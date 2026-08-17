import { useCallback, useEffect, useState } from 'react';
import { getCurrentCustomer, logoutCustomer } from '../services/customerAuthService';
import { AuthContext } from './AuthContext';

// Unica fuente de verdad de la sesion en el sitio publico: usa GET /auth/me
// (cookie httpOnly) y POST /logout, los mismos endpoints que ya usan
// Login/Register/ProfilePage. No inventa un segundo sistema de auth.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentCustomer();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      await refreshUser();
      if (isMounted) {
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await logoutCustomer();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
