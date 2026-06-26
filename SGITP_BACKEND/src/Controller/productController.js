//Creo un array de métodos
const productController = {};

//Import del Schema de la colección
//que vamos a ocupar
import productsModel from "../Model/products.js";

//SELECT
productController.getProducts = async (req, res) => {
  const products = await productsModel.find();
  res.json(products);
};

//INSERTAR
productController.insertProducts = async (req, res) => {
  //#1- Solicitamos los campos
  const { name, description, category, images, variants, price, cost } = req.body;

  const newProduct = new productsModel({ name, description, category, images, variants, price, cost });

  await newProduct.save();

  res.json({ message: "Product save" });
};

//ELIMINAR
productController.deleteProducts = async (req, res) => {
  await productsModel.findByIdAndDelete(req.params.id);
  res.json({ message: "product deleted" });
};

//ACTUALIZAR
productController.updateProducts = async (req, res) => {
  //1- solicitamos los nuevos valores
  const { name, description, category, images, variants, price, cost } = req.body;
  await productsModel.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      category,
      images,
      variants,
      price,
      cost
    },
    { new: true },
  );

  res.json({ message: "product updated" });
};

//SELECT POR ID
productController.getProductById = async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//BUSCAR por nombre
productController.searchByName = async (req, res) => {
  try {
    //#1- Solicitar los datos
    const { name } = req.body;

    const products = await productsModel.find({
      name: { $regex: name, $options: "i" },
    });

    if (!products) {
      return res.status(404).json({ message: "Products not found" });
    }

    return res.status(200).json(products);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Productos con stock bajo
productController.getLowStock = async (req, res) => {
  try {
    const products = await productsModel.find({ stock: { $lt: 5 } });

    if (!products) {
      return res.status(404).json({ message: "Not products with low stock" });
    }

    return res.status(200).json(products);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//FILTROS que el usuario coloque
productController.getProductsByPriceRange = async (req, res) => {
  try {
    //#1- Solicito los datos
    const { min, max } = req.body;

    const products = await productsModel.find({
      price: { $gte: min, $lte: max },
    });

    if (!products) {
      return res.status(404).json({ message: "Products not found" });
    }

    return res.status(200).json(products);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Contar cuantos elemetos hay en una colección
productController.countProducts = async (req, res) => {
  try {
    const count = await productsModel.countDocuments();

    return res.status(200).json(count);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default productController;