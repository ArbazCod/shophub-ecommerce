import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";
import upload from "../middlewares/upload.middleware.js"; // 🔥 ADD THIS

const router = express.Router();

// 📦 Public Routes
router.get("/", getAllProducts);
router.get("/:slug", getProductBySlug);

// 🛒 Admin Routes (UPDATED)
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"), // 🔥 IMPORTANT
  createProduct
);

router.put("/:slug", protect, adminOnly, updateProduct);
router.delete("/:slug", protect, adminOnly, deleteProduct);

export default router;