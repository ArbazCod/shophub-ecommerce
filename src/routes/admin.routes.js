import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

import {
  getAdminStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  blockUser,
  unblockUser,
  getAllReviews   // ✅ ADD THIS
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getAdminStats);

router.get("/orders", protect, adminOnly, getAllOrders);

router.patch("/orders/:id/status", protect, adminOnly, updateOrderStatus);

router.get("/users", protect, adminOnly, getAllUsers);

router.patch("/users/:id/block", protect, adminOnly, blockUser);

router.patch("/users/:id/unblock", protect, adminOnly, unblockUser);

// ✅ ADD THIS ROUTE (IMPORTANT)
router.get("/reviews", protect, adminOnly, getAllReviews);

export default router;