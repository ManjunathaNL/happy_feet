import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal, Package, Tag } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { catalogAPI, masterAPI } from "../services/api";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced Matrix Filters States
  const [priceRange, setPriceRange] = useState([0, 25000]);
  const [sortBy, setSortBy] = useState("popular");
  
  // Local state selections arrays
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  const [expandFilters, setExpandFilters] = useState({ category: true, price: true, brand: true });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Extract landing parameters from your Home Header actions
  const urlCategoryParam = searchParams.get("category") || "";
  const urlBrandParam = searchParams.get("brand") || "";
  const urlSearchQuery = searchParams.get("search") || "";

  // ✅ 1. SYNC URL ROUTE PARAMETERS TO FILTER BUFFERS INSTANTLY
  useEffect(() => {
    if (urlCategoryParam) {
      setSelectedCategories([urlCategoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [urlCategoryParam]);

  useEffect(() => {
    if (urlBrandParam) {
      setSelectedBrands([urlBrandParam]);
    } else {
      setSelectedBrands([]);
    }
  }, [urlBrandParam]);

  useEffect(() => {
    const synchronizeGalleryDataLayers = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          catalogAPI.getProducts(),
          masterAPI.category.getAll(),
          masterAPI.brand.getAll(),
        ]);

        setProducts(prodRes.data?.data || prodRes.data || []);
        setCategories(catRes.data?.data || []);
        setBrands(brandRes.data?.data || []);
      } catch (err) {
        console.error("Failed loading search gallery parameters sync mappings:", err);
      } finally {
        setLoading(false);
      }
    };
    synchronizeGalleryDataLayers();
  }, []);

  // ✅ 2. ADVANCED MULTI-DIMENSIONAL SEARCH & FILTER PIPELINE ENGINE
  const processedProductsMatrix = useMemo(() => {
    let dataset = [...products];

    // Real-time Text Query Context Search Filter
    if (urlSearchQuery) {
      const horizontalQuery = urlSearchQuery.toLowerCase().trim();
      dataset = dataset.filter(
        (p) =>
          p.name?.toLowerCase().includes(horizontalQuery) ||
          p.sku?.toLowerCase().includes(horizontalQuery) ||
          p.shortDescription?.toLowerCase().includes(horizontalQuery) ||
          p.brandId?.name?.toLowerCase().includes(horizontalQuery)
      );
    }

    // Category Identification Filter (Matches Object IDs or Populated Objects)
    if (selectedCategories.length > 0) {
      dataset = dataset.filter((p) => {
        const productCatId = p.categoryId?._id || p.categoryId;
        return selectedCategories.includes(String(productCatId));
      });
    }

    // Brand Identification Filter (Matches Object IDs or Populated Objects)
    if (selectedBrands.length > 0) {
      dataset = dataset.filter((p) => {
        const productBrandId = p.brandId?._id || p.brandId;
        return selectedBrands.includes(String(productBrandId));
      });
    }

    // Financial Constraints Boundaries Slider Range Filter
    dataset = dataset.filter((p) => {
      const actualCost = p.sellingPrice || p.price || 0;
      return actualCost >= priceRange[0] && actualCost <= priceRange[1];
    });

    // Sort Configuration Matrices
    if (sortBy === "price-low") dataset.sort((a, b) => (a.sellingPrice || 0) - (b.sellingPrice || 0));
    if (sortBy === "price-high") dataset.sort((a, b) => (b.sellingPrice || 0) - (a.sellingPrice || 0));
    if (sortBy === "newest") dataset.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return dataset;
  }, [products, urlSearchQuery, selectedCategories, selectedBrands, priceRange, sortBy]);

  const totalPagesCount = Math.ceil(processedProductsMatrix.length / itemsPerPage);
  const paginatedItemsGrid = processedProductsMatrix.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Dynamic header calculations safely computed
  const selectedCategoryName = useMemo(() => {
    if (selectedCategories.length === 1) {
      return categories.find(c => c._id === selectedCategories[0])?.name || "";
    }
    return "";
  }, [categories, selectedCategories]);

  // Handler to clear filters and safely reset the URL params context bounds
  const handleClearFilters = () => {
    setSearchParams({});
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 25000]);
    setSortBy("popular");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
        <span>Home /</span>
        <span className="text-[#7f1d1d]">Products Access Engine Gallery</span>
        {selectedCategoryName && <><span>/</span> <span className="text-slate-600">{selectedCategoryName}</span></>}
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Drawer Layer Filters Component */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-3xs sticky top-24 space-y-6">
              <div className="flex items-center gap-2 border-b pb-3 text-slate-900">
                <SlidersHorizontal size={14} className="text-[#7f1d1d]" />
                <h2 className="text-xs font-black uppercase tracking-wider">Advanced Filters</h2>
              </div>

              {/* Dynamic Category Checklist Node */}
              <div>
                <button onClick={() => setExpandFilters(p => ({ ...p, category: !p.category }))} className="flex items-center justify-between w-full text-[10px] font-black text-slate-400 uppercase tracking-widest select-none cursor-pointer">
                  Categories <ChevronDown size={14} className={`transition-transform duration-200 ${expandFilters.category ? "rotate-180" : ""}`} />
                </button>
                {expandFilters.category && (
                  <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                    {categories.map((c) => (
                      <label key={c._id} className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-black uppercase text-slate-600 hover:text-slate-900 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(c._id)} 
                          onChange={(e) => {
                            const updated = e.target.checked ? [c._id] : [];
                            setSearchParams(e.target.checked ? { category: c._id } : {});
                            setSelectedCategories(updated);
                            setCurrentPage(1);
                          }} 
                          className="w-4 h-4 rounded text-[#7f1d1d] focus:ring-[#7f1d1d] border-slate-300 bg-slate-50 cursor-pointer" 
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Official Brand Checklist Node */}
              <div className="border-t pt-4">
                <button onClick={() => setExpandFilters(p => ({ ...p, brand: !p.brand }))} className="flex items-center justify-between w-full text-[10px] font-black text-slate-400 uppercase tracking-widest select-none cursor-pointer">
                  Official Brands <ChevronDown size={14} className={`transition-transform duration-200 ${expandFilters.brand ? "rotate-180" : ""}`} />
                </button>
                {expandFilters.brand && (
                  <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                    {brands.map((b) => (
                      <label key={b._id} className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-black uppercase text-slate-600 hover:text-slate-900 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedBrands.includes(b._id)} 
                          onChange={(e) => {
                            const updated = e.target.checked ? [b._id] : [];
                            setSearchParams(e.target.checked ? { brand: b._id } : {});
                            setSelectedBrands(updated);
                            setCurrentPage(1);
                          }} 
                          className="w-4 h-4 rounded text-[#7f1d1d] focus:ring-[#7f1d1d] border-slate-300 bg-slate-50 cursor-pointer" 
                        />
                        <span className="truncate">{b.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Bounds Selector Slider */}
              <div className="border-t pt-4">
                <button onClick={() => setExpandFilters(p => ({ ...p, price: !p.price }))} className="flex items-center justify-between w-full text-[10px] font-black text-slate-400 uppercase tracking-widest select-none cursor-pointer">
                  Price Boundary <ChevronDown size={14} className={`transition-transform duration-200 ${expandFilters.price ? "rotate-180" : ""}`} />
                </button>
                {expandFilters.price && (
                  <div className="space-y-3 mt-3 font-sans">
                    <input type="range" min="0" max="25000" step="500" value={priceRange[1]} onChange={(e) => { setPriceRange([priceRange[0], Number(e.target.value)]); setCurrentPage(1); }} className="w-full accent-[#7f1d1d] cursor-pointer" />
                    <div className="flex gap-2 text-xs font-mono font-black">
                      <div className="flex-1">
                        <span className="text-slate-400 text-[8px] uppercase block mb-0.5">Min Range</span>
                        <input type="number" value={priceRange[0]} readOnly className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none" />
                      </div>
                      <div className="flex-1">
                        <span className="text-slate-400 text-[8px] uppercase block mb-0.5">Max Range</span>
                        <input type="number" value={priceRange[1]} readOnly className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleClearFilters} className="w-full h-10 bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-3xs cursor-pointer">
                Reset All Configuration Matrix
              </button>
            </motion.div>
          </div>

          {/* Master Stream Layout Card Track */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-3xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h2 className="text-xs md:text-sm font-black uppercase tracking-tight text-slate-900 flex items-center flex-wrap gap-1">
                {urlSearchQuery ? (
                  <span className="flex items-center gap-1.5"><Tag size={13} className="text-[#7f1d1d]" /> Search Results: "{urlSearchQuery}"</span>
                ) : selectedCategoryName ? (
                  <span className="flex items-center gap-1.5"><Package size={13} className="text-[#7f1d1d]" /> Dynamic {selectedCategoryName} Collection</span>
                ) : (
                  "All Footwear Models Directory"
                )}
                <span className="text-xs text-slate-400 font-bold ml-1">({processedProductsMatrix.length} pairs loaded)</span>
              </h2>

              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="h-9 px-3 border border-slate-200 rounded-xl text-xs font-black text-slate-600 bg-slate-50 outline-none cursor-pointer hover:border-slate-300">
                <option value="popular">Popularity Index</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">New Releases</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-24 text-xs font-mono text-slate-400 select-none animate-pulse">Synchronizing database directory matrices...</div>
            ) : paginatedItemsGrid.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedItemsGrid.map((p) => (
                    <div key={p._id} className="h-full">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>

                {totalPagesCount > 1 && (
                  <div className="flex justify-center gap-1.5 pt-6">
                    {Array.from({ length: totalPagesCount }).map((_, i) => (
                      <button key={i} onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-9 h-9 text-xs font-black rounded-xl border transition-all cursor-pointer ${currentPage === i + 1 ? "bg-[#7f1d1d] text-white border-[#7f1d1d]" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border rounded-3xl p-16 text-center shadow-3xs max-w-sm mx-auto">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">No footwear configurations matched your criteria inside the datastore pipeline arrays nodes.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}