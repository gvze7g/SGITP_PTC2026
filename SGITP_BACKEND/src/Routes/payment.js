import { Router } from "express";
import paymentController from "../Controller/paymentController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Contabilidad"),
  paymentController.getPayments
);

router.get(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Contabilidad"),
  paymentController.getPaymentById
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Contabilidad"),
  paymentController.insertPayment
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Contabilidad"),
  paymentController.updatePayment
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador"),
  paymentController.deletePayment
);

export default router;