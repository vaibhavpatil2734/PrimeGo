import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TrackingSteps from "./TrackingSteps";
import { Truck } from "lucide-react";

const OrderTracking = ({ order, status = "PLACED", trackingData }) => {
  const upperStatus = status?.toUpperCase() || "PLACED";

  const [scene, setScene] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  // Set scene based on status
  useEffect(() => {
    const statusToScene = {
      PLACED: 0,
      SHIPPED: 1,
      DELIVERED: 2,
    };

    let index = statusToScene[upperStatus] ?? 0;
    setScene(index);

    // initial trigger
    setPlayKey(prev => prev + 1);

  }, [upperStatus]);

  // ✅ REPLAY LOGIC (after animation ends + 5 sec delay)
  useEffect(() => {
    let timeout;

    // ⏱ define animation durations
    const sceneDurations = {
      0: 2000, // wrapping animation ~2s
      2: 2500, // delivery animation ~2.5s
    };

    if (scene === 0 || scene === 2) {
      const totalDelay = sceneDurations[scene] + 5000;

      timeout = setTimeout(() => {
        setPlayKey(prev => prev + 1);
      }, totalDelay);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [scene, playKey]);

  const getSceneText = () => {
    if (scene === 0) return "Wrapping your order 🎁";
    if (scene === 1) return "Your order has been shipped 🚚";
    if (scene === 2) return "Delivered successfully 🎉";
    return "Order Processing";
  };

  return (
    <div className="w-full p-2 sm:p-4 md:p-6">
      <TrackingSteps scene={scene} orderData={order} trackingId={order?.trackingId || ''} />

      {/* 🎬 SCENE */}
      <div className="relative h-40 sm:h-48 md:h-60 bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl overflow-hidden">
        
        <AnimatePresence mode="wait">
          
          {/* ================= 🎁 SCENE 1 ================= */}
          {scene === 0 && (
            <motion.div
              key={`wrap-${playKey}`}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative scale-90 sm:scale-110">
                
                <motion.div
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-400 rounded-xl shadow-xl relative z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                />

                <motion.div
                  className="absolute inset-0 bg-pink-400 rounded-xl z-20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                />

                <motion.div
                  className="absolute left-1/2 top-0 w-1.5 sm:w-2 h-full bg-red-500 -translate-x-1/2 z-30"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                />

                <motion.div
                  className="absolute top-1/2 left-0 h-1.5 sm:h-2 w-full bg-red-500 -translate-y-1/2 z-30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.3, duration: 0.3 }}
                />

                <motion.div
                  className="absolute -top-2 sm:-top-3 left-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 rounded-full -translate-x-1/2 z-40"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6, duration: 0.3 }}
                />

              </div>
            </motion.div>
          )}

          {/* ================= 🚚 SCENE 2 ================= */}
          {scene === 1 && (
            <motion.div
              key={`truck-${playKey}`}
              className="absolute inset-0 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute bottom-0 w-full h-10 sm:h-14 bg-gray-300 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 w-8 sm:w-12 h-1 bg-white rounded"
                    style={{ left: `${i * 60}px` }}
                    animate={{ x: [60, -60] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5,
                      delay: i * 0.1,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              <motion.div
                className="relative mb-1 sm:mb-2 z-10 scale-90 sm:scale-110"
                animate={{ x: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              >
                <Truck className="w-14 h-14 sm:w-20 sm:h-20 text-emerald-600 drop-shadow-lg" />
              </motion.div>
            </motion.div>
          )}

          {/* ================= 🤝 SCENE 3 ================= */}
          {scene === 2 && (
            <motion.div
              key={`delivery-${playKey}`}
              className="absolute inset-0 flex items-end justify-center gap-1 sm:gap-2 pb-4 sm:pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="absolute left-1 sm:left-2 bottom-4 sm:bottom-6 text-4xl sm:text-6xl opacity-40 z-0">
                🚚
              </div>

              <div className="text-5xl sm:text-7xl z-10 relative">
                🧍

                <motion.div
                  className="absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2 z-30"
                  initial={{ opacity: 0, scale: 0.4, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    delay: 2.2,
                    type: "spring",
                    stiffness: 250,
                    damping: 12,
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 translate-x-1 translate-y-1 bg-black rounded-2xl"></div>
                    <div className="relative bg-white border-[2.5px] border-black px-3 sm:px-5 py-2 sm:py-3 rounded-2xl font-extrabold text-[10px] sm:text-xs text-black tracking-wide">
                      Thanks for choosing MADE4UU...
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="text-3xl sm:text-4xl absolute z-20"
                initial={{ x: -30, y: -8 }}
                animate={{ x: [-30, 40, 65], y: [-8, -8, 18] }}
                transition={{ duration: 1.5 }}
              >
                🎁
              </motion.div>

              <motion.div
                className="absolute text-3xl sm:text-4xl z-30 bottom-8 sm:bottom-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1] }}
                transition={{ delay: 1.6 }}
              >
                🤝
              </motion.div>

              <div className="text-5xl sm:text-7xl z-10">🧍</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TEXT */}
      <div className="text-center mt-4 sm:mt-6 font-bold text-emerald-700 text-sm sm:text-lg">
        {getSceneText()}
      </div>
    </div>
  );
};

export default OrderTracking;