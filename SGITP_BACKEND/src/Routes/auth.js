import { Router } from "express";
import authController from "../Controller/authController.js";
import googleAuthController from "../Controller/googleAuthController.js";
import appleAuthController from "../Controller/appleAuthController.js";
import { validateAuthCookie } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get("/me", validateAuthCookie(["Employee", "Customer"]), authController.me);
router.post("/google", googleAuthController.google);
router.post("/apple", appleAuthController.apple);

export default router;