// Si el backend responde 401 (sesion vencida, cuenta eliminada o cookie
// invalida) mientras el admin esta en una pagina privada, se le manda al
// login en vez de dejarlo en una pantalla que ya no puede cargar nada.
// ProtectedRoute solo revisa la sesion al entrar a cada pagina.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const PUBLIC_PATHS = ["/", "/forgot-password", "/verify-code", "/reset-password"];
// Respuestas 401 que son parte normal de un flujo publico, no una sesion vencida.
const IGNORED_ENDPOINTS = ["/loginEmployee", "/auth/me", "/recoveryPassword"];

const originalFetch = window.fetch.bind(window);

window.fetch = async (input, init) => {
  const response = await originalFetch(input, init);
  const url = typeof input === "string" ? input : input?.url ?? "";

  if (
    response.status === 401 &&
    url.startsWith(API_URL) &&
    !IGNORED_ENDPOINTS.some((endpoint) => url.startsWith(`${API_URL}${endpoint}`)) &&
    !PUBLIC_PATHS.includes(window.location.pathname)
  ) {
    window.location.replace("/");
  }

  return response;
};
