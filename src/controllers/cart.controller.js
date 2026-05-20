import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// 🛒 Add Item to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      existingItem.quantity = newQuantity;
    } else {
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      cart.items.push({
        product: product._id,
        quantity,
        priceAtTime: product.price,
      });
    }

    // Recalculate total safely
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.priceAtTime,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📦 Get User Cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        items: [],
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔄 Update Cart Item Quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => i.product.toString() !== productId
      );
    } else {
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      item.quantity = quantity;
    }

    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.priceAtTime,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Remove Item from Cart
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.priceAtTime,
      0
    );

    await cart.save();

    res.status(200).json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


