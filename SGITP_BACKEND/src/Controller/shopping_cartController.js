import cartModel from "../Model/shopping_cart.js";
import productsModel from "../Model/products.js";
import salesModel from "../Model/sales.js";

//Array de funciones
const cartController = {};

const CART_STATUS = "Active";

const populateCart = (query) => {
  return query.populate(
    "products.productId",
    "name description category images variants price cost"
  );
};

const recalculateCart = async (cart) => {
  let total = 0;
  const products = [];

  for (const item of cart.products || []) {
    const productFound = await productsModel.findById(item.productId);

    if (!productFound) continue;

    const quantity = Math.max(1, Number(item.quantity || 1));
    const subtotal = Number(productFound.price || 0) * quantity;
    total += subtotal;

    products.push({
      productId: productFound._id,
      quantity,
      subtotal,
    });
  }

  cart.products = products;
  cart.total = total;
  return cart;
};

cartController.getMyCart = async (req, res) => {
  try {
    let cart = await populateCart(
      cartModel.findOne({ customerId: req.user.id, status: CART_STATUS })
    );

    if (!cart) {
      cart = await cartModel.create({
        customerId: req.user.id,
        products: [],
        total: 0,
        status: CART_STATUS,
      });

      cart = await populateCart(cartModel.findById(cart._id));
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.log("getMyCart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

cartController.addItemToMyCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const productFound = await productsModel.findById(productId);

    if (!productFound) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await cartModel.findOne({
      customerId: req.user.id,
      status: CART_STATUS,
    });

    if (!cart) {
      cart = new cartModel({
        customerId: req.user.id,
        products: [],
        total: 0,
        status: CART_STATUS,
      });
    }

    const existingItem = cart.products.find(
      (item) => item.productId?.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity || 0) + Number(quantity || 1);
    } else {
      cart.products.push({ productId, quantity: Number(quantity || 1), subtotal: 0 });
    }

    await recalculateCart(cart);
    await cart.save();

    const populatedCart = await populateCart(cartModel.findById(cart._id));
    return res.status(200).json(populatedCart);
  } catch (error) {
    console.log("addItemToMyCart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

cartController.updateMyCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await cartModel.findOne({
      customerId: req.user.id,
      status: CART_STATUS,
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter((item) => {
      if (item.productId?.toString() !== productId) return true;

      item.quantity = Number(quantity || 0);
      return item.quantity > 0;
    });

    await recalculateCart(cart);
    await cart.save();

    const populatedCart = await populateCart(cartModel.findById(cart._id));
    return res.status(200).json(populatedCart);
  } catch (error) {
    console.log("updateMyCartItem error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

cartController.removeMyCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await cartModel.findOne({
      customerId: req.user.id,
      status: CART_STATUS,
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) => item.productId?.toString() !== productId
    );

    await recalculateCart(cart);
    await cart.save();

    const populatedCart = await populateCart(cartModel.findById(cart._id));
    return res.status(200).json(populatedCart);
  } catch (error) {
    console.log("removeMyCartItem error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

cartController.checkoutMyCart = async (req, res) => {
  try {
    const {
      shipping_address,
      shipping_phone,
      payment_method = "Card",
      payment_status = "Pending",
    } = req.body;

    const cart = await populateCart(
      cartModel.findOne({ customerId: req.user.id, status: CART_STATUS })
    );

    if (!cart || !cart.products?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const itemDetails = cart.products.map((item) => {
      const product = item.productId || {};
      const variant = product.variants?.[0] || {};

      return {
        product_id: product._id,
        name: product.name,
        selected_variant: [variant.size, variant.color].filter(Boolean).join(" / "),
        quantity: item.quantity,
        unit_price: Number(product.price || 0),
      };
    });

    const sale = await salesModel.create({
      sales_date: new Date(),
      employee_id: req.user.userType === "Employee" ? req.user.id : undefined,
      cart_id: cart._id,
      origin: "Web",
      applied_price_type: "Retail",
      payment_method,
      payment_status,
      shipping_address,
      shipping_phone,
      item_details: itemDetails,
    });

    cart.status = "Completed";
    await cart.save();

    return res.status(201).json({
      message: "Order created",
      sale,
    });
  } catch (error) {
    console.log("checkoutMyCart error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//SELECT
cartController.getAllCarts = async (req, res) => {
  try {
    const carts = await cartModel
      .find()
      .populate("customerId", "name email")
      .populate("products.productId", "name price images variants description");

    return res.status(200).json(carts);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//SELECT by id
cartController.getCartById = async (req, res) => {
  try {
    const cart = await cartModel
      .findById(req.params.id)
      .populate("customerId", "name email")
      .populate("products.productId", "name price images variants description");

    return res.status(200).json(cart);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//INSERT
cartController.insertCart = async (req, res) => {
  try {
    //#1- Solicito los datos a ingresar
    const { customerId, products, status } = req.body;

    ///////////CALCULAR EL SUBTOTAL Y EL TOTAL///////

    //Variable para guardar el total a pagar
    let total = 0;

    //Arreglo de productos
    let newProducts = [];

    //De todos los productos, voy a recorrer uno por uno
    //calculando el subtotal y el total a pagar
    for (let i = 0; i < products.length; i++) {
      //Buscamos el producto en la base de datos
      const productFound = await productsModel.findById(products[i].productId);

      //Calcular el subtotal
      const subtotal = productFound.price * products[i].quantity;

      //Calcular el total
      total += subtotal;

      //guardamos el producto junto con la cantidad y el subtotal
      newProducts.push({
        productId: products[i].productId,
        quantity: products[i].quantity,
        subtotal: subtotal,
      });
    }

    //Guardamos todo en la base de datos
    const newCart = new cartModel({
      customerId,
      products: newProducts,
      total,
      status,
    });

    await newCart.save();

    return res.status(200).json({ message: "Cart saved" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//UPDATE
cartController.updateCart = async (req, res) => {
  try {
    //#1- Solicitamos los datos que vamos a actualizar
    const { customerId, products, status } = req.body;

    //////CALCULAR EL SUBTOTAL Y TOTAL
    let total = 0;

    let newProducts = [];

    for (let i = 0; i < products.length; i++) {
      //Buscar el producto
      const productFound = await productsModel.findById(products[i].productId);
      //Calculamos el subtotal
      const subtotal = productFound.price * products[i].quantity;
      //calculamos el total
      total += subtotal;
      //Guardamos el producto junto con el subtotal y la cantidad
      newProducts.push({
        productId: products[i].productId,
        quantity: products[i].quantity,
        subtotal: subtotal,
      });
    }

    //Actualizo en la base de datos
    const updatedCart = await cartModel.findByIdAndUpdate(
      req.params.id,
      {
        customerId,
        products: newProducts,
        total,
        status,
      },
      { new: true },
    );

    return res.status(200).json({ message: "Cart updated" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ELIMINAR
cartController.deleteCart = async (req, res) => {
  try {
    const deleteCart = await cartModel.findByIdAndDelete(req.params.id);

    if (!deleteCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json({ message: "Cart deleted" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default cartController;
