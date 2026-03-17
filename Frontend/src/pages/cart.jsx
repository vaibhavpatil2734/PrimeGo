import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { isAuthenticated } from "../services/auth.service";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    loading,
    cartLoading,
  } = useCart();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
    }
  }, []);

  const [isClearing, setIsClearing] = useState(false);

  const increaseQuantity = (cartItemId, currentQty) => {
    if (!cartLoading) {
      console.log(`📦 Cart Page: Increasing cartItemId ${cartItemId} from ${currentQty} → ${currentQty + 1}`);
      updateQuantity(cartItemId, currentQty + 1);
    }
  };

  const decreaseQuantity = (cartItemId, currentQty) => {
    if (currentQty <= 1 || cartLoading) return;
    console.log(`📦 Cart Page: Decreasing cartItemId ${cartItemId} from ${currentQty} → ${currentQty - 1}`);
    updateQuantity(cartItemId, currentQty - 1);
  };

  const handleRemove = (cartItemId) => {
    removeFromCart(cartItemId);
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setIsClearing(true);
      await clearCart();
      setIsClearing(false);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Your cart is empty
            </h2>

            <button
              onClick={handleContinueShopping}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-3 sm:p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded-lg sm:rounded-xl"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold pr-2 line-clamp-2 flex-1">
                        {item.name}
                      </h3>

                      <button
                        onClick={() => handleRemove(item.cartItemId || item._id)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs sm:text-sm p-1 -m-1 rounded transition-colors flex-shrink-0 ml-1"
                        title="Remove item"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-gray-100 p-2 sm:p-3 sm:p-4 rounded-lg sm:rounded-2xl mb-2 sm:mb-3">
                      <span className="font-semibold text-gray-700 text-xs sm:text-sm">
                        Quantity
                      </span>

                      <div className="flex items-center gap-1 sm:gap-2 sm:gap-3">
                        <button
                          onClick={() =>
                            decreaseQuantity(item.cartItemId || item._id, item.quantity)
                          }
                          disabled={cartLoading || item.quantity <= 1}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm hover:shadow-md active:scale-95 transition-all font-bold text-gray-800 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                          title="Decrease quantity"
                        >
                          {cartLoading ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-gray-400 border-t-gray-900"></div>
                          ) : (
                            "−"
                          )}
                        </button>

                        <span className="text-lg sm:text-xl font-bold min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            increaseQuantity(item.cartItemId || item._id, item.quantity)
                          }
                          disabled={cartLoading}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm hover:shadow-md active:scale-95 transition-all font-bold text-gray-800 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
                          title="Increase quantity"
                        >
                          {cartLoading ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-gray-400 border-t-gray-900"></div>
                          ) : (
                            "+"
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right mt-auto">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-2 mb-1">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-0">
                          <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.oldPrice > item.price && (
                            <p className="text-gray-400 line-through text-xs sm:text-sm">
                              ₹{item.oldPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">
                          ₹{item.price.toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 h-fit sticky top-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Subtotal ({cartCount} items)
                  </span>
                  <span className="font-semibold">
                    ₹{cartTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6 flex justify-between text-2xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cartLoading}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-gray-800 hover:to-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {cartLoading ? "Processing..." : "Proceed to Checkout →"}
              </button>

              <button
                onClick={handleContinueShopping}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;