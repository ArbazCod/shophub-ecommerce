import Notification from "../models/notification.model.js";

/* ======================================
   GET USER NOTIFICATIONS (WITH BROADCAST)
====================================== */

export const getUserNotifications = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const notifications = await Notification.find({
      $or: [
        { recipient: req.user._id },     // personal notifications
        { recipientRole: "user" }        // broadcast notifications
      ]
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* ======================================
   GET ADMIN NOTIFICATIONS
====================================== */

export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientRole: "admin"
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* ======================================
   MARK SINGLE NOTIFICATION AS READ
====================================== */

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    // Only allow owner to mark as read
    if (
      notification.recipient &&
      notification.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


/* ======================================
   MARK ALL NOTIFICATIONS AS READ
====================================== */

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { recipient: req.user._id },
          { recipientRole: "user" }
        ],
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};