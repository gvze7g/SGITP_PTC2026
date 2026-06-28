// Rutas de promotions

import express from "express";
import SalesController from "../Controller/salesController.js";

const router = express.Router();

router
  .route("/")
  .get(SalesController.getSales)
  .post(SalesController.insertSales);

router
    .route("/:id")
    .put(SalesController.updateSales)
    .delete(SalesController.deleteSales);
  
  export default router;