// 🔐 Admin Role Middleware

export const adminOnly = (req, res, next) => {
  try {
    // Ensure protect middleware ran first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, please login",
      });
    }

    // Check if user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in admin middleware",
    });
  }
};