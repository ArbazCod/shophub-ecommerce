import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";

// 🔐 Generate Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// 📝 Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar, // ✅ include avatar
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔐 Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔥 ALWAYS FETCH FRESH USER FROM DB
    const freshUser = await User.findById(user._id);

    res.status(200).json({
      message: "Login successful",
      token: generateToken(freshUser),
      user: {
        id: freshUser._id,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        avatar: freshUser.avatar, // 🔥 guaranteed latest avatar
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🧑 Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar, // ✅ include avatar
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔐 Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🖼️ UPLOAD PROFILE IMAGE (🔥 FIXED)
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    // 🔥 Upload to cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "profiles",
      }
    );

    const user = await User.findById(req.user._id);

    // ✅ SAVE IN avatar STRUCTURE (IMPORTANT)
    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    await user.save();

    // ✅ RETURN CORRECT FORMAT
    res.status(200).json({
      success: true,
      avatar: user.avatar,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// 👤 Get Profile
export const getProfile = async (req, res) => {
  try {
    // 🔥 ALWAYS fetch fresh user from DB
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar, // 🔥 THIS FIXES EVERYTHING
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};