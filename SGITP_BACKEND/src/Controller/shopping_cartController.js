import cartModel from "../Model/shopping_cart.js";
import customerModel from "../Model/customer.js";
import productsModel from "../Model/products.js";
import salesModel from "../Model/sales.js";
import promotionsModel from "../Model/promotions.js";
import {
  describeVariant,
  findVariant,
  getVariantStock,
  reserveStock,
  resolveVariant,
} from "../utils/inventory.js";
import { WHOLESALE_CUSTOMER_TYPE, getUnitPrice } from "../utils/pricing.js";
import { isWithinDateRange } from "../utils/dates.js";
import { isPositiveInteger, isValidObjectId, isValidPhone } from "../utils/validators.js";

//Array de funciones
const cartController = {};

const CART_STATUS = "Active";

// Un cliente minorista puede llevar como máximo estas unidades de un mismo
// producto (sumando todas sus tallas/colores). El mayorista no tiene tope:
// solo lo limita el stock.
const RETAIL_MAX_UNITS_PER_PRODUCT = 4;
const MAX_LINE_QUANTITY = 999;
// Tarifas de envío: el costo lo pone el servidor según el método, no el
// cliente (antes la web cobraba $25 y la app $5.90 por el mismo envío, y
// cualquiera podía mandar shipping_cost: 0 en un exprés).
const EXPRESS_SHIPPING_COST = 5.9;
const STANDARD_SHIPPING_COST = 0;
const getShippingCost = (method) =>
  /expr[eé]s/i.test(String(method)) ? EXPRESS_SHIPPING_COST : STANDARD_SHIPPING_COST;

const RETAIL_LIMIT_MESSAGE = `Alcanzaste el límite de compra de ${RETAIL_MAX_UNITS_PER_PRODUCT} unidades por producto para clientes minoristas`;

const normalize = (value) => String(value ?? "").trim();

// Revisa que el cupón exista, esté activo y dentro de su rango de fechas.
// Nunca se confía en un porcentaje que mande el cliente: el descuento real
// siempre sale de lo que hay guardado en Promotions.
const findActiveCoupon = async (couponCode) => {
  if (!couponCode?.trim()) return null;

  const promotion = await promotionsModel.findOne({
    coupon_code: couponCode.trim(),
    isActive: true,
  });

  if (!promotion) return null;

  // Vale todo el día de inicio y todo el día final (hora de El Salvador).
  if (!isWithinDateRange(promotion.start_date, promotion.end_date)) return null;

  return promotion;
};

// El tipo de cliente se lee de la base en cada petición (no del token): si un
// admin lo pasa a mayorista, el cambio aplica sin tener que volver a entrar.
// Un empleado comprando en la tienda pública paga como minorista.
const getCustomerType = async (user) => {
  if (user?.userType !== "Customer") return "Client";

  const customer = await customerModel.findById(user.id).select("customer_type");
  return customer?.customer_type || "Client";
};

const isWholesale = (customerType) => customerType === WHOLESALE_CUSTOMER_TYPE;

// "cost" (precio mayorista) no se manda al carrito: cada línea ya trae su
// unitPrice calculado según el tipo de cliente.
const populateCart = (query) => {
  return query.populate(
    "products.productId",
    "name description category images variants price offers"
  );
};

const sendCart = async (res, cartId, customerType, status = 200) => {
  const cart = await populateCart(cartModel.findById(cartId));

  return res.status(status).json({
    ...cart.toObject(),
    customer_type: customerType,
    max_units_per_product: isWholesale(customerType) ? null : RETAIL_MAX_UNITS_PER_PRODUCT,
  });
};

const findActiveCart = (customerId) =>
  cartModel.findOne({ customerId, status: CART_STATUS });

// Las líneas se identifican por su _id (una por variante). Si llega un id de
// producto (versiones anteriores de la web/app), se usa su primera línea.
const findLine = (cart, lineOrProductId) =>
  cart.products.find((item) => item._id?.toString() === lineOrProductId) ||
  cart.products.find((item) => item.productId?.toString() === lineOrProductId) ||
  null;

const unitsOfProductInOtherLines = (cart, productId, excludeLineId) =>
  cart.products
    .filter(
      (item) =>
        item.productId?.toString() === productId.toString() &&
        item._id?.toString() !== excludeLineId?.toString()
    )
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

const stockMessage = (product, variant, available, customerType) => {
  const label = describeVariant(variant);
  const name = `"${product.name}"${label ? ` (${label})` : ""}`;

  if (available <= 0) return `${name} está agotado`;

  // Solo el mayorista ve cuántas unidades hay en inventario.
  return isWholesale(customerType)
    ? `Solo hay ${available} unidades disponibles de ${name}`
    : `No hay suficiente stock de ${name} para esa cantidad`;
};

