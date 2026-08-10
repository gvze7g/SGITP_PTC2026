import { API_URL } from '../constants/api';
import { translateBackendMessage } from '../constants/errorMessages';

// Si el servidor no responde en este tiempo, cancelamos la petición en vez
// de dejar a la pantalla esperando para siempre.
const REQUEST_TIMEOUT_MS = 8000;

// Función base para llamar al backend, la usan authService y productService
// (y cualquier servicio nuevo que se agregue). Se encarga de: mandar la
// petición, cancelarla si tarda mucho, y convertir cualquier error del
// servidor en un mensaje en español.
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

  if (!response.ok) {
    throw new Error(translateBackendMessage(data.message));
  }

  return data;
}
