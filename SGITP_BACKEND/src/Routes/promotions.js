import { Router } from "express";
import promotionsController from "../Controller/promotionsController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = Router();

// Validar un cupón desde el carrito (cliente logueado). Va antes de "/:id"
// para que Express no confunda "validate" con un id de promocion.
router.get(
  "/validate/:code",
  validateAuthCookie(["Customer", "Employee"]),
  promotionsController.validateCoupon
);

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  promotionsController.getPromotions
);

router.get(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  promotionsController.getPromotionById
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  promotionsController.insertPromotion
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  promotionsController.updatePromotion
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  promotionsController.deletePromotion
);

export default router;