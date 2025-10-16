import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Admin
import LoginPage from "./pages/admin/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";
import "leaflet/dist/leaflet.css";

// Public
import LandingPage from "./pages/landing/LandingPage";

// Customer
import CustomerHome from "./pages/customer/CustomerHome";

// Seller
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerBusinessPage from "./pages/seller/SellerBusinessPage";
import SellerAccessPage from "./pages/seller/SellerAccessPage";
import SellerLoginPage from "./components/seller/SellerLoginPage"; // ✅ Make sure this is created
import ManageMenusPage from "./pages/seller/ManageMenusPage";
import BusinessManagement from "./pages/admin/BusinessManagement";

// Rider
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderLoginPage from "./pages/rider/RiderLoginPage";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/" element={<LoginPage />} />
        <Route path="/seller/login" element={<SellerLoginPage />} />
        <Route path="/seller/register" element={<SellerAccessPage />} />
        <Route path="/rider/login" element={<RiderLoginPage />} />

        {/* Admin Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />}>
            <Route />
            <Route path="users" element={<UserManagement />} />
            <Route path="business" element={<BusinessManagement />} />
          </Route>
        </Route>

        {/* Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
          <Route path="/customer/home" element={<CustomerHome />} />
        </Route>

        {/* Seller Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Seller"]} />}>
          <Route path="/seller" element={<SellerDashboard />}>
            <Route path="business" element={<SellerBusinessPage />} />
            <Route path="menus" element={<ManageMenusPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Rider"]} />}>
          <Route path="/rider" element={<RiderDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
