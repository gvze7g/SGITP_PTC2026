import { Router } from "express";
import employeeController from "../Controller/employeeController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente"),
  employeeController.getEmployees
);

router.get(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador", "Gerente"),
  employeeController.getEmployeeById
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador"),
  employeeController.insertEmployee
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador"),
  employeeController.updateEmployee
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrador"),
  employeeController.deleteEmployee
);

export default router;