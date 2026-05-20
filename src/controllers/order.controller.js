import Shipment from "../models/shipment.model.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";
import { generateInvoice } from "../services/invoice.service.js";

import {
  notifyOrderPlaced,
  notifyOrderStatus,
} from "../services/notification.service.js";


// 🧾 CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    console.log("🔥 createOrder hit");
    console.log("BODY:", req.body);
    console.log("USER:", req.user?._id);

    const { shippingAddress } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        message: "Complete shipping address required",
      });
    }

    let orderItems = [];
    let calculatedTotal = 0;

    for (const item of cart.items) {
      if (!item.product) continue;

      const product = await Product.findById(item.product._id);

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: "Product no longer available",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        priceAtTime: item.priceAtTime,
        quantity: item.quantity,
      });

      calculatedTotal += item.quantity * item.priceAtTime;
    }

    const order = await Order.create({
  user: req.user._id,
  items: orderItems,
  totalAmount: calculatedTotal,
  shippingAddress,
  paymentStatus: "pending",
  orderStatus: "pending",
});

// 🚚 AUTO CREATE SHIPMENT (ADD THIS)
await Shipment.create({
  order: order._id,
  trackingNumber: "TRK-" + Date.now(),
  carrier: "Internal",
  timeline: [
    {
      status: "processing",
      description: "Order placed successfully",
    },
  ],
});

    // 🔔 Notification
    try {
      await notifyOrderPlaced(order, req.user);
    } catch (err) {
      console.error("⚠️ Notification error:", err.message);
    }

    // 📉 Deduct stock
    for (const item of cart.items) {
      if (item.product?._id) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // 🧹 Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      order,
    });

  } catch (error) {
    console.error("❌ Order Error:", error);

    res.status(500).json({
      message: error.message || "Order creation failed",
    });
  }
};


// 📦 GET MY ORDERS
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ❌ CANCEL ORDER
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (
      order.orderStatus === "shipped" ||
      order.orderStatus === "delivered"
    ) {
      return res.status(400).json({
        message: "Cannot cancel after shipping",
      });
    }

    // 🔄 Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = "cancelled";

    if (order.paymentStatus === "paid") {
      const payment = await Payment.findOne({ order: order._id });

      if (payment) {
        payment.status = "refunded";
        await payment.save();
      }

      order.paymentStatus = "refunded";
    }

    await order.save();

    // 🔔 Notification
    try {
      await notifyOrderStatus({
        userId: order.user,
        orderId: order._id,
        type: "order_cancelled",
        title: "Order Cancelled",
        message: "Your order has been cancelled",
      });
    } catch (err) {
      console.error("⚠️ Notification error:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// 📄 DOWNLOAD INVOICE
export const downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params; // ✅ FIXED

    console.log("📄 Invoice request for:", id);

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ⚠️ Keep this (remove only if testing)
    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Invoice available after payment",
      });
    }

    // 🔒 Ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 📄 Generate PDF
    generateInvoice(order, res);

  } catch (error) {
    console.error("❌ Invoice error:", error);
    res.status(500).json({ message: error.message });
  }
};