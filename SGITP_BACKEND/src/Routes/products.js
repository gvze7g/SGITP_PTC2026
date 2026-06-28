import { Router } from "express";
import productController from "../Controller/productController.js";
import { validateAuthCookie } from "../Middlewares/authMiddleware.js";
import upload from "../utils/cloudinaryConfig.js";

const router = Router();

router.post("/search", productController.searchByName);
router.post("/price-range", productController.getProductsByPriceRange);
router.get("/status/low-stock", productController.getLowStock);
router.get("/status/count", productController.countProducts);

router.route("/")
  .get(productController.getProducts)
  .post(validateAuthCookie(["employee", "admin"]), upload.array("images", 5), productController.insertProducts);

router.route("/:id")
  .get(productController.getProductById)
  .put(validateAuthCookie(["employee", "admin"]), upload.array("images", 5), productController.updateProducts)
  .delete(validateAuthCookie(["employee", "admin"]), productController.deleteProducts);

export default router;