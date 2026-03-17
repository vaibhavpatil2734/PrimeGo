import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon, TrashIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useWishlist } from "../components/WishlistContext";
import { useCart } from "../components/CartContext";
import { isAuthenticated } from "../services/auth.service";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
    }
  }, []);

  const handleMoveToCart = (item) => {
    addToCart({
      id: item.productId,
      name: item.name,
      price: item.price,
      img: item.img,
    });
    removeFromWishlist(item.productId);
  };

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <HeartIcon className="h-24 w-24 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your Wishlist is Empty
        </h2>
        <p className="text-gray-500 mb-6">
          Save items you love by clicking the heart icon
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-600 transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-16 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <HeartIcon className="h-8 w-8 text-red-500" />
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
              My Wishlist ({wishlist.length} items)
            </h1>
          </div>
          <button
            onClick={clearWishlist}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const discount = item.oldPrice > item.price
              ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
              : 0;

            return (
              <div
                key={item.productId}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Product Image */}
                <div 
                  className="relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${item.productId}`)}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition duration-500"
                  />
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {discount}% OFF
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(item.productId);
                    }}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h3 
                    className="text-sm font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 line-clamp-2 mb-2"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    {item.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold text-gray-900">₹{item.price}</span>
                    {item.oldPrice > item.price && (
                      <span className="text-gray-400 line-through text-sm">
                        ₹{item.oldPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-2.5 rounded-xl font-medium hover:from-gray-800 hover:to-gray-600 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    Move to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/products")}
            className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

