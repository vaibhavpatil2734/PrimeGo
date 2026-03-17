import React, { useState } from "react";
import { useCart } from "../CartContext";
import { useWishlist } from "../WishlistContext";
import AnimatedBrand from "./AnimatedBrand";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentPath = window.location.pathname;
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navLinks = [
    {
      name: "Home",
      href: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4V14H9v7H5a2 2 0 0 1-2-2z" />
        </svg>
      ),
    },
    {
      name: "Products",
      href: "/products",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 7H4m0 0v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7m-16 0l4-4h8l4 4" />
        </svg>
      ),
    },
    {
      name: "Contact",
      href: "/contact",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
          />
        </svg>
      ),
    },
  ];

  const iconOnlyLinks = [
    {
      name: "Wishlist",
      href: "/wishlist",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      name: "Cart",
      href: "/cart",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
          <circle cx="9" cy="21" r="1" />
          <circle cx="17" cy="21" r="1" />
        </svg>
      ),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
        </svg>
      ),
    },
  ];

  const isActive = (href) => currentPath === href;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-md">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <a 
            href="/" 
className="flex items-center text-3xl font-extrabold transition-all duration-300 hover:scale-105"
          >
            <AnimatedBrand />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`
                  relative flex items-center gap-2 px-3 py-2 rounded-lg
                  transition-all duration-300
                  ${
                    isActive(link.href)
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  }
                `}
              >
                {link.icon}
                <span className="text-sm font-medium">{link.name}</span>

                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </a>
            ))}

            {/* Icon-only buttons */}
            {iconOnlyLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                title={link.name}
                className={`
                  relative p-2 rounded-lg
                  transition-all duration-300
                  ${
                    isActive(link.href)
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  }
                `}
              >
                {link.name === "Cart" ? (
                  <div className="relative">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H6" />
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="17" cy="21" r="1" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </div>
                ) : link.name === "Wishlist" ? (
                  <div className="relative">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </div>
                ) : (
                  link.icon
                )}

                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rounded-full" />
                )}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-indigo-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 space-y-2 bg-white border-t">
          {[...navLinks, ...iconOnlyLinks].map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-2 rounded-lg
                transition
                ${
                  isActive(link.href)
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }
              `}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
