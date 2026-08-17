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

// Busca la oferta vigente de un producto: activa y dentro de su rango de fechas
// (si no tiene fechas, basta con "active: true"). "value" es un porcentaje 0-100.
const getActiveOffer = (offers = [], now = new Date()) => {
  if (!Array.isArray(offers)) return null;

  return (
    offers.find((offer) => {
      if (!offer?.active) return false;
      if (typeof offer.value !== "number" || offer.value <= 0) return false;
      if (offer.startDate && now < new Date(offer.startDate)) return false;
      if (offer.endDate && now > new Date(offer.endDate)) return false;
      return true;
    }) || null
  );
};

// Unico lugar donde se calcula el precio de oferta, para que el badge (-20%,
// -35%...) y el precio final mostrados nunca queden inconsistentes entre
// componentes/paginas.
const decorateWithOfferPricing = (productDoc) => {
  const product = typeof productDoc.toObject === "function" ? productDoc.toObject() : productDoc;
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

// GET ALL
productController.getProducts = async (req, res) => {
  try {
    const products = await productsModel.find();
    return res.status(200).json(products);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET BY ID
productController.getProductById = async (req, res) => {
  try {
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(decorateWithOfferPricing(product));
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Productos con oferta activa vigente, para la seccion "Ofertas" de la web publica
productController.getOfferProducts = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 8), 20);

    // Pre-filtro barato en Mongo (cualquier oferta marcada activa); la fecha
    // exacta y el orden final se resuelven en JS con la misma logica que
    // getProductById, para que el precio mostrado nunca quede inconsistente.
    const candidates = await productsModel.find({ "offers.active": true });

    const productsWithOffer = candidates
      .map(decorateWithOfferPricing)
      .filter((product) => product.hasActiveOffer)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
      .slice(0, limit);

    return res.status(200).json(productsWithOffer);
  } catch (error) {
    console.log("Error: " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SEARCH BY NAME
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

// FILTER BY PRICE RANGE
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

// LOW STOCK
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

// COUNT PRODUCTS
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

// INSERT
productController.insertProducts = async (req, res) => {
  try {
    const { name, description, category, variants, price, cost, offers } = req.body;

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
    const parsedOffers =
      typeof offers === "string" ? JSON.parse(offers) : offers;

    const newProduct = new productsModel({
      name,
      description,
      category,
      images: imagesArray,
      variants: parsedVariants,
      price,
      cost,
      offers: parsedOffers,
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

// UPDATE
productController.updateProducts = async (req, res) => {
  try {
    const { name, description, category, variants, price, cost, offers } = req.body;

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
    const parsedOffers =
      typeof offers === "string" ? JSON.parse(offers) : offers;

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
        offers: parsedOffers,
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

// DELETE
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