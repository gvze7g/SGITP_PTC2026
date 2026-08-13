// Rutas de promotions

import express from "express";
import SalesController from "../Controller/salesController.js";
import { validateAuthCookie } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(SalesController.getSales)
  .post(SalesController.insertSales);

router
  .route("/best-sellers")
  .get(SalesController.getBestSellers);

router
  .route("/mine")
  .get(validateAuthCookie(["Customer"]), SalesController.getMySales);

router
    .route("/:id")
    .put(SalesController.updateSales)
    .delete(SalesController.deleteSales);
  
  export default router;
