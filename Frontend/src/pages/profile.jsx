import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, updateProfile, logout, isAuthenticated } from '../services/auth.service';
import { getAddresses } from '../services/address.service';
import AddressManager from '../components/AddressManager';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await getProfile();
      setUser(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || ''
      });
      // Fetch addresses after getting user profile
      if (userData._id) {
        fetchAddresses(userData._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async (userId) => {
    try {
      setAddressesLoading(true);
      const data = await getAddresses(userId);
      setAddresses(data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setAddressesLoading(false);
    }
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault);
  };

  const defaultAddress = getDefaultAddress();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile({
        username: formData.username,
        email: formData.email
      });
      setSuccess(result.message || 'Profile updated successfully');
      setUser({ ...user, username: formData.username, email: formData.email });
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-black font-bold tracking-widest uppercase"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-8 md:py-12 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.06)] overflow-hidden border border-gray-100">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="bg-black p-4 sm:p-6 md:p-8 text-center relative">
            {/* Small Edit Button - Top Right Corner */}
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center transition-colors"
              title="Edit Profile"
            >
              <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>

            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-2 sm:mb-4 ring-2 ring-gray-700">
              <span className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-widest uppercase">
                {user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-widest uppercase mb-0.5">
              {user?.username || 'User'}
            </h1>
            <p className="text-gray-400 text-[10px] sm:text-xs tracking-wide uppercase font-medium">
              {user?.role || 'Customer'}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div variants={itemVariants} className="p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className="mb-4 text-xs sm:text-sm font-medium text-white bg-black p-3 sm:p-4 rounded-lg text-center"
                >
                  {success}
                </motion.div>
              )}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className="mb-4 text-xs sm:text-sm font-medium text-white bg-red-600 p-3 sm:p-4 rounded-lg text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === 'profile' && (
              <div className="space-y-3 sm:space-y-6">
                {/* Profile Info Cards */}
                <div className="grid gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.5 sm:mb-1">
                          Username
                        </p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900">
                          {user?.username || 'Not set'}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.5 sm:mb-1">
                          Email Address
                        </p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900">
                          {user?.email || 'Not set'}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Default Address Display */}
                  {defaultAddress && (
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                            <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-gray-400">
                              Address
                            </p>
                            <span className="bg-black text-white text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">
                              Default
                            </span>
                          </div>
                          <p className="text-sm sm:text-lg font-semibold text-gray-900">{defaultAddress.name}</p>
                          <p className="text-gray-600 text-xs">{defaultAddress.phone}</p>
                          <p className="text-gray-600 text-xs">{defaultAddress.line1}</p>
                          <p className="text-gray-600 text-xs">{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.5 sm:mb-1">
                          Account Type
                        </p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900">
                          {user?.role || 'Customer'}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-gray-400 mb-0.5 sm:mb-1">
                          Member Since
                        </p>
                        <p className="text-sm sm:text-lg font-semibold text-gray-900">
                          {user?.date ? new Date(user.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info Notice for Google Users */}
                {user?.googleId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-xs sm:text-sm text-blue-700 font-medium">
                      Your account is linked with Google. Profile editing is available through your Google account settings.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Action Buttons Container */}
          <motion.div variants={itemVariants} className="p-3 sm:p-6 md:p-8 pt-0 space-y-2 sm:space-y-4">
            {/* Manage Addresses Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddressManager(!showAddressManager)}
              className="w-full bg-black text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {showAddressManager ? 'Hide Manage Addresses' : 'Manage Addresses'}
            </motion.button>

            {/* Address Manager Component */}
            {showAddressManager && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 sm:mb-4"
              >
                <AddressManager userId={user?._id} onAddressesChange={() => fetchAddresses(user._id)} />
              </motion.div>
            )}

            {/* My Orders Button */}
            <motion.a
              href="/orders"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              My Orders
            </motion.a>
            {user?.role === 'Admin' && (
              <motion.a
                href="/admin"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Admin Panel
              </motion.a>
            )}

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full bg-transparent border-2 border-black text-black font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-4 rounded-lg transition-colors hover:bg-black hover:text-white"
            >
              Logout
            </motion.button>
          </motion.div>

        </motion.div>
      </motion.div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-black p-4 sm:p-6 flex justify-between items-center">
                <h2 className="text-base sm:text-xl font-black text-white tracking-widest uppercase">
                  Edit Profile
                </h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleProfileSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5 sm:mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:py-3 bg-gray-50 border-2 border-gray-200 focus:border-black outline-none transition-colors duration-300 text-gray-900 font-medium rounded-lg text-sm"
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold tracking-widest uppercase text-gray-400 mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:py-3 bg-gray-50 border-2 border-gray-200 focus:border-black outline-none transition-colors duration-300 text-gray-900 font-medium rounded-lg text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Error message in modal */}
                {error && activeTab === 'profile' && (
                  <div className="text-xs sm:text-sm font-medium text-red-600 text-center bg-red-50 p-2.5 sm:p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex gap-2 sm:gap-3 pt-1.5 sm:pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-800 font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-3 rounded-lg transition-colors hover:bg-gray-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={saving}
                    className="flex-1 bg-black text-white font-bold tracking-widest uppercase text-xs sm:text-sm py-2.5 sm:py-3 rounded-lg transition-transform disabled:opacity-50"
                  >
                    {saving ? (
                      <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        Saving...
                      </motion.span>
                    ) : (
                      'Save Changes'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
