import React from "react";
import { motion } from "framer-motion";

const AnimatedBrand = () => {
  return (
    <div className="relative inline-flex items-center justify-center select-none cursor-pointer">
      
      {/* Brand Text */}
      <motion.h1
        className="relative flex items-center text-2xl lg:text-3xl font-extrabold tracking-tight"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Made4 */}
        <span className="text-[#0f172a] drop-shadow-md">
          Made4
        </span>

        {/* UU Gradient */}
        <motion.span
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
          bg-[length:200%_200%] bg-clip-text text-transparent drop-shadow-lg"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%"],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          UU
        </motion.span>

        {/* Thick RGB Underline */}
        <div className="absolute left-0 -bottom-2 w-full h-[5px] overflow-hidden rounded-full">
          
          {/* RGB Flow */}
          <motion.div
            className="h-full w-full"
            animate={{
              backgroundPosition: ["0% 0%", "200% 0%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background:
                "linear-gradient(90deg,#6366f1,#a855f7,#ec4899,#ffffff,#6366f1)",
              backgroundSize: "200% 100%",
            }}
          />

        </div>
      </motion.h1>
    </div>
  );
};

export default AnimatedBrand;