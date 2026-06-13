import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Check,
  Star,
  Layers,
  ShieldCheck,
  RefreshCw,
  Heart,
  Share2,
  Copy,
  Package,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, calculateTotals } from "../redux/cartSlice";
import { toggleWishlist } from "../redux/wishlistSlice";
import type { RootState } from "../redux";
import api, { catalogAPI, IMAGE_BASE_URL } from "../services/api";
import { ProductCard } from "../components/ProductCard";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  
  const wishlist = useSelector((state: RootState) => state.wishlist?.items || []);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated || false);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  // Interactive View States
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);

  const isInWishlist = wishlist.some((item: any) => (item._id || item.id) === product?._id);

  const cleanAssetURL = (rawPath: string) => {
    if (!rawPath) return "https://placehold.co/600x600?text=No+Image+Asset";
    if (rawPath.startsWith("http")) return rawPath;
    let clean = rawPath.replace(/\\/g, "/");
    if (clean.includes("uploads/")) {
      clean = "uploads/" + clean.split("uploads/")[1];
    }
    const base = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL : IMAGE_BASE_URL + "/";
    return `${base}${clean}`;
  };

  useEffect(() => {
    const bootstrapProfileDataTree = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await catalogAPI.getProductById(id);
        if (res.data?.success || res.data?.data) {
          const payload = res.data.data;
          setProduct(payload.product);
          
          const variantData = payload.variants || [];
          setVariants(variantData);
          
          // ✅ FIXED: Added safety fallback operators to prevent undefined property crashes during setup
          if (variantData.length > 0 && variantData[0]) {
            setSelectedColor(variantData[0].colorId?.name || "");
            setSelectedSize(variantData[0].sizeId?.name || "");
          } else {
            setSelectedColor("");
            setSelectedSize("");
          }

          setSelectedImage(0);
          setQuantity(1);

          const relatedRes = await catalogAPI.getProducts();
          const list = relatedRes.data?.data || relatedRes.data?.products || [];
          
          const targetedParentId = payload.product?.categoryId?._id || payload.product?.categoryId;
          
          const filteredSimilar = list.filter((p: any) => {
            const currentProductCatId = p.categoryId?._id || p.categoryId;
            return p._id !== payload.product?._id && currentProductCatId === targetedParentId;
          });
          
          setRelatedItems(filteredSimilar.slice(0, 4));
        }
      } catch (err) {
        console.error("Failure processing details parameters:", err);
      } finally {
        setLoading(false);
      }
    };
    bootstrapProfileDataTree();
  }, [id]);

  // Extract unique variation combinations dynamically
  const uniqueColors = useMemo(() => {
    return Array.from(new Set(variants.map(v => v?.colorId?.name).filter(Boolean)));
  }, [variants]);

  const sizesAvailableForChosenColor = useMemo(() => {
    if (!selectedColor) return [];
    return variants.filter(v => v?.colorId?.name === selectedColor);
  }, [variants, selectedColor]);

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Product share link copied to clipboard!");
    setShareDropdownOpen(false);
  };

  // ✅ ACTIVE CONTEXT RESOLVER MATRIX
  const matchedActiveVariant = useMemo(() => {
    if (variants.length === 0) return null;
    const match = variants.find(v => v?.colorId?.name === selectedColor && v?.sizeId?.name === selectedSize);
    if (!match && sizesAvailableForChosenColor.length > 0) {
      return sizesAvailableForChosenColor[0];
    }
    return match;
  }, [variants, selectedColor, selectedSize, sizesAvailableForChosenColor]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center font-sans gap-3">
        <RefreshCw className="animate-spin text-[#7f1d1d]" size={28} />
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Loading Specs Context Matrix...</span>
      </div>
    );
  }

  if (!product) return <div className="text-center py-32 font-mono text-xs text-rose-600">Product index data unavailable.</div>;

  const displayMrp = matchedActiveVariant ? matchedActiveVariant.mrp : product.mrp;
  const displaySellingPrice = matchedActiveVariant ? matchedActiveVariant.sellingPrice : product.sellingPrice;
  const currentAvailableStock = matchedActiveVariant ? matchedActiveVariant.stockQuantity : 10;
  const isOutOfStock = currentAvailableStock <= 0 || product.status !== "active";

  const handleToggleWishlist = async () => {
    dispatch(toggleWishlist({ _id: product._id, name: product.name, mrp: displayMrp, sellingPrice: displaySellingPrice, images: product.images || [] }));
    if (isAuthenticated) {
      try { await api.post("/api/wishlist/toggle", { productId: product._id }); } catch (err) { console.error(err); }
    }
  };

  const handleBasketCommit = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    try {
      const uniqueCartId = matchedActiveVariant ? `${product._id}-${matchedActiveVariant._id}` : product._id;
      dispatch(addToCart({
        id: uniqueCartId,
        productId: product._id,
        variantId: matchedActiveVariant ? matchedActiveVariant._id : null,
        name: `${product.name} ${matchedActiveVariant ? `[${matchedActiveVariant.colorId?.name} / Size ${matchedActiveVariant.sizeId?.name}]` : ""}`,
        price: displayMrp,
        discountedPrice: displaySellingPrice,
        quantity,
        image: product.images && product.images.length > 0 ? cleanAssetURL(product.images[0]) : "",
        gstPercentage: product.gstPercentage || 18,
      }));
      dispatch(calculateTotals());
      toast.success("Item packed into shopping basket profile!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 pt-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-5 rounded-3xl border border-slate-200/60 shadow-3xs mb-8">
        
        {/* Left Side View Image Area Wrapper */}
        <div className="space-y-4">
          <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center p-6 overflow-hidden relative shadow-3xs">
            {displayMrp > displaySellingPrice && (
              <div className="absolute top-4 left-4 bg-[#7f1d1d] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-xl shadow-xs z-10 tracking-wider">
                -{Math.round(((displayMrp - displaySellingPrice) / displayMrp) * 100)}% OFF
              </div>
            )}
            {product.images && product.images.length > 0 ? (
              <motion.img key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={cleanAssetURL(product.images[selectedImage])} alt="Footwear Master Profile" className="w-full h-full object-contain mix-blend-multiply" />
            ) : (
              <span className="text-slate-300 font-mono text-xs">No media file reference linked</span>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none">
              {product.images.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSelectedImage(idx)} className={`w-14 h-14 shrink-0 rounded-2xl bg-slate-50 border-2 p-1 flex items-center justify-center overflow-hidden cursor-pointer transition-all ${selectedImage === idx ? "border-[#7f1d1d] bg-white scale-102" : "border-slate-200"}`}>
                  <img src={cleanAssetURL(img)} alt="thumbnail" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Attributes Panel */}
        <div className="flex flex-col justify-between py-1">
          <div className="space-y-5">
            <div className="space-y-1 relative">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">{product.brandId?.name || "HAPPY FEET"}</span>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">{product.name}</h1>
                </div>

                {/* Wishlist + Real-time WhatsApp / Web Social Sharing Core Blocks */}
                <div className="flex gap-1.5 shrink-0 relative">
                  <button onClick={handleToggleWishlist} className="p-2 bg-slate-50 rounded-xl border hover:bg-slate-100 text-slate-400 hover:text-[#7f1d1d] transition-all cursor-pointer">
                    <Heart size={15} className={isInWishlist ? "fill-[#7f1d1d] text-[#7f1d1d]" : ""} />
                  </button>
                  
                  <div className="relative">
                    <button onClick={() => setShareDropdownOpen(!shareDropdownOpen)} className="p-2 bg-slate-50 rounded-xl border hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer">
                      <Share2 size={15} />
                    </button>
                    {shareDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 bg-white border rounded-xl shadow-xl p-1.5 z-50 min-w-[180px] space-y-0.5 animate-fadeIn font-sans">
                        <button onClick={copyLinkToClipboard} className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"><Copy size={12} /> Copy link</button>
                        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this premium shoe: ${product.name} - ${window.location.href}`)}`} target="_blank" rel="noreferrer" className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check size={12} /> WhatsApp Share</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-2 leading-tight">{product.shortDescription}</p>
            </div>

            {/* General Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 bg-slate-50 border p-2.5 rounded-2xl px-3">
              <div className="flex items-center text-amber-500 font-black bg-white px-1.5 py-0.5 rounded-md border border-slate-100 shadow-3xs"><Star size={11} className="fill-amber-500 mr-0.5" /> 4.5</div>
              <span>•</span>
              <span>Category: <span className="text-slate-700 uppercase font-black">{product.categoryId?.name || "General"}</span></span>
              <span>•</span>
              <span>SKU: <span className="font-mono text-slate-500">{matchedActiveVariant ? matchedActiveVariant.sku : product.sku}</span></span>
            </div>

            {/* ✅ SEPARATED COLOR SELECTOR LAYER */}
            {uniqueColors.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">1. Select Color Tone Variant:</span>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((colorName: any) => (
                    <button
                      key={colorName}
                      onClick={() => { setSelectedColor(colorName); const fall = variants.find(v => v?.colorId?.name === colorName); if(fall) setSelectedSize(fall.sizeId?.name); }}
                      className={`px-3 py-1.5 border rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${selectedColor === colorName ? "border-[#7f1d1d] bg-white ring-2 ring-[#7f1d1d]/10 text-[#7f1d1d]" : "bg-slate-50 border-slate-200 hover:bg-white text-slate-600"}`}
                    >
                      {colorName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ SEPARATED SIZES FROM ACTIVE COLOR PAIRINGS */}
            {selectedColor && sizesAvailableForChosenColor.length > 0 && (
              <div className="space-y-1.5 border-t pt-3 border-dashed">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">2. Select Sizing Unit Metric:</span>
                <div className="flex flex-wrap gap-2">
                  {sizesAvailableForChosenColor.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => setSelectedSize(v?.sizeId?.name)}
                      className={`px-3.5 py-1.5 border rounded-xl text-xs font-mono font-black transition-all cursor-pointer ${selectedSize === v?.sizeId?.name ? "bg-[#7f1d1d] border-[#7f1d1d] text-white shadow-xs" : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"}`}
                    >
                      Size {v?.sizeId?.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Frame Container */}
            <div className="bg-[#7f1d1d]/5 p-4 rounded-2xl border border-[#7f1d1d]/10 flex justify-between items-center">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#7f1d1d] font-mono">₹{displaySellingPrice}</span>
                  {displayMrp > displaySellingPrice && <span className="text-xs text-slate-400 line-through font-mono">₹{displayMrp}</span>}
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Includes {product.gstPercentage || 18}% static GST calculations</p>
              </div>

              <div className="text-right">
                {isOutOfStock ? (
                  <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black uppercase px-3 py-1 rounded-xl block tracking-wide">OUT OF STOCK</span>
                ) : (
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-3 py-1 rounded-xl block flex items-center gap-1"><Check size={12} /> IN STOCK ({currentAvailableStock})</span>
                )}
              </div>
            </div>

            {/* Quantity select triggers */}
            {!isOutOfStock && (
              <div className="flex items-center gap-3 text-xs font-black">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">Select Quantity:</span>
                <div className="flex items-center border bg-slate-50 rounded-xl h-8 overflow-hidden">
                  <button onClick={() => setQuantity(p => Math.max(1, p - 1))} className="px-2.5 h-full hover:bg-slate-100 font-mono font-bold transition-colors cursor-pointer">-</button>
                  <span className="px-3 font-mono font-black text-slate-800 text-xs">{quantity}</span>
                  <button onClick={() => setQuantity(p => Math.min(currentAvailableStock, p + 1))} className="px-2.5 h-full hover:bg-slate-100 font-mono font-bold transition-colors cursor-pointer">+</button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={handleBasketCommit}
              disabled={isOutOfStock || isAdding}
              className="w-full h-10 bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white disabled:opacity-40 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isAdding ? <RefreshCw size={13} className="animate-spin" /> : <ShoppingCart size={13} />} 
              {isOutOfStock ? "Out of Stock" : "Add to Cart Profile"}
            </button>
          </div>

        </div>
      </div>

      {/* Narrative breakdowns spec cards sheets set */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-3xs md:col-span-2 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2 flex items-center gap-1.5"><Layers size={13} /> Product Narrative</h3>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed whitespace-pre-wrap">{product.longDescription}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-3xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-2 flex items-center gap-1.5"><ShieldCheck size={13} /> Specifications Blueprint</h3>
          <div className="text-[11px] font-black uppercase tracking-wider space-y-2.5 text-slate-600 font-mono">
            <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400 font-sans">Closure System</span><span>{product.closureType || "Lace Up"}</span></div>
            <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400 font-sans">Toe Shape Frame</span><span>{product.toeShape || "Round"}</span></div>
            <div className="flex justify-between border-b pb-1.5"><span className="text-slate-400 font-sans">Fit Profiles</span><span>{product.fitType || "Regular"}</span></div>
            <div className="flex justify-between"><span className="text-slate-400 font-sans">Season</span><span>{product.season || "Summer"}</span></div>
          </div>
        </div>
      </div>

      {/* ✅ SIMILAR RELATED PRODUCTS TRACK LAYER GRID */}
      {relatedItems.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-900 select-none">
            <Package size={15} className="text-[#7f1d1d]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">You May Also Like (Similar Category Profiles)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedItems.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}