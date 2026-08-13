import { Router } from "express";
import payrollController from "../Controller/payrollController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  payrollController.getPayrolls
);

router.post(
  "/generate",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  payrollController.generatePayroll
);

router.post(
  "/",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  payrollController.insertPayroll
);

router.put(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  payrollController.updatePayroll
);

router.delete(
  "/:id",
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  payrollController.deletePayroll
);

export default router;
