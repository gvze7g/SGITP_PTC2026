import express from "express";
import wompiController from "../Controller/wompiController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// Antes ambas rutas eran públicas: cualquiera sin sesión podía sacar un token
// de acceso a la cuenta Wompi de la tienda (con su client_secret) y cobrar
// con él. El token ahora es solo para administradores, y el pago 3DS pide una
// sesión de cliente y consigue el token en el servidor.
router
  .route("/token")
  .post(
    validateAuthCookie(["Employee"]),
    validateEmployeeRole("Administrator"),
    wompiController.generarToken
  );
router.route("/payment3ds").post(validateAuthCookie(["Customer"]), wompiController.payment3ds);

export default router;
