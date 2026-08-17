import { Router } from "express";
import paymentMethodController from "../Controller/paymentMethodController.js";
import { validateAuthCookie } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/mine",
  validateAuthCookie(["Customer"]),
  paymentMethodController.getMyPaymentMethods
);

router.post(
  "/mine",
  validateAuthCookie(["Customer"]),
  paymentMethodController.addMyPaymentMethod
);

router.put(
  "/mine/:id",
  validateAuthCookie(["Customer"]),
  paymentMethodController.updateMyPaymentMethod
);

router.delete(
  "/mine/:id",
  validateAuthCookie(["Customer"]),
  paymentMethodController.deleteMyPaymentMethod
);

export default router;
