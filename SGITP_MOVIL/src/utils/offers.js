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

  const now = Date.now();

  return (
    offers.find((offer) => {
      if (!offer?.active) return false;
      if (offer.startDate && new Date(offer.startDate).getTime() > now) return false;
      if (offer.endDate && new Date(offer.endDate).getTime() < now) return false;
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
