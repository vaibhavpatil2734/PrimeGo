// AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Common Admin Navbar */}
      <AdminNav />

      {/* Admin Page Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}