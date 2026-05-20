import Order from "../models/order.model.js";
import { generateInvoice } from "../services/invoice.service.js";

export const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Invoice available after payment" });
    }

    // Ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    generateInvoice(order, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};