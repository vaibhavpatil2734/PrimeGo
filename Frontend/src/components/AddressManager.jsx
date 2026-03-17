import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/address.service';

const AddressManager = ({ userId, onAddressesChange }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  });

  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses(userId);
      setAddresses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      isDefault: false
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const addressData = { ...formData, userId };
      await addAddress(addressData);
      setSuccess('Address added successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchAddresses();
      if (onAddressesChange) onAddressesChange();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateAddress(editingAddress._id, formData);
      setSuccess('Address updated successfully');
      setIsEditModalOpen(false);
      setEditingAddress(null);
      resetForm();
      fetchAddresses();
      if (onAddressesChange) onAddressesChange();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await deleteAddress(id);
      setSuccess('Address deleted successfully');
      fetchAddresses();
      if (onAddressesChange) onAddressesChange();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      setSuccess('Default address updated');
      fetchAddresses();
      if (onAddressesChange) onAddressesChange();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set default address');
    }
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault);
  };

  const defaultAddress = getDefaultAddress();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-gray-500 font-medium"
        >
          Loading addresses...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 tracking-wide">My Addresses</h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold tracking-widest uppercase flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Address
        </motion.button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 text-sm font-medium text-white bg-green-600 p-3 rounded-lg text-center"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 text-sm font-medium text-white bg-red-600 p-3 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 font-medium">No addresses saved yet</p>
          <p className="text-gray-400 text-sm mt-1">Add an address to get started</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4">
          {addresses.map((address) => (
            <motion.div
              key={address._id}
              variants={itemVariants}
              className={`bg-gray-50 rounded-xl p-5 border-2 transition-all ${
                address.isDefault ? 'border-black bg-gray-100' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-gray-900">{address.name}</p>
                    {address.isDefault && (
                      <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                  <p className="text-gray-600 text-sm">{address.line1}</p>
                  <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.postalCode}</p>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="text-xs font-bold tracking-wider uppercase text-gray-500 hover:text-black transition-colors"
                      title="Set as default"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(address)}
                    className="text-xs font-bold tracking-wider uppercase text-gray-500 hover:text-black transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="text-xs font-bold tracking-wider uppercase text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add Address Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddressModal
            title="Add New Address"
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleAddSubmit}
            saving={saving}
            onClose={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Address Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <AddressModal
            title="Edit Address"
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleEditSubmit}
            saving={saving}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingAddress(null);
              resetForm();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Address Modal Component
const AddressModal = ({ title, formData, handleChange, handleSubmit, saving, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-black p-6 flex justify-between items-center sticky top-0">
          <h2 className="text-xl font-black text-white tracking-widest uppercase">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-black outline-none transition-colors duration-300 text-gray-900 font-medium rounded-lg"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-black outline-none transition-colors duration-300 text-gray-900 font-medium rounded-lg"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
              Address Line 1
            </label>
            <input
              type="text"
              name="line1"
              value={formData.line1}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-colors duration--black outline-none transition300 text-gray-900 font-medium rounded-lg"
              placeholder="Street address, apartment, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-black outline-none transition-colors duration-300 text-gray-900 font-medium rounded-lg"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-black outline-none transition-colors duration-300 text-gray-900 font-medium rounded-lg"
                placeholder="NY"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-black outline-none transition-colors duration-300 text-gray-900 font-medium rounded-lg"
              placeholder="10001"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              name="isDefault"
              id="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="w-5 h-5 text-black border-2 border-gray-300 rounded focus:ring-black focus:ring-offset-2"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
              Set as my default address
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 font-bold tracking-widest uppercase text-sm py-3 rounded-lg transition-colors hover:bg-gray-300"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
              className="flex-1 bg-black text-white font-bold tracking-widest uppercase text-sm py-3 rounded-lg transition-transform disabled:opacity-50"
            >
              {saving ? (
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  Saving...
                </motion.span>
              ) : (
                'Save Address'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddressManager;
