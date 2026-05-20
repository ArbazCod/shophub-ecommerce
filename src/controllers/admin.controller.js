import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

/**
 * 📊 GET ADMIN DASHBOARD STATS
 * Route: GET /api/admin/stats
 * Access: Admin Only
 */
export const getAdminStats = async (req, res) => {
  try {
    // 1️⃣ Basic Counts (Parallel Execution)
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    // 2️⃣ Total Revenue (Only Paid Orders)
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // 3️⃣ Order Status Counts
    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending",
    });

    const confirmedOrders = await Order.countDocuments({
      orderStatus: "confirmed",
    });

    const deliveredOrders = await Order.countDocuments({
      orderStatus: "delivered",
    });

    const refundedOrders = await Order.countDocuments({
      orderStatus: "refunded",
    });

    // 4️⃣ Monthly Revenue (Last 6 Months)
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    // 5️⃣ Top Selling Products
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          name: "$product.name",
          totalSold: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        refundedOrders,
        monthlyRevenue,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      order.deliveredAt = new Date();
    }

    if (orderStatus === "cancelled") {
      order.paymentStatus = "failed";
    }

    if (orderStatus === "refunded") {
      order.paymentStatus = "refunded";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const blockUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.isBlocked = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


export const unblockUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.isBlocked = false;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};