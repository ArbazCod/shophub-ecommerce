import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);

export default router;