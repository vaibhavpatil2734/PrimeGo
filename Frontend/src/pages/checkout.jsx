import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../components/CartContext";
import { getAddresses } from "../services/address.service";
import { getProfile } from "../services/auth.service";
import orderService from "../services/order.service";
import AddressManager from "../components/AddressManager";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_test_key_here';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  
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
  const [isRzpLoaded, setIsRzpLoaded] = useState(false);
  const [backendTotal, setBackendTotal] = useState(0); // Backend-calculated total

  // Frontend summary (no tax)
  const frontendSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const frontendTotal = frontendSubtotal;

  // Fetch user and addresses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const userData = await getProfile();
        setUser(userData);
        setUserId(userData._id);

        const addressData = await getAddresses(userData._id);
        setAddresses(addressData);

        const defaultAddr = addressData.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (addressData.length > 0) {
          setSelectedAddress(addressData[0]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load checkout data.");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Check Razorpay
  useEffect(() => {
    const checkRzp = () => {
      if (window.Razorpay) {
        setIsRzpLoaded(true);
      } else {
        setTimeout(checkRzp, 100);
      }
    };
    checkRzp();
  }, []);

  // Address handlers
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setError("");
  };

  const handleAddressesChange = async () => {
    try {
      const addressData = await getAddresses(userId);
      setAddresses(addressData);
      const defaultAddr = addressData.find(addr => addr.isDefault) || addressData[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    } catch (err) {
      console.error("Error refreshing addresses:", err);
    }
  };

  // ✅ UPDATED: Razorpay flow - Send ITEMS only (no total)
  const handleRazorpayPayment = async () => {
    if (!selectedAddress || cart.length === 0) {
      setError("Please select address and add items");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Transform cart to backend format (items only)
      const cartItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const result = await orderService.createPaymentOrder(cartItems, selectedAddress._id);
      
      if (result.success) {
        console.log('✅ Backend validated amount:', result.data.expectedAmount);
        setBackendTotal(result.data.expectedAmount);
        showRazorpay(result.data.razorpayOrder);
      } else {
        setError(result.error || "Payment validation failed");
      }
    } catch (err) {
      console.error('[Checkout] Payment initiation error:', err.response?.data || err);
      setError(err.response?.data?.error || "Payment initiation failed");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ UPDATED: COD flow - Send ITEMS only
  const handleCODOrder = async () => {
    if (!selectedAddress || cart.length === 0) {
      setError("Please select address and add items");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const cartItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const result = await orderService.createOrderCOD(cartItems, selectedAddress._id);
      
      if (result.success) {
        setOrderSuccess(result.data);
        await clearCart();
      } else {
        setError(result.error || "COD order failed");
      }
    } catch (err) {
      console.error('[Checkout] COD order error:', err.response?.data || err);
      setError(err.response?.data?.error || "COD order failed");
    } finally {
      setProcessing(false);
    }
  };

  // Razorpay handler
  const showRazorpay = useCallback((razorpayOrder) => {
    if (!window.Razorpay || !isRzpLoaded) {
      setError("Payment gateway not ready. Please refresh.");
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || "INR",
      name: "Made4UU",
      description: `Order: ₹${backendTotal}`,
      order_id: razorpayOrder.id,
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDE2QzI0IDE5LjE2OCA1LjE2OCAyNCAxNiAyNEgyMFYxNkwyNCAxNlptLTQuMjA4IDBjMCAuODY0LjcgMS41NjYgMS41NjYgMS41NjZIMjRDMTguNDMyIDI0IDE2IDIxLjU2OCAxNiAxNlMyMC40MzIgOCAyNCA4SDIxLjc5MlMxOS43OTIgOCAxOS43OTIgOC4yMDhWMTRIMTZDMTMuNDM2IDE0IDEyIDExLjU2NCAxMiA5VjguMjA4QzEyIDcuNDM2IDEzLjQzNiA2IDE0LjIwOCA2SDI0QzI1LjU2NCA2IDI3IDcuNDM2IDI3IDguMjA4VjEyQzI3IDEzLjU2NCAyNS41NjQgMTUgMjQgMTVaIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0yNCAxNkMyNCAxOS4xNjggNS4xNjggMjQgMTYgMjRIMjBWMTZMMjQgMTZaIiBmaWxsPSIjRkZBRjAwIi8+CjxwYXRoIGQ9Ik0xOS43OTIgOC4yMDhDOCAxLjQzNiAxMy40MzYgNiAxNC4yMDggNkgyNEMyNS41NjQgNiAyNyA3LjQzNiAyNyA4LjIwOFYxMkMyNyAxMy41NjQgMjUuNTY0IDE1IDI0IDE1WiIgZmlsbD0iI0ZGQTAwIi8+Cjwvc3ZnPg==",
      handler: async function (response) {
        console.log('RZP response:', response); // Debug
        // Explicitly send amount (paise) - Razorpay response format
        const verifyData = {
          ...response,
          razorpay_amount: razorpayOrder.amount // Use backend-provided paise value (fix race condition)
        };
        const verifyResult = await orderService.verifyPayment(verifyData);
        
        if (verifyResult.success && verifyResult.data.success) {
          setOrderSuccess(verifyResult.data);
          await clearCart();
        } else {
          console.error('[Checkout] Verify payment error:', verifyResult.error || verifyResult.data);
          setError(verifyResult.error || "Payment verification failed");
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: selectedAddress?.phone || ""
      },
      theme: { color: "#000000" },
      modal: {
        ondismiss: () => setError("Payment cancelled")
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }, [isRzpLoaded, user, selectedAddress, backendTotal]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div></div>;
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
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
            <button onClick={() => navigate("/orders")} className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-600 transition-all">View My Orders</button>
            <button onClick={() => navigate("/products")} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">Continue Shopping</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button onClick={() => navigate("/products")} className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-600 transition-all">Shop Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Address + Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                <button onClick={() => setShowAddressManager(!showAddressManager)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  {showAddressManager ? "Hide" : "Manage"}
                </button>
              </div>
              
              <AnimatePresence>
                {showAddressManager && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                    <AddressManager userId={userId} onAddressesChange={handleAddressesChange} />
                  </motion.div>
                )}
              </AnimatePresence>

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
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?._id === address._id}
                          onChange={() => handleSelectAddress(address)}
                          className="w-4 h-4 text-black border-gray-300 focus:ring-black mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{address.name}</p>
                            {address.isDefault && <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
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
                  <p className="text-gray-500 mb-4">No addresses saved.</p>
                  <button onClick={() => setShowAddressManager(true)} className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800">Add Address</button>
                </div>
              )}
            </div>

            {/* Items (for display) */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items ({cart.length})</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-bold mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary + Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{frontendSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total (finalized by backend)</span>
                  <span>₹{backendTotal > 0 ? backendTotal.toFixed(2) : frontendTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "razorpay" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="payment" value="razorpay" checked={paymentMethod === "razorpay"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-black" />
                    <div className="ml-3">
                      <p className="font-semibold">Pay with Razorpay</p>
                      <p className="text-xs text-gray-500">Secure • Backend validated prices</p>
                    </div>
                  </label>
                  <label className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "cash_on_delivery" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="payment" value="cash_on_delivery" checked={paymentMethod === "cash_on_delivery"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-black" />
                    <div className="ml-3">
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when delivered</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={paymentMethod === 'razorpay' ? handleRazorpayPayment : handleCODOrder}
                disabled={processing || !selectedAddress || cart.length === 0 || (paymentMethod === 'razorpay' && !isRzpLoaded)}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 rounded-xl font-bold text-lg hover:from-gray-800 hover:to-gray-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                {processing ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ${paymentMethod === 'razorpay' ? 'Securely' : 'on Delivery'}`
                )}
              </button>

              {/* Security badges */}
              <div className="text-xs text-gray-500 space-y-2 pt-6 border-t">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Backend price validation • No frontend tampering
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

