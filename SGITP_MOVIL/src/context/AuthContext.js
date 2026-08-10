import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { authService } from '../services/authService';

// Nombre de la "casilla" donde guardamos el usuario en el almacenamiento
// seguro del teléfono, para no perder la sesión al cerrar la app.
const USER_STORAGE_KEY = 'sgitp_customer';

// useContext: esto crea la "caja" donde va a vivir la info del usuario
// logueado, para que cualquier pantalla pueda leerla sin pasarla a mano
// de componente en componente.
const AuthContext = createContext(null);

// Este componente envuelve toda la app (ver App.js) y maneja todo lo
// relacionado a la sesión: quién está logueado, iniciar sesión, registrarse
// y cerrar sesión. Cualquier pantalla puede usar estas funciones con el
// hook useAuth() de más abajo.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // datos del usuario logueado (o null si no hay sesión)
  const [isBootstrapping, setIsBootstrapping] = useState(true); // true mientras revisamos si ya había sesión guardada
  const [isSubmitting, setIsSubmitting] = useState(false); // true mientras se está iniciando sesión o registrando

  // Al abrir la app: revisa si había un usuario guardado y le pregunta al
  // backend si esa sesión todavía es válida.
  useEffect(() => {
    async function bootstrapSession() {
      try {
        const cached = await SecureStore.getItemAsync(USER_STORAGE_KEY);
        if (cached) setUser(JSON.parse(cached));

        const { user: freshUser } = await authService.fetchMe();
        setUser(freshUser);
        await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(freshUser));
      } catch {
        // No hay sesión válida (o no hay internet): dejamos al usuario deslogueado.
        setUser(null);
        await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrapSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsSubmitting(true);
    try {
      const { user: loggedInUser } = await authService.loginCustomer(email, password);
      setUser(loggedInUser);
      await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      return loggedInUser;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setIsSubmitting(true);
    try {
      return await authService.registerCustomer(payload);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isBootstrapping, isSubmitting, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar la sesión desde cualquier pantalla, ej:
// const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
