import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import productService from "../../services/product.service";
import ProductForm from "../../components/admin/ProductForm";
import { Trash2, Edit3, Eye, Search, ChevronDown, X, Plus } from "lucide-react";
import categoryService from "../../services/category.service";

export default function ManageProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const pageSize = 10;
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const fetchProducts = async (page = currentPage, isSearch = false, reset = false) => {
    setLoading(page === 1);
    try {
      let result;
      const params = { page, limit: pageSize, isActive: true };

      if (isSearch && searchTerm.trim()) {
        result = await productService.search(searchTerm, params);
      } else {
        result = await productService.getAll(params);
      }

      if (result.success) {
        const newProducts = result.data.products || [];
        setTotalProducts(result.data.total || 0);
        setHasMore(newProducts.length === pageSize);

        if (reset || isSearch) {
          setProducts(newProducts);
          if (isSearch) {
            setSearchResults(newProducts);
          }
        } else {
          setProducts(prev => [...prev, ...newProducts]);
          if (isSearch) {
            setSearchResults(prev => [...prev, ...newProducts]);
          }
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const onClickSearch = useCallback(async () => {
    setCurrentPage(1);
    setIsSearching(true);
    
    if (searchTerm.trim()) {
      await fetchProducts(1, true, true);
    } else {
      await fetchProducts(1, false, true);
    }
    
    setIsSearching(false);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
    setCurrentPage(1);
    fetchProducts(1, false, true);
  };

  const loadMore = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchProducts(nextPage, !!searchTerm.trim(), false);
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

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    // Refresh current page
    fetchProducts(currentPage, !!searchTerm.trim(), true);
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const result = await categoryService.getAll();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      setError("Failed to fetch categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const categoryData = {
        name: newCategoryName.trim(),
        // slug will be auto-generated in backend
      };
      const result = await categoryService.create(categoryData);
      if (result.success) {
        await fetchCategories();
        setNewCategoryName("");
      } else {
        setError(result.error || "Failed to create category");
      }
    } catch (err) {
      setError("Failed to create category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (deletingCategoryId === id) return;
    setDeletingCategoryId(id);
    try {
      const result = await categoryService.delete(id);
      if (result.success) {
        await fetchCategories();
      }
    } catch (err) {
      setError("Failed to delete category");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const toggleCategoryStatus = async (id) => {
    try {
      const result = await categoryService.update(id, { isActive: false }); // Toggle logic in backend
      if (result.success) {
        await fetchCategories();
      }
    } catch (err) {
      setError("Failed to toggle category status");
    }
  };

  const displayProducts = isSearching ? searchResults : products;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1, false, true);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-gray-600">
            {totalProducts > 0 
              ? `${totalProducts.toLocaleString()} total products` 
              : 'No products'
            }
            {isSearching && ` • Searching "${searchTerm}"`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Manage Categories
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Search size={20} className="text-gray-400 mt-1 sm:mt-0" />
          <div className="flex flex-1 flex-col sm:flex-row w-full gap-2">
            <div className="flex flex-1 relative">
              <input
                type="text"
                placeholder="Search products by title only..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                disabled={loading}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={onClickSearch}
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap w-full sm:w-auto"
              title="Search"
            >
              <Search size={16} />
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      </div>

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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td colSpan="7" className="sm:hidden px-6 py-4">
                        <div className="flex flex-col space-y-3 p-4 border-t border-gray-100">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="flex items-center gap-1 pt-2">
                            <button
                              onClick={() => window.open(`/product/${product._id}`, '_blank')}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 flex-shrink-0"
                              title="View Product"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 flex-shrink-0"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              disabled={deletingId === product._id}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50 flex-shrink-0"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                              {deletingId === product._id && (
                                <span className="ml-1 animate-spin text-xs">...</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <img
                          src={product.images?.[0]?.url || '/placeholder.jpg'}
                          alt={product.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{product.categoryId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className="text-sm font-semibold text-gray-900">₹{product.discountPrice}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' : 
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => window.open(`/product/${product._id}`, '_blank')}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 flex-shrink-0"
                            title="View Product"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 flex-shrink-0"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deletingId === product._id}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50 flex-shrink-0"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                            {deletingId === product._id && (
                              <span className="ml-1 animate-spin text-xs">...</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {displayProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? 'No search results' : 'No products found'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? `Try different keywords` 
                    : 'Get started by creating your first product.'
                  }
                </p>
              </div>
            )}

            {hasMore && !isSearching && (
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

      {/* Edit Modal */}
{showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Edit Product</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <ProductForm
              initialData={editingProduct}
              mode="edit"
              productId={editingProduct?._id}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setShowEditModal(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Categories Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Manage Categories</h2>
                <button
                  onClick={() => setShowCategoriesModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Create New Category */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3">Create New Category</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || loadingCategories}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                  >
                    <Plus size={16} />
                    Create
                  </button>
                </div>
              </div>

              {/* Categories Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingCategories ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                          Loading categories...
                        </td>
                      </tr>
                    ) : categories.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                          No categories found. Create one above!
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => toggleCategoryStatus(category._id)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Toggle Status"
                              >
                                {category.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category._id)}
                                disabled={deletingCategoryId === category._id}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                                {deletingCategoryId === category._id && (
                                  <span className="ml-1 animate-spin text-xs">...</span>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
