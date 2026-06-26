import productsModel from "../Model/products.js";
import { v2 as cloudinary } from "cloudinary";

const productController = {};

productController.getProducts = async (req, res) => {
  try {
    const products = await productsModel.find();
    res.json(products);
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

productController.insertProducts = async (req, res) => {
  try {
    const { name, description, category, variants, price, cost } = req.body;
    let imagesArray = [];

    if (req.files && req.files.length > 0) {
      imagesArray = req.files.map((file) => ({
        image: file.path,
        public_id: file.filename
      }));
    }

    const newProduct = new productsModel({
      name,
      description,
      category,
      images: imagesArray,
      variants,
      price,
      cost
    });

    await newProduct.save();
    res.status(201).json({ message: "Product saved successfully" });
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

productController.deleteProducts = async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    await productsModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

productController.updateProducts = async (req, res) => {
  try {
    const { name, description, category, variants, price, cost } = req.body;
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imagesArray = product.images;

    if (req.files && req.files.length > 0) {
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }

      imagesArray = req.files.map((file) => ({
        image: file.path,
        public_id: file.filename
      }));
    }

    await productsModel.findByIdAndUpdate(
      req.params.id,
      { name, description, category, images: imagesArray, variants, price, cost },
      { new: true }
    );

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

productController.getProductById = async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "product not found" });
    return res.status(200).json(product);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.searchByName = async (req, res) => {
  try {
    const { name } = req.body;
    const products = await productsModel.find({ name: { $regex: name, $options: "i" } });
    if (!products) return res.status(404).json({ message: "Products not found" });
    return res.status(200).json(products);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.getLowStock = async (req, res) => {
  try {
    const products = await productsModel.find({ stock: { $lt: 5 } });
    if (!products) return res.status(404).json({ message: "Not products with low stock" });
    return res.status(200).json(products);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.getProductsByPriceRange = async (req, res) => {
  try {
    const { min, max } = req.body;
    const products = await productsModel.find({ price: { $gte: min, $lte: max } });
    if (!products) return res.status(404).json({ message: "Products not found" });
    return res.status(200).json(products);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

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