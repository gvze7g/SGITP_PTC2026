import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { request } from '../services/apiClient';
import { sessionStore } from '../services/sessionStore';

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

  // Guarda el resultado de cualquier login (normal, Google o Apple).
  // El backend devuelve { token, user }: el token se guarda aparte porque es
  // lo que se manda como "Authorization: Bearer" en las siguientes peticiones
  // (React Native no conserva cookies de forma confiable entre reinicios).
  const persistSession = useCallback(async ({ token, user: loggedInUser }) => {
    if (token) await sessionStore.setToken(token);

    setUser(loggedInUser);
    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(loggedInUser));

    return loggedInUser;
  }, []);

  // Al abrir la app: revisa si había un usuario guardado y le pregunta al
  // backend si esa sesión todavía es válida.
  useEffect(() => {
    async function bootstrapSession() {
      try {
        const cached = await SecureStore.getItemAsync(USER_STORAGE_KEY);
        if (cached) setUser(JSON.parse(cached));

        const { user: freshUser } = await request('/auth/me', { method: 'GET' });
        setUser(freshUser);
        await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(freshUser));
      } catch {
        // No hay sesión válida (o no hay internet): dejamos al usuario deslogueado.
        setUser(null);
        await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
        await sessionStore.clear();
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrapSession();
  }, []);

  const login = useCallback(
    async (email, password) => {
      setIsSubmitting(true);
      try {
        const result = await request('/loginCustomer', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        return await persistSession(result);
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistSession]
  );

  // Recibe el id_token que devolvió Google y deja que el backend lo verifique
  // contra los servidores de Google (nunca confiamos en el token solo porque
  // venga del celular).
  const loginWithGoogle = useCallback(
    async (idToken) => {
      setIsSubmitting(true);
      try {
        const result = await request('/auth/google', {
          method: 'POST',
          body: JSON.stringify({ idToken }),
        });
        return await persistSession(result);
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistSession]
  );

  // Recibe el identityToken de Apple. fullName solo llega la PRIMERA vez que
  // el usuario autoriza la app, por eso se manda junto con el token: si no,
  // la cuenta se crearía sin nombre.
  const loginWithApple = useCallback(
    async ({ identityToken, fullName }) => {
      setIsSubmitting(true);
      try {
        const result = await request('/auth/apple', {
          method: 'POST',
          body: JSON.stringify({ identityToken, fullName }),
        });
        return await persistSession(result);
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistSession]
  );

  const register = useCallback(async ({ fullName, email, password }) => {
    setIsSubmitting(true);
    try {
      return await request('/registerCustomer', {
        method: 'POST',
        body: JSON.stringify({ full_name: fullName, email, password }),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await request('/logout', { method: 'POST' });
    } finally {
      setUser(null);
      await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      await sessionStore.clear();
    }
  }, []);

  // Actualiza nombre/teléfono del cliente logueado (pantalla "Mis Datos" /
  // "Editar Perfil") y refresca la sesión guardada con los datos nuevos.
  const updateProfile = useCallback(async ({ full_name, main_phone }) => {
    setIsSubmitting(true);
    try {
      const { user: updatedUser } = await request('/customer/me', {
        method: 'PUT',
        body: JSON.stringify({ full_name, main_phone }),
      });
      setUser(updatedUser);
      await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isBootstrapping,
        isSubmitting,
        login,
        loginWithGoogle,
        loginWithApple,
        register,
        logout,
        updateProfile,
      }}
    >
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
