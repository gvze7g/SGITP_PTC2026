// Rutas de promotions

import express from "express";
import SalesController from "../Controller/salesController.js";
import {
  attachCustomerType,
  validateAuthCookie,
  validateEmployeeRole,
} from "../Middlewares/authMiddleware.js";

const router = express.Router();

// Ventas e historial: solo administradores del panel.
const adminOnly = [validateAuthCookie(["Employee"]), validateEmployeeRole("Administrator")];

router
  .route("/")
  .get(...adminOnly, SalesController.getSales)
  .post(...adminOnly, SalesController.insertSales);

router
  .route("/best-sellers")
  .get(attachCustomerType, SalesController.getBestSellers);

router
  .route("/mine")
  .get(validateAuthCookie(["Customer"]), SalesController.getMySales);

router
    .route("/:id")
    .put(...adminOnly, SalesController.updateSales)
    .delete(...adminOnly, SalesController.deleteSales);
  
  export default router;
