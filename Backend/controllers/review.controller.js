const mongoose = require('mongoose');
const Review = require('../models/review.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const logActivity = require('../utils/logActivity');

/**
 * Submit reviews for order items
 * 1. Validate order exists, status DELIVERED, not already reviewed
 * 2. Dedupe by product, create Review docs
 * 3. Update products avgRating/reviewCount
 * 4. Mark order hasReviewed: true
 */
const submitOrderReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const reviews = req.body; // [{productId, rating, comment}]
    
    console.log('📝 Review submission:', { orderId, userId: userId.toString(), reviews });

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: 'Reviews array required' });
    }

    // 1. Validate order
    const order = await Order.findOne({ 
      _id: orderId, 
      userId,
      status: 'DELIVERED'
    }).populate('items.productId');

    console.log('🔍 Order found:', {
      id: order?._id,
      userId: order?.userId?.toString(), 
      status: order?.status,
      hasReviewed: order?.hasReviewed,
      itemCount: order?.items?.length,
      orderProducts: order?.items?.map(item => ({
        productId: item.productId?._id?.toString(),
        title: item.productId?.title
      }))
    });

    if (!order) {
      return res.status(400).json({ error: 'Valid DELIVERED order required' });
    }
    if (order.hasReviewed) {
      return res.status(400).json({ error: 'Order already reviewed' });
    }

    // 2. Dedupe & validate reviews (must match order products)
    const orderProductIds = new Set(order.items.map(item => item.productId._id.toString()));
    console.log('🎯 Order product IDs:', Array.from(orderProductIds));
    console.log('📥 Submitted product IDs:', reviews.map(r => r.productId));
    
    const uniqueReviews = [];
    const seenProducts = new Set();

    for (const reviewData of reviews) {
      const productId = reviewData.productId;
      console.log(`Checking productId ${productId}: in orderProducts=${orderProductIds.has(productId)}`);
      if (!orderProductIds.has(productId) || seenProducts.has(productId)) continue;
      
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        return res.status(400).json({ error: 'Rating must be 1-5 stars' });
      }

      uniqueReviews.push({
        userId,
        productId,
        orderId,
        rating: reviewData.rating,
        comment: reviewData.comment || ''
      });
      seenProducts.add(productId);
    }

    if (uniqueReviews.length === 0) {
      console.log('❌ No valid reviews matched order products');
      return res.status(400).json({ 
        error: 'No valid reviews for order products',
        debug: {
          expectedProducts: Array.from(orderProductIds),
          submittedReviews: reviews.map(r => ({productId: r.productId, rating: r.rating}))
        }
      });
    }

    // 3. Use session for atomic updates - FIXED
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Create reviews - ULTRA FIXED: Sequential create in transaction (100% reliable)
      const createdReviews = [];
      for (const reviewData of uniqueReviews) {
        const review = await Review.create([reviewData], { session });
        createdReviews.push(review[0]);
      }
      console.log('✅ All reviews created:', createdReviews.length);

      // Update products avgRating/reviewCount PROPERLY - FIXED null safety
      for (const review of createdReviews) {
        const product = await Product.findById(review.productId).session(session);
        if (!product) {
          console.warn(`Product not found: ${review.productId}`);
          continue;
        }
        const newCount = (product.reviewCount || 0) + 1;
        const newAvg = ((product.rating || 0) * (product.reviewCount || 0) + review.rating) / newCount;
        
        await Product.findByIdAndUpdate(
          review.productId,
          { 
            reviewCount: newCount,
            rating: newAvg
          },
          { session }
        );
      }

      // Mark order reviewed
      order.hasReviewed = true;
      await order.save({ session });
    });
    session.endSession();

    console.log('🎉 All reviews processed successfully');
    
    await logActivity(req, 'CREATE', 'Review', orderId, `Submitted ${uniqueReviews.length} reviews`);

    // FIXED: createdReviews scoped to transaction, declare outside
    res.json({ 
      success: true, 
      message: `Submitted ${uniqueReviews.length} review(s) successfully!`,
      count: uniqueReviews.length 
    });

  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { submitOrderReview };

