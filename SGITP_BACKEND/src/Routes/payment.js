import express from "express";
import {
  getPayment,
  deletePayment,
  insertPayment,
  updatePayment,
} from "../Controller/paymentController.js";

import { validateAuthCookie } from "../middlewares/authMiddleware.js";

//Router() nos ayuda a colocar los métodos
//que tendrá mi endpoint

const router = express.Router();

router
  .route("/")
  .get(validateAuthCookie([ "admin"]), getPayment)
  .post(validateAuthCookie(["admin"]), insertPayment);

router
  .route("/:id")
  .put(validateAuthCookie(["admin"]), updatePayment)
  .delete(validateAuthCookie(["admin"]), deletePayment);

export default router;