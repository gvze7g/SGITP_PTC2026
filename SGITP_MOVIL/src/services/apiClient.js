import { API_URL } from '../constants/api';
import { translateBackendMessage } from '../constants/errorMessages';

// Si el servidor no responde en este tiempo, cancelamos la petición en vez
// de dejar a la pantalla esperando para siempre.
const REQUEST_TIMEOUT_MS = 8000;

// AuthContext registra aquí qué hacer cuando el backend responde 401 (sesión
// vencida o cuenta eliminada): cerrar la sesión local y volver al Login.
let unauthorizedHandler = null;

// 401 que son parte normal de flujos sin sesión (login, registro,
// recuperar contraseña) o de la revisión inicial de la sesión.
const IGNORED_UNAUTHORIZED_PATHS = ['/auth/me', '/loginCustomer', '/registerCustomer', '/recoveryPassword'];

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// Función base para llamar al backend: la usan directamente los hooks y
// contexts que necesitan datos del servidor (no hay una capa de "services"
// aparte). Se encarga de: mandar la petición, cancelarla si tarda mucho, y
// convertir cualquier error del servidor en un mensaje en español.
export async function request(path, options) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include', // manda la cookie de sesión en cada petición
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));

  if (
    response.status === 401 &&
    unauthorizedHandler &&
    !IGNORED_UNAUTHORIZED_PATHS.some((ignored) => path.startsWith(ignored))
  ) {
    unauthorizedHandler();
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
  }

  if (!response.ok) {
    throw new Error(translateBackendMessage(data.message));
  }

  return data;
}
