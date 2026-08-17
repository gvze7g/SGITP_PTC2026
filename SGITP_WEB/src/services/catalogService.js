const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

// Servicio usado por la web publica para leer ropa, detalle de producto y tiendas
// desde el backend sin duplicar fetch, manejo de errores ni formatos visuales.
export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=760&q=90';

export function getProductImage(product, size = 760) {
  const image = product?.images?.[0]?.image;
  if (image) return image;

  return `https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=${size}&q=90`;
}

export function formatProductPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));
}

export function getProductMaterial(product) {
  const variant = product?.variants?.[0];
  return [variant?.color, variant?.fabric || product?.category]
    .filter(Boolean)
    .join(' / ') || product?.category || 'Producto Peques';
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? fallbackMessage);
  }

  return data;
}

export async function getCatalogProducts() {
  let response;

  try {
    response = await fetch(`${API_URL}/products/catalog`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudieron obtener los productos.');
}

export async function getBestSellingProducts(limit = 5) {
  let response;

  try {
    response = await fetch(`${API_URL}/sales/best-sellers?limit=${limit}`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudieron obtener los productos mas vendidos.');
}

export async function getOfferProducts(limit = 8) {
  let response;

  try {
    response = await fetch(`${API_URL}/products/catalog/offers?limit=${limit}`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudieron obtener las ofertas.');
}

export async function getCatalogProductById(productId) {
  let response;

  try {
    response = await fetch(`${API_URL}/products/catalog/${productId}`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudo obtener el producto.');
}

export async function getPublicBranches() {
  let response;

  try {
    response = await fetch(`${API_URL}/branches/public`, {
      credentials: 'include',
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, 'No se pudieron obtener las tiendas.');
}
