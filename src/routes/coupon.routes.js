import express from "express";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import {
  applyCoupon,
  getAvailableCoupons,
  seedCoupons,
  removeCoupon,  // ✅ Add this import
} from "../controllers/coupon.controller.js";

const router = express.Router();

// ✅ User routes
router.post("/apply", protect, applyCoupon);
router.post("/remove", protect, removeCoupon);  // ✅ Add this route
router.get("/", protect, getAvailableCoupons);

// 🔐 Admin only
router.post("/seed", protect, adminOnly, seedCoupons);

export default router;