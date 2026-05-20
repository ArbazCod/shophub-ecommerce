import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
    },

    razorpayPaymentId: String,

    razorpaySignature: String,

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: String,

    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },

    paidAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;