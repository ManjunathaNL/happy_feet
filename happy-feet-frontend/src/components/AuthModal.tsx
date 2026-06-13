import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Phone,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { RootState } from "../redux";
import { closeAuthModal, setAuthSuccess } from "../redux/authSlice";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthModalOpen, authModalType } = useSelector(
    (state: RootState) => state.auth,
  );

  const [viewState, setViewState] = useState<"login" | "register" | "forgot">(
    authModalType,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    mobile?: string;
  }>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);

  const switchView = (nextView: "login" | "register" | "forgot") => {
    setViewState(nextView);
    setErrors({});
    setEmail("");
    setPassword("");
    setName("");
    setMobile("");
    setShowPassword(false);
  };

  useEffect(() => {
    if (isAuthModalOpen) {
      setViewState(authModalType);
      setErrors({});
      setEmail("");
      setPassword("");
      setName("");
      setMobile("");
    }
  }, [isAuthModalOpen, authModalType]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const localErrors: typeof errors = {};

    // 1. Password Recovery Pipeline
    if (viewState === "forgot") {
      if (!email.trim()) {
        localErrors.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        localErrors.email = "Please enter a valid email address";
      }

      if (localErrors.email) {
        setErrors(localErrors);
        emailRef.current?.focus();
        return;
      }

      setLoading(true);
      try {
        const res = await api.post("/auth/forgot-password", {
          email: email.toLowerCase().trim(),
        });
        toast.success(res.data.message || "Reset link sent to your email!");
        switchView("login");
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to request reset link.",
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Account Registration Pipeline
    if (viewState === "register") {
      if (!name.trim()) localErrors.name = "Full name is required";
      if (!mobile.trim() || !/^\d{10}$/.test(mobile.trim()))
        localErrors.mobile = "Mobile number must be 10 digits";
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        localErrors.email = "Valid email is required";
      if (!password || password.length < 6)
        localErrors.password = "Password must be at least 6 characters long";

      if (Object.keys(localErrors).length > 0) {
        setErrors(localErrors);
        if (localErrors.name) nameRef.current?.focus();
        else if (localErrors.mobile) mobileRef.current?.focus();
        else if (localErrors.email) emailRef.current?.focus();
        else if (localErrors.password) passwordRef.current?.focus();
        return;
      }

      setLoading(true);
      try {
        await api.post("/auth/register", {
          name,
          mobile,
          email: email.toLowerCase().trim(),
          password,
        });
        toast.success("Account created successfully! Please log in.");
        switchView("login");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to create account.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. Login Authentication Matrix Process
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      localErrors.email = "Valid email is required";
    if (!password) localErrors.password = "Password is required";

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      if (localErrors.email) emailRef.current?.focus();
      else if (localErrors.password) passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Save data directly into active Redux state slices and clear modal view context
      dispatch(setAuthSuccess(res.data));
      toast.success(`Welcome back, ${res.data.user.name}`);
      dispatch(closeAuthModal());
      
      if (res.data.user.role !== "Customer") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }

    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Incorrect email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white border border-slate-200 p-6 rounded-2xl relative shadow-xl text-slate-800 font-sans"
      >
        <button
          onClick={() => dispatch(closeAuthModal())}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-600 hover:scale-110 transition-all duration-200 shadow-xs flex items-center justify-center cursor-pointer"
          title="Close window"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)] transition-all duration-300 shadow-sm">
          {viewState !== "login" && (
            <button
              type="button"
              onClick={() => switchView("login")}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center text-inherit"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider">
              {viewState === "login"
                ? "Sign In"
                : viewState === "register"
                  ? "Create Account"
                  : "Reset Password"}
            </h3>
            <p className="text-[11px] opacity-80 mt-0.5 font-medium">
              {viewState === "login"
                ? "Welcome back! Please enter your details."
                : viewState === "register"
                  ? "Join Happy Feet today."
                  : "Enter your email to receive a password reset link."}
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {viewState === "register" && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    className={`w-full bg-slate-50 border ${errors.name ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-slate-400"} rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">⚠ {errors.name}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={mobileRef}
                    type="tel"
                    value={mobile}
                    maxLength={10}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      if (errors.mobile) setErrors((p) => ({ ...p, mobile: undefined }));
                    }}
                    className={`w-full bg-slate-50 border ${errors.mobile ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-slate-400"} rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none`}
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                {errors.mobile && <p className="text-[10px] text-red-500 font-bold mt-1">⚠ {errors.mobile}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={emailRef}
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={`w-full bg-slate-50 border ${errors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-slate-400"} rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none`}
                placeholder="example@email.com"
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">⚠ {errors.email}</p>}
          </div>

          {viewState !== "forgot" && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
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
                  className={`w-full bg-slate-50 border ${errors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-slate-400"} rounded-xl pl-10 pr-10 py-2 text-sm text-slate-900 focus:outline-none`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1">⚠ {errors.password}</p>}
            </div>
          )}

          {viewState === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => switchView("forgot")}
                className="text-[10px] font-bold text-red-700 hover:text-red-900 tracking-wide uppercase transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)] filter hover:brightness-110 active:scale-98 cursor-pointer"
          >
            {loading ? "Please wait..." : viewState === "login" ? "Login" : viewState === "register" ? "Sign Up" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
          {viewState === "login" ? (
            <p>
              Don't have an account?{" "}
              <button type="button" onClick={() => switchView("register")} className="text-red-900 font-bold hover:underline">
                Create Account
              </button>
            </p>
          ) : (
            <p>
              Remembered your password?{" "}
              <button type="button" onClick={() => switchView("login")} className="text-red-900 font-bold hover:underline">
                Back to Login
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};