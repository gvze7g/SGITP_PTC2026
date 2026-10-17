import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';

// Pantallas que se pueden ver sin sesión.
const PUBLIC_SCREENS = new Set([
  'Splash',
  'Login',
  'Register',
  'ForgotPassword',
  'VerifyCode',
  'NewPassword',
]);

// Vigila la navegación: si no hay sesión (cerró sesión, venció la cookie o el
// backend respondió 401) y la pantalla actual es privada, manda al Login y
// borra el historial para que "atrás" no regrese a datos del usuario.
export function SessionGuard({ navigationRef }) {
  const { user, isBootstrapping } = useAuth();

  useEffect(() => {
    if (isBootstrapping || user) return undefined;

    function redirectIfPrivate() {
      if (!navigationRef.isReady()) return;
      const route = navigationRef.getCurrentRoute();
      if (route && !PUBLIC_SCREENS.has(route.name)) {
        navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    }

    redirectIfPrivate();
    return navigationRef.addListener('state', redirectIfPrivate);
  }, [user, isBootstrapping, navigationRef]);

  return null;
}
