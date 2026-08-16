import favoriteModel from "../Model/favorite.js";

const favoriteController = {};

// GET de los favoritos del cliente logueado (usa el id que dejó el token en req.user)
favoriteController.getMyFavorites = async (req, res) => {
  try {
    const favorites = await favoriteModel.find({ customer_id: req.user.id });

    return res.status(200).json(favorites);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT de un favorito para el cliente logueado (evita duplicados del mismo producto)
favoriteController.addMyFavorite = async (req, res) => {
  try {
    const { product_id } = req.body;
    const customer_id = req.user.id;

    const existing = await favoriteModel.findOne({ customer_id, product_id });
    if (existing) {
      return res.status(200).json({ message: "Favorite already saved", favorite: existing });
    }

    const newFavorite = new favoriteModel({ customer_id, product_id });
    await newFavorite.save();

    return res.status(201).json({
      message: "Favorite saved",
      favorite: newFavorite,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE de un favorito del cliente logueado, buscado por product_id (no por
// el _id del favorito, que el cliente nunca ve)
favoriteController.removeMyFavorite = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { productId } = req.params;

    const deletedFavorite = await favoriteModel.findOneAndDelete({
      customer_id,
      product_id: productId,
    });

    if (!deletedFavorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    return res.status(200).json({ message: "Favorite deleted successfully" });
  } catch (error) {
    console.log("removeMyFavorite error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET ALL (panel de administración: todos los favoritos de todos los clientes)
favoriteController.getFavorites = async (req, res) => {
  try {
    const favorites = await favoriteModel.find();

    return res.status(200).json(favorites);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
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
        message: "Favorite saved",
        favorite: newFavorite
      });
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({ message: "Internal server error" });
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
        return res.status(404).json({ message: "Favorite not found" });
      }
  
      return res.status(200).json({
        message: "Favorite updated",
        favorite: updatedFavorite
      });
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  // DELETE
  favoriteController.deleteFavorite = async (req, res) => {
    try {
      const deletedFavorite = await favoriteModel.findByIdAndDelete(
        req.params.id
      );
  
      if (!deletedFavorite) {
        return res.status(404).json({ message: "Favorite not found" });
      }
  
      return res.status(200).json({
        message: "Favorite deleted successfully"
      });
    } catch (error) {
      console.log("deleteFavorite error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  export default favoriteController;