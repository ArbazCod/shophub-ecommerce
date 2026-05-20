import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

import {
  createShipment,
  updateShipmentStatus,
  getShipment
} from "../controllers/shipment.controller.js";

const router = express.Router();

/* ===============================
   Admin Routes
================================ */

router.post("/", protect, adminOnly, createShipment);

router.patch("/:id/status", protect, adminOnly, updateShipmentStatus);


/* ===============================
   User Routes
================================ */

// 🚚 FIXED ROUTE (IMPORTANT)
router.get("/:orderId", protect, getShipment);

export default router;