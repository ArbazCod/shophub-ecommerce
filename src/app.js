import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import corsMiddleware from "./config/cors.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import shipmentRoutes from "./routes/shipment.routes.js";

// ✅ Import ONLY auth limiter
import { authLimiter } from "./middlewares/rateLimit.middleware.js";

import { razorpayWebhook } from "./controllers/payment.controller.js";

import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

/* =====================================================
   Security & CORS
===================================================== */
app.use(helmet());
app.use(corsMiddleware);

/* =====================================================
   🔴 Razorpay Webhook (MUST be before express.json())
===================================================== */
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

/* =====================================================
   JSON Body Parser
===================================================== */
app.use(express.json());

/* =====================================================
   🔐 Apply Rate Limit ONLY to Auth Routes
===================================================== */
//app.use("/api/auth", authLimiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* =====================================================
   Routes
===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/shipments", shipmentRoutes);

/* =====================================================
   Root
===================================================== */
app.get("/", (req, res) => {
  res.json({ message: "Ecommerce API Running" });
});

/* =====================================================
   Error Handling
===================================================== */
app.use(notFound);
app.use(errorHandler);

export default app;