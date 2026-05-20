import mongoose from "mongoose";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Product from "../models/product.model.js";

/* =====================================================
   🔹 INTERNAL FUNCTION – FINALIZE PAYMENT (CORE LOGIC)
   Used by BOTH verify route and webhook
===================================================== */

const finalizePayment = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  session
) => {
  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
  })
    .populate("order")
    .session(session);

  if (!payment) {
    throw new Error("Payment record not found");
  }

  // Idempotency protection
  if (payment.status === "paid") {
    return "already_paid";
  }

  const order = payment.order;

  // Deduct stock safely
  for (const item of order.items) {
    const product = await Product.findById(item.product).session(session);

    if (!product || product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }

    product.stock -= item.quantity;
    await product.save({ session });
  }

  // Update payment
  payment.status = "paid";
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature || "";
  payment.paidAt = new Date();
  await payment.save({ session });

  // Update order
  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  order.paidAt = new Date();
  await order.save({ session });

  return "success";
};

/* =====================================================
   🟢 STEP 1: CREATE RAZORPAY ORDER
===================================================== */

export const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const existingPayment = await Payment.findOne({
      order: order._id,
      status: "created",
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already initiated",
      });
    }

    const options = {
      amount: order.totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${order._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    await Payment.create({
      user: req.user._id,
      order: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      status: "created",
    });

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: "INR",
       key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   🟢 STEP 2: VERIFY PAYMENT (Frontend Flow)
===================================================== */

export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid signature");
    }

    const result = await finalizePayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      session
    );

    await session.commitTransaction();
    session.endSession();

    if (result === "already_paid") {
      return res.status(200).json({ message: "Payment already verified" });
    }

    res.status(200).json({ message: "Payment verified successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

/* =====================================================
   🌐 WEBHOOK (Server-to-Server Confirmation)
===================================================== */

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const razorpay_order_id =
        event.payload.payment.entity.order_id;

      const razorpay_payment_id =
        event.payload.payment.entity.id;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        await finalizePayment(
          razorpay_order_id,
          razorpay_payment_id,
          null,
          session
        );

        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};