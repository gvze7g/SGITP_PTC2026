import { Router } from "express";
import productController from "../Controller/productController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";
import upload from "../utils/cloudinaryConfig.js";

const router = Router();

router.post(
  "/search",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  productController.searchByName
);

router.post(
  "/price-range",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  productController.getProductsByPriceRange
);

router.get(
  "/status/low-stock",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  productController.getLowStock
);

router.get(
  "/status/count",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  productController.countProducts
);

// Catálogo para la app móvil: cualquier cliente logueado puede ver los
// productos (a diferencia de las rutas de abajo, que son solo para el
// panel de administración). Van antes de "/:id" para que Express no las
// confunda con un id de producto.
router.get(
  "/catalog",
  validateAuthCookie(["Customer", "Employee"]),
  productController.getProducts
);

router.get(
  "/catalog/:id",
  validateAuthCookie(["Customer", "Employee"]),
  productController.getProductById
);

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  productController.getProducts
);

router.get(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  productController.getProductById
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  upload.array("images", 5),
  productController.insertProducts
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  upload.array("images", 5),
  productController.updateProducts
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  upload.array("images", 5),
  productController.deleteProducts
);

export default router;