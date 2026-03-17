import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { HeartIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";

const WishlistDrawer = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    addToCart({
      id: item.productId,
      name: item.name,
      price: item.price,
      img: item.img,
    });
    removeFromWishlist(item.productId);
  };

  const handleViewFullWishlist = () => {
    setIsOpen(false);
    navigate("/wishlist");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">My Wishlist ({wishlist.length})</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-black text-xl"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="p-6 space-y-4 overflow-y-auto h-[70%]">
          {!wishlist || wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <HeartIcon className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Your wishlist is empty</p>
              <p className="text-sm">Save your favorite items here</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 border-b pb-3"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold">₹{item.price}</span>
                    {item.oldPrice > item.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{item.oldPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="text-xs bg-black text-white px-3 py-1.5 rounded-full hover:bg-gray-800 transition"
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.productId)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlist && wishlist.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
            <button
              onClick={clearWishlist}
              className="w-full text-sm text-red-500 hover:text-red-700 mb-2 text-left"
            >
              Clear Wishlist
            </button>
            <button
              onClick={handleViewFullWishlist}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-600 transition-all"
            >
              View Full Wishlist
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistDrawer;

