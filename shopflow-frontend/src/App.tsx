import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ToastContainer from "./components/ui/Toast";
import CartDrawer from "./components/cart/CartDrawer";
import Spinner from "./components/ui/Spinner";

// Layout — NOT lazy loaded (needed immediately)
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminRoute from "./components/layout/AdminRoute";

// ─── Lazy loaded pages ────────────────────────────────
// Auth
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

// Shop
const HomePage = lazy(() => import("./pages/shop/HomePage"));
const ProductsPage = lazy(() => import("./pages/shop/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/shop/ProductDetailPage"));
const CategoryPage = lazy(() => import("./pages/shop/CategoryPage"));

// Checkout + Orders
const CheckoutPage = lazy(() => import("./pages/checkout/CheckoutPage"));
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/orders/OrderDetailPage"));

// Admin — most important to lazy load
// These are the heaviest pages and only admins access them
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

import ShopLayout from "./components/layout/ShopLayout";
import AdminLayout from "./components/layout/AdminLayout";

import ScrollToTop from "./components/ui/ScrollTop";

// ─── Page loading fallback ────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartDrawer />
      <ToastContainer />

      {/* Suspense wraps ALL routes — one fallback for any page load */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Auth ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ── Shop ── */}
          <Route
            path="/"
            element={
              <ShopLayout>
                <HomePage />
              </ShopLayout>
            }
          />
          <Route
            path="/products"
            element={
              <ShopLayout>
                <ProductsPage />
              </ShopLayout>
            }
          />
          <Route
            path="/products/:slug"
            element={
              <ShopLayout>
                <ProductDetailPage />
              </ShopLayout>
            }
          />
          <Route
            path="/categories/:slug"
            element={
              <ShopLayout>
                <CategoryPage />
              </ShopLayout>
            }
          />

          {/* ── Protected Shop ── */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <ShopLayout>
                  <CheckoutPage />
                </ShopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <ShopLayout>
                  <OrdersPage />
                </ShopLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <ShopLayout>
                  <OrderDetailPage />
                </ShopLayout>
              </ProtectedRoute>
            }
          />

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
