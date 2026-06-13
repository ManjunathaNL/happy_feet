import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { RootState } from './redux/index.ts';
import { RouteAccess } from './redux/authSlice.ts';

// Layout Frames
import { AdminLayout } from './layouts/AdminLayout.tsx';
import { PublicLayout } from './layouts/PublicLayout.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

// Public Catalog Marketplace Views
import { Home } from './pages/Home.tsx';
import Products from './pages/Products.tsx';
import { ResetPassword } from './pages/ResetPassword.tsx';

// Linked end-to-end user client flows
import ProductDetails from './pages/ProductDetails.tsx';
import Cart from './pages/Cart.tsx';
import Wishlist from './pages/Wishlist.tsx';
import Checkout from './pages/Checkout.tsx';

// ⚡ LAZY LOAD COMPONENT REGISTRY
const Dashboard = React.lazy(() => import('./pages/Dashboard.tsx').then(module => ({ default: module.Dashboard })));
const UserManagement = React.lazy(() => import('./pages/UserManagement.tsx').then(module => ({ default: module.UserManagement })));
const RoleManagement = React.lazy(() => import('./pages/RoleManagement.tsx').then(module => ({ default: module.RoleManagement })));
const RouteManagement = React.lazy(() => import('./pages/RouteManagement.tsx').then(module => ({ default: module.RouteManagement })));
const ProductManagement = React.lazy(() => import('./pages/ProductManagement.tsx').then(module => ({ default: module.ProductManagement })));
const AccessMappings = React.lazy(() => import('./pages/AccessMappings.tsx').then(module => ({ default: module.AccessMappings })));
const MasterManagement = React.lazy(() => import('./pages/MasterManagement.tsx').then(module => ({ default: module.MasterManagement })));

// ✅ FIXED: Grab the default export cleanly to solve the property compilation error
const InventoryTracker = React.lazy(() => import('./pages/InventoryTracker.tsx'));

// Map lazy components directly to the dynamic absolute 'path' string keys coming from the DB
const lazyComponentRegistry: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  '/dashboard': Dashboard,
  '/users': UserManagement,
  '/roles': RoleManagement,
  '/routes': RouteManagement,
  '/products': ProductManagement,
  '/inventory': InventoryTracker,
  '/role-route-mappings': AccessMappings,
  "/masters": MasterManagement,
};

// 🌀 THEME SYNCHRONIZED LOADER: Spinning accent ring styled with deep crimson tokens
const ViewLoader = () => (
  <div className="w-full h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7f1d1d]"></div>
  </div>
);

export const App: React.FC = () => {
  const { token, routes, currentTheme } = useSelector((state: RootState) => state.auth);

  // Sync global CSS variables with active user parameters
  useEffect(() => {
    if (currentTheme) {
      document.documentElement.style.setProperty('--dynamic-bg', currentTheme.bg);
      document.documentElement.style.setProperty('--dynamic-text', currentTheme.text);
    }
  }, [currentTheme]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { 
            background: '#0f172a', 
            color: '#f8fafc', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.1)' 
          } 
        }} 
      />
      
      <Routes>
        
        {/* --- 1. Static Public Storefront Layout Nodes --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products-gallery" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* --- 2. Dynamic Lazy Admin Panel Layout (RBAC Driven) --- */}
        <Route 
          element = {
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {token && routes && routes.map((rt: RouteAccess) => {
            const LazyComp = lazyComponentRegistry[rt.path];
            const absolutePath = rt.path.startsWith('/') ? rt.path : `/${rt.path}`;
            
            return LazyComp ? (
              <Route 
                key={rt.path} 
                path={absolutePath} 
                element={
                  <Suspense fallback={<ViewLoader />}>
                    <LazyComp />
                  </Suspense>
                } 
              />
            ) : null;
          })}
        </Route>

        {/* Global Catch-all Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};