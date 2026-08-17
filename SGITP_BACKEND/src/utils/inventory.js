import productsModel from "../Model/products.js";

// Descuenta el stock de la variante vendida. La usan tanto las ventas del
// POS (salesController.insertSales) como el checkout del carrito
// (shopping_cartController.checkoutMyCart), para que un pedido "reste"
// inventario sin importar por dónde se creó.
export const discountVariantsStock = async (itemDetails = []) => {
  for (const item of itemDetails) {
    if (!item?.product_id) continue;

    const product = await productsModel.findById(item.product_id);
    if (!product || !Array.isArray(product.variants)) continue;

    const variant =
      product.variants.find(
        (v) => v.size === item.variant_size && v.color === item.variant_color
      ) || product.variants[0];

    if (!variant) continue;

    const currentStock = Number(variant.stock || 0);
    const soldQty = Number(item.quantity || 0);
    variant.stock = String(Math.max(0, currentStock - soldQty));

    await product.save();
  }
};
