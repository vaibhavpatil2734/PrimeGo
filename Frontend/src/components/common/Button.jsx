import React, { useEffect, useRef } from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}) {
  const buttonRef = useRef(null);

  const variants = {
    primary: "bg-indigo-600",
    success: "bg-emerald-600",
    danger: "bg-rose-600",
  };

  const sizes = {
    sm: `
      px-3 py-1.5 text-xs rounded-md
      sm:px-3.5 sm:py-1.5 sm:text-xs
      md:px-4 md:py-2 md:text-sm
      lg:px-4 lg:py-2 lg:text-sm
    `,
    mds: `
      px-3.5 py-2 text-xs rounded-md
      sm:px-4 sm:py-2 sm:text-sm
      md:px-5 md:py-2.5 md:text-sm
      lg:px-5 lg:py-2.5 lg:text-base
    `,
    md: `
      px-4 py-2 text-sm rounded-lg
      sm:px-5 sm:py-2.5 sm:text-base
      md:px-6 md:py-3 md:text-base
      lg:px-7 lg:py-3 lg:text-lg
    `,
    mdl: `
      px-4.5 py-2.5 text-sm rounded-xl
      sm:px-6 sm:py-3 sm:text-lg
      md:px-7 md:py-3.5 md:text-lg
      lg:px-8 lg:py-4 lg:text-xl
    `,
    lg: `
      px-5 py-3 text-base rounded-xl
      sm:px-7 sm:py-3.5 sm:text-lg
      md:px-8 md:py-4 md:text-xl
      lg:px-10 lg:py-4.5 lg:text-2xl
    `,
  };

  // ▶ Animate once when first visible, then reset
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-once");

          // 🔑 remove after animation so hover can replay
          setTimeout(() => {
            el.classList.remove("animate-once");
          }, 1000); // must match transition duration

          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative overflow-hidden font-semibold tracking-wide
        text-white transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {/* 🌊 Fluid shine */}
      <span
        className="
          pointer-events-none absolute inset-y-0 -left-1/2 w-[200%]
          bg-gradient-to-r from-white/10 via-white/60 to-white/10
          skew-x-[-25deg] translate-x-[-100%]
          transition-transform duration-1000 ease-out
          group-hover:translate-x-[100%]
          group-[.animate-once]:translate-x-[100%]
        "
      />

      <span className="relative z-10">{children}</span>
    </button>
  );
}
