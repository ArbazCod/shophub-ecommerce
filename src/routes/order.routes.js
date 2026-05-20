import express from "express";
import {
  createOrder,
  getMyOrders,
  cancelOrder,
  downloadInvoice
} from "../controllers/order.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);

// ✅ FIXED (use id)
router.get("/:id/invoice", protect, downloadInvoice);

router.put("/:id/cancel", protect, cancelOrder);

export default router;