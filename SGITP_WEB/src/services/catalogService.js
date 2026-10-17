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

// Precio que paga quien esta viendo: el mayorista recibe wholesalePrice del
// backend (solo a el se le envia); el resto paga el de oferta o el regular.
export function getDisplayPrice(product) {
  if (product?.isWholesaleView && Number(product.wholesalePrice) > 0) {
    return Number(product.wholesalePrice);
  }

  return Number(product?.hasActiveOffer ? product.finalPrice : product?.price) || 0;
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

// Caché corto en el navegador para lecturas públicas: cambiar de página ya
// no vuelve a pedir el catálogo, las categorías ni las tiendas al servidor.
// Si dos componentes piden lo mismo a la vez, comparten una sola petición.
const responseCache = new Map();
const CATALOG_TTL_MS = 30 * 1000;
const STATIC_TTL_MS = 5 * 60 * 1000;

async function fetchJson(path, fallbackMessage) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Enciende o reinicia el backend.');
  }

  return parseResponse(response, fallbackMessage);
}

function cachedGet(path, fallbackMessage, ttlMs, variant = '') {
  const key = `${path}|${variant}`;
  const entry = responseCache.get(key);

  if (entry && entry.expiresAt > Date.now()) return entry.promise;

  const promise = fetchJson(path, fallbackMessage).catch((error) => {
    responseCache.delete(key);
    throw error;
  });
  responseCache.set(key, { promise, expiresAt: Date.now() + ttlMs });
  return promise;
}

// variant: tipo de cliente con sesión. El mayorista recibe otros precios, así
// que su catálogo se guarda aparte del de los demás.
export function getCatalogProducts(variant = '') {
  return cachedGet('/products/catalog', 'No se pudieron obtener los productos.', CATALOG_TTL_MS, variant);
}

export function getBestSellingProducts(limit = 5, variant = '') {
  return cachedGet(
    `/sales/best-sellers?limit=${limit}`,
    'No se pudieron obtener los productos más vendidos.',
    CATALOG_TTL_MS,
    variant
  );
}

// Sin caché: el detalle debe mostrar el stock del momento.
export function getCatalogProductById(productId) {
  return fetchJson(`/products/catalog/${encodeURIComponent(productId)}`, 'No se pudo obtener el producto.');
}

export function getPublicBranches() {
  return cachedGet('/branches/public', 'No se pudieron obtener las tiendas.', STATIC_TTL_MS);
}

// Lista cerrada de categorias (agrupadas en Niña, Niño y Unisex), la misma
// que usa el panel para crear productos.
export function getProductCategories() {
  return cachedGet('/products/catalog/categories', 'No se pudieron obtener las categorías.', STATIC_TTL_MS);
}

const NEW_ARRIVAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function isNewProduct(product) {
  return (
    Boolean(product?.createdAt) &&
    Date.now() - new Date(product.createdAt).getTime() < NEW_ARRIVAL_WINDOW_MS
  );
}

export function getProductTotalStock(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return variants.reduce((total, variant) => {
    const stock = Number.parseInt(variant?.stock, 10);
    return total + (Number.isFinite(stock) && stock > 0 ? stock : 0);
  }, 0);
}

// Colores unicos del producto (un color con varias tallas sale una vez).
export function getProductColors(product) {
  const seen = new Map();
  (product?.variants || []).forEach((variant) => {
    const name = String(variant?.color || '').trim();
    if (name && !seen.has(name)) seen.set(name, variant.colorHex || '#d8cfc4');
  });
  return [...seen.entries()].map(([name, hex]) => ({ name, hex }));
}

export function getProductFabrics(product) {
  return [
    ...new Set(
      (product?.variants || []).map((variant) => String(variant?.fabric || '').trim()).filter(Boolean)
    ),
  ];
}

export function getProductSizes(product) {
  return [
    ...new Set(
      (product?.variants || []).map((variant) => String(variant?.size || '').trim()).filter(Boolean)
    ),
  ];
}
