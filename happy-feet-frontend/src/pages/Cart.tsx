import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux";
import { removeFromCart, updateQuantity, calculateTotals, setCartItems } from "../redux/cartSlice";
import api, { IMAGE_BASE_URL } from "../services/api.ts";
import toast from "react-hot-toast";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: cartItems, total, gstTotal } = useSelector((state: RootState) => state.cart);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated || false);

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/cart").then(res => {
        const payloadData = res.data?.data?.items || [];
        const baseRootServer = api.defaults.baseURL?.replace(/\/api$/, "") || "http://localhost:5000";
        
        const mappedData = payloadData.map((i: any) => ({
          id: i.variantId ? `${i.productId._id}-${i.variantId._id}` : i.productId._id,
          productId: i.productId._id,
          variantId: i.variantId?._id || null,
          name: i.productId.name + (i.variantId ? ` (${i.variantId.colorId?.name} / Size ${i.variantId.sizeId?.name})` : ""),
          price: i.variantId ? i.variantId.mrp : i.productId.mrp,
          discountedPrice: i.variantId ? i.variantId.sellingPrice : i.productId.sellingPrice,
          quantity: i.quantity,
          image: i.productId.images?.[0] ? `${baseRootServer}/${i.productId.images[0].replace(/\\/g, "/")}` : "https://placehold.co/100",
          gstPercentage: i.productId.gstPercentage || 18
        }));
        dispatch(setCartItems(mappedData));
      }).catch(err => console.error(err));
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    dispatch(calculateTotals());
  }, [cartItems, dispatch]);

  const handleQtyChange = async (id: string, productId: string, variantId: string | null, currentQty: number) => {
    if (currentQty <= 0) return;
    dispatch(updateQuantity({ id, quantity: currentQty }));

    if (isAuthenticated) {
      try {
        await api.put("/cart/update-quantity", { productId, variantId, quantity: currentQty });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRemoveItem = async (id: string, productId: string, variantId: string | null) => {
    dispatch(removeFromCart(id));
    toast.success("Cleared from cart portfolio.");

    if (isAuthenticated) {
      try {
        await api.delete("/cart/remove", { data: { productId, variantId } });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[65vh] bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center font-sans">
          <ShoppingCart size={48} className="mx-auto mb-3 text-slate-300" />
          <h1 className="text-base font-black text-slate-800 uppercase tracking-wider">Your Cart is Empty</h1>
          <button onClick={() => navigate("/products-gallery")} className="mt-4 px-5 h-9 bg-[#7f1d1d] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs hover:bg-[#6b1a1a]">Explore Gallery</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 border-b pb-3 mb-6 flex items-center gap-2">
          <ShoppingCart size={18} className="text-[#7f1d1d]" /> Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-3xs flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-16 h-16 bg-slate-50 border rounded-xl overflow-hidden shrink-0 p-1 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight max-w-md line-clamp-1">{item.name}</h3>
                      <div className="mt-0.5 text-xs font-bold text-slate-400 font-mono">₹{item.discountedPrice}</div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 gap-3">
                    <div className="flex items-center border bg-slate-50 rounded-xl h-8 overflow-hidden">
                      <button onClick={() => handleQtyChange(item.id, item.productId, item.variantId, item.quantity - 1)} className="px-2.5 h-full hover:bg-slate-100 font-mono font-bold transition-colors cursor-pointer"><Minus size={12} /></button>
                      <span className="px-3 font-mono font-black text-xs text-slate-800">{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item.id, item.productId, item.variantId, item.quantity + 1)} className="px-2.5 h-full hover:bg-slate-100 font-mono font-bold transition-colors cursor-pointer"><Plus size={12} /></button>
                    </div>
                    <div className="text-right font-mono font-black text-slate-900 text-sm min-w-[70px]">₹{item.discountedPrice * item.quantity}</div>
                    <button onClick={() => handleRemoveItem(item.id, item.productId, item.variantId)} className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-xl cursor-pointer"><Trash2 size={13} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-3xs space-y-4 font-bold text-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-2">Order Ledger</h3>
              <div className="space-y-2.5 border-b pb-4 text-slate-500 font-medium">
                <div className="flex justify-between"><span>Subtotal Base Vol</span><span className="font-mono text-slate-800 font-black">₹{(total - gstTotal).toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Assessed GST Tax</span><span className="font-mono text-slate-800 font-black">₹{gstTotal.toFixed(0)}</span></div>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1"><span>Total Gross Cost</span><span className="font-mono text-[#7f1d1d] text-base">₹{total.toFixed(0)}</span></div>
              <button onClick={() => navigate("/checkout")} className="w-full h-11 bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-3xs flex items-center justify-center gap-1.5 cursor-pointer">Proceed to Checkout <ArrowRight size={13} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}