import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { RootState } from './redux/store.ts';
import { RouteAccess } from './redux/authSlice.ts';

// Layout Frames
import { AdminLayout } from './layouts/AdminLayout.tsx';
import { PublicLayout } from './layouts/PublicLayout.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

// Public Catalog Marketplace Views (Kept static since all users see these immediately)
import { Home } from './pages/Home.tsx';
import { Products } from './pages/Products.tsx';
import { ResetPassword } from './pages/ResetPassword.tsx';

const CartView = () => (
  <div className="py-20 text-center text-slate-500 font-mono text-xs">
    Your shopping cart instance is currently empty.
  </div>
);

// ⚡ LAZY LOAD COMPONENT REGISTRY: Split admin panel page instances into small chunks
const Dashboard = React.lazy(() => import('./pages/Dashboard.tsx').then(module => ({ default: module.Dashboard })));
const UserManagement = React.lazy(() => import('./pages/UserManagement.tsx').then(module => ({ default: module.UserManagement })));
const RoleManagement = React.lazy(() => import('./pages/RoleManagement.tsx').then(module => ({ default: module.RoleManagement })));
const RouteManagement = React.lazy(() => import('./pages/RouteManagement.tsx').then(module => ({ default: module.RouteManagement })));
const BrandManagement = React.lazy(() => import('./pages/BrandManagement.tsx').then(module => ({ default: module.BrandManagement })));
const CategoryManagement = React.lazy(() => import('./pages/CategoryManagement.tsx').then(module => ({ default: module.CategoryManagement })));
const ProductCatalog = React.lazy(() => import('./pages/ProductCatalog.tsx').then(module => ({ default: module.ProductCatalog })));
const InventoryTracker = React.lazy(() => import('./pages/InventoryTracker.tsx').then(module => ({ default: module.InventoryTracker })));
const AccessMappings = React.lazy(() => import('./pages/AccessMappings.tsx').then(module => ({ default: module.AccessMappings })));

// Map lazy components directly to the dynamic absolute 'path' string keys coming from the DB
const lazyComponentRegistry: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  '/dashboard': Dashboard,
  '/users': UserManagement,
  '/roles': RoleManagement,
  '/routes': RouteManagement,
  '/brands': BrandManagement,
  '/categories': CategoryManagement,
  '/products': ProductCatalog,
  '/inventory': InventoryTracker,
  '/role-route-mappings': AccessMappings,
};

// 🌀 Simple clean loading state for chunk resolution transitions
const ViewLoader = () => (
  <div className="w-full h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
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
        
        {/* --- 1. Static Public Storefront Layout --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products-gallery" element={<Products />} />
          <Route path="/cart" element={<CartView />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* --- 2. Dynamic Lazy Admin Panel Layout (RBAC Driven) --- */}
        <Route 
          element={
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
                  // Wrap in Suspense boundary to cleanly render loader when the user clicks a route
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