import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
    setSuccess(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- TRIGGER THE RED ERROR BOXES ---
    if (!formData.email.trim()) {
      setError("Please enter your Email Address.");
      return;
    }
    if (!formData.password) {
      setError("Please enter your Password.");
      return;
    }
    
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/user/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role); 
      setSuccess("Authentication successful. Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Connection Error");
    } finally {
      setLoading(false);
    }
  };

  // --- Form Animations ---
  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  // Hover animation for the brand name
  const brandHover = {
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 10 }
  };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* --- Aurora Background Effect --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-60" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], x: [0, -50, 0], y: [0, 50, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} 
          className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-50" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 50, 0] }} 
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }} 
          className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-60" 
        />
      </div>

      {/* Left Side - Branding (Desktop) */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-start p-16 lg:p-24 relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <motion.h1 
            className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight mb-6 cursor-default"
            whileHover={brandHover}
          >
            <span className="hover:text-indigo-700 transition-colors duration-300">Made4</span>
            <span className="text-indigo-600 hover:text-indigo-500 transition-colors duration-300">UU</span>
          </motion.h1>
          <p className="text-slate-600 text-lg max-w-md leading-relaxed">
            Welcome back. Log in to access your personalized dashboard and continue where you left off.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          animate="visible" 
          className="w-full max-w-md"
        >
          {/* Mobile Header (Responsive) */}
          <motion.div variants={fadeUp} className="mb-10 md:hidden text-left">
            <motion.h1 
                className="text-4xl font-black text-slate-900 tracking-tight mb-2 cursor-default inline-block"
                whileHover={brandHover}
            >
               <span className="hover:text-indigo-700 transition-colors duration-300">Made4</span>
               <span className="text-indigo-600 hover:text-indigo-500 transition-colors duration-300">UU</span>
            </motion.h1>
          </motion.div>

          <motion.div variants={fadeUp} className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in</h2>
            <p className="text-slate-500 text-sm">Enter your credentials to continue.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-indigo-800 bg-indigo-50 p-4 rounded-lg text-center border border-indigo-100">
                  {success}
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-red-800 bg-red-50 p-4 rounded-lg text-center border border-red-100">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div variants={fadeUp} className="space-y-8">
              {/* Floating Label Input - Email */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  className="peer w-full border-b-2 border-slate-300 bg-transparent py-2 text-slate-900 focus:border-indigo-600 focus:outline-none transition-colors placeholder-transparent"
                  onChange={handleChange}
                  value={formData.email}
                  placeholder="Email"
                />
                <label className="absolute left-0 -top-3.5 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-indigo-600">
                  Email Address
                </label>
              </div>

              {/* Floating Label Input - Password */}
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  className="peer w-full border-b-2 border-slate-300 bg-transparent py-2 text-slate-900 focus:border-indigo-600 focus:outline-none transition-colors placeholder-transparent"
                  onChange={handleChange}
                  value={formData.password}
                  placeholder="Password"
                />
                <label className="absolute left-0 -top-3.5 text-slate-500 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-indigo-600">
                  Password
                </label>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-semibold py-4 rounded-lg hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-indigo-200 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Sign In'}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={fadeUp} className="my-8 flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </motion.div>
  
          {/* Google Auth */}
          <motion.div variants={fadeUp} className="flex justify-center w-full shadow-sm hover:shadow-md transition-shadow rounded-lg">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                  try {
                    const res = await axios.post('http://localhost:5000/api/user/google-login', { token: credentialResponse.credential });
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('role', res.data.role); 
                    setSuccess("Authentication successful.");
                    setTimeout(() => navigate("/"), 1000);
                  } catch (err) {
                    setError("Google authentication failed.");
                  }
              }}
              onError={() => setError('Google Login Failed')}
              theme="outline"
              size="large"
              width="320"
            />
          </motion.div>

          {/* Toggle View */}
          <motion.div variants={fadeUp} className="mt-12 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/register')} 
              className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              Create one here
            </button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;