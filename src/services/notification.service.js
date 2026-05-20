import Notification from "../models/notification.model.js";

/* ================================
   CREATE USER NOTIFICATION
================================ */

export const createUserNotification = async ({
  userId,
  type,
  title,
  message,
  metadata = {}
}) => {
  return await Notification.create({
    recipient: userId,
    recipientRole: "user",
    type,
    title,
    message,
    metadata
  });
};


/* ================================
   CREATE ADMIN NOTIFICATION
================================ */

export const createAdminNotification = async ({
  type,
  title,
  message,
  metadata = {}
}) => {
  return await Notification.create({
    recipientRole: "admin",
    type,
    title,
    message,
    metadata
  });
};


/* ================================
   BROADCAST (ALL USERS)
================================ */

export const createBroadcastNotification = async ({
  type,
  title,
  message,
  metadata = {}
}) => {
  return await Notification.create({
    recipient: null, // important
    recipientRole: "user",
    type,
    title,
    message,
    metadata
  });
};


/* ================================
   ORDER PLACED
================================ */

export const notifyOrderPlaced = async (order, user) => {
  await Notification.insertMany([
    {
      recipient: user._id,
      recipientRole: "user",
      type: "order_created",
      title: "Order Placed",
      message: `Your order ${order._id} was placed successfully`,
      metadata: { orderId: order._id }
    },
    {
      recipientRole: "admin",
      type: "new_order_admin",
      title: "New Order Received",
      message: `New order placed by ${user.name}`,
      metadata: { orderId: order._id }
    }
  ]);
};


/* ================================
   ORDER STATUS UPDATE
================================ */

export const notifyOrderStatus = async ({
  userId,
  orderId,
  type,
  title,
  message
}) => {
  return await Notification.create({
    recipient: userId,
    recipientRole: "user",
    type,
    title,
    message,
    metadata: { orderId }
  });
};


/* ================================
   NEW REVIEW (USER → ADMIN)
================================ */

export const notifyNewReview = async ({
  user,
  productId
}) => {
  return await Notification.create({
    recipientRole: "admin",
    type: "system_alert",
    title: "New Review",
    message: `${user.name} added a review`,
    metadata: { productId }
  });
};