import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import api, { IMAGE_BASE_URL } from "../services/api";
import toast from "react-hot-toast";

export const Home: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchStorefrontData = async () => {
      try {
        setLoading(true);
        // Query master Dynamic Content endpoints simultaneously
        const [productsRes, categoriesRes, brandsRes, bannersRes, storesRes] =
          await Promise.all([
            api.get("/products?limit=12").catch(() => ({ data: [] })), // Graceful fallback if product engine isn't live yet
            api.get("/masters/categories"),
            api.get("/masters/brands"),
            api.get("/masters/banners"),
            api.get("/masters/stores"),
          ]);

        // FIX: Extracting the .data.data envelope accurately from your master controller payloads
        setFeaturedProducts(
          productsRes.data?.products || productsRes.data || [],
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

  // --- Carousel Navigation Controls ---
  const handlePrevCarousel = () => {
    setCarouselIndex((prev) =>
      prev === 0 ? Math.max(0, featuredProducts.length - 4) : prev - 1,
    );
  };

  const handleNextCarousel = () => {
    setCarouselIndex((prev) =>
      prev >= Math.max(0, featuredProducts.length - 4) ? 0 : prev + 1,
    );
  };

  if (loading)
    return <Loading fullScreen message="Synchronizing Happy Feet Matrix..." />;

  return (
    <div className="space-y-12 bg-slate-50 text-slate-900 transition-all duration-300 min-h-screen pb-16">
      {/* 1. Dynamic Top Banner Carousel */}
      <section className="relative rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden min-h-[360px] flex items-center">
        {banners.length > 0 ? (
          <div className="w-full relative min-h-[360px]">
            <div className="absolute inset-0 w-full h-full">
              <img
                src={`${IMAGE_BASE_URL}${banners[activeBannerIndex].image}`}
                alt={banners[activeBannerIndex].title}
                className="w-full h-full object-cover hidden md:block"
              />
              <img
                src={`${IMAGE_BASE_URL}${banners[activeBannerIndex].mobileImage || banners[activeBannerIndex].image}`}
                alt={banners[activeBannerIndex].title}
                className="w-full h-full object-cover md:hidden"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/40 to-transparent" />
            </div>

            <div className="absolute inset-y-0 left-0 max-w-xl flex flex-col justify-center px-8 md:px-16 z-10 text-white">
              <span className="bg-red-800 text-white text-[10px] tracking-widest font-black uppercase px-2.5 py-1 rounded-md shadow-xs w-max select-none">
                Exclusive Campaign
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter mt-4 leading-tight uppercase drop-shadow-xs">
                {banners[activeBannerIndex].title}
              </h1>
              <p className="text-xs text-slate-200 font-medium mt-3 max-w-sm drop-shadow-xs">
                Explore brand new collections with high-performance premium
                materials and dynamic verification controls.
              </p>
            </div>

            {/* Manual Slider Navigation Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 right-6 flex gap-2 z-25">
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
          <div className="p-8 md:p-12 px-8 md:px-16 max-w-xl z-10">
            <span className="bg-[#7f1d1d] text-white text-[10px] tracking-widest font-black uppercase px-2.5 py-1 rounded-md shadow-xs">
              Live Storefront
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 leading-none text-slate-900">
              FIND YOUR PERFECT PAIR
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-4 max-w-sm">
              Explore custom dynamic footwear lines, active catalogs, and
              dynamic official brand maps.
            </p>
          </div>
        )}
      </section>

      {/* 2. Dynamic Partner Brands Section */}
      {brands.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 select-none">
            <Store size={14} className="text-red-800" /> Official Footwear
            Brands
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {brands.map((b: any) => (
              <div
                key={b._id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-2 text-center hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group h-28"
              >
                {b.logo ? (
                  <img
                    src={`${IMAGE_BASE_URL}${b.logo}`}
                    alt={b.name}
                    className="h-10 max-w-[85%] object-contain filter group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="font-mono text-[10px] font-bold text-slate-300 uppercase">
                    Logo Asset
                  </span>
                )}
                <div className="text-xs font-black text-slate-800 uppercase tracking-wide truncate w-full">
                  {b.name}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Dynamic Category Matrix */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 select-none">
            <Layers size={14} className="text-red-800" /> Shop By Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c: any) => (
              <div
                key={c._id}
                className="relative rounded-2xl border border-slate-200 overflow-hidden bg-white aspect-square flex items-end p-4 group hover:shadow-md hover:border-slate-400 transition-all cursor-pointer"
              >
                {c.image && (
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={`${IMAGE_BASE_URL}${c.image}`}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" />
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

      {/* 4. Products Grid Carousel Slider */}
      {featuredProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                Trending Best Sellers
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevCarousel}
                className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextCarousel}
                className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-3xs"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {featuredProducts
                .slice(carouselIndex, carouselIndex + 4)
                .map((product: any) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between group hover:shadow-lg hover:border-slate-300 transition-all h-[360px]"
                  >
                    <div>
                      <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden mb-4 p-2">
                        {product.images && product.images[0] ? (
                          <img
                            src={`${IMAGE_BASE_URL}${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-102 transition-transform"
                          />
                        ) : (
                          <span className="font-mono text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                            No Image Asset
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-sm text-slate-900 truncate uppercase tracking-tight">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-medium">
                        {product.description ||
                          "Premium high-grade lifestyle catalog shoe."}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                      <span className="font-mono text-sm text-slate-900 font-black">
                        ₹{product.basePrice || product.price}
                      </span>
                      <button
                        style={{
                          backgroundColor: "var(--dynamic-accent-bg)",
                          color: "var(--dynamic-accent-text)",
                        }}
                        className="px-4 py-2 font-black text-[10px] uppercase rounded-xl transition-all shadow-3xs cursor-pointer hover:brightness-110"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* 5. Dynamic Store Outlets Matrix Section */}
      {stores.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 select-none">
            <MapPin size={14} className="text-red-800" /> Locate Our Active
            Branches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store: any) => (
              <div
                key={store._id}
                className="bg-white border border-slate-200 p-6 rounded-3xl shadow-3xs flex flex-col justify-between hover:border-slate-300 hover:shadow-2xs transition-all relative overflow-hidden group"
              >
                {/* Visual Accent Tab */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-100 group-hover:bg-red-800 transition-colors" />

                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-base font-black tracking-tight text-slate-900 uppercase truncate">
                      {store.name}
                    </h4>
                    <span className="bg-slate-100 border border-slate-200 text-slate-500 font-mono font-bold text-[9px] px-2 py-0.5 rounded-md shrink-0">
                      {store.code}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 flex items-start gap-2 pt-1">
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

                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 gap-2 text-[11px] font-medium text-slate-400 font-mono">
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
