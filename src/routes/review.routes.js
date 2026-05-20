import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  addReview,
  updateReview,
  deleteReview,
  getProductReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.get("/:productId", getProductReviews);

router.post("/", protect, addReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;