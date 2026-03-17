import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../../services/product.service';
import ProductForm from '../../components/admin/ProductForm';

export default function UpdateProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await productService.getById(id);
        if (result.success) {
          setProductData(result.data);
        } else {
          setError(result.error || 'Failed to load product');
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSuccess = () => {
    navigate('/admin/products');
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };


  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>;
  if (error || !productData) return <div className="text-red-600 text-center py-12">{error || 'Product not found'}</div>;

  return (
    <div className="w-full min-h-screen p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4 sm:mb-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">Edit Product</h1>
      </div>
      <div className="max-w-4xl mx-auto w-full">
        <ProductForm
          initialData={productData}
          mode="edit"
          productId={id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};


