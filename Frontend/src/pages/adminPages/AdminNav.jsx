import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Plus,
  MessageCircle,
  Activity,
  Download
} from "lucide-react";

export default function AdminNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const buttons = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <BarChart3 size={16} /> },
    { label: "Users", path: "/admin/users", icon: <Users size={16} /> },
    { label: "Create Product", path: "/admin/products/create", icon: <Plus size={16} /> },
    { label: "Manage Products", path: "/admin/products", icon: <Package size={16} /> },
    { label: "Manage Contacts", path: "/admin/contacts", icon: <MessageCircle size={16} /> },
    { label: "Manage Orders", path: "/admin/orders", icon: <ShoppingCart size={16} /> }]

  const isProductsActive = location.pathname.startsWith("/admin/products");
  const isContactsActive = location.pathname === "/admin/contacts";

  return (
    <div className="bg-white shadow-sm">
      <div className="px-6 py-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <div className="px-6 pb-4 flex gap-3 flex-wrap">
        {/* Main Navigation */}
        {buttons.map((btn) => {
          const isActive = location.pathname === btn.path;

          return (
            <button
              key={btn.label}
              onClick={() => navigate(btn.path, { replace: true })}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border-2 transition ${
                isActive
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600"
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

