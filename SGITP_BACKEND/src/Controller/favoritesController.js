import favoriteModel from "../Model/favorite.js";
import customerModel from "../Model/customer.js";
import productsModel from "../Model/products.js";
import { toCatalogProduct } from "../utils/pricing.js";
import { isValidObjectId } from "../utils/validators.js";

const favoriteController = {};

// Favoritos del cliente autenticado (los ve, agrega y quita solo el),
// usando el mismo modelo Favorite que ya tenia el CRUD de administracion.

// GET /favorite/mine
favoriteController.getMyFavorites = async (req, res) => {
  try {
    const favorites = await favoriteModel
      .find({ customer_id: req.user.id })
      .populate("product_id", "name price cost images category offers variants")
      .sort({ createdAt: -1 });

    // Mismo formato que el catálogo: el mayorista ve su precio y nadie más
    // recibe "cost".
    const customer = await customerModel.findById(req.user.id).select("customer_type");
    const customerType = customer?.customer_type || null;

    return res.status(200).json(
      favorites.map((favorite) => {
        const data = favorite.toObject();
        if (data.product_id && typeof data.product_id === "object") {
          data.product_id = toCatalogProduct(data.product_id, customerType);
        }
        return data;
      })
    );
  } catch (error) {
    console.log("getMyFavorites error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// POST /favorite/mine
favoriteController.addMyFavorite = async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Selecciona un producto" });
    }

    if (!isValidObjectId(product_id) || !(await productsModel.exists({ _id: product_id }))) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const existing = await favoriteModel.findOne({
      customer_id: req.user.id,
      product_id,
    });

    if (existing) {
      return res.status(200).json({ message: "Ya está en tus favoritos", favorite: existing });
    }

    const favorite = await favoriteModel.create({
      customer_id: req.user.id,
      product_id,
    });

    return res.status(201).json({ message: "Guardado en favoritos", favorite });
  } catch (error) {
    console.log("addMyFavorite error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// DELETE /favorite/mine/:productId
favoriteController.removeMyFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(404).json({ message: "Favorito no encontrado" });
    }

    // El filtro incluye customer_id: un cliente solo puede borrar SUS
    // propios favoritos, nunca los de otro, sin importar el productId que mande.
    const deleted = await favoriteModel.findOneAndDelete({
      customer_id: req.user.id,
      product_id: productId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Favorito no encontrado" });
    }

    return res.status(200).json({ message: "Se quitó de tus favoritos" });
  } catch (error) {
    console.log("removeMyFavorite error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// GET ALL (panel de administración: todos los favoritos de todos los clientes)
favoriteController.getFavorites = async (req, res) => {
  try {
    const favorites = await favoriteModel.find();

    return res.status(200).json(favorites);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
  }
};

// INSERT
favoriteController.insertFavorite = async (req, res) => {
    try {
      const {
        customer_id,
        product_id
      } = req.body;
  
      const newFavorite = new favoriteModel({
        customer_id,
        product_id
      });
  
      await newFavorite.save();
  
      return res.status(201).json({
        message: "Guardado en favoritos",
        favorite: newFavorite
      });
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
    }
  };
  
  // UPDATE
  favoriteController.updateFavorite = async (req, res) => {
    try {
      const {
        customer_id,
        product_id
      } = req.body;
  
      const updatedFavorite = await favoriteModel.findByIdAndUpdate(
        req.params.id,
        {
          customer_id,
          product_id
        },
        { new: true }
      );
  
      if (!updatedFavorite) {
        return res.status(404).json({ message: "Favorito no encontrado" });
      }
  
      return res.status(200).json({
        message: "Favorito actualizado",
        favorite: updatedFavorite
      });
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
    }
  };
  
  // DELETE
  favoriteController.deleteFavorite = async (req, res) => {
    try {
      const deletedFavorite = await favoriteModel.findByIdAndDelete(
        req.params.id
      );
  
      if (!deletedFavorite) {
        return res.status(404).json({ message: "Favorito no encontrado" });
      }
  
      return res.status(200).json({
        message: "Favorito eliminado correctamente"
      });
    } catch (error) {
      console.log("deleteFavorite error:", error);
      return res.status(500).json({ message: "Ocurrió un error en el servidor, intenta de nuevo" });
    }
  };
  
  export default favoriteController;