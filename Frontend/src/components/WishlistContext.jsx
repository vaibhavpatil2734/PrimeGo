import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import wishlistService from "../services/wishlist.service";
import { getProfile } from "../services/auth.service";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  // Track loading state for wishlist operations
  const [wishlistLoading, setWishlistLoading] = useState(false);
  // Use ref to avoid stale closure issues
  const wishlistRef = useRef([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

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
        }
      } catch (error) {
        // Silent fail for guest users
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  /* =============================
     FETCH WISHLIST
  ============================== */
  const fetchWishlist = useCallback(async () => {
    if (!userId) return;

    try {
      const wishlistData = await wishlistService.getWishlist(userId);
      const items = wishlistData.data?.items || [];

      setWishlist(
        items.map((item) => ({
          _id: item._id,
          productId: item.productId?._id || item.productId,
          name: item.productId?.title || "Product",
          price: item.productId?.discountPrice && item.productId?.discountPrice > 0
            ? item.productId.price - item.productId.discountPrice
            : item.productId?.price || 0,
          oldPrice: item.productId?.price || 0,
          img: item.productId?.images?.[0]?.url || "/placeholder.jpg",
          addedAt: item.addedAt,
        }))
      );
    } catch (error) {
      // Silent fail
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    } else {
      // For guest users, use localStorage
      const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
      setWishlist(guestWishlist);
    }
  }, [userId, fetchWishlist]);

  /* =============================
     ADD TO WISHLIST
  ============================== */
  const addToWishlist = useCallback(
    async (product) => {
      // Prevent multiple simultaneous requests
      if (wishlistLoading) return;
      
      if (!userId) {
        window.location.href = '/login';
        return;
      }
      
      setWishlistLoading(true);
      
      // First update local state
      const newItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        img: product.img,
        addedAt: new Date().toISOString(),
      };

      // For logged in users - update state first, then backend
      // Check if already in wishlist to avoid duplicates (use string comparison)
      const isAlreadyInWishlist = wishlistRef.current.some(
        (item) => String(item.productId) === String(product.id)
      );
      
      if (!isAlreadyInWishlist) {
        setWishlist((prev) => [...prev, newItem]);
      }

      try {
        await wishlistService.addToWishlist(userId, product.id);
        // Don't fetch fresh data here - local state is already updated
        // This prevents race conditions where fetchWishlist might get stale data
      } catch (error) {
        // Revert on error - restore previous state
        if (!isAlreadyInWishlist) {
          setWishlist((prev) => prev.filter(
            (item) => String(item.productId) !== String(product.id)
          ));
        }
      } finally {
        setWishlistLoading(false);
      }
    },
    [userId, wishlistLoading]
  );

  /* =============================
     REMOVE FROM WISHLIST
  ============================== */
  const removeFromWishlist = useCallback(
    async (productId) => {
      // Prevent multiple simultaneous requests
      if (wishlistLoading) return;
      
      setWishlistLoading(true);
      
      // Store current state for rollback
      const previousWishlist = [...wishlistRef.current];
      
      // First update local state immediately - use String conversion for consistent comparison
      setWishlist((prev) => prev.filter((item) => String(item.productId) !== String(productId)));

      if (!userId) {
        // For guest users, use localStorage
        const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
        const filtered = guestWishlist.filter(
          (item) => String(item.productId) !== String(productId)
        );
        localStorage.setItem("guestWishlist", JSON.stringify(filtered));
        setWishlistLoading(false);
        return;
      }

      try {
        const response = await wishlistService.removeFromWishlist(userId, productId);
        
        // Verify the count from backend response and re-sync if needed
        if (response.data && response.data.itemCount !== undefined) {
          const backendCount = response.data.itemCount;
          const localCount = wishlistRef.current.length;
          
          // If counts don't match, re-fetch to ensure sync
          if (backendCount !== localCount) {
            await fetchWishlist();
          }
        }
      } catch (error) {
        // Revert on error by restoring previous state
        setWishlist(previousWishlist);
      } finally {
        setWishlistLoading(false);
      }
    },
    [userId, wishlistLoading, fetchWishlist]
  );

  /* =============================
     TOGGLE WISHLIST (Add if not exists, remove if exists)
  ============================== */
  const toggleWishlist = useCallback(
    async (product) => {
      // Prevent multiple simultaneous requests
      if (wishlistLoading) return;
      
      // Use ref to get current state - avoids stale closure
      const currentWishlist = wishlistRef.current;
      const isInList = currentWishlist.some((item) => item.productId === product.id);
      
      if (isInList) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    },
    [removeFromWishlist, addToWishlist, wishlistLoading]
  );

  /* =============================
     CHECK IF PRODUCT IN WISHLIST
  ============================== */
  const isInWishlist = useCallback(
    (productId) => {
      return wishlistRef.current.some(
        (item) => String(item.productId) === String(productId)
      );
    },
    []
  );

  /* =============================
     CLEAR WISHLIST
  ============================== */
  const clearWishlistItems = useCallback(async () => {
    // Store current state for rollback
    const previousWishlist = [...wishlistRef.current];
    
    // Clear local state first
    setWishlist([]);

    if (!userId) {
      localStorage.removeItem("guestWishlist");
      return;
    }

    try {
      await wishlistService.clearWishlist(userId);
    } catch (error) {
      // Revert on error
      setWishlist(previousWishlist);
      fetchWishlist();
    }
  }, [userId, fetchWishlist]);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist: clearWishlistItems,
        wishlistCount,
        loading,
        wishlistLoading,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

