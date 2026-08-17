const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

// Revisa un codigo de descuento contra el backend (nunca calcula el
// porcentaje en el navegador: el descuento real siempre lo decide el servidor).
export async function validateCoupon(code) {
  let response;

  try {
    response = await fetch(`${API_URL}/promotions/validate/${encodeURIComponent(code)}`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? 'Ese codigo no es valido.');
  }

  return data;
}
