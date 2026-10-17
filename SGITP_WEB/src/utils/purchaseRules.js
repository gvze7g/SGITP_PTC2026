// Reglas de compra de la tienda. Son las mismas que aplica el backend
// (shopping_cartController.js); aqui solo sirven para avisar antes de llamar
// a la API, el servidor siempre vuelve a validar.

export const RETAIL_MAX_UNITS_PER_PRODUCT = 4;

export const RETAIL_LIMIT_MESSAGE = `Alcanzaste el limite de compra de ${RETAIL_MAX_UNITS_PER_PRODUCT} unidades por producto para clientes minoristas.`;

export function isWholesaleCustomer(user) {
  return user?.customer_type === 'Wholesale';
}

export function getVariantStock(variant) {
  const stock = Number.parseInt(variant?.stock, 10);
  return Number.isFinite(stock) && stock > 0 ? stock : 0;
}

export function findVariant(product, size, color) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const clean = (value) => String(value ?? '').trim();

  return (
    variants.find(
      (variant) => clean(variant.size) === clean(size) && clean(variant.color) === clean(color)
    ) || null
  );
}

// Unidades que se pueden pedir de una variante: el stock, y para el
// minorista ademas el tope por producto (descontando lo que ya lleva en
// otras tallas/colores del mismo producto).
export function getMaxUnits({ stock, isWholesale, unitsInOtherLines = 0 }) {
  if (isWholesale) return stock;
  return Math.max(0, Math.min(stock, RETAIL_MAX_UNITS_PER_PRODUCT - unitsInOtherLines));
}
