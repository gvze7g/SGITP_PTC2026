import express from "express";
import cartController from "../Controller/shopping_cartController.js";

const router = express.Router();

router.route("/")
  .get(cartController.getAllCarts)
  .post(cartController.insertCart);

router.route("/:id")
  .put(cartController.updateCart)
  .delete(cartController.deleteCart)
  .get(cartController.getCartById);

export default router;