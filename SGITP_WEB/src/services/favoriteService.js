const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? fallbackMessage);
  }

  return data;
}

export async function getMyFavorites() {
  let response;

  try {
    response = await fetch(`${API_URL}/favorite/mine`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudieron obtener tus favoritos.');
}

export async function addFavorite(productId) {
  let response;

  try {
    response = await fetch(`${API_URL}/favorite/mine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ product_id: productId }),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo guardar en favoritos.');
}

export async function removeFavorite(productId) {
  let response;

  try {
    response = await fetch(`${API_URL}/favorite/mine/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo quitar de favoritos.');
}
