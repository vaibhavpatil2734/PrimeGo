import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaGift } from 'react-icons/fa';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/70 to-purple-50/70 relative overflow-hidden">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/50 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-slate-400/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-indigo-300/50 rounded-full blur-xl"></div>
      </div> 
      
      {/* Cartoon Elements - LG+ Only */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <div className="absolute top-25 left-30 w-16 h-16 text-indigo-400 opacity-60">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>

        <div className="absolute top-1/4 right-1/4 w-14 h-14 text-purple-400 opacity-50 -translate-y-1/2">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM2 2v2h1.8l3.5 7.6-1.3 2.3c-.1.2-.1.4-.1.6v.1c0 1.1.9 2 2 2h12v-2H8.5l.3-.9h7.5c.8 0 1.5-.5 1.8-1.3l3.7-6.6c.2-.3.3-.7.3-1.1 0-.6-.4-1-1-1H5.2L5 3H2zm18.3 3l-3.7 6.6c-.2.3-.5.5-.9.5H6.4l-.2-.6L7 6h12.3z"/>
          </svg>
        </div>

        <div className="absolute top-2/5 left-1/3 w-10 h-10 text-amber-500 opacity-60 -translate-y-1/2">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
          </svg>
        </div>

        <div className="absolute top-3/4 left-1/5 w-12 h-12 text-pink-400 opacity-55 -translate-y-1/2">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.63 7L6.37 17.36c-.52.52-1.37.52-1.89 0L2.52 14.7c-.52-.52-.52-1.37 0-1.89l8.73-8.73c.52-.52 1.37-.52 1.89 0l4.95 4.95c.52.52.52 1.37 0 1.89zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.24 3.24 1.83-1.83.01-.02z"/>
          </svg>
        </div>

        <div className="absolute top-3/5 right-1/5 w-8 h-8 text-yellow-400 opacity-60">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 .587l3.668 7.431 8.332 1.209-6 5.834-.001 8.939-6.331-3.331-6.331 3.331v-8.939l-6-5.834 8.332-1.209z"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen lg:flex lg:items-center lg:justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg text-center space-y-6 pt-12 sm:pt-16 lg:pt-0 pb-12 sm:pb-16 lg:pb-16 mx-auto lg:mx-0">
          
          {/* 404 */}
          <div className="mb-6 sm:mb-8">
            <div className="text-4xl sm:text-5xl md:text-[52px] lg:text-[52px] xl:text-[56px] font-black tracking-tight text-indigo-600 drop-shadow-lg hover:scale-105 transition-transform duration-300">
              404
            </div>
          </div>

          {/* Gift Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-indigo-100/50 backdrop-blur-sm border border-indigo-200 p-4 sm:p-5 flex items-center justify-center shadow-xl">
            <FaGift className="text-2xl sm:text-3xl text-indigo-600 pointer-events-none select-none" />
          </div>

          {/* Page Not Found */}
          <div className="mb-6 px-2 sm:px-4">
            <h1 className="text-2xl sm:text-3xl md:text-[32px] lg:text-[32px] xl:text-[36px] font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight leading-tight">
              Page Not Found
            </h1>
          </div>

          {/* Message */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-md mx-auto mb-6 sm:mb-8 px-4 sm:px-6">
            The page you're looking for does not exist.
          </p>

         
          
        </div>
      </div>
    </div>
  );
}