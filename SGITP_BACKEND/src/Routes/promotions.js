import express from "express";
import promotionsController from "../Controller/promotionsController.js";

const router = express.Router();

router
  .route("/")
  .get(promotionsController.getPromotions)
  .post(promotionsController.insertPromotions);

router
    .route("/:id")
    .put(promotionsController.updatePromotions)
    .delete(promotionsController.deletePromotions);
  
  export default router;