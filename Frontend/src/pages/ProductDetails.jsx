import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../components/CartContext";
import { useWishlist } from "../components/WishlistContext";
import productService from "../services/product.service";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, wishlistLoading, loading } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [buttonState, setButtonState] = useState("idle");
  
  // Direct from context
  const isLiked = isInWishlist(product?.id);
  
  // Touch/swipe support for image gallery
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const imageContainerRef = useRef(null);

  // Handle touch events for swipe gesture
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 75;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        handleNextImage();
      } else {
        // Swipe right - previous image
        handlePreviousImage();
      }
    }
    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

const fetchProduct = async () => {
    try {
      setPageLoading(true);
      const result = await productService.getById(id);

      if (result.success) {
        // Get all images (max 5) from the product
        const productImages = (result.data.images || []).slice(0, 5).map(img => img.url);
        
        const transformedProduct = {
          id: result.data._id,
          name: result.data.title,
          price: result.data.discountPrice > 0 ? result.data.discountPrice : result.data.price,
          oldPrice: result.data.price,
          rating: result.data.rating || 0,
          reviews: result.data.reviewCount || 0,
          img: productImages.length > 0 ? productImages[0] : "/placeholder.jpg",
          description: result.data.description,
          stock: result.data.stock || 0,
        };

        setProduct(transformedProduct);
        setImages(productImages.length > 0 ? productImages : ["/placeholder.jpg"]);
        setSelectedImageIndex(0);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch product details");
    } finally {
      setPageLoading(false);
    }
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (product) fetchSuggestedProducts();
  }, [product]);

  const fetchSuggestedProducts = async () => {
    try {
      const result = await productService.getAll({ limit: 6 });
      if (result.success) {
        const transformed = (result.data.products || [])
          .filter((p) => p._id !== id)
          .slice(0, 4)
          .map((p) => ({
            id: p._id,
            name: p.title,
            price: p.discountPrice > 0 ? p.discountPrice : p.price,
            oldPrice: p.price,
            img: p.images?.length > 0
              ? p.images[0].url
              : "/placeholder.jpg",
          }));
        setSuggestedProducts(transformed);
      }
    } catch (err) {
      console.error("Failed to fetch suggested products");
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl font-semibold">
        Product not found
      </div>
    );
  }

  const discount = product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

