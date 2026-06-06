import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Store, Layers } from 'lucide-react';
import { Loading } from '../components/Loading';
import api from '../services/api';
import toast from 'react-hot-toast';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/categories?limit=12'),
          api.get('/brands?limit=10')
        ]);

        setFeaturedProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
        setBrands(brandsRes.data || []);
      } catch (error) {
        console.error('Home page data error:', error);
        console.error("Failed to load products and categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) return <Loading fullScreen message="Loading our store..." />;

  return (
    <div className="space-y-12 bg-slate-50 text-slate-900 transition-all duration-300 min-h-screen">
      
      {/* 1. Hero Banner */}
      <section className="p-8 md:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[300px]">
        <div className="max-w-xl z-10">
          <span 
            style={{ backgroundColor: 'var(--dynamic-accent-bg)', color: 'var(--dynamic-accent-text)' }}
            className="text-[10px] tracking-widest font-black uppercase px-2.5 py-1 rounded-md shadow-sm"
          >
            New 2026 Collection
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 leading-none text-slate-900">
            FIND YOUR PERFECT PAIR
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-4 max-w-sm">
            Explore high-performance sports shoes and casual footwear with instant GST invoicing.
          </p>
        </div>
      </section>

      {/* 2. Brands Section */}
      {brands.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Store size={14} /> Official Shoe Brands
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {brands.map((b: any) => (
              <div key={b._id} className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-center hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
                {b.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Categories Section */}
      {categories.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Layers size={14} /> Shop By Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((c: any) => (
              <div key={c._id} className="p-3 text-xs rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-center uppercase tracking-wider hover:border-slate-400 transition-colors cursor-pointer">
                {c.name}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Products Grid Carousel */}
      {featuredProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Trending Best Sellers</h2>
            <div className="flex gap-2">
              <button onClick={() => setCarouselIndex(p => Math.max(0, p - 1))} className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"><ChevronLeft size={16} /></button>
              <button onClick={() => setCarouselIndex(p => (p + 4 >= featuredProducts.length ? 0 : p + 1))} className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.slice(carouselIndex, carouselIndex + 4).map((product: any) => (
              <div key={product._id} className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between group hover:shadow-lg transition-all">
                <div>
                  <div className="w-full aspect-square bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs tracking-widest uppercase mb-4">
                    Footwear Image
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 truncate">{product.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description || 'Premium comfort shoes.'}</p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                  <span className="font-mono text-xs text-slate-900 font-bold">₹{product.basePrice}</span>
                  <button 
                    style={{ backgroundColor: 'var(--dynamic-accent-bg)', color: 'var(--dynamic-accent-text)' }}
                    className="px-3 py-1 font-black text-[10px] uppercase rounded-lg shadow-sm transition-all filter hover:brightness-110"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};