import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import productService from "../services/product.service";
import categoryService from "../services/category.service";
import { FiSearch } from "react-icons/fi";

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [likedProducts, setLikedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 16;

  useEffect(() => {
    fetchProducts(1);
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
    
    if (selectedCategory === "All") {
      fetchProducts(1);
    } else if (selectedCategory === "hot-deals") {
      fetchHotDeals(1);
    } else {
      fetchProductsByCategory(selectedCategory, 1);
    }
  }, [selectedCategory]);

  // Transform backend data to match ProductCard component expectations
const transformProduct = (product) => {
    return {
    id: product._id,
    name: product.title,
    img: product.images && product.images.length > 0 ? product.images[0].url : '/placeholder.jpg',
    // Current price = discounted price if available, otherwise original price
    price: product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price,
    oldPrice: product.price,
    discountPercent: product.discountPrice && product.discountPrice > 0 && product.price > 0 
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0,
    rating: product.rating || 0,
    reviews: product.reviewCount || 0,
  };
};

  const fetchProducts = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const result = await productService.getAll({ page, limit: ITEMS_PER_PAGE });
      if (result.success) {
        const transformedProducts = (result.data.products || []).map(transformProduct);
        const total = result.data.total || 0;
        const newProductsLength = transformedProducts.length;
        
        if (page === 1) {
          setProducts(transformedProducts);
        } else {
          setProducts(prev => [...prev, ...transformedProducts]);
        }
        
        setTotalProducts(total);
        setCurrentPage(page);
        // Check if there are more products to load
        setHasMore((page * ITEMS_PER_PAGE) < total);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreProducts = () => {
    if (hasMore && !loadingMore) {
      fetchProducts(currentPage + 1);
    }
  };

  const fetchProductsByCategory = async (categoryId, page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const result = await productService.getByCategory(categoryId, { page, limit: ITEMS_PER_PAGE });
      if (result.success) {
        // Backend returns array directly when category is used
        const data = Array.isArray(result.data) ? result.data : (result.data.products || []);
        const transformedProducts = data.map(transformProduct);
        
        if (page === 1) {
          setProducts(transformedProducts);
        } else {
          setProducts(prev => [...prev, ...transformedProducts]);
        }
        
        // For category, we assume all products are loaded at once (no total count)
        setHasMore(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchHotDeals = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Fetch more products to sort for hot deals
      const limit = ITEMS_PER_PAGE * 4; // Get more to have enough after sorting
      const result = await productService.getAll({ page: 1, limit });
      
      if (result.success) {
        let allProducts = (result.data.products || []).map(transformProduct);
        
        // Sort by discount desc
        allProducts.sort((a, b) => b.discountPercent - a.discountPercent);
        
        // Paginate client-side
        const start = (page - 1) * ITEMS_PER_PAGE;
        const paginated = allProducts.slice(start, start + ITEMS_PER_PAGE);
        
        if (page === 1) {
          setProducts(paginated);
        } else {
          setProducts(prev => [...prev, ...paginated]);
        }
        
        setTotalProducts(allProducts.length);
        setCurrentPage(page);
        setHasMore(paginated.length === ITEMS_PER_PAGE && start + ITEMS_PER_PAGE < allProducts.length);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch hot deals");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await categoryService.getAll();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const toggleLike = (id) => {
    if (likedProducts.includes(id)) {
      setLikedProducts(likedProducts.filter((item) => item !== id));
    } else {
      setLikedProducts([...likedProducts, id]);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 md:px-16 md:py-16 lg:px-20 lg:py-20">

    {/* 🔍 SEARCH BAR */}
<div className="flex justify-center mb-6 md:mb-12">
  <div className="relative w-full max-w-2xl group">

    <input
      type="text"
      placeholder="Search"
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        setShowDropdown(true);
      }}
      className="
      w-full
      pl-4
      pr-12
      py-3 md:py-4
      rounded-full
      bg-gray-50
      shadow-md
      border border-transparent
      focus:outline-none
      focus:ring-2 focus:ring-indigo-400
      transition-all duration-300
      text-sm md:text-base

      hover:shadow-xl
      hover:border-indigo-300
      "
    />

    {/* Search Icon Right Side */}
    <span className="
      absolute right-5 top-1/2 -translate-y-1/2
      text-gray-500
      pointer-events-none
      transition-colors duration-300
      group-hover:text-indigo-500
    ">
      <FiSearch size={20} />
    </span>

    {searchQuery && (
      <button
        onClick={() => {
          setSearchQuery("");
          setShowDropdown(false);
        }}
        className="
        absolute right-12 top-1/2 -translate-y-1/2
        text-gray-400
        hover:text-red-500
        transition duration-300
        "
      >
        ✕
      </button>
    )}

  

    {/* Search Icon Right Side */}
    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
      <FiSearch size={20} />
    </span>

    {searchQuery && (
      <button
        onClick={() => {
          setSearchQuery("");
          setShowDropdown(false);
        }}
        className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
      >
        ✕
      </button>
    )}

  
          {/* Dropdown suggestions ONLY when typing */}
          {showDropdown && searchQuery.length > 0 && (
            <div className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">

              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/product/${item.id}`);
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 p-2">
                  No results found
                </p>
              )}

            </div>
          )}

        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-12 justify-center">
        <button
          key="all"
          onClick={() => setSelectedCategory("All")}
          className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition duration-300 ${
            selectedCategory === "All"
              ? "bg-black text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-black hover:text-white"
          }`}
        >
          All
        </button>
        <button
          key="hot-deals"
          onClick={() => setSelectedCategory("hot-deals")}
          className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition duration-300 ${
            selectedCategory === "hot-deals"
              ? "bg-black text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-black hover:text-white"
          }`}
        >
          Hot Deals
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat._id)}
            className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition duration-300 ${
              selectedCategory === cat._id
                ? "bg-black text-white shadow-lg"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-black hover:text-white"
            }`}
          >
            {cat.name || cat.slug || cat._id.slice(0, 12)}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
          {[...Array(16)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {/* SHOW MORE BUTTON */}
          {hasMore && filteredProducts.length > 0 && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMoreProducts}
                disabled={loadingMore}
                className={`px-8 py-3 rounded-full text-sm font-medium transition duration-300 ${
                  loadingMore
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800 shadow-lg"
                }`}
              >
                {loadingMore ? "Loading..." : "Show More"}
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center text-gray-500 text-lg mt-16">
              😔 No products found
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
