import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

import {
  getUserNotifications,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from "../controllers/notification.controller.js";

const router = express.Router();

/* User routes */

router.get("/", protect, getUserNotifications);

router.patch("/:id/read", protect, markNotificationRead);

router.patch("/read-all", protect, markAllNotificationsRead);


/* Admin routes */

router.get("/admin", protect, adminOnly, getAdminNotifications);

export default router;