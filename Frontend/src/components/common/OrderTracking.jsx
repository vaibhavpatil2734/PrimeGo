import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Check, X, Package } from 'lucide-react';

const PROGRESS_STEPS = [
  { key: 'PLACED', label: 'Placed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Check }
];

const OrderTracking = ({ status = 'PLACED', size = 'sm' }) => {
  const upperStatus = status?.toUpperCase() || 'PLACED';
  const isProgress = PROGRESS_STEPS.some(step => step.key === upperStatus);
  const stepIndex = PROGRESS_STEPS.findIndex(step => step.key === upperStatus);

  const sizeStyles = size === 'sm' 
    ? 'h-8 px-3 text-xs [&>svg]:w-3 [&>svg]:h-3'
    : 'h-10 px-4 text-sm [&>svg]:w-4 [&>svg]:h-4 py-1';

  if (upperStatus === 'CANCELLED') {
    return (
      <motion.div 
        className={`inline-flex items-center gap-1.5 rounded-full bg-red-100/80 border-2 border-red-200 ${sizeStyles} font-bold uppercase tracking-wider text-red-800 animate-shake`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        aria-label="Order Cancelled"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        >
          <X className="text-red-600 drop-shadow-sm" />
        </motion.div>
        <span className="font-black">CANCELLED</span>
      </motion.div>
    );
  }

  if (!isProgress) {
    return (
      <motion.span 
        className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        {upperStatus}
      </motion.span>
    );
  }

  return (
    <motion.div 
      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-sm overflow-hidden ${sizeStyles} font-bold uppercase tracking-wider text-emerald-800`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-label={`Order ${upperStatus.toLowerCase()}`}
    >
      {/* Progress Bar */}
      <motion.div 
        className="h-full w-1 bg-gradient-to-b from-emerald-400 to-green-600 -mr-1"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      
      <div className="flex items-center gap-1.5 relative z-10">
        {PROGRESS_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === stepIndex;
          const isCompleted = index < stepIndex;
          
          return (
            <AnimatePresence key={step.key}>
              <motion.div
                className={`flex flex-col items-center gap-0.5 p-0.5 rounded-full ${
                  isCompleted ? 'bg-emerald-400' : 
                  isActive ? 'bg-emerald-500 shadow-md shadow-emerald-200' : 
                  'bg-emerald-200'
                }`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
              >
                {isCompleted ? (
                  <motion.div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ type: 'spring' }}
                  >
                    <Check className="w-2 h-2 text-emerald-600" strokeWidth={3} />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-100 rounded-full shadow-lg relative overflow-hidden"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      backgroundColor: ['#10b981', '#059669', '#10b981']
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500 animate-pulse opacity-75 rounded-full" />
                    <Icon className="w-2 h-2 absolute inset-0 m-auto text-emerald-700" strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-300 rounded-full"
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: 'spring' }}
                  >
                    <Icon className="w-2 h-2 text-emerald-500 absolute inset-0 m-auto opacity-70" strokeWidth={2} />
                  </motion.div>
                )}
                {size === 'md' && (
                  <motion.span 
                    className={`text-[10px] ${isActive ? 'text-emerald-600 font-black' : 'text-emerald-500'}`}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {step.label}
                  </motion.span>
                )}
              </motion.div>
            </AnimatePresence>
          );
        })}
        {size === 'sm' && (
          <motion.span 
            className="font-black text-emerald-700"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {upperStatus}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

OrderTracking.displayName = 'OrderTracking';

export default OrderTracking;

