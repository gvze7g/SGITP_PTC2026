import { Router } from "express";
import favoriteController from "../Controller/favoritesController.js";
import {
  validateAuthCookie,
  validateEmployeeRole
} from "../Middlewares/authMiddleware.js";

const router = Router();

// Favoritos del propio cliente (privados: solo el dueno de la sesion los ve)
router.get("/mine", validateAuthCookie(["Customer"]), favoriteController.getMyFavorites);
router.post("/mine", validateAuthCookie(["Customer"]), favoriteController.addMyFavorite);
router.delete(
  "/mine/:productId",
  validateAuthCookie(["Customer"]),
  favoriteController.removeMyFavorite
);

// GET ALL
router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  favoriteController.getFavorites
);

// INSERT
router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  favoriteController.insertFavorite
);


// UPDATE
router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  favoriteController.updateFavorite
);


// DELETE
router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  favoriteController.deleteFavorite
);

export default router;