import express from "express";
import cartController from "../Controller/shopping_cartController.js";
import { validateAuthCookie, validateEmployeeRole } from "../Middlewares/authMiddleware.js";

const router = express.Router();
// El carrito de la tienda es solo para clientes (igual que favoritos,
// direcciones y tarjetas).
const webStoreUsers = ["Customer"];
const adminOnly = [validateAuthCookie(["Employee"]), validateEmployeeRole("Administrator")];

router.route("/mine")
  .get(validateAuthCookie(webStoreUsers), cartController.getMyCart)
  .post(validateAuthCookie(webStoreUsers), cartController.addItemToMyCart);

router
  .route("/mine/checkout")
  .post(validateAuthCookie(webStoreUsers), cartController.checkoutMyCart);

// :itemId es el _id de la línea del carrito (una por talla/color).
router.route("/mine/:itemId")
  .put(validateAuthCookie(webStoreUsers), cartController.updateMyCartItem)
  .delete(validateAuthCookie(webStoreUsers), cartController.removeMyCartItem);

// CRUD general de carritos: expone datos de todos los clientes, así que es
// solo para administradores (antes cualquiera podía listarlos sin sesión).
router.route("/")
  .get(...adminOnly, cartController.getAllCarts)
  .post(...adminOnly, cartController.insertCart);

router.route("/:id")
  .put(...adminOnly, cartController.updateCart)
  .delete(...adminOnly, cartController.deleteCart)
  .get(...adminOnly, cartController.getCartById);

export default router;
