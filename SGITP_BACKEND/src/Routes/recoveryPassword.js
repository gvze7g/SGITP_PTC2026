import express from "express";
import recoveryPasswordController from "../Controller/recoveryPasswordController.js";

const router = express.Router();

router.post("/requestCode", recoveryPasswordController.sendRecoveryCode);
router.post("/verifyCode", recoveryPasswordController.verifyCode);
router.post("/newPassword", recoveryPasswordController.newPassword);

export default router;