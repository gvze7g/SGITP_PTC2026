// Rutas de promotions

import express from "express";
import SpentController from "../Controller/spentController.js";

const router = express.Router();

router
  .route("/")
  .get(SpentController.getSpent)
  .post(SpentController.insertSpent);

router
    .route("/:id")
    .put(SpentController.updateSpent)
    .delete(SpentController.deleteSpent);
  
  export default router;