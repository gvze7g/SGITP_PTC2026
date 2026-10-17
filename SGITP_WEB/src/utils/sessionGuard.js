// Si el backend responde 401 (sesion vencida o cuenta eliminada) en una
// peticion que necesita sesion, se avisa con el evento "session-expired" para
// que AuthProvider cierre la sesion local y las paginas muestren el modo
// invitado, en vez de seguir como si el cliente estuviera conectado.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

// 401 que son parte de flujos publicos (login, registro, recuperar
// contraseña) o de la propia revision de sesion.
const IGNORED_ENDPOINTS = [
  '/auth/me',
  '/loginCustomer',
  '/registerCustomer',
  '/recoveryPassword',
  '/auth/google',
];

export const SESSION_EXPIRED_EVENT = 'session-expired';

const originalFetch = window.fetch.bind(window);

window.fetch = async (input, init) => {
  const response = await originalFetch(input, init);
  const url = typeof input === 'string' ? input : input?.url ?? '';

  if (
    response.status === 401 &&
    url.startsWith(API_URL) &&
    !IGNORED_ENDPOINTS.some((endpoint) => url.startsWith(`${API_URL}${endpoint}`))
  ) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  return response;
};
