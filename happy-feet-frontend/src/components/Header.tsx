import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/index.ts";
import { logout, openAuthModal } from "../redux/authSlice.ts";
import api from "../services/api.ts";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Heart,
  PhoneCall,
  PackageCheck,
  Store
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  const { isAuthenticated, user, currentTheme } = useSelector(
    (state: RootState) => state.auth,
  );

  // ✅ NEW LIVE SELECTORS: Pull real-time state dimensions for layout badging updates
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);
  const wishlistItems = useSelector((state: RootState) => state.wishlist?.items || []);

  // Compute live cumulative totals instantly
  const totalCartPairsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalWishlistItemsCount = wishlistItems.length;

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const categoriesRes = await api.get("/masters/categories");
        setDynamicCategories(categoriesRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load header navigation layout requirements:", err);
        setDynamicCategories([
          { _id: "cat1", name: "Athletic Sneakers" },
          { _id: "cat2", name: "Formal Loafers" },
          { _id: "cat3", name: "Performance Sandals" },
        ]);
      }
    };
    fetchHeaderData();
  }, [currentTheme]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products-gallery?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)] border-b border-black/10 shadow-md transition-all duration-300 font-sans">
      <div className="w-full px-6 py-4 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
            HAPPY FEET
          </Link>
        </div>

        {/* Global Search bar */}
        <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
          <form onSubmit={handleSearch} className="w-full flex items-center bg-white/15 border border-white/10 rounded-xl overflow-hidden h-10">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for your favorite footwear..."
              className="flex-1 px-4 bg-transparent outline-none text-sm text-white placeholder-white/60"
            />
            <button type="submit" className="px-4 text-white hover:bg-white/10 transition-colors cursor-pointer">
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Action Panel Links */}
        <div className="hidden md:flex items-center gap-6 text-white shrink-0">
          <Link to="/contact" className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider">
            <PhoneCall size={18} />
            <span>Contact Us</span>
          </Link>

          {/* ✅ WISHLIST LINK WITH INTERACTIVE DYNAMIC NUMBER BADGING */}
          <Link to="/wishlist" className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider relative group">
            <div className="relative">
              <Heart size={18} />
              {totalWishlistItemsCount > 0 && (
                <motion.span 
                  initial={{ scale: 0.6 }} 
                  animate={{ scale: 1 }} 
                  className="absolute -top-1.5 -right-2 bg-white text-[#7f1d1d] text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#7f1d1d]/10 shadow-xs"
                >
                  {totalWishlistItemsCount}
                </motion.span>
              )}
            </div>
            <span className="mt-0.5">Wishlist</span>
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setProfileDropdown(!profileDropdown)} className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                <User size={18} />
                <span className="flex items-center gap-0.5 mt-0.5">
                  Account <ChevronDown size={10} />
                </span>
              </button>
              
              {profileDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[200px] overflow-hidden py-1 z-50 text-slate-800">
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="font-bold text-xs">{user?.name}</p>
                    <p className="text-[9px] text-slate-500 font-mono truncate">{user?.email}</p>
                  </div>
                  
                  {user?.role === "Customer" ? (
                    <>
                      <Link to="/profile" onClick={() => setProfileDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold transition-colors">
                        <User size={14} /> My Profile
                      </Link>
                      <Link to="/my-orders" onClick={() => setProfileDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold transition-colors">
                        <PackageCheck size={14} /> My Orders
                      </Link>
                    </>
                  ) : (
                    <Link to="/dashboard" onClick={() => setProfileDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold transition-colors">
                      <Store size={14} /> Admin Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setProfileDropdown(false);
                      navigate("/");
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-slate-50 font-bold flex items-center gap-2 transition-colors border-t border-slate-100 cursor-pointer"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => dispatch(openAuthModal("login"))} className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
              <User size={18} />
              <span>Login / Register</span>
            </button>
          )}

          {/* ✅ CART LINK WITH INTERACTIVE DYNAMIC NUMBER BADGING */}
          <Link to="/cart" className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider relative group">
            <div className="relative">
              <ShoppingCart size={18} />
              {totalCartPairsCount > 0 && (
                <motion.span 
                  initial={{ scale: 0.6 }} 
                  animate={{ scale: 1 }} 
                  className="absolute -top-1.5 -right-2 bg-white text-[#7f1d1d] text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#7f1d1d]/10 shadow-xs"
                >
                  {totalCartPairsCount}
                </motion.span>
              )}
            </div>
            <span className="mt-0.5">Cart</span>
          </Link>
        </div>

        {/* Mobile menu triggers */}
        <button className="md:hidden text-white cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Content Block */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--dynamic-accent-bg)] border-t border-white/10 px-4 py-4 space-y-4 animate-fadeIn">
          <form onSubmit={handleSearch} className="w-full flex items-center bg-white/15 border border-white/10 rounded-xl overflow-hidden h-10">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shoes..."
              className="flex-1 px-4 bg-transparent outline-none text-sm text-white placeholder-white/60"
            />
            <button type="submit" className="px-4 text-white"><Search size={16} /></button>
          </form>
          <div className="flex flex-col gap-3 font-bold text-sm text-white/90">
            {dynamicCategories.map(cat => (
              <Link key={cat._id} to={`/products-gallery?category=${encodeURIComponent(cat._id)}`} onClick={() => setMobileMenuOpen(false)} className="hover:text-white">
                {cat.name}
              </Link>
            ))}
            <div className="flex justify-between border-t border-white/10 pt-3 text-xs uppercase tracking-wider font-black">
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5">
                <Heart size={16} /> Wishlist ({totalWishlistItemsCount})
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5">
                <ShoppingCart size={16} /> Cart ({totalCartPairsCount})
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Categories subheader navigation layout grid */}
      <div className="bg-black/10 border-t border-white/5 hidden md:block">
        <div className="px-6 flex items-center">
          <div className="flex gap-8 py-3 overflow-x-auto scrollbar-none w-full">
            {dynamicCategories.map((cat) => (
              <div
                key={cat._id}
                onMouseEnter={() => setActiveCategoryName(cat.name)}
                onMouseLeave={() => setActiveCategoryName(null)}
                className={`cursor-pointer text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategoryName === cat.name ? "text-white underline decoration-white decoration-2 underline-offset-4" : "text-white/80 hover:text-white"}`}
              >
                <Link to={`/products-gallery?category=${encodeURIComponent(cat._id)}`}>
                  {cat.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};