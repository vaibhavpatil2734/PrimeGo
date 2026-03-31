import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const { isInWishlist, toggleWishlist, wishlistLoading, loading } = useWishlist();

  const [likeAnimating, setLikeAnimating] = useState(false);

  // ✅ Safe ID handling (fix)
  const productId = product.id || product._id;
  
  // Direct from context - no local state
  const isLiked = isInWishlist(productId);

  const discount =
    product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

const handleCardClick = () => {
    // Save scroll position before navigation
    sessionStorage.setItem('products-scroll', window.scrollY.toString());
    navigate(`/product/${productId}`);
  };

const handleLikeClick = (e) => {
    e.stopPropagation();
    if (wishlistLoading) return;
    setLikeAnimating(true);
    // Use wishlist context for toggle
    toggleWishlist({
      id: productId,
      name: product.name || product.title,
      price: product.price,
      oldPrice: product.oldPrice,
      img: product.img || product.images?.[0]?.url
    });
    // Reset animation and force sync
    setTimeout(() => {
      setLikeAnimating(false);
    }, 500);
  };





  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        <img
          src={product.img || product.images?.[0]?.url}
          alt={product.name || product.title}
          className="w-full h-48 object-cover hover:scale-110 transition duration-500"
        />

        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discount}% OFF
          </div>
        )}

        <div
          onClick={handleLikeClick}
          className={`
            absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg cursor-pointer 
            transition-all duration-300 ease-out group
            ${likeAnimating 
              ? 'animate-ping scale-125 ring-4 ring-red-400/60 shadow-2xl bg-red-50' 
              : 
              isLiked 
                ? 'scale-[1.05] ring-2 ring-red-500/40 shadow-xl hover:scale-115' 
                : 'hover:scale-110 hover:shadow-xl hover:ring-1 hover:ring-gray-300/50'
            }
            ${wishlistLoading ? 'cursor-wait opacity-75' : ''}
          `}
        >
          <div className="relative">
            {loading ? (
              <OutlineHeart className="h-5 w-5 text-gray-400 animate-pulse" />
            ) : isLiked ? (
              <SolidHeart className="h-5 w-5 text-red-500 group-hover:animate-pulse" />
            ) : (
              <OutlineHeart className="h-5 w-5 text-gray-600 group-hover:text-red-400 transition-colors duration-200" />
            )}
            {likeAnimating && (
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full animate-ping [animation-duration:400ms]" />
            )}
          </div>
        </div>

        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            Quick View
          </span>
        </div>
      </div>

      <div className="p-3 md:p-4">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 line-clamp-2 mb-1 md:mb-2">
          {product.name || product.title}
        </h3>

        <div className="flex items-center gap-1 text-yellow-500 text-xs md:text-sm mb-2 md:mb-3">
          <span className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.floor(product.rating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </span>
          <span className="text-gray-500 text-[10px] md:text-xs ml-1">
            ({product.reviews || 0} reviews)
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
          <p className="text-lg md:text-xl font-bold text-gray-900">
            ₹{product.price}
          </p>
          {product.oldPrice > product.price && (
            <p className="text-gray-400 line-through text-xs md:text-sm">
              ₹{product.oldPrice}
            </p>
          )}
        </div>

        <div className="mt-1 md:mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${productId}`);
            }}
            className="
              w-full py-2 md:py-2.5 rounded-xl font-medium flex items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 shadow-md
              bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 hover:shadow-lg
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 md:h-4 md:w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="text-[10px] md:text-sm">View Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
