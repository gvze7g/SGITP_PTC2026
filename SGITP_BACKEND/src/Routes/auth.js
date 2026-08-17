import { Router } from "express";
import authController from "../Controller/authController.js";
import googleAuthController from "../Controller/googleAuthController.js";
import { validateAuthCookie } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get("/me", validateAuthCookie(["Employee", "Customer"]), authController.me);
router.post("/google", googleAuthController.google);

export default router;