import React from "react";
import { motion } from "framer-motion";

const TrackingSteps = ({ scene, orderData, trackingId = '' }) => {
  // Dynamic dates from order data or fallback mocks
  const getFormattedDate = (timestamp, fallback, isExpected = false) => {
    if (!timestamp) return fallback;
    
    let date;
    if (typeof timestamp === 'string') {
      // Handle YYYY-MM-DD or custom formats
      date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // If invalid Date, display raw string for ETD (e.g. "2024-12-25")
        const formatted = timestamp.replace(/-/g, '/'); 
        return isExpected ? `Expected ${formatted}` : formatted;
      }
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) return fallback;
    
    const now = new Date();
    const options = {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    const formatted = date.toLocaleDateString('en-US', options).replace(',', '');
    if (isExpected && date > now) return `Expected by ${formatted}`;
    return formatted;
  };

  // 🔥 Real dates from order data
  const getStatusLabel = () => {
    const status = orderData?.current_status || orderData?.trackingStatus || orderData?.status;
    if (orderData?.deliveredAt) return "Delivered";
    if (orderData?.shippedAt) return `Shipped (${status})`;
    return "Expected";
  };

  const steps = [
    {
      label: "Order Placed",
      icon: "📦",
      date: getFormattedDate(orderData?.createdAt, "Pending"),
    },
    {
      label: "Shipped",
      icon: "🚚",
      date: getFormattedDate(orderData?.shippedAt, "Pending") + 
            (orderData?.current_status ? ` • ${orderData.current_status}` : ""),
    },
    {
      label: getStatusLabel(),
      icon: orderData?.deliveredAt ? "✅" : "📍",
      date: getFormattedDate(
        orderData?.deliveredAt || 
        orderData?.expectedDelivery || 
        orderData?.etd, 
        "Pending",
        true  // isExpected flag
      ),
    },
  ];

  return (
    <div className="w-full p-4">
      <div className="relative flex flex-col gap-6 sm:gap-8">

        {/* ✅ Base Line (FIXED HERE) */}
        {/* Vertical Base Line */}
        <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-gray-300 rounded-full z-0" />

        {/* Animated Progress Line */}
        <motion.div 
          className="absolute left-5 top-0 w-[2px] bg-emerald-500 rounded-full z-1"
          initial={{ height: 0 }}
          animate={{ 
            height: scene === 0 ? '33%' : scene === 1 ? '66%' : '100%' 
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* 🔥 Animated Line */}
        <motion.div
          className="absolute left-5 top-5 w-[2px] bg-black rounded-full"
          initial={{ height: 0 }}
          animate={{
            height:
              scene === 0
                ? 0
                : scene === 1
                ? "50%"
                : "calc(100% - 40px)", // stops at center
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isActive = scene === index;
          const isCompleted = scene > index;

          return (
            <div key={index} className="flex items-start gap-4">

              {/* Circle */}
              <div className="relative z-10 bg-white p-[2px] rounded-full">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted || isActive ? "bg-black text-white" : "bg-gray-300"}`}
                  
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {step.icon}
                </motion.div>
              </div>

              {/* Text */}
              <div>
                <p className={`font-semibold ${isActive ? "text-black" : "text-gray-600"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">
                  {step.date}
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackingSteps;