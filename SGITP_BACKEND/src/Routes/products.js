import { Router } from "express";
import productController from "../Controller/productController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";
import upload from "../utils/cloudinaryConfig.js";

const router = Router();

router.post(
  "/search",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Inventario"),
  productController.searchByName
);

router.post(
  "/price-range",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Inventario"),
  productController.getProductsByPriceRange
);

router.get(
  "/status/low-stock",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Inventario"),
  productController.getLowStock
);

router.get(
  "/status/count",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Inventario"),
  productController.countProducts
);

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  productController.getProducts
);

router.get(
  "/:id",
  validateAuthCookie(["Employee"]),
  productController.getProductById
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Inventario"),
  upload.array("images", 5),
  productController.insertProducts
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Inventario"),
  upload.array("images", 5),
  productController.updateProducts
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Inventario"),
  productController.deleteProducts
);

export default router;