import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header.tsx';
import { Footer } from '../components/Footer.tsx';
import { AuthModal } from '../components/AuthModal.tsx';

export const PublicLayout: React.FC = () => {
  return (
    // Body sets a clean slate-50 light background
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans transition-colors duration-300">
      <Header />
      <AuthModal />
      <main className="flex-1 w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};