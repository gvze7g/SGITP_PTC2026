// Rutas de promotions

import express from "express";
import SalesController from "../Controller/salesController.js";
import { validateAuthCookie } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(validateAuthCookie(["Employee"]), SalesController.getSales)
  .post(validateAuthCookie(["Employee"]), SalesController.insertSales);

router
  .route("/best-sellers")
  .get(SalesController.getBestSellers);

router
  .route("/mine")
  .get(validateAuthCookie(["Customer"]), SalesController.getMySales);

router
    .route("/:id")
    .put(validateAuthCookie(["Employee"]), SalesController.updateSales)
    .delete(validateAuthCookie(["Employee"]), SalesController.deleteSales);
  
  export default router;
