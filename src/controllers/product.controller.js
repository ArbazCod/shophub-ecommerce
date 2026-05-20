import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

// ✅ NEW IMPORT (Notification)
import { createBroadcastNotification } from "../services/notification.service.js";

// 🛒 Create Product (Admin Only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "products" }
      );

      imageUrl = result.secure_url;
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      stock,
      category,
      images: imageUrl ? [imageUrl] : [],
    });

    // ✅ 🔥 ADD NOTIFICATION HERE (AFTER PRODUCT CREATED)
    await createBroadcastNotification({
      type: "system_alert",
      title: "New Product Added",
      message: `${product.name} is now available`,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📦 Get All Products (Public)
export const getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const query = {};

    // category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // price filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // search filter
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    let sortOption = { createdAt: -1 };

    if (req.query.sort === "price") sortOption = { price: 1 };
    if (req.query.sort === "rating") sortOption = { rating: -1 };

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📦 Get Single Product by Slug (Public)
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🛠 Update Product (Admin Only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;
    product.price = req.body.price ?? product.price;
    product.stock = req.body.stock ?? product.stock;
    product.category = req.body.category ?? product.category;
    product.images = req.body.images ?? product.images;

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ HARD DELETE PRODUCT (Admin Only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted permanently",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
