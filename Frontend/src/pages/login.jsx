import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import AnimatedBrand from '../components/common/AnimatedBrand.jsx';

const Login = () => {
  const navigate = useNavigate();
  
  // --- Standard Login States ---
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- Forgot Password States ---
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [fpStep, setFpStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [fpData, setFpData] = useState({ email: '', otp: '', newPassword: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
    setSuccess(''); 
  };

  const handleFpChange = (e) => {
    setFpData({ ...fpData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  // --- Login Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await axios.post(`${baseUrl}/api/user/login`, formData);
      
      localStorage.setItem('token', res.data.token);
      if (res.data.role) localStorage.setItem('role', res.data.role); 
      if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));

      setSuccess("Login successful! Redirecting...");
      
      setTimeout(() => navigate("/"), 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Google Login ---
  const handleGoogleSuccess = async (credentialResponse) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/api/user/google-login`, { token: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      if (res.data.role) localStorage.setItem('role', res.data.role); 
      if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess("Google login successful! Redirecting...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- Forgot Password handlers ---
  const handleSendFpOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fpData.email.trim()) {
      setError("Please enter your registered Email Address.");
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/user/forgot-password-otp', { email: fpData.email });
      setSuccess(`Verification code sent to ${fpData.email}`);
      setFpStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fpData.otp || fpData.otp.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    if (!fpData.newPassword || fpData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await axios.put('http://localhost:5000/api/user/reset-password', {
        email: fpData.email,
        otp: fpData.otp,
        newPassword: fpData.newPassword
      });
      
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        setIsForgotPassword(false);
        setFpStep(1);
        setFpData({ email: '', otp: '', newPassword: '' });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setFpStep(1);
    setError('');
    setSuccess('');
    setFpData({ email: '', otp: '', newPassword: '' });
  };

  // --- Animations (matched to register) ---
  const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
  const primaryButtonHover = { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 10 } };
  const buttonTap = { scale: 0.98 };
  const brandHover = { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 10 } };

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-[#F9FAFB] font-sans selection:bg-black selection:text-white">
      
      {/* Left Branding (matched register) */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-start p-16 lg:p-24 relative z-10">
        <motion.div className="-mt-16" initial={{ opacity: 0, x: -30, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.8 }}>
          <AnimatedBrand className="text-5xl lg:text-7xl" />
          <p className="mt-6 text-gray-600 text-lg max-w-md leading-relaxed not-italic">
            Welcome. {" "}Sign in to access your personalized dashboard and continue shopping.
          </p>
        </motion.div>
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Mobile Header */}
          <div className="mb-10 md:hidden text-left">
            <AnimatedBrand className="text-4xl [&>h1]:text-4xl" />
          </div>

          <AnimatePresence mode="wait">
            {!isForgotPassword ? (
              <motion.div 
                key="login-main" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
                  <h2 className="text-3xl font-bold text-black mb-2">Sign In</h2>
                  <p className="text-gray-500 text-sm font-medium">Enter your credentials to continue.</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {success && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-green-800 bg-green-50 p-4 rounded-lg text-center border border-green-100 shadow-sm">
                        {success}
                      </motion.div>
                    )}
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-red-800 bg-red-50 p-4 rounded-lg text-center border border-red-100 shadow-sm">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="space-y-8">
                    {/* Email */}
                    <div className="relative">
                      <input 
                        id="login-email" 
                        type="email" 
                        name="email" 
                        className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 text-black font-medium focus:border-black focus:outline-none transition-colors placeholder-transparent" 
                        onChange={handleChange} 
                        value={formData.email} 
                        placeholder="Email" 
                      />
                      <label htmlFor="login-email" className="absolute left-0 -top-3.5 text-gray-500 font-medium text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black pointer-events-none cursor-text">
                        Email Address
                      </label>
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <input 
                        id="login-password" 
                        type="password" 
                        name="password" 
                        className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 text-black font-medium focus:border-black focus:outline-none transition-colors placeholder-transparent" 
                        onChange={handleChange} 
                        value={formData.password} 
                        placeholder="Password" 
                      />
                      <label htmlFor="login-password" className="absolute left-0 -top-3.5 text-gray-500 font-medium text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black pointer-events-none cursor-text">
                        Password
                      </label>
                    </div>
                  </div>

                  <div className="text-right">
                    <button 
                      type="button" 
                      onClick={toggleForgotPassword} 
                      className="text-sm text-gray-600 font-bold hover:text-black transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <motion.div variants={fadeUp} className="pt-6">
                    <motion.button 
                      type="submit" 
                      disabled={loading} 
                      whileHover={primaryButtonHover} 
                      whileTap={buttonTap} 
                      className="w-full relative flex items-center justify-center overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-bold text-lg py-4 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition-all duration-500 disabled:opacity-70"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </motion.button>
                  </motion.div>

                  {/* OR Divider & Google */}
                  <div className="relative pt-8 pb-6">
                    <div className="flex items-center">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="flex-shrink-0 mx-4 text-xs uppercase text-gray-500 font-bold tracking-wider">OR</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                  </div>

                  <motion.div variants={fadeUp} className="pb-6">
                    <div className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden bg-white">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        theme="outline"
                        size="large"
                        loadingElement={
                          <div className="p-4 flex items-center justify-center text-gray-600 text-sm font-medium">
                            Signing in...
                          </div>
                        }
                      />
                    </div>
                  </motion.div>
                </form>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-12 text-center text-sm text-gray-500 font-medium">
                  Don't have an account?{' '}
                  <button onClick={() => navigate('/register')} className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-indigo-600 after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100">
                    Create one here
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                key="forgot" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <motion.div variants={fadeUp} className="mb-10">
                  <h2 className="text-3xl font-bold text-black mb-2">Reset Password</h2>
                  <p className="text-gray-500 text-sm font-medium">
                    {fpStep === 1 ? "Enter your email to receive reset code." : `Enter code sent to ${fpData.email}`}
                  </p>
                </motion.div>

                <form onSubmit={fpStep === 1 ? handleSendFpOtp : handleResetPassword} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {success && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-green-800 bg-green-50 p-4 rounded-lg text-center border border-green-100 shadow-sm">
                        {success.startsWith('Verification code sent to') ? (
                          <>
                            Code sent to{' '}
                            <a href={`mailto:${fpData.email}`} className="text-blue-600 font-bold hover:text-blue-800 underline decoration-blue-300 underline-offset-2 transition-colors">
                              {fpData.email}
                            </a>
                          </>
                        ) : success}
                      </motion.div>
                    )}
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-red-800 bg-red-50 p-4 rounded-lg text-center border border-red-100 shadow-sm">
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-8 min-h-[180px]">
                    {fpStep === 1 ? (
                      <div className="relative">
                        <input 
                          id="fp-email" 
                          type="email" 
                          name="email" 
                          className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 text-black font-medium focus:border-black focus:outline-none transition-colors placeholder-transparent" 
                          onChange={handleFpChange} 
                          value={fpData.email} 
                          placeholder="Email" 
                        />
                        <label htmlFor="fp-email" className="absolute left-0 -top-3.5 text-gray-500 font-medium text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black pointer-events-none">
                          Email Address
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="relative">
                          <input 
                            id="fp-otp" 
                            type="text" 
                            name="otp" 
                            maxLength="6" 
                            className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 text-black font-medium focus:border-black focus:outline-none transition-colors placeholder-transparent font-black tracking-widest text-center text-xl" 
                            onChange={handleFpChange} 
                            value={fpData.otp} 
                            placeholder="000000" 
                          />
                          <label htmlFor="fp-otp" className="absolute left-0 -top-3.5 text-gray-500 font-medium text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black pointer-events-none text-center w-full">
                            6-Digit Code
                          </label>
                        </div>
                        <div className="relative">
                          <input 
                            id="fp-password" 
                            type="password" 
                            name="newPassword" 
                            className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 text-black font-medium focus:border-black focus:outline-none transition-colors placeholder-transparent" 
                            onChange={handleFpChange} 
                            value={fpData.newPassword} 
                            placeholder="Password" 
                          />
                          <label htmlFor="fp-password" className="absolute left-0 -top-3.5 text-gray-500 font-medium text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black pointer-events-none">
                            New Password
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <motion.div variants={fadeUp} className="pt-6 flex gap-3">
                    <motion.button
                      type="button"
                      onClick={toggleForgotPassword}
                      whileHover={primaryButtonHover}
                      whileTap={buttonTap}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-full transition-colors text-sm"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={primaryButtonHover}
                      whileTap={buttonTap}
                      className="flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-bold py-4 rounded-full shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition-all duration-500 disabled:opacity-70"
                    >
                      {loading ? 'Processing...' : (fpStep === 1 ? 'Send Code' : 'Reset Password')}
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
