import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingCart, RefreshCw } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux";
import { setWishlistItems, toggleWishlist } from "../redux/wishlistSlice";
import { addToCart, calculateTotals } from "../redux/cartSlice";
import api, { IMAGE_BASE_URL } from "../services/api";
import toast from "react-hot-toast";

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const favoriteItems = useSelector((state: RootState) => state.wishlist?.items || []);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated || false);
  
  // ✅ FIX: Added synchronization guard to prevent flashing empty UI on page reload
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setIsSyncing(true);
      api.get("/wishlist")
        .then(res => { 
          if (res.data?.success || Array.isArray(res.data?.data)) {
            dispatch(setWishlistItems(res.data.data || [])); 
          } 
        })
        .catch(err => console.error("Wishlist synchronization failure:", err))
        .finally(() => setIsSyncing(false));
    } else {
      setIsSyncing(false);
    }
  }, [isAuthenticated, dispatch]);

  const removeFavoriteNode = async (product: any) => {
    dispatch(toggleWishlist(product));
    toast.success("Removed from wishlist");
    
    if (isAuthenticated) {
      try { 
        await api.post("/wishlist/toggle", { productId: product._id }); 
      } catch (e) { 
        console.error("Backend state sync failed:", e); 
      }
    }
  };

  const moveFavoriteNodeIntoCart = (product: any) => {
    const base = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL : IMAGE_BASE_URL + "/";
    const absoluteImage = product.images && product.images.length > 0 
      ? `${base}${product.images[0].replace(/\\/g, "/")}` 
      : "https://placehold.co/400x400?text=No+Image+Asset";

    dispatch(addToCart({
      id: product._id,
      productId: product._id,
      variantId: null,
      name: product.name,
      price: product.mrp || 0,
      discountedPrice: product.sellingPrice || product.mrp || 0,
      quantity: 1,
      image: absoluteImage,
      gstPercentage: product.gstPercentage || 18
    }));
    
    dispatch(calculateTotals());
    removeFavoriteNode(product);
    toast.success("Item packed into basket smoothly!");
  };

  // ✅ Keep screen stable until network payload is evaluated into state tree
  if (isSyncing) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center font-sans gap-2">
        <RefreshCw className="animate-spin text-[#7f1d1d]" size={24} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Favorites Portfolio...</span>
      </div>
    );
  }

  if (favoriteItems.length === 0) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-4 text-center font-sans bg-slate-50">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
          <Heart size={22} />
        </div>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Your Wishlist is Empty</h2>
        <button onClick={() => navigate("/products-gallery")} className="mt-4 h-9 px-5 bg-[#7f1d1d] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#6b1a1a] cursor-pointer">Browse Models</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-lg font-black uppercase tracking-tight border-b pb-3 mb-6 flex items-center gap-2">
          <Heart size={18} className="text-[#7f1d1d] fill-[#7f1d1d]" /> Saved Favorites Registry
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {favoriteItems.map((item) => {
              const base = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL : IMAGE_BASE_URL + "/";
              const parsedImg = item.images && item.images.length > 0 
                ? `${base}${item.images[0].replace(/\\/g, "/")}` 
                : "https://placehold.co/400x400?text=No+Image+Asset";

              return (
                <motion.div 
                  key={item._id} 
                  layout 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  className="bg-white rounded-2xl border border-slate-200/60 p-3 shadow-3xs flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden border flex items-center justify-center p-2 relative border-slate-100">
                      <img src={parsedImg} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-103 transition-transform duration-300" />
                      <button onClick={() => removeFavoriteNode(item)} className="absolute top-2 right-2 p-2 bg-white rounded-xl text-slate-400 hover:text-rose-600 shadow-3xs border border-slate-100 transition-colors cursor-pointer z-10"><Trash2 size={13} /></button>
                    </div>
                    <h3 className="font-black text-xs sm:text-sm text-slate-800 uppercase tracking-tight mt-3 line-clamp-1 group-hover:text-[#7f1d1d] transition-colors">{item.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.shortDescription || "Premium dynamic footwear release."}</p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="font-mono font-black text-sm text-[#7f1d1d]">
                      ₹{item.sellingPrice || item.mrp}
                    </div>
                    <button onClick={() => moveFavoriteNodeIntoCart(item)} className="h-8 px-3 bg-slate-50 hover:bg-[#7f1d1d] text-slate-700 hover:text-white border border-slate-200 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"><ShoppingCart size={11} /> Move to Cart</button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}