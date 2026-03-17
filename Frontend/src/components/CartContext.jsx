import { createContext, useContext, useState, useEffect, useCallback } from "react";
import cartService from "../services/cart.service";
import { getProfile } from "../services/auth.service";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  const mapCartItems = useCallback((items = []) => {
    return items.map((item) => {
      const displayPrice = item.productId?.discountPrice > 0 ? item.productId.discountPrice : item.productId?.price || item.priceSnapshot;
      return {
        _id: item._id,
        productId: item.productId?._id || item.productId,
        cartItemId: item._id,
        name: item.productId?.title || "Product",
        price: displayPrice,
        oldPrice: item.productId?.price || item.priceSnapshot,
        discountPercent: item.productId?.discountPrice && item.productId?.price ? 
          Math.round(((item.productId.price - item.productId.discountPrice) / item.productId.price) * 100) : 0,
        quantity: item.quantity || 1,
        img: item.productId?.images?.[0]?.url || "/placeholder.jpg",
      };
    });
  }, []);

  /* =============================
     FETCH USER
  ============================== */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const userData = await getProfile();
          setUserId(userData._id);
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.log("User not logged in");
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    window.addEventListener("storage", fetchUser);
    return () => window.removeEventListener("storage", fetchUser);
  }, []);

  /* =============================
     FETCH CART
  ============================== */
  const fetchCart = useCallback(async () => {
    if (!userId) return;

    try {
      const cartData = await cartService.getCart(userId);
      const items = cartData.items || [];
      setCart(mapCartItems(items));
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [userId, mapCartItems]);

  /* =============================
     HANDLE CART SOURCE
  ============================== */
  useEffect(() => {
    const syncCart = async () => {
      if (userId) {
        try {
          const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

          if (guestCart.length > 0) {
            for (const item of guestCart) {
              await cartService.addToCart(userId, item.productId, item.quantity);
            }
            localStorage.removeItem("guestCart");
          }

          await fetchCart();
        } catch (error) {
          console.error("Error syncing cart:", error);
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        setCart(guestCart);
      }
    };

    if (!loading) {
      syncCart();
    }
  }, [userId, loading, fetchCart]);

  /* =============================
     ADD TO CART
  ============================== */
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      const productId = product._id || product.id;

      if (!productId) {
        console.error("Product ID is missing");
        return;
      }

      if (!userId) {
        window.location.href = '/login';
        return;
      }

      try {
        await cartService.addToCart(userId, productId, quantity);
        await fetchCart();
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },
    [userId, fetchCart]
  );

  /* =============================
     REMOVE
  ============================== */
  const removeFromCart = useCallback(
    async (cartItemId) => {
      if (cartLoading) return;
      setCartLoading(true);

      try {
        await cartService.removeFromCart(userId, cartItemId);
        await fetchCart();
      } catch (error) {
        console.error("Error removing item:", error);
      } finally {
        setCartLoading(false);
      }
    },
    [userId, cartLoading, fetchCart]
  );

  /* =============================
     UPDATE QUANTITY
  ============================== */
  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      if (quantity < 1 || cartLoading) return;

      setCartLoading(true);

      if (!userId) {
        console.error("User not logged in for quantity update");
        setCartLoading(false);
        return;
      }

      try {
        await cartService.updateCartQuantity(userId, cartItemId, quantity);
        await fetchCart();
      } catch (error) {
        console.error("Error updating quantity:", error);
      } finally {
        setCartLoading(false);
      }
    },
    [userId, cartLoading, fetchCart]
  );

  /* =============================
     CLEAR CART
  ============================== */
  const clearCartItems = useCallback(async () => {
    if (!userId) {
      localStorage.removeItem("guestCart");
      setCart([]);
      return;
    }

    try {
      await cartService.clearCart(userId);
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [userId]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart: clearCartItems,
        cartCount,
        cartTotal,
        loading,
        cartLoading,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);