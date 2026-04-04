import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, Send } from 'lucide-react';
import orderService from '../services/order.service';
import { isAuthenticated } from '../services/auth.service';

const ReviewOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Per-item reviews: {productId: {rating, comment}}
  const [itemReviews, setItemReviews] = useState({});

  // Dedupe products from order items
  const uniqueItems = order?.items ? 
    order.items.reduce((acc, item) => {
      const id = item.productId._id;
      if (!acc[id]) acc[id] = item.productId;
      return acc;
    }, {}) : {};

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const result = await orderService.getOrderById(orderId);
      if (result.success) {
        setOrder(result.data);
        if (result.data.hasReviewed) {
          setSuccess(true);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateReview = (productId, rating, comment = '') => {
    setItemReviews(prev => ({
      ...prev,
      [productId]: { rating, comment }
    }));
  };

  const handleSubmit = async () => {
    // FIXED: Preserve productId using Object.entries()
    const reviews = Object.entries(itemReviews)
      .filter(([, r]) => r.rating > 0)
      .map(([productId, r]) => ({
        productId,
        rating: r.rating,
        comment: r.comment || ''
      }));
      
    console.log('🚀 Submitting reviews with productIds:', reviews); // Debug
    
    if (reviews.length === 0) {
      setError('Please rate at least one item');
      return;
    }

    try {
      setSubmitting(true);
      const result = await orderService.submitOrderReview(orderId, reviews);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate(`/orders#${orderId}`), 1500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md w-full text-center">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1 }}>
            <svg className="w-20 h-20 text-green-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">Your review for order #{order?.orderNumber} has been submitted.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/orders')}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/orders')}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-black font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200"
        >
          {/* Order Info */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
              Rate Your Order
            </h1>
            <p className="text-gray-600 text-lg">
              Order #{order?.orderNumber} • {order?.items?.length || 0} items
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Items Reviews */}
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <AnimatePresence>
              {Object.values(uniqueItems).map((item) => {
                const prodId = item._id;
                const review = itemReviews[prodId] || { rating: 0, comment: '' };
                
                return (
                  <motion.div 
                    key={prodId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all bg-white"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                        <img 
                          src={item.images?.[0]?.url || '/placeholder.jpg'} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500">⭐ Rate this item</p>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-4">
                      {[1,2,3,4,5].map((star) => (
                        <motion.button
                          key={star}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateReview(prodId, star)}
                          className={`transition-all ${
                            star <= review.rating 
                              ? 'text-yellow-400' 
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        >
                          <Star className="w-7 h-7" fill="currentColor" />
                        </motion.button>
                      ))}
                    </div>

                    {/* Comment */}
                    <textarea
                      value={review.comment}
                      onChange={(e) => updateReview(prodId, review.rating, e.target.value)}
                      placeholder="Optional: Share your thoughts (max 500 chars)..."
                      className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">
                      {review.comment.length}/500
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting || Object.values(itemReviews).filter(r => r.rating > 0).length === 0}
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Reviews ({Object.values(itemReviews).filter(r => r.rating > 0).length} items)
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewOrder;

