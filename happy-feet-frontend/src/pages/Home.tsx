import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux";
import { ProductCard } from "../components/ProductCard";
import {
  ChevronLeft,
  ChevronRight,
  Store,
  Layers,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Loading } from "../components/Loading";
import api, { IMAGE_BASE_URL } from "../services/api.ts";
import toast from "react-hot-toast";

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const brandScrollRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);

  const cleanAssetURL = (rawPath: any) => {
    if (!rawPath || typeof rawPath !== "string") return "";
    let clean = rawPath.replace(/\\/g, "/");
    if (clean.includes("uploads/"))
      clean = "uploads/" + clean.split("uploads/")[1];
    const base = IMAGE_BASE_URL.endsWith("/")
      ? IMAGE_BASE_URL
      : IMAGE_BASE_URL + "/";
    return `${base}${clean}`;
  };

  useEffect(() => {
    const fetchStorefrontData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, brandsRes, bannersRes, storesRes] =
          await Promise.all([
            api.get("/products?limit=20").catch(() => api.get("/products")),
            api
              .get("/masters/categories")
              .catch(() => api.get("/masters/categories")),
            api.get("/masters/brands").catch(() => api.get("/masters/brands")),
            api
              .get("/masters/banners")
              .catch(() => api.get("/masters/banners")),
            api.get("/masters/stores").catch(() => api.get("/masters/stores")),
          ]);

        setFeaturedProducts(
          productsRes.data?.data ||
            productsRes.data?.products ||
            productsRes.data ||
            [],
        );
        setCategories(categoriesRes.data?.data || []);
        setBrands(brandsRes.data?.data || []);
        setBanners(bannersRes.data?.data || []);
        setStores(storesRes.data?.data || []);
      } catch (error) {
        console.error("Home page data pipeline processing error:", error);
        toast.error("Failed to safely synchronize active storefront assets.");
      } finally {
        setLoading(false);
      }
    };
    fetchStorefrontData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right",
  ) => {
    if (ref.current) {
      const offset = direction === "left" ? -300 : 300;
      ref.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (loading)
    return <Loading fullScreen message="Synchronizing Happy Feet Matrix..." />;

  return (
    <div className="space-y-12 bg-slate-50 text-slate-900 transition-all duration-300 min-h-screen pb-16 px-4 md:px-8 max-w-7xl mx-auto pt-6 overflow-hidden">
      {/* 1. Auto-Advancing Top Hero Banner Carousel */}
      <section className="relative rounded-3xl bg-slate-950 border border-slate-200 shadow-sm overflow-hidden min-h-[380px] flex items-center">
        {banners.length > 0 ? (
          <div className="w-full relative min-h-[380px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBannerIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={cleanAssetURL(banners[activeBannerIndex].image)}
                  alt="Desktop"
                  className="w-full h-full object-cover hidden md:block"
                />
                <img
                  src={cleanAssetURL(
                    banners[activeBannerIndex].mobileImage ||
                      banners[activeBannerIndex].image,
                  )}
                  alt="Mobile"
                  className="w-full h-full object-cover md:hidden"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-y-0 left-0 max-w-xl flex flex-col justify-center px-8 md:px-16 z-10 text-white">
              <span className="bg-[#7f1d1d] text-white text-[9px] tracking-widest font-black uppercase px-2.5 py-1 rounded-md shadow-xs w-max">
                Exclusive Campaign
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-4 leading-tight uppercase">
                {banners[activeBannerIndex].title}
              </h1>
              <p className="text-xs text-slate-300 font-medium mt-3 max-w-sm leading-relaxed">
                Explore brand new collections with high-performance premium
                shoes engineered for maximum comfort.
              </p>
              <button
                onClick={() => navigate("/products-gallery")}
                className="mt-6 w-max bg-white text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all cursor-pointer"
              >
                Shop Campaign
              </button>
            </div>

            {banners.length > 1 && (
              <div className="absolute bottom-6 right-6 flex gap-2 z-25">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveBannerIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${activeBannerIndex === idx ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 md:p-16 max-w-xl z-10 text-white">
            <span className="bg-[#7f1d1d] text-white text-[10px] tracking-widest font-black uppercase px-2.5 py-1 rounded-md">
              Live Storefront
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 leading-none">
              FIND YOUR PERFECT PAIR
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-4 max-w-sm">
              Explore custom dynamic footwear lines, active catalogs, and
              dynamic official brand maps.
            </p>
          </div>
        )}
      </section>

      {/* 2. Shop By Categories Arrow-Controlled Slider */}
      {categories.length > 0 && (
        <section className="space-y-4 relative">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 select-none">
              <Layers size={14} className="text-[#7f1d1d]" /> Shop By Category
            </h3>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleScroll(categoryScrollRef, "left")}
                className="p-2 border rounded-xl bg-white text-slate-600 shadow-3xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => handleScroll(brandScrollRef, "right")}
                className="p-2 border rounded-xl bg-white text-slate-600 shadow-3xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div
            ref={categoryScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-none pb-2 scroll-smooth"
          >
            {categories.map((c: any) => (
              <div
                key={c._id}
                onClick={() =>
                  navigate(
                    `/products-gallery?category=${encodeURIComponent(c._id)}`,
                  )
                }
                className="relative rounded-2xl border border-slate-200 overflow-hidden bg-white w-44 h-44 shrink-0 flex items-end p-4 group hover:border-slate-400 transition-all cursor-pointer shadow-3xs"
              >
                {c.image && (
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={cleanAssetURL(c.image)}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/10 to-transparent" />
                  </div>
                )}
                <div className="relative z-10 w-full text-center">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider block truncate ${c.image ? "text-white" : "text-slate-800"}`}
                  >
                    {c.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Official Brands Arrow-Controlled Slider */}
      {brands.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 select-none">
              <Store size={14} className="text-[#7f1d1d]" /> Official Footwear
              Brands
            </h3>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleScroll(brandScrollRef, "left")}
                className="p-2 border rounded-xl bg-white text-slate-600 shadow-3xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => handleScroll(brandScrollRef, "right")}
                className="p-2 border rounded-xl bg-white text-slate-600 shadow-3xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div
            ref={brandScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-none pb-2 scroll-smooth"
          >
            {brands.map((b: any) => (
              <div
                key={b._id}
                onClick={() =>
                  navigate(
                    `/products-gallery?brand=${encodeURIComponent(b._id)}`,
                  )
                }
                className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-2 text-center hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group w-36 h-28 shrink-0 shadow-3xs"
              >
                {b.logo ? (
                  <img
                    src={cleanAssetURL(b.logo)}
                    alt={b.name}
                    className="h-9 max-w-[90%] object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="font-mono text-[10px] font-bold text-slate-300 uppercase">
                    Logo
                  </span>
                )}
                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wide truncate w-full">
                  {b.name}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Trending Best Sellers Live Slider Track */}
      {featuredProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
              Trending Best Sellers
            </h2>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleScroll(productScrollRef, "left")}
                className="p-2 border rounded-xl bg-white text-slate-600 shadow-3xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => handleScroll(productScrollRef, "right")}
                className="p-2 border rounded-xl bg-white text-slate-600 shadow-3xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div
            ref={productScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-none pb-4 scroll-smooth"
          >
            {featuredProducts.map((product: any) => (
              <div
                key={product._id}
                className="w-64 shrink-0 shadow-3xs rounded-3xl"
              >
                {/* ✅ FIXED: Passed clean single object parameter match */}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Physical Store Outlets */}
      {stores.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 select-none">
            <MapPin size={14} className="text-[#7f1d1d]" /> Locate Our Active
            Branches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store: any) => (
              <div
                key={store._id}
                className="bg-white border border-slate-200 p-5 rounded-3xl shadow-3xs flex flex-col justify-between hover:border-slate-300 transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-slate-100 group-hover:bg-[#7f1d1d] transition-colors" />
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase truncate">
                      {store.name}
                    </h4>
                    <span className="bg-slate-100 border text-slate-500 font-mono font-bold text-[9px] px-2 py-0.5 rounded-md">
                      {store.code}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 flex items-start gap-2 pt-1 leading-tight">
                    <MapPin
                      size={13}
                      className="text-slate-400 shrink-0 mt-0.5"
                    />
                    <span>
                      {store.address
                        ? `${store.address}, ${store.area}, ${store.city} - ${store.pincode}`
                        : `${store.city}`}
                    </span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t grid grid-cols-1 gap-1 text-[10px] font-medium text-slate-400 font-mono">
                  {store.mobile && (
                    <span className="flex items-center gap-2">
                      <Phone size={11} className="text-slate-300" />{" "}
                      {store.mobile}
                    </span>
                  )}
                  {store.email && (
                    <span className="flex items-center gap-2 truncate">
                      <Mail size={11} className="text-slate-300" />{" "}
                      {store.email}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
