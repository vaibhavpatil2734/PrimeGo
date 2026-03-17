import React, { useState, useEffect } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import Layout from "../app/Layout";
import Home from "../app/home/Home";
import PageNotFound from "../app/PageNotFound";
import Login from "../pages/login";
import Register from "../pages/register";
import Cart from "../pages/cart";
import Checkout from "../pages/checkout";
import Profile from "../pages/profile";
import Aboutus from "../pages/Aboutus";
import Contact from "../pages/Contact";
import Products from "../pages/products";
import ProductDetails from "../pages/ProductDetails";
import MyOrders from "../pages/MyOrders";
import Wishlist from "../pages/Wishlist";
import AdminRouteGuard from "../components/admin/AdminRouteGuard";

// ADMIN
import AdminLayout from "../pages/adminPages/AdminLayout";
import AdminDashboard from "../pages/adminPages/AdminDashboard";
import AdminOrders from "../pages/adminPages/AdminOrders";
import AdminUsers from "../pages/adminPages/AdminUsers";
import CreateProduct from "../pages/adminPages/CreateProduct";
import ManageProduct from "../pages/adminPages/ManageProduct";
import UpdateProduct from "../pages/adminPages/UpdateProduct";
import ManageContacts from "../pages/adminPages/ManageContacts";

// Loader
const PageLoader = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 99999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(248, 248, 255, 0.95)",
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "5px solid #f3f3f3",
        borderTop: "5px solid #FFCC33",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    ></div>

    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// FIXED RouteLoader
const RouteLoader = ({ children }) => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);

    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {isNavigating && <PageLoader />}
      {children}
    </>
  );
};

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: (
      <RouteLoader>
        <Layout />
      </RouteLoader>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "profile", element: <Profile /> },
      { path: "orders", element: <MyOrders /> },
      { path: "about-us", element: <Aboutus /> },
      { path: "contact", element: <Contact /> },
      { path: "products", element: <Products /> },
      { path: "product/:id", element: <ProductDetails /> },
      { path: "wishlist", element: <Wishlist /> },

      // ADMIN ROUTES
      {
        path: "admin",
        element: (
          <AdminRouteGuard>
            <AdminLayout />
          </AdminRouteGuard>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "users", element: <AdminUsers /> },

          // PRODUCT MANAGEMENT
          { path: "products", element: <ManageProduct /> },
          { path: "products/create", element: <CreateProduct /> },
          { path: "products/:id/edit", element: <UpdateProduct /> },
          { path: "contacts", element: <ManageContacts /> },
        ],
      },
    ],
  },

  { path: "*", element: <PageNotFound /> },
]);


export default AppRoutes;