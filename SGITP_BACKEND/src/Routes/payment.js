import { Router } from "express";
import paymentController from "../Controller/paymentController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  paymentController.getPayments
);

router.get(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  paymentController.getPaymentById
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  paymentController.insertPayment
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  paymentController.updatePayment
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  paymentController.deletePayment
);

export default router;