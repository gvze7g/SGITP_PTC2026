import { Router } from "express";
import spentController from "../Controller/spentController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Contabilidad"),
  spentController.getSpent
);

router.get(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Contabilidad"),
  spentController.getSpentById
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Contabilidad"),
  spentController.insertSpent
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente", "Contabilidad"),
  spentController.updateSpent
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador"),
  spentController.deleteSpent
);

export default router;