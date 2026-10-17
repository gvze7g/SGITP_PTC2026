import productsModel from "../Model/products.js";

// Inventario por variante (talla + color). Lo usan el carrito, el checkout
// de la web/app y las ventas del POS, para que todos validen y descuenten el
// stock con las mismas reglas.

const normalize = (value) => String(value ?? "").trim();

export const getVariantStock = (variant) => {
  const stock = Number.parseInt(variant?.stock, 10);
  return Number.isFinite(stock) && stock > 0 ? stock : 0;
};

export const getTotalStock = (variants = []) => {
  if (!Array.isArray(variants)) return 0;
  return variants.reduce((total, variant) => total + getVariantStock(variant), 0);
};

export const findVariant = (product, size, color) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return (
    variants.find(
      (variant) =>
        normalize(variant.size) === normalize(size) && normalize(variant.color) === normalize(color)
    ) || null
  );
};

// Si el cliente eligió talla/color se usa exactamente esa variante. Si no
// mandó ninguna (botones rápidos de "añadir" o pedidos viejos), se toma la
// primera variante con stock suficiente, igual que hace el POS.
export const resolveVariant = (product, size, color, quantity = 1) => {
  if (normalize(size) || normalize(color)) return findVariant(product, size, color);

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return (
    variants.find((variant) => getVariantStock(variant) >= quantity) ||
    variants.find((variant) => getVariantStock(variant) > 0) ||
    variants[0] ||
    null
  );
};

export const describeVariant = (variant) =>
  [normalize(variant?.size), normalize(variant?.color)].filter(Boolean).join(" / ");

// Suma/resta stock a una variante sin pisar ventas simultáneas: solo escribe
// si el stock sigue siendo el que se leyó (si otra venta lo cambió en medio,
// vuelve a leer y reintenta). Nunca deja el stock en negativo.
const adjustVariantStock = async (productId, variantId, delta) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const product = await productsModel.findById(productId);
    const variant = product?.variants?.id(variantId);
    if (!variant) return false;

    const nextStock = getVariantStock(variant) + delta;
    if (nextStock < 0) return false;

    const result = await productsModel.updateOne(
      { _id: productId, variants: { $elemMatch: { _id: variantId, stock: variant.stock } } },
      { $set: { "variants.$.stock": String(nextStock) } }
    );

    if (result.modifiedCount === 1) return true;
  }

  return false;
};

const restoreStock = async (reserved) => {
  for (const item of reserved) {
    await adjustVariantStock(item.productId, item.variantId, item.quantity);
  }
};

// Descuenta del inventario todo lo vendido, o nada: si alguna variante ya no
// alcanza, devuelve lo que ya había descontado y responde por qué falló.
// itemDetails usa el formato de sales.item_details (product_id, quantity,
// variant_size, variant_color, name).
export const reserveStock = async (itemDetails = []) => {
  const grouped = new Map();

  for (const item of itemDetails) {
    const quantity = Number(item?.quantity);
    if (!item?.product_id || !Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, message: "Cada producto debe tener una cantidad entera mayor que 0" };
    }

    const product = await productsModel.findById(item.product_id);
    if (!product) {
      return { ok: false, message: `El producto "${item.name || "seleccionado"}" ya no existe` };
    }

    const variant = resolveVariant(product, item.variant_size, item.variant_color, quantity);
    if (!variant) {
      return {
        ok: false,
        message: `La talla/color elegida de "${product.name}" ya no está disponible`,
      };
    }

    const key = `${product._id}:${variant._id}`;
    const current = grouped.get(key) || {
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      variantLabel: describeVariant(variant),
      quantity: 0,
    };
    current.quantity += quantity;
    grouped.set(key, current);
  }

  const reserved = [];

  for (const item of grouped.values()) {
    const ok = await adjustVariantStock(item.productId, item.variantId, -item.quantity);

    if (!ok) {
      await restoreStock(reserved);
      const label = item.variantLabel ? ` (${item.variantLabel})` : "";
      return {
        ok: false,
        message: `No hay suficiente stock de "${item.name}"${label} para completar el pedido`,
      };
    }

    reserved.push(item);
  }

  return { ok: true, reserved, restore: () => restoreStock(reserved) };
};
