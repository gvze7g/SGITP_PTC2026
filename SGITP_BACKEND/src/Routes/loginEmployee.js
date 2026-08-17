import express from "express";
import loginEmployeeController from "../Controller/loginEmployeeController.js";

const router = express.Router();

router.route("/").post(loginEmployeeController.login);

export default router;