import express from "express";
import cartController from "../Controller/shopping_cartController.js";
import { validateAuthCookie } from "../Middlewares/authMiddleware.js";

const router = express.Router();
const webStoreUsers = ["Customer", "Employee"];

router.route("/mine")
  .get(validateAuthCookie(webStoreUsers), cartController.getMyCart)
  .post(validateAuthCookie(webStoreUsers), cartController.addItemToMyCart);

router
  .route("/mine/checkout")
  .post(validateAuthCookie(webStoreUsers), cartController.checkoutMyCart);

router.route("/mine/:productId")
  .put(validateAuthCookie(webStoreUsers), cartController.updateMyCartItem)
  .delete(validateAuthCookie(webStoreUsers), cartController.removeMyCartItem);

router.route("/")
  .get(cartController.getAllCarts)
  .post(cartController.insertCart);

router.route("/:id")
  .put(cartController.updateCart)
  .delete(cartController.deleteCart)
  .get(cartController.getCartById);

export default router;
