import mongoose from "mongoose";
import Shipment from "../models/shipment.model.js";
import Order from "../models/order.model.js";
import { createUserNotification } from "../services/notification.service.js";


/* Create shipment (admin) */

export const createShipment = async (req, res) => {

  try {

    const { orderId, carrier } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const existingShipment = await Shipment.findOne({ order: orderId });

    if (existingShipment) {
      return res.status(400).json({
        message: "Shipment already exists for this order"
      });
    }

    const trackingNumber =
      "TRK-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    const shipment = await Shipment.create({
      order: orderId,
      trackingNumber,
      carrier,
      timeline: [
        {
          status: "processing",
          description: "Order is being prepared for shipment"
        }
      ]
    });

    res.status(201).json({
      success: true,
      shipment
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



/* Update shipment status */

export const updateShipmentStatus = async (req, res) => {

  try {

    const { status, location, description } = req.body;

    const allowedStatus = [
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered"
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid shipment status"
      });
    }

    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        message: "Shipment not found"
      });
    }

    shipment.status = status;

    shipment.timeline.push({
      status,
      location: location || "",
      description: description || ""
    });

    if (status === "shipped") {
      shipment.shippedAt = new Date();
    }

    if (status === "delivered") {
      shipment.deliveredAt = new Date();
    }

    await shipment.save();

    /* Create notification for user */

    const order = await Order.findById(shipment.order);

    if (order) {

      await createUserNotification({
        userId: order.user,
        type: "order_shipped",
        title: "Shipment Update",
        message: `Your order ${order._id} status is now ${status}`,
        metadata: {
          orderId: order._id
        }
      });

    }

    res.status(200).json({
      success: true,
      shipment
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



/* Get shipment for order */

export const getShipment = async (req, res) => {

  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const shipment = await Shipment.findOne({
      order: req.params.orderId
    }).populate("order");

    if (!shipment) {
      return res.status(404).json({
        message: "Shipment not found"
      });
    }

    res.status(200).json({
      success: true,
      shipment
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};