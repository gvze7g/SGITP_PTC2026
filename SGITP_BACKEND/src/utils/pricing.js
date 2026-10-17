// Precios de producto en un solo lugar: el catálogo (lo que se muestra), el
// carrito (lo que se suma) y el checkout (lo que se cobra) usan estas mismas
// funciones, así el precio mostrado y el cobrado nunca quedan distintos.
import { isWithinDateRange } from "./dates.js";

export const WHOLESALE_CUSTOMER_TYPE = "Wholesale";

// Busca la oferta vigente de un producto: activa y dentro de su rango de fechas
// (si no tiene fechas, basta con "active: true"). "value" es un porcentaje 0-100.
// Se compara por día: la oferta vale todo el día final, no hasta su medianoche.
export const getActiveOffer = (offers = []) => {
  if (!Array.isArray(offers)) return null;

  return (
    offers.find((offer) => {
      if (!offer?.active) return false;
      if (typeof offer.value !== "number" || offer.value <= 0) return false;
      return isWithinDateRange(offer.startDate, offer.endDate);
    }) || null
  );
};

const toPlainProduct = (productDoc) =>
  typeof productDoc?.toObject === "function" ? productDoc.toObject() : { ...productDoc };

// Unico lugar donde se calcula el precio de oferta, para que el badge (-20%,
// -35%...) y el precio final mostrados nunca queden inconsistentes entre
// componentes/paginas.
export const decorateWithOfferPricing = (productDoc) => {
  const product = toPlainProduct(productDoc);
  const activeOffer = getActiveOffer(product.offers);

  if (!activeOffer) {
    return { ...product, hasActiveOffer: false };
  }

  const discountPercentage = Math.min(Math.max(Number(activeOffer.value) || 0, 0), 100);
  const originalPrice = Number(product.price) || 0;
  const finalPrice = Number((originalPrice * (1 - discountPercentage / 100)).toFixed(2));

  return {
    ...product,
    hasActiveOffer: true,
    discountPercentage,
    originalPrice,
    finalPrice,
  };
};

// Precio unitario real según el tipo de cliente. El mayorista paga "cost"
// (el panel lo rotula "COSTO (CLIENTE MAYORISTA)", igual que el POS); el
// minorista paga el precio regular o el de oferta si hay una vigente.
export const getUnitPrice = (productDoc, customerType) => {
  const product = toPlainProduct(productDoc);

  if (customerType === WHOLESALE_CUSTOMER_TYPE && Number(product.cost) > 0) {
    return Number(Number(product.cost).toFixed(2));
  }

  const decorated = decorateWithOfferPricing(product);
  return decorated.hasActiveOffer ? decorated.finalPrice : Number(product.price) || 0;
};

// Producto tal como lo ve la tienda pública. "cost" es el precio mayorista,
// así que solo viaja (como wholesalePrice) cuando quien consulta es mayorista.
export const toCatalogProduct = (productDoc, customerType) => {
  const { cost, ...product } = decorateWithOfferPricing(productDoc);

  if (customerType === WHOLESALE_CUSTOMER_TYPE && Number(cost) > 0) {
    return { ...product, isWholesaleView: true, wholesalePrice: Number(cost) };
  }

  return { ...product, isWholesaleView: false };
};
