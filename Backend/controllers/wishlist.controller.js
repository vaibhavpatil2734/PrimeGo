const Wishlist = require("../models/wishlist.model");
const logActivity = require("../utils/logActivity");

/* ==========================
   GET WISHLIST
========================== */
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // Create empty wishlist if doesn't exist
      wishlist = await Wishlist.create({ userId, items: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* ==========================
   ADD TO WISHLIST
========================== */
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required"
      });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // Create new wishlist if doesn't exist
      wishlist = await Wishlist.create({
        userId,
        items: [{ productId }]
      });
    } else {
      // Check if product already exists in wishlist
      const existingItem = wishlist.items.find(
        item => item.productId.toString() === productId
      );

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist"
        });
      }

      // Add product to wishlist
      wishlist.items.push({ productId });
      await wishlist.save();
      await logActivity(req, 'CREATE', 'WishlistItem', productId);
    }

    res.status(200).json({

      success: true,
      message: "Product added to wishlist",
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* ==========================
   REMOVE FROM WISHLIST
========================== */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Find wishlist without auto-populate to ensure productId is ObjectId
    const wishlist = await Wishlist.findOne({ userId }).lean();

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found"
      });
    }

    // Get initial count before removal
    const initialCount = wishlist.items.length;
    
    // Helper function to get the actual ObjectId string from item
    const getProductIdString = (item) => {
      // If productId is populated (object), use _id
      // If productId is ObjectId, convert to string
      if (item.productId && typeof item.productId === 'object' && item.productId._id) {
        return item.productId._id.toString();
      }
      // If it's a plain ObjectId
      return item.productId.toString();
    };

    // Remove product from wishlist - handle both populated and non-populated cases
    wishlist.items = wishlist.items.filter(
      item => getProductIdString(item) !== String(productId)
    );

    // Check if item was actually removed
    const removedCount = initialCount - wishlist.items.length;
    
    // Update the database with filtered items
    await Wishlist.updateOne(
      { userId },
      { items: wishlist.items }
    );
    await logActivity(req, 'DELETE', 'WishlistItem', productId);

    res.status(200).json({

      success: true,
      message: "Product removed from wishlist",
      data: { items: wishlist.items, itemCount: wishlist.items.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* ==========================
   CHECK IF PRODUCT IN WISHLIST
========================== */
exports.checkWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId } = req.query;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required"
      });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        inWishlist: false
      });
    }

    const inWishlist = wishlist.items.some(
      item => item.productId.toString() === productId
    );

    res.status(200).json({
      success: true,
      inWishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/* ==========================
   CLEAR WISHLIST
========================== */
exports.clearWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found"
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared",
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

