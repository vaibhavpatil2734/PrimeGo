import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../components/CartContext";
import { getAddresses } from "../services/address.service";
import { getProfile } from "../services/auth.service";
import orderService from "../services/order.service";
import AddressManager from "../components/AddressManager";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  // Order summary calculations
  const taxRate = 0.1;
  const shippingCost = 0; // Free shipping
  const subtotal = cartTotal;
  const tax = Number((subtotal * taxRate).toFixed(2));
  const total = subtotal + tax + shippingCost;

  // Fetch user and addresses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Get user profile
        const userData = await getProfile();
        setUser(userData);
        setUserId(userData._id);

        // Get addresses
        const addressData = await getAddresses(userData._id);
        setAddresses(addressData);

        // Auto-select default address
        const defaultAddr = addressData.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (addressData.length > 0) {
          setSelectedAddress(addressData[0]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load checkout data. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Handle address selection
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setError("");
  };

  // Handle address change from AddressManager
  const handleAddressesChange = async () => {
    try {
      const addressData = await getAddresses(userId);
      setAddresses(addressData);
      
      // Update selected address if it was modified
      if (selectedAddress) {
        const updated = addressData.find(addr => addr._id === selectedAddress._id);
        if (updated) {
          setSelectedAddress(updated);
        } else if (addressData.length > 0) {
          const defaultAddr = addressData.find(addr => addr.isDefault);
          setSelectedAddress(defaultAddr || addressData[0]);
        }
      }
    } catch (err) {
      console.error("Error refreshing addresses:", err);
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError("Please select a shipping address");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Prepare order items
      const items = cart.map(item => ({
        productId: item.productId,
        title: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      // Create order data based on payment method
      const orderData = {
        userId,
        items,
        shippingAddressId: selectedAddress._id,
        payment: paymentMethod === "cash_on_delivery" 
          ? {
              provider: "cash_on_delivery",
              transactionId: null,
              status: "PENDING"
            }
          : {
              provider: "razorpay",
              transactionId: "TXN" + Date.now(),
              status: "PAID"
            }
      };

      const result = await orderService.createOrder(orderData);

      if (result.success) {
        setOrderSuccess(result.data);
        await clearCart();
      } else {
        setError(result.error || "Failed to place order");
      }
    } catch (err) {
      console.error("Order error:", err);
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Order success state
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-4">Thank you for your order.</p>
          <p className="text-sm text-gray-500 mb-6">Order Number: <span className="font-mono font-bold">{orderSuccess.orderNumber}</span></p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate("/orders")}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-600 transition-all"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate("/products")}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Empty cart check
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to your cart first.</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-600 transition-all"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Address Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                <button
                  onClick={() => setShowAddressManager(!showAddressManager)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  {showAddressManager ? "Hide" : "Manage Addresses"}
                </button>
              </div>

              {/* Address Manager */}
              <AnimatePresence>
                {showAddressManager && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <AddressManager userId={userId} onAddressesChange={handleAddressesChange} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Address Selection */}
              {addresses.length > 0 ? (
                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <motion.div
                      key={address._id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleSelectAddress(address)}
                      className={`cursor-pointer rounded-xl p-4 border-2 transition-all ${
                        selectedAddress?._id === address._id
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddress?._id === address._id}
                            onChange={() => handleSelectAddress(address)}
                            className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{address.name}</p>
                            {address.isDefault && (
                              <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{address.phone}</p>
                          <p className="text-gray-600 text-sm">{address.line1}</p>
                          <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.postalCode}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No addresses saved yet.</p>
                  <button
                    onClick={() => setShowAddressManager(true)}
                    className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-bold text-gray-900 mt-1">₹{item.price * item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "razorpay" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">Pay with Razorpay</p>
                      <p className="text-xs text-gray-500">Secure payment via Razorpay</p>
                    </div>
                  </label>
                  <label className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "cash_on_delivery" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === "cash_on_delivery"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when you receive the order</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={processing || !selectedAddress}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 rounded-xl font-bold text-lg hover:from-gray-800 hover:to-gray-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Place Order - ₹${total.toFixed(2)}`
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t text-xs text-gray-500 space-y-2">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Secure checkout with SSL encryption
                </p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  7 days easy return policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
