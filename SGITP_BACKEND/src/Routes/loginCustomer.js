import express from "express";
import loginCustomerController from "../Controller/loginCustomerController";

const router = express.Router();

router.route("/").post(loginCustomerController.login);
export default router;