import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ fullScreen = false, message = 'Loading System Framework...' }) => {
  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-slate-50/90 backdrop-blur-xs z-50' 
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full"
        />
        <p className="text-sm font-semibold tracking-wide text-slate-600">{message}</p>
      </div>
    </div>
  );
};