// Revisa que una línea con "quantity" unidades quepa en el límite minorista
// y en el stock de su variante. Devuelve el mensaje de error o null.
const validateLineQuantity = ({ cart, product, variant, lineId, quantity, customerType }) => {
  if (quantity > MAX_LINE_QUANTITY) {
    return `No puedes agregar más de ${MAX_LINE_QUANTITY} unidades de un producto`;
  }

  if (!isWholesale(customerType)) {
    const otherUnits = unitsOfProductInOtherLines(cart, product._id, lineId);
    if (otherUnits + quantity > RETAIL_MAX_UNITS_PER_PRODUCT) return RETAIL_LIMIT_MESSAGE;
  }

  const available = getVariantStock(variant);
  if (quantity > available) return stockMessage(product, variant, available, customerType);

  return null;
};

const recalculateCart = async (cart, customerType) => {
  let total = 0;
  const products = [];

  for (const item of cart.products || []) {
    const productFound = await productsModel.findById(item.productId);

    if (!productFound) continue;

    const quantity = Math.max(1, Math.floor(Number(item.quantity || 1)));

    // Líneas guardadas antes de que el carrito supiera de variantes: se les
    // asigna la variante que el checkout les habría descontado.
    let { size, color } = item;
    if (size === undefined && color === undefined) {
      const variant = resolveVariant(productFound, null, null, quantity);
      size = normalize(variant?.size);
      color = normalize(variant?.color);
    }

    const unitPrice = getUnitPrice(productFound, customerType);
    const subtotal = Number((unitPrice * quantity).toFixed(2));
    total += subtotal;

    products.push({
      _id: item._id,
      productId: productFound._id,
      size,
      color,
      quantity,
      unitPrice,
      subtotal,
    });
  }

  cart.products = products;
  cart.total = Number(total.toFixed(2));
  return cart;
};

