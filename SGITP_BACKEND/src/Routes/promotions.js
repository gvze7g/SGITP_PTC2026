import { Router } from "express";
import promotionsController from "../Controller/promotionsController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente"),
  promotionsController.getPromotions
);

router.get(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente"),
  promotionsController.getPromotionById
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente"),
  promotionsController.insertPromotion
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente"),
  promotionsController.updatePromotion
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador"),
  promotionsController.deletePromotion
);

export default router;