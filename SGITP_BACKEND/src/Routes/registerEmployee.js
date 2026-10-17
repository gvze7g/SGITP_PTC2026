import express from "express";
import registerEmployeeController from "../Controller/registerEmployeeController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// Crear empleados (incluidos administradores) es solo para administradores:
// antes cualquiera sin sesión podía registrarse como Administrator.
router.route("/")
.post(
  validateAuthCookie(["Employee"]),
  validateEmployeeRole("Administrator"),
  registerEmployeeController.register
);
router.route("/verifyCodeEmail").post(registerEmployeeController.verifyCode);

export default router;