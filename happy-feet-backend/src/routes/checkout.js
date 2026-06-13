const express = require("express");
const router = express.Router();

// ✅ FIXED Relative Pathing Traversal (Double dots look up cleanly relative to src/routes/)
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const ProductVariant = require("../models/ProductVariant");
const { protect } = require("../middlewares/authMiddleware");

router.post("/place-order", protect, async (req, res) => {
  try {
    const { formData, cartItems, subtotal, gstAmount, shippingCost, usePoints, total } = req.body;
    
    // Core data parameter validations
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart array is empty." });
    }
    if (!formData || !formData.address) {
      return res.status(400).json({ success: false, message: "Delivery details are required parameters." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User profile entity not found." });

    // 1. Structural Stock Verification and Mutation Check
    for (const item of cartItems) {
      if (item.variantId) {
        const variant = await ProductVariant.findById(item.variantId);
        if (!variant || variant.stockQuantity < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Stock unavailable for item variant: ${item.name || 'Selected Shoe'}` 
          });
        }
        
        // Mutate stock counts safely
        variant.stockQuantity -= item.quantity;
        await variant.save();
      }
    }

    // 2. Compute Point Redemption Deductions
    let pointsDeducted = 0;
    if (usePoints && user.pointsWallet > 0) {
      pointsDeducted = Math.min(user.pointsWallet, subtotal + gstAmount + shippingCost);
      user.pointsWallet -= pointsDeducted;
    }

    const finalCalculatedTotal = Math.max(0, (subtotal + gstAmount + shippingCost) - pointsDeducted);

    // 3. Purchase Point Accumulation (Earn 10% of total paid back as loyalty tokens)
    const pointsEarned = Math.floor(finalCalculatedTotal * 0.10);
    user.pointsWallet += pointsEarned;

    // 4. Referral Allocation Mapping Trigger (Processed on first successful purchase)
    let referralPointsAwarded = 0;
    if (user.referredBy && !user.isReferralRewardProcessed) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        referrer.pointsWallet += 500; // Award ₹500 value worth of points to referrer
        await referrer.save();
        
        user.pointsWallet += 250; // Award ₹250 value worth of points to referee
        user.isReferralRewardProcessed = true;
        referralPointsAwarded = 250;
      }
    }

    // 5. Commit Order Log to DB
    const order = await Order.create({
      userId: user._id,
      items: cartItems,
      shippingAddress: formData,
      paymentMethod: formData.paymentMethod || "cod",
      subtotal,
      gstAmount,
      shippingCost,
      pointsRedemedCost: pointsDeducted,
      totalPaid: finalCalculatedTotal,
      pointsEarnedFromPurchase: pointsEarned
    });

    await user.save();
    
    // Clear out active DB cart buffer on completion
    await Cart.findOneAndUpdate({ userId: user._id }, { $set: { items: [] } });

    return res.status(201).json({
      success: true,
      message: "Order dispatched safely.",
      orderId: order._id,
      pointsEarned,
      pointsBalance: user.pointsWallet,
      referralPointsAwarded
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;