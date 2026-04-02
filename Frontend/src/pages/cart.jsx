import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { isAuthenticated } from "../services/auth.service";
import cartService from "../services/cart.service";

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
      window.location.href = "/login";
    }
  }, []);

  const [isClearing, setIsClearing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [customizationStates, setCustomizationStates] = useState({});
  const [unsavedItems, setUnsavedItems] = useState(new Set());

const updateCartItemCustom = async (cartItemId, updates, onSuccess) => {
    if (cartLoading) return;
    try {
      await cartService.updateCartItem(getUserId(), cartItemId, updates);
      onSuccess && onSuccess();
      // fetchCart is called via context
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  };

  const increaseQuantity = (cartItemId, currentQty) => {
    if (!cartLoading) {
      console.log(
        `📦 Cart Page: Increasing cartItemId ${cartItemId} from ${currentQty} → ${currentQty + 1}`,
      );
      updateQuantity(cartItemId, currentQty + 1);
    }
  };

  const decreaseQuantity = (cartItemId, currentQty) => {
    if (currentQty <= 1 || cartLoading) return;
    console.log(
      `📦 Cart Page: Decreasing cartItemId ${cartItemId} from ${currentQty} → ${currentQty - 1}`,
    );
    updateQuantity(cartItemId, currentQty - 1);
  };

  const getUserId = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr)._id : null;
  };

  // Customization helpers
  const getItemState = (itemId) => customizationStates[itemId] || {};
  const updateItemState = (itemId, newState) => {
    setCustomizationStates(prev => ({
      ...prev,
      [itemId]: { ...getItemState(itemId), ...newState }
    }));
  };

  const setUnsaved = (itemId, isUnsaved) => {
    const newSet = new Set(unsavedItems);
    if (isUnsaved) {
      newSet.add(itemId);
    } else {
      newSet.delete(itemId);
    }
    setUnsavedItems(newSet);
  };

  const saveCustomization = async (itemId) => {
    const state = getItemState(itemId);
    if (!state.isDirty || state.localType !== 'customized' || !state.localName?.trim()) return;

    const updates = {
      customizationType: state.localType,
      customName: state.localName.trim()
    };

    await updateCartItemCustom(itemId, updates, () => {
      updateItemState(itemId, {
        originalType: state.localType,
        originalName: state.localName,
        isDirty: false
      });
      setUnsaved(itemId, false);
    });
  };

  const cancelCustomization = (itemId) => {
    const state = getItemState(itemId);
    updateItemState(itemId, {
      localType: state.originalType,
      localName: state.originalName,
      isDirty: false
    });
    setUnsaved(itemId, false);
  };

  const toggleCustomization = (itemId) => {
    const state = getItemState(itemId);
    const newType = state.localType === 'plain' ? 'customized' : 'plain';
    const isDirty = newType !== state.originalType;
    updateItemState(itemId, { localType: newType, isDirty });
    setUnsaved(itemId, isDirty);
  };

  const updateCustomName = (itemId, name) => {
    const state = getItemState(itemId);
    const newName = name.slice(0, 50);
    const isDirty = state.localType !== state.originalType || newName.trim() !== (state.originalName || '');
    updateItemState(itemId, { localName: newName, isDirty });
    setUnsaved(itemId, isDirty);
  };

  const initItemState = (itemId, item) => {
    if (!customizationStates[itemId]) {
      const customName = item.customName || '';
      updateItemState(itemId, {
        originalType: item.customizationType || 'plain',
        originalName: customName,
        localType: item.customizationType || 'plain',
        localName: customName,
        isDirty: false
      });
    }
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
                        onClick={() =>
                          handleRemove(item.cartItemId || item._id)
                        }
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
                            decreaseQuantity(
                              item.cartItemId || item._id,
                              item.quantity,
                            )
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
                            increaseQuantity(
                              item.cartItemId || item._id,
                              item.quantity,
                            )
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
                      <div>
                        {item.customizationType === "customized" &&
                            item.customName && (
                              <div className="mb-3 mt-4 p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-800">
                                  <span className="font-medium">
                                    Personalized:
                                  </span>
                                  <span>{item.customName}</span>
                                </div>
                              </div>
                            )}
                      </div>
                    </div>
                        {/* Personalization Toggle Section */}
                    <div className="relative mb-3 mt-5">
                      <button
                        onClick={() => {
                          const id = item.cartItemId || item._id;
                          initItemState(id, item);
                          setExpandedItems((prev) => ({
                            ...prev,
                            [id]: !prev[id],
                          }));
                        }}
                        className="absolute -top-5 right-2 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm hover:shadow-md hover:bg-white hover:text-gray-900 transition-all duration-200 z-10"
                        title="Toggle personalization"
                      >
                        {expandedItems[item.cartItemId || item._id]
                          ? "− Customize"
                          : "+ Customize"}
                      </button>
                      {expandedItems[item.cartItemId || item._id] && (
                        <>
                          
  <div className={`p-3 rounded-xl transition-all ${getItemState(item.cartItemId || item._id).isDirty ? 'ring-2 ring-yellow-300 bg-yellow-50 border border-yellow-200' : 'bg-gray-100'}`}>
                            <div className="flex items-center gap-1 mb-2">
                              <h4 className="font-semibold text-gray-800 text-xs">
                                Personalization Option
                              </h4>
                              {getItemState(item.cartItemId || item._id).isDirty && (
                                <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">Unsaved</span>
                              )}
                            </div>
                            <div className="space-y-2">
                              <label
                                className={`flex items-center p-2.5 border rounded-lg cursor-pointer transition-all w-full text-xs ${item.customizationType === "plain" ? "border-black bg-gray-50 ring-1 ring-black/20" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                              >
                                <input
                                  type="radio"
                                  name={`custom-${item.cartItemId || item._id}`}
                                  value="plain"
                                  checked={getItemState(item.cartItemId || item._id).localType === "plain"}
                                  onChange={() => toggleCustomization(item.cartItemId || item._id)}
                                  className="w-3 h-3 text-black border-gray-300 focus:ring-black mr-2"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    Plain (No Name)
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Standard product
                                  </div>
                                </div>
                              </label>

                              <label
                                className={`flex items-center p-2.5 border rounded-lg cursor-pointer transition-all w-full text-xs ${item.customizationType === "customized" ? "border-black bg-gray-50 ring-1 ring-black/20" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                              >
                                <input
                                  type="radio"
                                  name={`custom-${item.cartItemId || item._id}`}
                                  value="customized"
                                  checked={getItemState(item.cartItemId || item._id).localType === "customized"}
                                  onChange={() => toggleCustomization(item.cartItemId || item._id)}
                                  className="w-3 h-3 text-black border-gray-300 focus:ring-black mr-2"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    Customized (Add Name)
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Personalized name (max 50 chars)
                                  </div>
                                </div>
                              </label>
                            </div>
 {getItemState(item.cartItemId || item._id).localType === "customized" && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    value={getItemState(item.cartItemId || item._id).localName || ""}
                                    onChange={(e) => updateCustomName(item.cartItemId || item._id, e.target.value)}
                                    placeholder="Enter name..."
                                    className={`flex-1 p-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-black/30 border-gray-300 ${getItemState(item.cartItemId || item._id).isDirty ? 'ring-2 ring-yellow-300 border-yellow-400 bg-yellow-50' : ''}`}
                                    maxLength={50}
                                  />
                                  <span className="text-xs text-gray-500 min-w-[3rem] text-center px-1">
                                    {(getItemState(item.cartItemId || item._id).localName || '').length}/50
                                  </span>
                                </div>
                                {getItemState(item.cartItemId || item._id).isDirty && (
                                  <div className="flex gap-2 mt-3 pt-3 border-t border-yellow-200">
                                    <button
                                      onClick={() => saveCustomization(item.cartItemId || item._id)}
                                      className="flex-1 bg-green-500 text-white text-xs py-1.5 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      Save
                                    </button>
                                    <button
                                      onClick={() => cancelCustomization(item.cartItemId || item._id)}
                                      className="flex-1 bg-gray-200 text-gray-700 text-xs py-1.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}
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

              {unsavedItems.size > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-yellow-800">
                      {unsavedItems.size} unsaved customization{unsavedItems.size > 1 ? 's' : ''}. Save all changes before checkout.
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={handleCheckout}
                disabled={cartLoading || unsavedItems.size > 0}
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
