import { Router } from "express";
import logoutController from "../Controller/logoutController.js";

const router = Router();

router.post("/", logoutController.logout);

export default router;