import express from "express";
import customerController from "../Controller/customerController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.route("/me")
    .put(validateAuthCookie(["Customer"]), customerController.updateMyProfile);

router.route("/me/addresses")
    .get(validateAuthCookie(["Customer"]), customerController.getMyAddresses)
    .post(validateAuthCookie(["Customer"]), customerController.addMyAddress);

router.route("/me/addresses/:addressId")
    .put(validateAuthCookie(["Customer"]), customerController.updateMyAddress)
    .delete(validateAuthCookie(["Customer"]), customerController.deleteMyAddress);

// Administración de clientes: solo administradores del panel.
const adminOnly = [validateAuthCookie(["Employee"]), validateEmployeeRole("Administrator")];

router.route("/")
    .get(...adminOnly, customerController.getCustomers)
    .post(...adminOnly, customerController.insertCustomer);

router.route("/:id")
    .put(...adminOnly, customerController.updateCustomer)
    .delete(...adminOnly, customerController.deleteCustomer);

export default router;
