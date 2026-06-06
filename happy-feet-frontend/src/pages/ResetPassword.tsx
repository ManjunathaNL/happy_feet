import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Independent visibility toggles for enhanced security UX
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Inline Validation States
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const localErrors: typeof errors = {};

    // 🛑 Inline Client-Side Validation Checklist
    if (!password) {
      localErrors.password = 'New password is required.';
    } else if (password.length < 6) {
      localErrors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      localErrors.confirmPassword = 'Please confirm your new password.';
    } else if (password !== confirmPassword) {
      localErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      if (localErrors.password) passwordRef.current?.focus();
      else if (localErrors.confirmPassword) confirmPasswordRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      if (!token) throw new Error('Invalid or expired validation payload.');
      
      const res = await authAPI.resetPassword(token, { password });
      toast.success(res.data?.message || 'Password updated successfully! Redirecting...');
      
      // Send user straight to storefront home view where the login modal can accept new entries
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || 'Failed to override password parameters.';
      setErrors({ password: serverMsg });
      passwordRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl shadow-xl relative"
      >
        {/* Decorative Brand Accent Ring Header */}
        <div className="mb-6 p-4 rounded-2xl flex items-center gap-4 bg-[var(--dynamic-accent-bg,#7f1d1d)] text-[var(--dynamic-accent-text,#ffffff)] shadow-sm">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-md font-black uppercase tracking-wider">Update Credentials</h3>
            <p className="text-[11px] opacity-80 mt-0.5 font-medium">Create a strong password for your secure profile.</p>
          </div>
        </div>

        <form onSubmit={handleResetSubmit} className="space-y-4">
          {/* New Password Input Box */}
          <div className="flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`w-full bg-slate-50 border rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none transition-all ${
                  errors.password ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:ring-2 focus:ring-[#7f1d1d]"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 mt-1.5">
                <AlertCircle size={12} /> {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password Input Box */}
          <div className="flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                className={`w-full bg-slate-50 border rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none transition-all ${
                  errors.confirmPassword ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:ring-2 focus:ring-[#7f1d1d]"
                }`}
                placeholder="••••••••"
              />
              {/* ✅ ADDED: Visibility Toggle explicitly for Confirm Password surface node */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 mt-1.5">
                <AlertCircle size={12} /> {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Action Trigger Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md bg-[var(--dynamic-accent-bg,#7f1d1d)] text-[var(--dynamic-accent-text,#ffffff)] filter hover:brightness-110 active:scale-98 cursor-pointer flex items-center justify-center gap-2 h-[44px]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Commit Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};