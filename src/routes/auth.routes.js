import express from "express";
import {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
  uploadProfileImage,
  getProfile // ✅ ADD THIS
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = express.Router();

/* 🔐 Auth routes */

router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);

/* 👤 Profile routes */

// ✅ 🔥 THIS WAS MISSING (MOST IMPORTANT FIX)
router.get("/me", protect, getProfile);

router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

router.put(
  "/profile-image",
  protect,
  upload.single("image"),
  uploadProfileImage
);

export default router;