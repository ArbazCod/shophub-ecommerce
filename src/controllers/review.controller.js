import Review from "../models/review.model.js";
import Product from "../models/product.model.js";

// ✅ NEW IMPORT (Notification)
import { notifyNewReview } from "../services/notification.service.js";

/**
 * 🔄 Recalculate product rating
 */
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const numReviews = reviews.length;

  const avgRating =
    numReviews === 0
      ? 0
      : reviews.reduce((acc, item) => acc + item.rating, 0) / numReviews;

  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    numReviews,
  });
};

/**
 * 🟢 Add Review
 */
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    // ✅ 🔥 NOTIFICATION (ADMIN GETS ALERT)
    await notifyNewReview({
      user: req.user,
      productId: product._id,
    });

    await updateProductRating(productId);

    res.status(201).json({
      message: "Review added",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✏ Update Review
 */
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    await updateProductRating(review.product);

    res.status(200).json({
      message: "Review updated",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ❌ Delete Review
 */
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const productId = review.product;

    await review.deleteOne();

    await updateProductRating(productId);

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 📦 Get Reviews for Product
 */
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    }).populate("user", "name");

    res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


