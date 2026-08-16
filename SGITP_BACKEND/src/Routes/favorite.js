import { Router } from "express";
import favoriteController from "../Controller/favoritesController.js";
import {
  validateAuthCookie,
  validateEmployeeRole
} from "../Middlewares/authMiddleware.js";

const router = Router();

// Rutas del cliente logueado (app móvil / web pública): cada quien solo ve
// y edita sus propios favoritos. Van antes que las rutas de admin de abajo
// porque "/mine" no debe pasar por validateEmployeeRole.
router.get(
  "/mine",
  validateAuthCookie(["Customer"]),
  favoriteController.getMyFavorites
);

router.post(
  "/mine",
  validateAuthCookie(["Customer"]),
  favoriteController.addMyFavorite
);

router.delete(
  "/mine/:productId",
  validateAuthCookie(["Customer"]),
  favoriteController.removeMyFavorite
);

// GET ALL (panel de administración)
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