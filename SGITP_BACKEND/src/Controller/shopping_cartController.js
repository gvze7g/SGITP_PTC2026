import cartModel from "../Model/shopping_cart.js";
import productsModel from "../Model/products.js";

//Array de funciones
const cartController = {};

//SELECT
cartController.getAllCarts = async (req, res) => {
  try {
    const carts = await cartModel
      .find()
      .populate("customerId", "name email")
      .populate("products.productId", "name price");

    return res.status(200).json(carts);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//SELECT by id
cartController.getCartById = async (req, res) => {
  try {
    const cart = cartModel
      .findById(req.params.id)
      .populate("customerId", "name email")
      .populate("products.productId", "name price");

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