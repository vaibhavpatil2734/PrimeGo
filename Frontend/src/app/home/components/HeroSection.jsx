import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import HeroRunway from "./HeroRunway";
import AnimatedBrand from "../../../components/common/AnimatedBrand.jsx";

export default function HeroSection({ products, loading }) {

  const typingLines = [
    "Make it yours. Make it iconic.",
    "Stand out. Stay personal.",
    "Perfect for every moment.",
    "A gift that remembers."
  ];

  const [currentText, setCurrentText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentLine = typingLines[currentLineIndex];
    let timeout;

    if (!isDeleting && charIndex === currentLine.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1600);
    } 
    else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setCurrentLineIndex((prev) => (prev + 1) % typingLines.length);
    } 
    else {
      timeout = setTimeout(() => {
        const nextIndex = isDeleting ? charIndex - 1 : charIndex + 1;
        setCurrentText(currentLine.substring(0, nextIndex));
        setCharIndex(nextIndex);
      }, isDeleting ? 30 : 60);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentLineIndex]);

  return (
    <section className="relative min-h-screen flex flex-col items-center px-4 md:px-6 py-8 md:py-10 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-white">

      {/* Background Glow */}
      <div className="absolute w-[420px] h-[420px] bg-indigo-300/20 blur-3xl rounded-full -top-32 -right-32" />
      <div className="absolute w-[420px] h-[420px] bg-blue-300/20 blur-3xl rounded-full -bottom-32 -left-32" />

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 text-2xl md:text-3xl opacity-30">

        <motion.span animate={{ y: [0, -30, 0], x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute left-[8%] top-[20%]">🎁</motion.span>

        <motion.span animate={{ y: [0, -25, 0], x: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute left-[25%] top-[10%]">✨</motion.span>

        <motion.span animate={{ y: [0, -35, 0], x: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute left-[45%] top-[18%]">❤️</motion.span>

        <motion.span animate={{ y: [0, -30, 0], x: [0, -8, 0] }} transition={{ duration: 6.5, repeat: Infinity }} className="absolute left-[65%] top-[12%]">🛍</motion.span>

        <motion.span animate={{ y: [0, -28, 0], x: [0, 12, 0] }} transition={{ duration: 7.5, repeat: Infinity }} className="absolute left-[85%] top-[20%]">✨</motion.span>

        <motion.span animate={{ y: [0, -32, 0], x: [0, -6, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute left-[12%] top-[50%]">🎁</motion.span>

        <motion.span animate={{ y: [0, -30, 0], x: [0, 9, 0] }} transition={{ duration: 6.8, repeat: Infinity }} className="absolute left-[32%] top-[60%]">❤️</motion.span>

        <motion.span animate={{ y: [0, -26, 0], x: [0, -9, 0] }} transition={{ duration: 7.2, repeat: Infinity }} className="absolute left-[55%] top-[55%]">🛍</motion.span>

        <motion.span animate={{ y: [0, -34, 0], x: [0, 7, 0] }} transition={{ duration: 7.8, repeat: Infinity }} className="absolute left-[75%] top-[58%]">✨</motion.span>

        <motion.span animate={{ y: [0, -29, 0], x: [0, -8, 0] }} transition={{ duration: 6.3, repeat: Infinity }} className="absolute left-[18%] top-[80%]">🛍</motion.span>

        <motion.span animate={{ y: [0, -31, 0], x: [0, 6, 0] }} transition={{ duration: 7.7, repeat: Infinity }} className="absolute left-[48%] top-[85%]">🎁</motion.span>

        <motion.span animate={{ y: [0, -27, 0], x: [0, -7, 0] }} transition={{ duration: 6.9, repeat: Infinity }} className="absolute left-[80%] top-[78%]">❤️</motion.span>

      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-20 flex flex-wrap items-center justify-center gap-2 text-center mb-5 md:mb-6"
      >
        <AnimatedBrand />

        <span className="text-gray-700 font-semibold text-xl md:text-3xl lg:text-4xl">
          – Where Every Choice Feels Right
        </span>
      </motion.div>

      {/* Product Runway */}
      <div className="w-full max-w-5xl md:max-w-6xl flex justify-center mx-auto z-10">
        <HeroRunway products={products} loading={loading} />
      </div>

      {/* Typing Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="z-20 text-indigo-600 font-semibold text-base md:text-xl lg:text-2xl h-10 text-center mt-5 mb-5"
      >
        {currentText}
        <span className="animate-pulse ml-1">|</span>
      </motion.p>

      {/* Feature Badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="z-20 flex flex-wrap justify-center gap-2 md:gap-3 mt-3 text-[11px] md:text-sm"
      >

        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-white shadow-sm rounded-full text-gray-600 border">
          🎁 Perfect Gift Ideas
        </span>

        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-white shadow-sm rounded-full text-gray-600 border">
          ✨ Unique Personalized Designs
        </span>

        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-white shadow-sm rounded-full text-gray-600 border">
          🚚 Fast Delivery
        </span>

        <span className="px-3 md:px-4 py-1.5 md:py-2 bg-white shadow-sm rounded-full text-gray-600 border">
          💎 Premium Quality
        </span>

      </motion.div>

    </section>
  );
}