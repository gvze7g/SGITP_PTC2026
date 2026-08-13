import express from "express";
import customerController from "../Controller/customerController.js";
import { validateAuthCookie } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.route("/me/addresses")
    .get(validateAuthCookie(["Customer"]), customerController.getMyAddresses)
    .post(validateAuthCookie(["Customer"]), customerController.addMyAddress);

router.route("/me/addresses/:addressId")
    .put(validateAuthCookie(["Customer"]), customerController.updateMyAddress)
    .delete(validateAuthCookie(["Customer"]), customerController.deleteMyAddress);

router.route("/")
    .get(customerController.getCustomers)
    .post(customerController.insertCustomer);

router.route("/:id")
    .put(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

export default router;
