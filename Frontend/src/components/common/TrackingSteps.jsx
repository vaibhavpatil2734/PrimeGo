import React from "react";
import { motion } from "framer-motion";

const TrackingSteps = ({ scene, orderData, trackingId = '' }) => {
  // Dynamic dates from order data or fallback mocks
  const getFormattedDate = (timestamp, fallback, isExpected = false) => {
    if (!timestamp) return fallback;
    try {
      const date = new Date(timestamp);
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
    } catch {
      return fallback;
    }
  };

  const mockData = {
    placed: "25 Mar 2026, 10:30 AM",
    shipped: "26 Mar 2026, 02:15 PM",
    expected: "28 Mar 2026, 05:00 PM",
    delivered: "28 Mar 2026, 03:45 PM",
  };

  const steps = [
    {
      label: "Placed",
      icon: "📦",
      date: getFormattedDate(orderData?.createdAt, mockData.placed),
    },
    {
      label: "Shipped",
      icon: "🚚",
      date: getFormattedDate(orderData?.updatedAt, mockData.shipped),
    },
    {
      label: "Delivered",
      icon: "📍",
      date: getFormattedDate(
        scene === 2 ? orderData?.updatedAt : null,
        scene === 2 ? mockData.delivered : mockData.expected,
        !orderData?.updatedAt
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