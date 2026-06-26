import express from "express";
import productController from "../Controller/productController.js";

//Router() nos ayudará a colocar los métodos
//que tendrá el endpoint
const router = express.Router();

router
  .route("/")
  .get(productController.getProducts)
  .post(productController.insertProducts);

router.route("/searchByName").post(productController.searchByName);

router.route("/low-stock").get(productController.getLowStock);

router.route("/price-range").post(productController.getProductsByPriceRange);

router.route("/count").get(productController.countProducts);

router
  .route("/:id")
  .get(productController.getProductById)
  .put(productController.updateProducts)
  .delete(productController.deleteProducts);

export default router;