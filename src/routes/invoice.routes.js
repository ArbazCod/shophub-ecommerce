import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { downloadInvoice } from "../controllers/invoice.controller.js";

const router = express.Router();

router.get("/:orderId", protect, downloadInvoice);

export default router;