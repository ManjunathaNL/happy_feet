import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store.ts";
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
  Store,
  Heart,
  PhoneCall,
  PackageCheck
} from "lucide-react";
import toast from "react-hot-toast";

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreBranch, setSelectedStoreBranch] = useState("Global Distribution Warehouse");
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const [physicalStores, setPhysicalStores] = useState<any[]>([]);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  const { isAuthenticated, user, currentTheme } = useSelector(
    (state: RootState) => state.auth,
  );

  const targetedDemographics = ["Men", "Women", "Kids", "Boys", "Girls"];

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        // Fetch Categories and Stores simultaneously from unified dynamic endpoints
        const [categoriesRes, storesRes] = await Promise.all([
          api.get("/masters/categories"),
          api.get("/masters/stores")
        ]);
        
        setDynamicCategories(categoriesRes.data?.data || []);
        
        const storesData = storesRes.data?.data || [];
        setPhysicalStores(storesData);
        
        // Initialize default selected branch if valid data returns from backend
        if (storesData.length > 0) {
          setSelectedStoreBranch(storesData[0].name);
        }
      } catch (err) {
        console.error("Failed to load header navigation layout requirements:", err);
        // Fallbacks matching structural expectations safely
        setDynamicCategories([
          { _id: "cat1", name: "Athletic Sneakers" },
          { _id: "cat2", name: "Formal Loafers" },
          { _id: "cat3", name: "Performance Sandals" },
        ]);
        setPhysicalStores([
          { _id: "st1", name: "Global Distribution Warehouse" },
          { _id: "st2", name: "Happy Feet Hub - Bengaluru" }
        ]);
      }
    };
    fetchHeaderData();
  }, [currentTheme]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/products-gallery?search=${encodeURIComponent(searchQuery)}&branchStore=${encodeURIComponent(selectedStoreBranch)}`,
      );
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)] border-b border-black/10 shadow-md transition-all duration-300 font-sans">
      <div className="w-full px-4 py-4 flex items-center justify-between gap-4">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
            HAPPY FEET
          </Link>
        </div>

        {/* Center: Search Field Area */}
        <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
          <form onSubmit={handleSearch} className="w-full flex items-center bg-white/15 border border-white/10 rounded-xl overflow-hidden h-10">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for shoes..."
              className="flex-1 px-4 bg-transparent outline-none text-sm text-white placeholder-white/60"
            />
            <button type="submit" className="px-4 text-white hover:bg-white/10 transition-colors">
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Dynamic Store Branch Location Selector Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/10 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-black/20 transition-all h-10"
          >
            <Store size={14} />
            <span className="max-w-[130px] truncate">{selectedStoreBranch}</span>
            <ChevronDown size={12} />
          </button>

          {storeDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[240px] overflow-hidden py-1 z-50 text-slate-800 animate-fadeIn">
              {physicalStores.map((store) => (
                <button
                  key={store._id}
                  onClick={() => {
                    setSelectedStoreBranch(store.name);
                    setStoreDropdownOpen(false);
                    toast.success(`Switched branch store context to: ${store.name}`);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold block transition-colors ${selectedStoreBranch === store.name ? "bg-slate-100 text-red-800" : "hover:bg-slate-50"}`}
                >
                  {store.name} <span className="block text-[9px] font-mono font-normal text-slate-400 mt-0.5">{store.city || "Active Store Branch"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Actions Panel Link Set */}
        <div className="hidden md:flex items-center gap-6 text-white shrink-0">
          <Link to="/contact" className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider">
            <PhoneCall size={18} />
            <span>Contact Us</span>
          </Link>

          <Link to="/products-gallery?filter=wishlist" className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider">
            <Heart size={18} />
            <span>Wishlist</span>
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setProfileDropdown(!profileDropdown)} className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider">
                <User size={18} />
                <span className="flex items-center gap-0.5">
                  Account <ChevronDown size={10} />
                </span>
              </button>
              
              {profileDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[200px] overflow-hidden py-1 z-50 text-slate-800">
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="font-bold text-xs">{user?.name}</p>
                    <p className="text-[9px] text-slate-500 font-mono truncate">{user?.email}</p>
                  </div>
                  
                  {user?.role === "Customer" && (
                    <>
                      <Link to="/profile" onClick={() => setProfileDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold transition-colors">
                        <User size={14} /> My Profile
                      </Link>
                      <Link to="/my-orders" onClick={() => setProfileDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-bold transition-colors">
                        <PackageCheck size={14} /> My Orders
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setProfileDropdown(false);
                      navigate("/");
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-slate-50 font-bold flex items-center gap-2 transition-colors border-t border-slate-100"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => dispatch(openAuthModal("login"))} className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider">
              <User size={18} />
              <span>Login/Register</span>
            </button>
          )}

          <Link to="/cart" className="flex flex-col items-center gap-0.5 opacity-90 hover:opacity-100 text-[10px] font-bold uppercase tracking-wider">
            <ShoppingCart size={18} />
            <span>Cart</span>
          </Link>
        </div>

        {/* Small Screen Mobile Grid Navigation Trigger Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Subheader Matrix Navigation Bar Links */}
      <div className="bg-black/10 border-t border-white/5 hidden lg:block">
        <div className="px-4 flex items-center">
          <div className="flex gap-6 py-2.5">
            {targetedDemographics.map((segment) => (
              <Link key={segment} to={`/products-gallery?gender=${segment}`} className="text-xs font-black uppercase tracking-widest text-white/90 hover:text-white transition-colors">
                {segment}
              </Link>
            ))}
          </div>

          <div className="flex gap-8 flex-1 pl-8 py-2.5 overflow-x-auto scrollbar-none">
            {dynamicCategories.map((cat) => (
              <div
                key={cat._id}
                onMouseEnter={() => setActiveCategoryName(cat.name)}
                className={`cursor-pointer text-[11px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeCategoryName === cat.name ? "text-white underline decoration-white decoration-2 underline-offset-4" : "text-white/70 hover:text-white"}`}
              >
                <Link to={`/products-gallery?category=${encodeURIComponent(cat.name)}`}>
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