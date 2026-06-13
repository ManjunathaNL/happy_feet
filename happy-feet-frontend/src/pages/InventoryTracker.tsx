import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, AlertTriangle, CheckCircle, Package, Edit3 } from "lucide-react";
import {inventoryAPI} from "../services/api";
import toast from "react-hot-toast";


interface InventoryVariant {
  _id: string;
  productId: {
    _id: string;
    name: string;
    sku: string;
    status: string;
    brandId?: { name: string };
    categoryId?: { name: string };
  };
  colorId?: { name: string };
  sizeId?: { name: string };
  sku: string;
  mrp: number;
  sellingPrice: number;
  stockQuantity: number;
}

export default function InventoryTracker() {
  const [stockDataset, setStockDataset] = useState<InventoryVariant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingVariant, setEditingVariant] = useState<InventoryVariant | null>(null);
  const [overrideCountInput, setOverrideCountInput] = useState("");
  const [auditReasonInput, setAuditReasonInput] = useState("Manual Warehouse Count");


const syncInventoryCollectionLayers = async () => {
  setLoading(true);
  try {
    // Using the new inventoryAPI object
    const res = await inventoryAPI.getAll(); 
    
    if (res.data?.success) {
      setStockDataset(res.data.data || []);
    }
  } catch (err) {
    console.error("Failed loading inventory data:", err);
    toast.error("Failed to map live warehouse variables nodes.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    syncInventoryCollectionLayers();
  }, []);

  const lowStockCountMetrics = useMemo(() => {
    return stockDataset.filter(v => v && typeof v.stockQuantity === "number" && v.stockQuantity <= 5).length;
  }, [stockDataset]);

  const processedInventoryMatrix = useMemo(() => {
    if (!searchQuery.trim()) return stockDataset;
    const horizontalTerm = searchQuery.toLowerCase().trim();
    return stockDataset.filter(v => 
      v?.productId?.name?.toLowerCase().includes(horizontalTerm) ||
      v?.sku?.toLowerCase().includes(horizontalTerm) ||
      v?.productId?.sku?.toLowerCase().includes(horizontalTerm)
    );
  }, [stockDataset, searchQuery]);

  const handleStockCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericClean = e.target.value.replace(/\D/g, "");
    setOverrideCountInput(numericClean);
  };

  const handleUpdateStockCommit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingVariant) return;

  const parsedCount = Number(overrideCountInput);
  setIsSubmitting(true);
  
  try {
    // ✅ Use the cleaner updateStock method you created
    const response = await inventoryAPI.updateStock({
      variantId: editingVariant._id,
      nextStockCount: parsedCount,
      adjustmentsReason: auditReasonInput
    });

    if (response.data?.success) {
      toast.success("Inventory metrics updated successfully!");
      setEditingVariant(null);
      syncInventoryCollectionLayers();
    }
  } catch (err: any) {
    console.error(err);
    toast.error(err.response?.data?.message || "Modification request was rejected.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16 pt-6 px-4 md:px-8 max-w-7xl mx-auto">
      
      {/* Metric Cards Banner Rows Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total SKU Matrices</span>
            <h2 className="text-xl font-black text-slate-900 font-mono">{stockDataset.length} Paths</h2>
          </div>
          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl"><Package size={18} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Low Stock Warnings</span>
            <h2 className="text-xl font-black text-rose-600 font-mono">{lowStockCountMetrics} Items</h2>
          </div>
          <div className={`p-3 rounded-xl ${lowStockCountMetrics > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-400"}`}><AlertTriangle size={18} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Warehouse Status</span>
            <h2 className="text-sm font-black text-emerald-600 uppercase tracking-tight">Active Sync Complete</h2>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={18} /></div>
        </div>
      </div>

      {/* Lookup Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-3xs flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <input 
            type="text" 
            placeholder="Search by footwear title, barcode or SKU..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-slate-400" 
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <button onClick={syncInventoryCollectionLayers} className="h-9 px-4 border bg-slate-50 hover:bg-white rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5 transition-all cursor-pointer">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh Logistics Node
        </button>
      </div>

      {/* Main Datastore Rows Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-3xs overflow-hidden">
        {loading ? (
          <div className="text-center py-24 text-xs font-mono text-slate-400 select-none animate-pulse">Decompiling logistics matrix layers...</div>
        ) : processedInventoryMatrix.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                  <th className="p-4">Footwear Model Specification / ID</th>
                  <th className="p-4">Color/Sizing Node</th>
                  <th className="p-4">Variant SKU Barcode</th>
                  <th className="p-4">Calculated Stock</th>
                  <th className="p-4 text-right">Actions Matrix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-600">
                {processedInventoryMatrix.map((item) => {
                  if (!item) return null;
                  const isLow = item.stockQuantity <= 5;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 max-w-sm">
                        <div className="truncate font-black text-slate-900 uppercase tracking-tight">{item.productId?.name || "No Product Reference"}</div>
                        <div className="text-[10px] font-mono text-slate-400 font-medium mt-0.5">Parent SKU: {item.productId?.sku || "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] uppercase font-black tracking-wide border text-slate-700 border-slate-200">
                          {item.colorId?.name || "Default"} / Size {item.sizeId?.name || "Mix"}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-500">{item.sku || "N/A"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono text-sm font-black ${isLow ? "text-rose-600" : "text-slate-800"}`}>
                            {item.stockQuantity ?? 0} pairs
                          </span>
                          {isLow && <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[8px] px-1.5 py-0.2 rounded-md font-black uppercase tracking-wider animate-pulse">Critical</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => { setEditingVariant(item); setOverrideCountInput(String(item.stockQuantity ?? 0)); }} 
                          className="h-7 px-3 bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)] hover:opacity-90 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer shadow-3xs"
                        >
                          <Edit3 size={11} /> Audit Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-xs font-black uppercase tracking-wider text-slate-400">No active variants captured within the search context parameters loop node.</div>
        )}
      </div>

      {/* Manual Audit Stock Popup Overlay Box */}
      <AnimatePresence>
        {editingVariant && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="bg-white rounded-3xl p-5 border shadow-xl max-w-sm w-full space-y-4">
              <div className="border-b pb-2 flex items-center gap-1.5 text-slate-900 select-none">
                <Package size={16} className="text-[#7f1d1d]" />
                <h3 className="text-xs font-black uppercase tracking-wider">Manual Inventory Audit Adjustment</h3>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target SKU Focus</span>
                <p className="font-black text-slate-800 uppercase tracking-tight truncate">{editingVariant.productId?.name}</p>
                <p className="font-mono text-slate-400 text-[10px]">Variant: {editingVariant.colorId?.name} / Size {editingVariant.sizeId?.name}</p>
              </div>

              <form onSubmit={handleUpdateStockCommit} className="space-y-4 font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">New Warehouse Count <span className="text-rose-600 font-bold">*</span></label>
                  <input 
                    type="text" 
                    value={overrideCountInput} 
                    onChange={handleStockCountChange} 
                    placeholder="Enter physical counts" 
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold font-mono outline-none focus:border-slate-400" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Audit Adjustment Reason <span className="text-rose-600 font-bold">*</span></label>
                  <select 
                    value={auditReasonInput} 
                    onChange={(e) => setAuditReasonInput(e.target.value)} 
                    className="w-full h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-slate-400"
                  >
                    <option value="Manual Warehouse Count">Manual Physical Warehouse Recount</option>
                    <option value="Incoming Production Batch">Incoming Bulk Batch Restock</option>
                    <option value="Damaged Goods Exclusion">Damaged / Defective Stock Audit Reduction</option>
                    <option value="Customer Return Re-entry">Customer Order Returns Processing</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2 border-t text-xs font-black uppercase">
                  <button type="button" onClick={() => setEditingVariant(null)} className="flex-1 h-9 border rounded-xl hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 h-9 bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-40"
                  >
                    {isSubmitting ? "Syncing..." : "Save Parameters"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}