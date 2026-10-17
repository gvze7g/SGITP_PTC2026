// Cada producto puede traer varias ofertas (product.offers, ver el modelo
// del backend), pero solo nos importa la que esté activa hoy. "value" se
// trata como porcentaje de descuento (ej. 30 = "-30%"), igual que se ve en
// la web pública.

// Busca, dentro de las ofertas del producto, una que esté marcada como
// activa y cuyo rango de fechas incluya hoy (si no trae fechas, se toma
// como vigente todo el tiempo).
export function getActiveOffer(product) {
  const offers = product?.offers;
  if (!Array.isArray(offers)) return null;

  // Se compara por día ("AAAA-MM-DD"), igual que el backend: la oferta vale
  // todo su día final. Las fechas se guardan como medianoche UTC del día.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const toDay = (value) => new Date(value).toISOString().slice(0, 10);

  return (
    offers.find((offer) => {
      if (!offer?.active) return false;
      if (offer.startDate && toDay(offer.startDate) > today) return false;
      if (offer.endDate && toDay(offer.endDate) < today) return false;
      return true;
    }) ?? null
  );
}

// Precio con el descuento de la oferta ya aplicado, redondeado a 2 decimales.
export function getDiscountedPrice(product, offer) {
  const price = Number(product?.price ?? 0);
  const percentage = Number(offer?.value ?? 0);
  return Math.round(price * (1 - percentage / 100) * 100) / 100;
}

// El backend solo le manda wholesalePrice al cliente mayorista: si viene, ese
// es su precio y las ofertas no le aplican.
export function getWholesalePrice(product) {
  return product?.isWholesaleView && Number(product.wholesalePrice) > 0
    ? Number(product.wholesalePrice)
    : null;
}
