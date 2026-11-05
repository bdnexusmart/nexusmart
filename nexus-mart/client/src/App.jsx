import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import HomePage from "./pages/customer/HomePage";
import ProductListPage from "./pages/customer/ProductListPage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import MyOrdersPage from "./pages/customer/MyOrdersPage";
import VendorListPage from "./pages/customer/VendorListPage";
import VendorStorePage from "./pages/customer/VendorStorePage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import VendorLayout from "./pages/vendor/VendorLayout";
import VendorDashboardPage from "./pages/vendor/VendorDashboardPage";
import VendorProductsPage from "./pages/vendor/VendorProductsPage";
import VendorOrdersPage from "./pages/vendor/VendorOrdersPage";
import VendorSettingsPage from "./pages/vendor/VendorSettingsPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminVendorsPage from "./pages/admin/AdminVendorsPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/vendors" element={<VendorListPage />} />
          <Route path="/vendors/:slug" element={<VendorStorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer */}
          <Route element={<ProtectedRoute roles={["customer"]} />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
          </Route>

          {/* Vendor */}
          <Route element={<ProtectedRoute roles={["vendor"]} />}>
            <Route element={<VendorLayout />}>
              <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
              <Route path="/vendor/products" element={<VendorProductsPage />} />
              <Route path="/vendor/orders" element={<VendorOrdersPage />} />
              <Route path="/vendor/settings" element={<VendorSettingsPage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/vendors" element={<AdminVendorsPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={<p className="text-center py-24 text-ink-muted">Page not found.</p>}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
