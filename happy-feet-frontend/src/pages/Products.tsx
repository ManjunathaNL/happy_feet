import React, { useEffect, useState } from 'react';
import api from '../services/api.ts';
import { GlassCard } from '../components/GlassCard.tsx';
import { Layers, Footprints, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const response = await api.get('/products'); // Pulls from your new controller
        setProducts(response.data);
      } catch (err) {
        toast.error('Unable to fetch live footwear catalog data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-sm font-mono opacity-50">Loading live inventory matrix...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <Layers className="text-indigo-400" /> Catalog Matrix
        </h1>
        <p className="opacity-60 text-sm">Browse our live inventory catalog across all active categories.</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-black/10">
          <Footprints className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No inventory items populated in the database catalog yet.</p>
          <p className="text-xs text-slate-600 mt-1">Initialize entries inside the Admin Console to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <GlassCard key={prod._id} className="bg-black/20 border-white/5 flex flex-col justify-between">
              <div>
                <div className="w-full h-44 bg-slate-950/40 rounded-xl mb-4 flex items-center justify-center text-4xl select-none">
                  👟
                </div>
                <div className="flex items-center justify-between text-xs font-bold font-mono text-indigo-400 uppercase">
                  <span>{prod.brandId?.name || 'Generic Brand'}</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded border border-white/5">{prod.gender}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1.5 truncate">{prod.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prod.description || 'No description available.'}</p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-40 uppercase tracking-widest font-bold">Price</div>
                  <div className="text-xl font-black text-white">₹{prod.sellingPrice}</div>
                </div>
                <button 
                  onClick={() => toast.success(`${prod.name} added to cart! `)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all transform active:scale-95"
                >
                  Add To Cart 
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};