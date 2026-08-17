import favoriteModel from "../Model/favorite.js";

const favoriteController = {};

// Favoritos del cliente autenticado (los ve, agrega y quita solo el),
// usando el mismo modelo Favorite que ya tenia el CRUD de administracion.

// GET /favorite/mine
favoriteController.getMyFavorites = async (req, res) => {
  try {
    const favorites = await favoriteModel
      .find({ customer_id: req.user.id })
      .populate("product_id", "name price images category offers variants")
      .sort({ createdAt: -1 });

    return res.status(200).json(favorites);
  } catch (error) {
    console.log("getMyFavorites error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /favorite/mine
favoriteController.addMyFavorite = async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "product_id is required" });
    }

    const existing = await favoriteModel.findOne({
      customer_id: req.user.id,
      product_id,
    });

    if (existing) {
      return res.status(200).json({ message: "Already in favorites", favorite: existing });
    }

    const favorite = await favoriteModel.create({
      customer_id: req.user.id,
      product_id,
    });

    return res.status(201).json({ message: "Favorite saved", favorite });
  } catch (error) {
    console.log("addMyFavorite error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /favorite/mine/:productId
favoriteController.removeMyFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    // El filtro incluye customer_id: un cliente solo puede borrar SUS
    // propios favoritos, nunca los de otro, sin importar el productId que mande.
    const deleted = await favoriteModel.findOneAndDelete({
      customer_id: req.user.id,
      product_id: productId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    return res.status(200).json({ message: "Favorite removed" });
  } catch (error) {
    console.log("removeMyFavorite error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET ALL
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