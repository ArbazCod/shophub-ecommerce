import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    recipientRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: [
        "order_created",
        "order_shipped",
        "order_delivered",
         "order_cancelled", 
        "refund_processed",
        "new_order_admin",
        "system_alert"
      ],
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    metadata: {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
      }
    }
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;