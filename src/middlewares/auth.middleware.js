import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// 🔐 Protect Route Middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};


// 🔐 Admin Only Middleware
export const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};