{/* MAIN SECTION */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 grid lg:grid-cols-2 gap-10">

          {/* IMAGE SECTION - Flipkart Style */}
          <div className="flex flex-col gap-4">
            {/* Main Image Container */}
            <div 
              ref={imageContainerRef}
              className="relative overflow-hidden rounded-2xl group bg-gray-100" 
              style={{ touchAction: "manipulation" }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-80 sm:h-96 object-cover transition duration-500"
              />
              
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-red-500 text-white text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full shadow-lg">
                  {discount}% OFF
                </div>
              )}
              
              {/* Like Button */}
              <div
              onClick={() => {
                  if (wishlistLoading) return;
                  setLikeAnimating(true);
                  toggleWishlist(product);
                setTimeout(() => {
                    setLikeAnimating(false);
                  }, 500);
                }}
                className={`
                  absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg cursor-pointer 
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
                    <OutlineHeart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 animate-pulse" />
                  ) : isLiked ? (
                    <SolidHeart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 group-hover:animate-pulse" />
                  ) : (
                    <OutlineHeart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-red-400 transition-colors duration-200" />
                  )}
                  {likeAnimating && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full animate-ping [animation-duration:400ms]" />
                  )}
                </div>
              </div>

              {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="hidden lg:absolute lg:left-2 lg:top-1/2 lg:-translate-y-1/2 bg-white shadow-lg p-3 md:p-2 rounded-full lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-gray-100 z-10"

                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="hidden lg:absolute lg:right-2 lg:top-1/2 lg:-translate-y-1/2 bg-white shadow-lg p-3 md:p-2 rounded-full lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-gray-100 z-10"

                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/70 text-white text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                  {selectedImageIndex + 1}/{images.length}
                </div>
              )}
            </div>

            {/* Mobile Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex lg:hidden gap-1 overflow-x-auto pb-2 justify-center scrollbar-hide px-2">
                {images.map((img, index) => (
                  <button
                    key={`thumb-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-blue-600 shadow-md scale-105"
                        : "border-gray-200 hover:border-gray-400 hover:scale-105"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumb ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}


            {/* Thumbnail Gallery - Visible on tablet and desktop only */}
            {images.length > 1 && (
              <div className="hidden lg:flex gap-2 sm:gap-3 overflow-x-auto pb-2 justify-center scrollbar-hide px-1">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-blue-600 ring-2 ring-blue-600 ring-opacity-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* DETAILS */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
              {product.name}
            </h1>

            <div className="text-yellow-500 mb-3 text-sm sm:text-base">
              ⭐ {product.rating} ({product.reviews} reviews)
            </div>

            <div className="mb-6">
              <p className="text-2xl sm:text-3xl font-bold">
                ₹{product.price}
              </p>
              {discount > 0 && (
                <p className="text-gray-400 line-through mt-1">
                  ₹{product.oldPrice}
                </p>
              )}
            </div>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8">
              {product.description}
            </p>

            {/* STOCK INFO */}
            <div className="mb-4">
              {product.stock > 0 ? (
                product.stock < 20 ? (
                  <span className="text-orange-600 font-bold text-sm bg-orange-100 px-3 py-1 rounded-full animate-pulse">
                    🔥 Hurry! Only {product.stock} left
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold text-sm">
                    ✓ In Stock ({product.stock} available)
                  </span>
                )
              ) : (
                <span className="text-red-500 font-semibold text-sm">
                  ✗ Out of Stock
                </span>
              )}
            </div>

            {/* QUANTITY */}
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-2xl mb-6">
              <span className="font-semibold text-gray-700">Quantity</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                  disabled={product.stock === 0}
                  className="w-9 h-9 rounded-full bg-white shadow-md hover:scale-110 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.stock === 0 || quantity >= product.stock}
                  className="w-9 h-9 rounded-full bg-white shadow-md hover:scale-110 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* ADD TO BAG */}
            <div className="relative">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (product.stock === 0) {
                    alert("This product is out of stock");
                    return;
                  }
                  if (quantity > product.stock) {
                    alert(`Only ${product.stock} items available in stock`);
                    return;
                  }
                  
                  buttonState === "loading" ? null : setButtonState("loading");
                  
                  try {
                    await addToCart(product, quantity);
                    setButtonState("success");
                    setTimeout(() => setButtonState("idle"), 2500);
                  } catch (error) {
                    setButtonState("idle");
                  }
                }}
                disabled={buttonState === "loading" || buttonState === "success" || product.stock === 0}
                className={`
                  w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md
                  ${buttonState === "success" 
                    ? "bg-green-500 text-white hover:bg-green-600" 
                    : "bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 hover:shadow-lg"
                  }
                  ${buttonState === "loading" ? "cursor-wait opacity-80" : "hover:shadow-lg"}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {buttonState === "idle" && (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </>
                )}
                {buttonState === "loading" && (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {buttonState === "success" && (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Added!
                  </>
                )}
              </button>
            </div>

            {/* Extra Info */}
            <div className="mt-8 border-t pt-6 text-sm text-gray-600 space-y-2">
              <p>🚚 Free Delivery within 3-5 days</p>
              <p>🔄 7 Days Easy Return</p>
              <p>🔒 Secure Payment Options</p>
            </div>
          </div>
        </div>

        {/* SUGGESTED PRODUCTS */}
        <div className="mt-20">
          <h2 className="text-xl sm:text-2xl font-bold mb-8">
            You may also like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {suggestedProducts.map((item) => {
              const itemDiscount = item.oldPrice > item.price
                ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100)
                : 0;
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition cursor-pointer group"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-32 sm:h-40 object-cover transition duration-500 group-hover:scale-110"
                    />
                    {itemDiscount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {itemDiscount}% OFF
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold group-hover:text-indigo-600 transition line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-bold">₹{item.price}</p>
                    {item.oldPrice > item.price && (
                      <p className="text-gray-400 line-through text-sm">
                        ₹{item.oldPrice}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
