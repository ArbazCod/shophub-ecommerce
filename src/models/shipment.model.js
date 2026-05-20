import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true, // ✅ added for faster lookup
    },

    carrier: {
      type: String,
      default: "Internal",
    },

    status: {
      type: String,
      enum: [
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
      ],
      default: "processing",
      index: true,
    },

    timeline: [
      {
        status: {
          type: String,
          required: true, // ✅ enforced
        },
        location: {
          type: String,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    shippedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

const Shipment = mongoose.model("Shipment", shipmentSchema);

export default Shipment;