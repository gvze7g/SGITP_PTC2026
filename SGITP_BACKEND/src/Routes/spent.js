import { Router } from "express";
import spentController from "../Controller/spentController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  spentController.getSpent
);

router.get(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  spentController.getSpentById
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  spentController.insertSpent
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  spentController.updateSpent
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  spentController.deleteSpent
);

export default router;