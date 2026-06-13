import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/index.ts';
import { openAuthModal } from '../redux/authSlice.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, isLoading, routes } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      dispatch(openAuthModal('login'));
    }
  }, [isAuthenticated, isLoading, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <h3 className="text-2xl font-black text-white tracking-tight">Authentication Required</h3>
        <p className="text-slate-400 text-sm mt-2">
          Please sign in to access this secured customer portal or corporate dashboard.
        </p>
        <button 
          onClick={() => dispatch(openAuthModal('login'))}
          className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  // Cross-reference dynamic route paths directly
  const hasAccess = routes.some(r => r.path === location.pathname);
  
  if (!hasAccess) {
    // Safely redirect unassigned profiles back to storefront index view
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};