cartController.getMyCart = async (req, res) => {
  try {
    const customerType = await getCustomerType(req.user);
    let cart = await findActiveCart(req.user.id);

    if (!cart) {
      cart = await cartModel.create({
        customerId: req.user.id,
        products: [],
        total: 0,
        status: CART_STATUS,
      });
    } else {
      // Los precios pueden haber cambiado (oferta nueva o vencida, cliente
      // pasado a mayorista): se recalculan cada vez que se abre el carrito.
      await recalculateCart(cart, customerType);
      await cart.save();
    }

    return sendCart(res, cart._id, customerType);
  } catch (error) {
    console.log("getMyCart error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

cartController.addItemToMyCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "Producto inválido" });
    }

    if (!isPositiveInteger(quantity)) {
      return res.status(400).json({ message: "La cantidad debe ser un número entero mayor que 0" });
    }

    if (normalize(size).length > 40 || normalize(color).length > 40) {
      return res.status(400).json({ message: "La talla o el color no son válidos" });
    }

    const productFound = await productsModel.findById(productId);

    if (!productFound) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const requestedQuantity = Number(quantity);
    const variant = resolveVariant(productFound, size, color, requestedQuantity);

    if (!variant) {
      return res.status(400).json({ message: "Selecciona una talla y un color disponibles" });
    }

    const customerType = await getCustomerType(req.user);

    let cart = await findActiveCart(req.user.id);

    if (!cart) {
      cart = new cartModel({
        customerId: req.user.id,
        products: [],
        total: 0,
        status: CART_STATUS,
      });
    }

    const existingItem = cart.products.find(
      (item) =>
        item.productId?.toString() === productId &&
        normalize(item.size) === normalize(variant.size) &&
        normalize(item.color) === normalize(variant.color)
    );

    const nextQuantity = Number(existingItem?.quantity || 0) + requestedQuantity;
    const errorMessage = validateLineQuantity({
      cart,
      product: productFound,
      variant,
      lineId: existingItem?._id,
      quantity: nextQuantity,
      customerType,
    });

    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    if (existingItem) {
      existingItem.quantity = nextQuantity;
    } else {
      cart.products.push({
        productId,
        size: normalize(variant.size),
        color: normalize(variant.color),
        quantity: nextQuantity,
        subtotal: 0,
      });
    }

    await recalculateCart(cart, customerType);
    await cart.save();

    return sendCart(res, cart._id, customerType);
  } catch (error) {
    console.log("addItemToMyCart error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// PUT /cart/mine/:itemId — cambia la cantidad de una línea (0 la elimina).
cartController.updateMyCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const nextQuantity = Number(quantity);

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ message: "Producto inválido" });
    }

    if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
      return res.status(400).json({ message: "La cantidad debe ser un número entero de 0 o más" });
    }

    const cart = await findActiveCart(req.user.id);

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const line = findLine(cart, itemId);

    if (!line) {
      return res.status(404).json({ message: "Ese producto ya no está en tu carrito" });
    }

    const customerType = await getCustomerType(req.user);

    if (nextQuantity === 0) {
      cart.products.pull(line._id);
    } else {
      const productFound = await productsModel.findById(line.productId);

      if (!productFound) {
        return res.status(400).json({ message: "Este producto ya no existe, elimínalo del carrito" });
      }

      const variant =
        line.size === undefined && line.color === undefined
          ? resolveVariant(productFound, null, null, nextQuantity)
          : findVariant(productFound, line.size, line.color);

      if (!variant) {
        return res
          .status(400)
          .json({ message: "La talla/color de este producto ya no está disponible, elimínalo del carrito" });
      }

      const errorMessage = validateLineQuantity({
        cart,
        product: productFound,
        variant,
        lineId: line._id,
        quantity: nextQuantity,
        customerType,
      });

      if (errorMessage) {
        return res.status(400).json({ message: errorMessage });
      }

      line.quantity = nextQuantity;
    }

    await recalculateCart(cart, customerType);
    await cart.save();

    return sendCart(res, cart._id, customerType);
  } catch (error) {
    console.log("updateMyCartItem error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

cartController.removeMyCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ message: "Producto inválido" });
    }

    const cart = await findActiveCart(req.user.id);

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const line = findLine(cart, itemId);

    if (!line) {
      return res.status(404).json({ message: "Ese producto ya no está en tu carrito" });
    }

    cart.products.pull(line._id);

    const customerType = await getCustomerType(req.user);
    await recalculateCart(cart, customerType);
    await cart.save();

    return sendCart(res, cart._id, customerType);
  } catch (error) {
    console.log("removeMyCartItem error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

cartController.checkoutMyCart = async (req, res) => {
  try {
    const {
      shipping_address,
      shipping_phone,
      shipping_method = "Standard",
      payment_method = "Card",
      coupon_code,
    } = req.body;

    // payment_status nunca se toma del cliente: hoy no hay una confirmacion
    // real de pago (webhook/gateway) conectada al checkout web, asi que todo
    // pedido nace "Pending" y solo un Employee puede marcarlo "Paid" (PUT
    // /api/sales/:id) una vez verifica el cobro. Si se aceptara del body,
    // cualquiera podria mandar payment_status:"Paid" y aparecer en tendencias
    // sin haber pagado.
    const payment_status = "Pending";

    if (!normalize(shipping_address) || String(shipping_address).length > 200) {
      return res.status(400).json({ message: "La dirección de envío es obligatoria" });
    }

    if (!isValidPhone(shipping_phone)) {
      return res
        .status(400)
        .json({ message: "El teléfono de contacto debe tener entre 8 y 12 dígitos" });
    }

    if (!normalize(shipping_method) || String(shipping_method).length > 50) {
      return res.status(400).json({ message: "Selecciona un método de envío válido" });
    }

    const shippingCost = getShippingCost(shipping_method);

    if (!normalize(payment_method) || String(payment_method).length > 100) {
      return res.status(400).json({ message: "Selecciona un método de pago válido" });
    }

    if (coupon_code && !/^[A-Za-z0-9]{1,20}$/.test(String(coupon_code).trim())) {
      return res.status(400).json({ message: "El código de descuento no es válido" });
    }

    const cart = await findActiveCart(req.user.id);

    if (!cart || !cart.products?.length) {
      return res.status(400).json({ message: "Tu carrito está vacío" });
    }

    const customerType = await getCustomerType(req.user);

    // El porcentaje real sale de Promotions, nunca del body: si el cupón no
    // existe, no está activo o ya venció, se ignora en vez de fallar todo el
    // pedido (así el cliente no se queda sin poder pagar por un código viejo).
    const coupon = await findActiveCoupon(coupon_code);
    const discountPercentage = coupon ? Number(coupon.discount_percentage || 0) : 0;

    // Se vuelve a validar todo con el inventario actual: entre que se armó
    // el carrito y se paga, el stock pudo bajar por otras ventas.
    const itemDetails = [];

    for (const item of cart.products) {
      const product = await productsModel.findById(item.productId);

      if (!product) {
        return res
          .status(400)
          .json({ message: "Un producto de tu carrito ya no existe, elimínalo para continuar" });
      }

      const quantity = Number(item.quantity || 0);
      const variant =
        item.size === undefined && item.color === undefined
          ? resolveVariant(product, null, null, quantity)
          : findVariant(product, item.size, item.color);

      if (!variant) {
        return res.status(400).json({
          message: `La talla/color elegida de "${product.name}" ya no está disponible, elimínala del carrito`,
        });
      }

      const errorMessage = validateLineQuantity({
        cart,
        product,
        variant,
        lineId: item._id,
        quantity,
        customerType,
      });

      if (errorMessage) {
        return res.status(400).json({ message: errorMessage });
      }

      const basePrice = getUnitPrice(product, customerType);
      const finalPrice = discountPercentage > 0
        ? Number((basePrice * (1 - discountPercentage / 100)).toFixed(2))
        : basePrice;

      itemDetails.push({
        product_id: product._id,
        name: product.name,
        selected_variant: describeVariant(variant),
        variant_size: normalize(variant.size),
        variant_color: normalize(variant.color),
        quantity,
        unit_price: finalPrice,
      });
    }

    // Primero se aparta el stock (todo o nada) y luego se crea la venta, así
    // dos clientes no pueden comprar la misma última unidad.
    const stock = await reserveStock(itemDetails);

    if (!stock.ok) {
      return res.status(400).json({ message: stock.message });
    }

    let sale;
    try {
      sale = await salesModel.create({
        sales_date: new Date(),
        employee_id: req.user.userType === "Employee" ? req.user.id : undefined,
        cart_id: cart._id,
        origin: "Web",
        applied_price_type: isWholesale(customerType) ? "Wholesale" : "Retail",
        payment_method: normalize(payment_method),
        payment_status,
        shipping_address: normalize(shipping_address),
        shipping_phone: normalize(shipping_phone),
        shipping_method: normalize(shipping_method),
        shipping_cost: shippingCost,
        item_details: itemDetails,
        coupon_code: coupon ? coupon.coupon_code : undefined,
        discount_percentage: discountPercentage || undefined,
      });
    } catch (saleError) {
      await stock.restore();
      throw saleError;
    }

    cart.status = "Completed";
    await cart.save();

    return res.status(201).json({
      message: "Pedido realizado",
      sale,
    });
  } catch (error) {
    console.log("checkoutMyCart error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// ---------- CRUD de administración (solo empleados) ----------

// Calcula subtotales y total de una lista { productId, quantity } enviada por
// el panel; devuelve null si algún producto o cantidad es inválido.
const buildAdminCartProducts = async (products) => {
  if (!Array.isArray(products)) return null;

  let total = 0;
  const newProducts = [];

  for (const item of products) {
    if (!isValidObjectId(item?.productId) || !isPositiveInteger(item?.quantity)) return null;

    const productFound = await productsModel.findById(item.productId);
    if (!productFound) return null;

    const subtotal = Number((Number(productFound.price || 0) * Number(item.quantity)).toFixed(2));
    total += subtotal;

    newProducts.push({
      productId: item.productId,
      size: normalize(item.size),
      color: normalize(item.color),
      quantity: Number(item.quantity),
      unitPrice: Number(productFound.price || 0),
      subtotal,
    });
  }

  return { products: newProducts, total: Number(total.toFixed(2)) };
};

//SELECT
cartController.getAllCarts = async (req, res) => {
  try {
    const carts = await cartModel
      .find()
      .populate("customerId", "full_name email")
      .populate("products.productId", "name price images variants description");

    return res.status(200).json(carts);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

//SELECT by id
cartController.getCartById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const cart = await cartModel
      .findById(req.params.id)
      .populate("customerId", "full_name email")
      .populate("products.productId", "name price images variants description");

    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

//INSERT
cartController.insertCart = async (req, res) => {
  try {
    const { customerId, products, status } = req.body;

    if (!isValidObjectId(customerId)) {
      return res.status(400).json({ message: "Cliente inválido" });
    }

    const built = await buildAdminCartProducts(products);
    if (!built) {
      return res.status(400).json({ message: "Hay productos o cantidades inválidas en el carrito" });
    }

    const newCart = new cartModel({
      customerId,
      products: built.products,
      total: built.total,
      status: normalize(status) || CART_STATUS,
    });

    await newCart.save();

    return res.status(200).json({ message: "Carrito guardado" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

//UPDATE
cartController.updateCart = async (req, res) => {
  try {
    const { customerId, products, status } = req.body;

    if (!isValidObjectId(req.params.id) || !isValidObjectId(customerId)) {
      return res.status(400).json({ message: "Carrito o cliente inválido" });
    }

    const built = await buildAdminCartProducts(products);
    if (!built) {
      return res.status(400).json({ message: "Hay productos o cantidades inválidas en el carrito" });
    }

    const updatedCart = await cartModel.findByIdAndUpdate(
      req.params.id,
      {
        customerId,
        products: built.products,
        total: built.total,
        status: normalize(status) || CART_STATUS,
      },
      { new: true },
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    return res.status(200).json({ message: "Carrito actualizado" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

//ELIMINAR
cartController.deleteCart = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const deleteCart = await cartModel.findByIdAndDelete(req.params.id);

    if (!deleteCart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    return res.status(200).json({ message: "Carrito eliminado" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

export default cartController;
