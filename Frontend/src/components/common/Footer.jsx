import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative bg-black text-white overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* TOP SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 text-center lg:text-left">
          
          {/* BRAND */}
          <div className="max-w-sm">
            <h2 className="text-2xl font-extrabold hover:text-indigo-400 transition">
              Made4UU
            </h2>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Custom-designed products made just for you. Quality,
              creativity, and style delivered to your doorstep.
            </p>
          </div>

          {/* LINKS */}
          <ul className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm font-semibold">
            {[
              { name: "Privacy Policy", href: "/privacy" },
              { name: "Terms of Service", href: "/terms" },
              { name: "Contact Us", href: "/contact" },
              { name: "About Us", href: "/about-us" },
              { name: "Refund Policy", href: "/refund-policy" }
            ].map((link) => (
              <li key={link.name} className="relative group">
                <Link
                  to={link.href}
                  className="text-white hover:text-indigo-400 transition"
                >
                  {link.name}
                </Link>

                {/* Underline */}
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
              </li>
            ))}
          </ul>
        </div>

        {/* SOCIAL ICONS */}
        <div className="flex justify-center gap-6 mt-10">
          
          {/* FACEBOOK */}
          <a
            href="https://www.facebook.com/Made4onlyyouu"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-white/10 hover:bg-blue-500/20 transition transform hover:scale-110"
          >
            <svg
              className="w-6 h-6 text-white hover:text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-4 3.8-4 1.1 0 2.2.2 2.2.2v2.4H15c-1.2 0-1.5.7-1.5 1.5V12H17l-.5 3h-3v7A10 10 0 0 0 22 12z" />
            </svg>
          </a>

          {/* INSTAGRAM */}
          <a
            href="https://www.instagram.com/made4uu.official/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-white/10 hover:bg-pink-500/20 transition transform hover:scale-110"
          >
            <svg
              className="w-6 h-6 text-white hover:text-pink-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7.75 2C4.57 2 2 4.57 2 7.75v8.5C2 19.43 4.57 22 7.75 22h8.5C19.43 22 22 19.43 22 16.25v-8.5C22 4.57 19.43 2 16.25 2h-8.5zm0 2h8.5C18.32 4 20 5.68 20 7.75v8.5c0 2.07-1.68 3.75-3.75 3.75h-8.5C5.68 20 4 18.32 4 16.25v-8.5C4 5.68 5.68 4 7.75 4zm8.75 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
            </svg>
          </a>
        </div>

        {/* DIVIDER */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />

        {/* BOTTOM */}
        <div className="text-center text-sm text-gray-400 space-y-2">
          
          {/* Powered by */}
          <div>
            <span className="text-white font-medium hover:text-indigo-400 transition">
              Powered by Word Lane Tech
            </span>
          </div>

          {/* Copyright */}
          <div>
            © 2026{" "}
            <span className="text-white font-medium hover:text-indigo-400 transition">
              Made4UU
            </span>{" "}
            All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}