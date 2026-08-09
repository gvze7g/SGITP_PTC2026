import express from "express";
import loginCustomerController from "../Controller/loginCustomerController.js";

const router = express.Router();

router.route("/").post(loginCustomerController.login);
export default router;