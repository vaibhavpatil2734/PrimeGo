import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck } from "lucide-react";

const OrderTracking = ({ status = "PLACED" }) => {
  const upperStatus = status?.toUpperCase() || "PLACED";
  
  // Map status to scene
  const getInitialScene = () => {
    if (upperStatus === "SHIPPED") return 1;
    if (upperStatus === "DELIVERED") return 2;
    return 0; // PLACED default
  };

  const [scene, setScene] = useState(getInitialScene());

  const getSceneText = () => {
    if (scene === 0) return "Wrapping your order 🎁 - seen 1";
    if (scene === 1) return "Out for delivery 🚚 - seen 2";
    if (scene === 2) return "Delivered successfully 🎉 - seen 3";
    return "Order Processing";
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-xl">

      {/* 🎬 SCENE */}
      <div className="relative h-48 sm:h-60 bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl overflow-hidden">

        <AnimatePresence mode="wait">

          {/* ================= 🎁 SCENE 1 ================= */}
          {scene === 0 && (
            <motion.div
              key="wrap"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative scale-90 sm:scale-110">
                <motion.div
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-400 rounded-xl shadow-xl"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
                <motion.div
                  className="absolute inset-0 bg-pink-400 rounded-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div
                  className="absolute left-1/2 top-0 w-1.5 sm:w-2 h-full bg-red-500 -translate-x-1/2"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4 }}
                />
                <motion.div
                  className="absolute top-1/2 left-0 h-1.5 sm:h-2 w-full bg-red-500 -translate-y-1/2"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6 }}
                />
                <motion.div
                  className="absolute -top-2 sm:-top-3 left-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 rounded-full -translate-x-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                />
              </div>
            </motion.div>
          )}

          {/* ================= 🚚 SCENE 2 ================= */}
          {scene === 1 && (
            <motion.div
              key="truck"
              className="absolute inset-0 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Road */}
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

              {/* Truck */}
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
              key="delivery"
              className="absolute inset-0 flex items-end justify-center gap-1 sm:gap-2 pb-4 sm:pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Truck */}
              <div className="absolute left-1 sm:left-2 bottom-4 sm:bottom-6 text-4xl sm:text-6xl opacity-40 z-0">
                🚚
              </div>

              {/* LEFT PERSON */}
              <div className="text-5xl sm:text-7xl z-10 relative">
                🧍

                {/* 💬 PRO COMIC SPEECH BUBBLE */}
                <motion.div
                  className="absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2 z-30"
                  initial={{ opacity: 0, scale: 0.4, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 2.2, type: "spring", stiffness: 250, damping: 12 }}
                >
                  <div className="relative">

                    {/* Shadow */}
                    <div className="absolute inset-0 translate-x-1 translate-y-1 bg-black rounded-2xl"></div>

                    {/* Bubble */}
                    <div className="relative bg-white border-[2.5px] border-black px-3 sm:px-5 py-2 sm:py-3 rounded-2xl font-extrabold text-[10px] sm:text-xs text-black tracking-wide">
                      Thanks for choosing MADE4UU...
                    </div>

                  </div>
                </motion.div>
              </div>

              {/* BOX */}
              <motion.div
                className="text-3xl sm:text-4xl absolute z-20"
                initial={{ x: -30, y: -8 }}
                animate={{
                  x: [-30, 40, 65],
                  y: [-8, -8, 18],
                }}
                transition={{ duration: 1.5 }}
              >
                🎁
              </motion.div>

              {/* HANDSHAKE */}
              <motion.div
                className="absolute text-3xl sm:text-4xl z-30 bottom-8 sm:bottom-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1] }}
                transition={{ delay: 1.6 }}
              >
                🤝
              </motion.div>

              {/* RIGHT PERSON */}
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

