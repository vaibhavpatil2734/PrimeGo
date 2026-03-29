import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import axios from "axios";
import productService from "../../services/product.service";
                

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export default function ProductForm({ 
  initialData = {}, 
  mode = 'create', 
  productId, 
  onSuccess, 
  onCancel, 
  className = "" 
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);

  // Existing images for edit mode
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    categoryId: initialData.categoryId?._id || initialData.categoryId || "",
    price: initialData.price || "",
    discountPrice: initialData.discountPrice || "",
    stock: initialData.stock || 0,
    attributes: {
      color: initialData.attributes?.color || "",
      size: initialData.attributes?.size || "",
    },
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
  });

  const MAX_IMAGES = 5;

useEffect(() => {
  setFormData({
    title: initialData.title || "",
    description: initialData.description || "",
    categoryId: initialData.categoryId || "",
    price: initialData.price || "",
    discountPrice: initialData.discountPrice || "",
    stock: initialData.stock || 0,
    attributes: {
      color: initialData.attributes?.color || "",
      size: initialData.attributes?.size || "",
    },
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
  });

  if (mode === 'edit' && initialData.images) {
    setExistingImages(initialData.images.slice(0, MAX_IMAGES));
  }
}, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setFetchingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

                

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("attributes.")) {
      const attrKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attrKey]: value,
        },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      setError("Please select valid image files (JPEG, PNG, GIF, WebP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError("Please select images smaller than 5MB");
      return;
    }

    const currentCount = existingImages.length - imagesToDelete.length + selectedImages.length;
    if (currentCount + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed. Current: ${currentCount}, Adding ${files.length}`);
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveNewImage = (index) => {
    setSelectedImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleRemoveExistingImage = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
  };

  const handleUndoDelete = (imageId) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        stock: Number(formData.stock),
        attributes: {
          color: formData.attributes.color || null,
          size: formData.attributes.size || null,
        },
        isActive: formData.isActive,
      };

      let productResponse;
      if (mode === 'create') {
        productResponse = await axios.post(`${API_URL}/products`, productData);
      } else {
        productResponse = await axios.put(`${API_URL}/products/${productId}`, productData);
      }

      if (productResponse.data) {
        const currentProductId = productResponse.data._id || productId;
        setSuccessMessage(mode === 'create' ? "Product created successfully!" : "Product updated successfully!");
        
        // Upload new images
        if (selectedImages.length > 0) {
          setUploadingImages(true);
          const formDataObj = new FormData();
          selectedImages.forEach((img) => {
            formDataObj.append('images', img.file);
          });

          try {
            await productService.uploadImages(currentProductId, formDataObj);
          } catch (uploadErr) {
            console.error("Image upload failed:", uploadErr);
            setError("Saved product but failed to upload images. Please try again.");
          }
        }

        // Delete selected images
        if (imagesToDelete.length > 0 && mode === 'edit') {
          for (const imageId of imagesToDelete) {
            try {
              await productService.deleteImage(currentProductId, imageId);
            } catch (deleteErr) {
              console.error("Image delete failed:", deleteErr);
            }
          }
        }

        setSuccessMessage(`${mode === 'create' ? 'Product created' : 'Product updated'} and images updated successfully!`);

        if (onSuccess) {
          onSuccess(productResponse.data);
        } else {
          setTimeout(() => {
            navigate("/admin/products");
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
      setSuccessMessage("");
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const currentCount = existingImages.length - imagesToDelete.length + selectedImages.length;

  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
          </h1>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter product title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter product description"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            {fetchingCategories ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={16} />
                Loading categories...
              </div>
            ) : (
              <>
              <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>



          {/* Price & Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price with Discount</label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="0"
            />
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                name="attributes.color"
                value={formData.attributes.color}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g., Red, Blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <input
                type="text"
                name="attributes.size"
                value={formData.attributes.size}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g., S, M, L"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Product is active (visible to customers)
            </label>
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Upload size={20} />
                  <span className="font-medium">Images</span>
                  <span className="text-sm text-gray-400">({currentCount}/5)</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto text-center"
                >
                  Add New Images
                </label>
              </div>

              {/* Existing Images (Edit Mode Only) */}
              {mode === 'edit' && existingImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    Current Images ({existingImages.length})
                  </h4>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
                    {existingImages.map((img, index) => (
                      <div key={img.imageId || index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={img.url}
                          alt="Current"
                          className="w-full h-full object-cover"
                        />
                        {imagesToDelete.includes(img.imageId) ? (
                          <button
                            onClick={() => handleUndoDelete(img.imageId)}
                            className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg opacity-100 transition-all hover:scale-110"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRemoveExistingImage(img.imageId)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Selected Images */}
              {selectedImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    New Images to Add ({selectedImages.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {selectedImages.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 border-dashed">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedImages.length === 0 && existingImages.length === 0) && (
                <div className="text-center py-6 text-gray-400">
                  <ImageIcon className="mx-auto mb-2" size={32} />
                  <p className="text-sm">No images</p>
                  <p className="text-xs mt-1">Add up to 5 images (JPEG, PNG, GIF, WebP)</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(loading || uploadingImages) && <Loader2 className="animate-spin" size={20} />}
              {loading 
                ? `${mode === 'create' ? 'Creating' : 'Updating'}...` 
                : uploadingImages 
                  ? "Uploading Images..." 
                  : mode === 'create' ? 'Create Product' : 'Update Product'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

