import productsModel from "../Model/products.js";
import { cloudinary } from "../utils/cloudinaryConfig.js";

const productController = {};

const uploadBufferToCloudinary = (buffer, folder = "SGITP_BACKEND/products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

const getTotalStock = (variants = []) => {
  if (!Array.isArray(variants)) return 0;

  return variants.reduce((total, variant) => {
    const stock = Number(variant?.stock || 0);
    return total + stock;
  }, 0);
};

productController.getProducts = async (req, res) => {
  try {
    const products = await productsModel.find();
    return res.status(200).json(products);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.getProductById = async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.searchByName = async (req, res) => {
  try {
    const { name } = req.body;

    const products = await productsModel.find({
      name: { $regex: name || "", $options: "i" },
    });

    return res.status(200).json(products);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.getProductsByPriceRange = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;

    const filters = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};

      if (minPrice !== undefined && minPrice !== "") {
        filters.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined && maxPrice !== "") {
        filters.price.$lte = Number(maxPrice);
      }
    }

    const products = await productsModel.find(filters);

    return res.status(200).json(products);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.getLowStock = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold || 5);

    const products = await productsModel.find();

    const lowStockProducts = products.filter((product) => {
      const totalStock = getTotalStock(product.variants);
      return totalStock <= threshold;
    });

    return res.status(200).json(lowStockProducts);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.countProducts = async (req, res) => {
  try {
    const totalProducts = await productsModel.countDocuments();

    const products = await productsModel.find();

    const lowStockCount = products.filter((product) => {
      const totalStock = getTotalStock(product.variants);
      return totalStock <= 5;
    }).length;

    return res.status(200).json({
      totalProducts,
      lowStockCount,
    });
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.insertProducts = async (req, res) => {
  try {
    const { name, description, category, variants, price, cost } = req.body;

    let imagesArray = [];

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer))
      );

      imagesArray = uploadedImages.map((image) => ({
        image: image.secure_url,
        public_id: image.public_id,
      }));
    }

    const parsedVariants =
      typeof variants === "string" ? JSON.parse(variants) : variants;

    const newProduct = new productsModel({
      name,
      description,
      category,
      images: imagesArray,
      variants: parsedVariants,
      price,
      cost,
    });

    await newProduct.save();

    return res.status(201).json({
      message: "Product saved successfully",
      product: newProduct,
    });
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

productController.updateProducts = async (req, res) => {
  try {
    const { name, description, category, variants, price, cost } = req.body;

    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imagesArray = product.images || [];

    if (req.files && req.files.length > 0) {
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }

      const uploadedImages = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer))
      );

      imagesArray = uploadedImages.map((image) => ({
        image: image.secure_url,
        public_id: image.public_id,
      }));
    }

    const parsedVariants =
      typeof variants === "string" ? JSON.parse(variants) : variants;

    const updatedProduct = await productsModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        category,
        images: imagesArray,
        variants: parsedVariants,
        price,
        cost,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
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

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default productController;