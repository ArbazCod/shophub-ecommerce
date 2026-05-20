import Coupon from "../models/coupon.model.js";
import Cart from "../models/cart.model.js";


// ✅ HELPER: CALCULATE DISCOUNT (DRY)
const calculateDiscount = (coupon, amount) => {
  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (amount * coupon.discountValue) / 100;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  return discount;
};


// ✅ APPLY COUPON
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code required" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: "Invalid coupon" });
    }

    // 🔥 Expiry check
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    // 🔥 Usage limit check (only check, don't increment here)
    if (
      coupon.usageLimit &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        message: "Coupon usage limit reached",
      });
    }

    // 🔥 Already used check
    if (
      coupon.usedBy &&
      coupon.usedBy.some(
        (id) => id.toString() === req.user._id.toString()
      )
    ) {
      return res.status(400).json({
        message: "Coupon already used",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.totalPrice === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    // 🔥 Minimum order check
    if (
      coupon.minOrderAmount &&
      cart.totalPrice < coupon.minOrderAmount
    ) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }

    // ✅ Calculate discount using helper
    const discount = calculateDiscount(coupon, cart.totalPrice);
    const finalAmount = Math.max(cart.totalPrice - discount, 0);

    // ✅ OPTIONAL: store applied coupon in cart (prevents stacking)
    cart.appliedCoupon = coupon.code;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      discount: Math.round(discount),
      finalAmount: Math.round(finalAmount),
      couponCode: coupon.code,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ GET AVAILABLE COUPONS
export const getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    const cartTotal = cart?.totalPrice || 0;

    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null },
      ],
    });

    const availableCoupons = coupons.map((coupon) => {
      const isApplicable =
        !coupon.minOrderAmount ||
        cartTotal >= coupon.minOrderAmount;

      const isUsedByUser = coupon.usedBy?.some(
        (id) => id.toString() === userId.toString()
      );

      const isExpired =
        coupon.expiresAt && coupon.expiresAt < new Date();

      const isUsageLimitReached =
        coupon.usageLimit &&
        coupon.usedCount >= coupon.usageLimit;

      let discount = 0;

      if (
        isApplicable &&
        !isUsedByUser &&
        !isExpired &&
        !isUsageLimitReached
      ) {
        discount = calculateDiscount(coupon, cartTotal);
      }

      return {
        code: coupon.code,
        description: coupon.description,
        discount: coupon.discountValue,
        minAmount: coupon.minOrderAmount,
        type: coupon.discountType,
        isApplicable,
        isUsedByUser,
        isExpired,
        isUsageLimitReached,
        potentialSavings: Math.round(discount),
      };
    });

    res.json({
      success: true,
      coupons: availableCoupons,
      cartTotal,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ SEED COUPONS (FOR TESTING)
export const seedCoupons = async (req, res) => {
  try {
    const coupons = [
      {
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: 10,
        description: "10% off on first order",
        minOrderAmount: 500,
        maxDiscount: 500,
        isActive: true,
        expiresAt: new Date("2026-12-31"),
        usedCount: 0,
        usedBy: [],
      },
      {
        code: "SAVE20",
        discountType: "percentage",
        discountValue: 20,
        description: "20% off on orders above ₹999",
        minOrderAmount: 999,
        maxDiscount: 1000,
        isActive: true,
        expiresAt: new Date("2026-12-31"),
        usedCount: 0,
        usedBy: [],
      },
      {
        code: "FLAT200",
        discountType: "fixed",
        discountValue: 200,
        description: "₹200 off on minimum order ₹1000",
        minOrderAmount: 1000,
        isActive: true,
        expiresAt: new Date("2026-12-31"),
        usedCount: 0,
        usedBy: [],
      },
    ];

    for (let coupon of coupons) {
      await Coupon.findOneAndUpdate(
        { code: coupon.code },
        coupon,
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: "Coupons seeded successfully",
      count: coupons.length,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.appliedCoupon = null;
      await cart.save();
    }
    res.json({ success: true, message: "Coupon removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};