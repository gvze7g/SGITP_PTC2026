import express from "express";
import customerController from "../Controller/customerController.js";

const router = express.Router();

router.route("/")
    .get(customerController.getCustomers)
    .post(customerController.insertCustomer);

router.route("/:id")
    .put(customerController.updateCustomer)
    .delete(customerController.deleteCustomer);

export default router;
