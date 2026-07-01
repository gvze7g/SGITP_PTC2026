import { Router } from "express";
import authController from "../Controller/authController.js";
import { validateAuthCookie } from "../Middlewares/authMiddleware.js";

const router = Router();

router.get("/me", validateAuthCookie(["Employee", "Customer"]), authController.me);

export default router;