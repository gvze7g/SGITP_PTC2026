import favoriteModel from "../Model/favorite.js";

const favoriteController = {};

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