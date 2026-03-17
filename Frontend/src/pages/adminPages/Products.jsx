import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/product.service";
import { Trash2, Edit3, Eye, ChevronDown, Plus, Package } from "lucide-react";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

// Uses Backend/controllers/product.controller.js#getActiveProducts via productService.getActive() - shows only active products\n// Used by: /admin/products page\nconst fetchActiveProducts = async (page = currentPage, reset = false) => {
    setLoading(page === 1);
    try {
      const result = await productService.getActive({ page, limit: pageSize });

      if (result.success) {
        const newProducts = result.data.products || [];
        setTotalProducts(result.data.total || 0);
        setHasMore(newProducts.length === pageSize);

        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch active products");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchActiveProducts(nextPage, false);
  };

  const handleDelete = async (id) => {
    if (deletingId === id) return;
    setDeletingId(id);
    const result = await productService.delete(id);
    if (result.success) {
      setProducts(products.filter(p => p._id !== id));
      setTotalProducts(prev => Math.max(0, prev - 1));
    } else {
      setError(result.error);
    }
    setDeletingId(null);
  };

  useEffect(() => {
    fetchActiveProducts(1, true);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Products</h1>
          <p className="text-gray-600">
            {totalProducts > 0 
              ? `${totalProducts.toLocaleString()} active products` 
              : 'No active products'
            }
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/products/create")}
          className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2 self-start sm:self-end"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={product.images?.[0]?.url || '/placeholder.jpg'}
                          alt={product.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.categoryId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">₹{product.price}</span>
                        {product.discountPrice && (
                          <span className="text-sm text-gray-400 line-through ml-1">₹{product.discountPrice}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => window.open(`/product/${product._id}`, '_blank')}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="View Product"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/product-manage/${product._id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                          {deletingId === product._id && (
                            <span className="ml-1 animate-spin">...</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No active products found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first product.
                </p>
              </div>
            )}

            {hasMore && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className="rotate-180" />
                      Load More Products
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Showing {products.length} of {totalProducts.toLocaleString()}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

