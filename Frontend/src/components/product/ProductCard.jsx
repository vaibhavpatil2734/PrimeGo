import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, wishlistLoading, loading } = useWishlist();
  const [buttonState, setButtonState] = useState("idle"); // idle, loading, success
  const [isLiked, setIsLiked] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  // ✅ Safe ID handling (fix)
  const productId = product.id || product._id;
  
  // Update isLiked when wishlist changes - fixes stale closure issue
  useEffect(() => {
    const liked = isInWishlist(productId);
    setIsLiked(liked);
    if (productId) console.log(`ProductCard ${productId}: isLiked=${liked}, loading=${loading}`);
  }, [productId, isInWishlist, loading]);

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
      setIsLiked(isInWishlist(productId));
    }, 500);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    // If already success, don't trigger again
    if (buttonState === "success") return;
    
    // Set loading state
    setButtonState("loading");
    
    try {
      await addToCart({
        id: productId,
        name: product.name || product.title,
        price: product.price,
        img: product.img || product.images?.[0]?.url
      });
      
      // Set success state after adding
      setButtonState("success");
      
      // Reset to idle after 2.5 seconds
      setTimeout(() => {
        setButtonState("idle");
      }, 2500);
    } catch (error) {
      setButtonState("idle");
    }
  };

  // Sparkle component
  const Sparkle = ({ className }) => (
    <svg
      className={`absolute w-3 h-3 text-yellow-300 ${className}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );

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

        <div className="mt-1 md:mt-2 relative">
          <button
            onClick={handleAddToCart}
            disabled={buttonState === "loading" || buttonState === "success"}
            className={`
              w-full py-2 md:py-2.5 rounded-xl font-medium flex items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 shadow-md
              ${buttonState === "success" 
                ? "btn-success text-white" 
                : "bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 hover:shadow-lg"
              }
              ${buttonState === "loading" ? "cursor-wait opacity-80" : ""}
            `}
          >
            {buttonState === "idle" && (
              <>
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-[10px] md:text-sm">Add to Cart</span>
              </>
            )}

            {buttonState === "loading" && (
              <svg
                className="spinner h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}

            {buttonState === "success" && (
              <>
                {/* Sparkles container - only visible on success - all around the button border */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {/* Top edge */}
                  <Sparkle className="sparkle-s1" style={{ top: '2%', left: '10%' }} />
                  <Sparkle className="sparkle-s2" style={{ top: '2%', right: '10%' }} />
                  <Sparkle className="sparkle-s3" style={{ top: '2%', left: '30%' }} />
                  <Sparkle className="sparkle-s4" style={{ top: '2%', right: '30%' }} />
                  <Sparkle className="sparkle-s5" style={{ top: '2%', left: '50%', transform: 'translateX(-50%)' }} />
                  
                  {/* Bottom edge */}
                  <Sparkle className="sparkle-s6" style={{ bottom: '2%', left: '10%' }} />
                  <Sparkle className="sparkle-s7" style={{ bottom: '2%', right: '10%' }} />
                  <Sparkle className="sparkle-s8" style={{ bottom: '2%', left: '30%' }} />
                  <Sparkle className="sparkle-s9" style={{ bottom: '2%', right: '30%' }} />
                  <Sparkle className="sparkle-s10" style={{ bottom: '2%', left: '50%', transform: 'translateX(-50%)' }} />
                  
                  {/* Left edge */}
                  <Sparkle className="sparkle-s11" style={{ top: '20%', left: '2%' }} />
                  <Sparkle className="sparkle-s12" style={{ top: '50%', left: '2%' }} />
                  <Sparkle className="sparkle-s1" style={{ top: '80%', left: '2%' }} />
                  
                  {/* Right edge */}
                  <Sparkle className="sparkle-s2" style={{ top: '20%', right: '2%' }} />
                  <Sparkle className="sparkle-s3" style={{ top: '50%', right: '2%' }} />
                  <Sparkle className="sparkle-s4" style={{ top: '80%', right: '2%' }} />
                </div>
                
                {/* Checkmark icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 md:h-5 md:w-5 checkmark-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-[10px] md:text-sm text-fade-in">Added!</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
