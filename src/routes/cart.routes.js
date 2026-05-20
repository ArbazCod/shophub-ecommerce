import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cart.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes protected
router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/", updateCartItem);
router.delete("/:productId", removeCartItem);

export default router;