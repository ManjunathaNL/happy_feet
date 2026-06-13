import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Eye } from "lucide-react";
import { IMAGE_BASE_URL } from "../services/api";

interface ProductCardProps {
  product: any;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageHovered, setImageHovered] = useState(false);

  const productId = product._id || product.id;

  const cleanAssetURL = (rawPath: string) => {
    if (!rawPath) return "https://placehold.co/400x400?text=No+Image+Asset";
    if (rawPath.startsWith("http")) return rawPath;
    let clean = rawPath.replace(/\\/g, "/");
    if (clean.includes("uploads/")) {
      clean = "uploads/" + clean.split("uploads/")[1];
    }
    const base = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL : IMAGE_BASE_URL + "/";
    return `${base}${clean}`;
  };

  const mainImage = product.images && product.images.length > 0 ? cleanAssetURL(product.images[0]) : "https://placehold.co/400x400?text=No+Image+Asset";
  const hoverImage = product.images && product.images.length > 1 ? cleanAssetURL(product.images[1]) : mainImage;

  const price = product.mrp || 0;
  const discountedPrice = product.sellingPrice || price;
  const inStock = product.status === "active";

  return (
    <Link to={`/product/${productId}`} className="block h-full">
      <motion.div
        whileHover={{ y: -6 }}
        className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-xs hover:shadow-md transition-all h-full flex flex-col p-3 group"
      >
        {/* Fixed Aspect-Square Image canvas container wrapper */}
        <div
          className="relative w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center p-4 border border-slate-100"
          onMouseEnter={() => setImageHovered(true)}
          onMouseLeave={() => setImageHovered(false)}
        >
          <motion.img
            src={imageHovered ? hoverImage : mainImage}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply"
            animate={{ scale: imageHovered ? 1.04 : 1 }}
            transition={{ duration: 0.3 }}
          />

          {price > discountedPrice && (
            <div className="absolute top-3 right-3 bg-[#7f1d1d] text-white px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-wider uppercase shadow-sm">
              SAVE ₹{price - discountedPrice}
            </div>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="text-white text-[10px] font-black uppercase tracking-widest bg-slate-900/90 px-4 py-1.5 rounded-xl">
                Out Of Stock
              </span>
            </div>
          )}

          {/* Clean Hover Overlay */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-800 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Eye size={16} />
            </div>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="flex-1 pt-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate max-w-[70%]">
                {product.brandId?.name || "HAPPY FEET"}
              </p>
              <div className="flex items-center text-amber-500 text-[10px] font-black bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100/50 shrink-0">
                <Star size={10} className="fill-amber-500 mr-0.5" />
                4.5
              </div>
            </div>

            <h3 className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-[#7f1d1d] transition-colors tracking-tight uppercase">
              {product.name}
            </h3>
            <p className="text-[11px] text-slate-400 line-clamp-1 font-medium leading-tight">
              {product.shortDescription}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 mt-2.5 flex items-baseline justify-between font-mono">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-slate-900">
                ₹{discountedPrice}
              </span>
              {price > discountedPrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{price}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              {product.gstPercentage || 18}% GST
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};