import React from "react";

export default function Footer() {
  return (
    <footer className="relative bg-black text-white overflow-hidden">
      
      {/* Subtle animated background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Top Section */}
        <div
          className="
            flex flex-col md:flex-row md:justify-between md:items-start gap-8
            animate-[fadeUp_0.8s_ease-out_forwards]
          "
        >
          
          {/* Brand */}
          <div className="group transition-transform duration-300 hover:-translate-y-1">
            <h2
              className="
                text-2xl font-extrabold text-white
                transition-all duration-300
                group-hover:text-indigo-400
                group-hover:drop-shadow-md
              "
            >
              Made4UU
            </h2>
            <p className="mt-2 text-sm text-gray-300 max-w-sm leading-relaxed">
              Custom-designed products made just for you. Quality,
              creativity, and style delivered to your doorstep.
            </p>
          </div>

          {/* Links */}
          <ul className="flex flex-col sm:flex-row gap-6 text-sm font-semibold">
            {[
              { name: "Privacy Policy", href: "/privacy" },
              { name: "Terms of Service", href: "/terms" },
              { name: "Contact Us", href: "/contact" },
              { name : "About Us", href: "/about-us"}
            ].map((link) => (
              <li key={link.name} className="relative group">
                <a
                  href={link.href}
                  className="text-white transition-colors duration-300 group-hover:text-indigo-400"
                >
                  {link.name}
                </a>

                {/* Animated underline */}
                <span
                  className="
                    absolute left-0 -bottom-1 h-0.5 w-0
                    bg-linear-to-r from-indigo-500 to-purple-500
                    transition-all duration-300
                    group-hover:w-full
                  "
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
        </div>

        {/* Bottom Section */}
        <div
          className="
            text-center text-sm text-gray-400
            animate-[fadeUp_1s_ease-out_forwards]
          "
        >
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-medium text-white hover:text-indigo-400 transition">
            Made4UU
          </span>
          . All rights reserved.
        </div>
      </div>

      {/* Custom animation */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </footer>
  );
}
