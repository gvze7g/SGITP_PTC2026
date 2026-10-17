import { Router } from "express";
import productController from "../Controller/productController.js";
import {
  attachCustomerType,
  validateAuthCookie,
  validateEmployeeRole,
} from "../Middlewares/authMiddleware.js";
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
  attachCustomerType,
  productController.getCatalogProducts
);

// Lista cerrada de categorías (selector del panel y filtros de la tienda).
router.get(
  "/catalog/categories",
  productController.getCategories
);

// Ofertas activas para la seccion publica "Ofertas" del Home. Va antes de
// "/catalog/:id" para que Express no confunda "offers" con un id de producto.
router.get(
  "/catalog/offers",
  attachCustomerType,
  productController.getOfferProducts
);

router.get(
  "/catalog/:id",
  attachCustomerType,
  productController.getCatalogProductById
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
