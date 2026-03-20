import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, Check, X } from 'lucide-react';

const PROGRESS_STEPS = [
  { key: 'PLACED', label: 'Placed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Check }
];

const OrderTracking = ({ status = 'PLACED', size = 'sm' }) => {
  const upperStatus = status?.toUpperCase() || 'PLACED';
  const isCancelled = upperStatus === 'CANCELLED';
  const stepIndex = PROGRESS_STEPS.findIndex(step => step.key === upperStatus);
  const currentStep = stepIndex >= 0 ? stepIndex : 0;
  const showSteps = Math.min(currentStep + 1, PROGRESS_STEPS.length);

  const sizeStyles = size === 'sm' ? 'gap-1 [&>svg]:w-4 [&>svg]:h-4 text-xs py-1 px-3' : 'gap-2 [&>svg]:w-5 [&>svg]:h-5 text-sm py-2 px-4';

  if (isCancelled) {
    return (
      <motion.div 
        className={`inline-flex items-center gap-2 rounded-full bg-red-100 border-2 border-red-200 text-red-800 font-bold uppercase tracking-wider shadow-md ${sizeStyles}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <motion.div animate={{ rotate: [0, -12, 12, -12, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>
          <X className="drop-shadow-sm" />
        </motion.div>
        CANCELLED
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-sm backdrop-blur-sm ${sizeStyles}`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
    >
      {/* Progress Bar */}
      <motion.div 
        className="absolute inset-0 h-full bg-gradient-to-r from-emerald-400/50 to-green-500/50 rounded-full -mr-0.5"
        style={{ width: `${(showSteps / PROGRESS_STEPS.length) * 100}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${(showSteps / PROGRESS_STEPS.length) * 100}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      <div className="relative z-10 flex items-center gap-1">
        {PROGRESS_STEPS.slice(0, showSteps).map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <motion.div
              key={step.key}
              className={`flex items-center ${size === 'sm' ? 'p-0.5' : 'p-1'} rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-400 shadow-md' : 
                isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-200 ring-2 ring-emerald-300' : 
                'bg-emerald-200'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div className={`${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'} rounded-full shadow-sm flex items-center justify-center overflow-hidden`}>
                {isCompleted ? (
                  <Check className="w-3 h-3 text-white stroke-w-3" />
                ) : isActive ? (
                  <motion.div
                    className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 rounded-full relative flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <Icon className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-white`} />
                  </motion.div>
                ) : (
                  <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-500 opacity-70`} />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      
      {size === 'md' && (
        <motion.span 
          className="font-black text-emerald-700 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm ml-2"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {upperStatus}
        </motion.span>
      )}
    </motion.div>
  );
};

OrderTracking.displayName = 'OrderTracking';

export default OrderTracking;

