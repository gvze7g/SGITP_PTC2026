// Rutas de promotions

import express from "express";
import posController from "../Controller/posController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get(
    "/",
    validateAuthCookie(["Employee"]),
    validateEmployeeRole("Administrador", "Gerente"),
    posController.getPos
  );
  
  router.post(
    "/",
    validateAuthCookie(["Employee"]),
    validateEmployeeRole("Administrador", "Gerente"),
    posController.insertPos
  );
  
  router.put(
    "/:id",
    validateAuthCookie(["Employee"]),
    validateEmployeeRole("Administrador", "Gerente"),
    posController.updatePos
  );
  
  router.delete(
    "/:id",
    validateAuthCookie(["Employee"]),
    validateEmployeeRole("Administrador"),
    posController.deletePos
  );
  
  export default router;