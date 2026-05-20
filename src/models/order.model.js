import mongoose from "mongoose";

/* ===============================
   Order Item Schema
================================ */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    priceAtTime: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

/* ===============================
   Order Schema
================================ */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    /* 🔥 Shipping Address */
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      email: { type: String, required: true }, // ✅ added
    },

    /* 🔥 Coupon Support */
    coupon: {
      code: String,
      discount: Number,
    },

    /* 🔥 Payment Details (Razorpay) */
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    /* 🔥 Shipment Link */
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
    },

    paidAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

/* ===============================
   Model Export
================================ */
const Order = mongoose.model("Order", orderSchema);

export default Order;