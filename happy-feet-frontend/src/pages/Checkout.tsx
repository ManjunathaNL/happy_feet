import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, Wallet, ShieldCheck, CreditCard, QrCode, Sparkles } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux";
import { clearCart } from "../redux/cartSlice";
import api from "../services/api";
import toast from "react-hot-toast";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  upiId?: string;
  cardName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);
  const { user } = useSelector((state: RootState) => state.auth);
  const userWalletPointsBalance = user?.pointsWallet || 0;

  const [currentStep, setCurrentStep] = useState(1);
  const [usePoints, setUsePoints] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedUpiProvider, setSelectedUpiProvider] = useState("gpay");

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    address: "", city: "", state: "", pincode: "",
    shippingMethod: "standard", paymentMethod: "cod",
    upiId: "", cardName: "", cardNumber: "", expiryDate: "", cvv: ""
  });

  // ✅ FIXED: Safely hydrates the email address input field when auth state updates
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.discountedPrice * item.quantity, 0);
  const gstAmount = cartItems.reduce((acc, item) => acc + (item.discountedPrice * item.quantity * (item.gstPercentage || 18)) / 118, 0);
  const shippingCost = formData.shippingMethod === "express" ? 100 : 0;
  
  const totalBillBeforePoints = subtotal + shippingCost;
  const applicablePointsDiscount = usePoints ? Math.min(userWalletPointsBalance, totalBillBeforePoints) : 0;
  const total = Math.max(0, totalBillBeforePoints - applicablePointsDiscount);
  const potentialPointsEarned = Math.floor(total * 0.1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Strict non-digit character filtering logic rules
    if (name === "phone" || name === "pincode" || name === "cardNumber" || name === "cvv") {
      const numericClean = value.replace(/\D/g, "");
      setFormData(prev => ({ ...prev, [name]: numericClean }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (): boolean => {
    const nextErrors: FormErrors = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.firstName.trim()) { nextErrors.firstName = "First Name parameter field is required."; isValid = false; }
      if (!formData.lastName.trim()) { nextErrors.lastName = "Last Name parameter field is required."; isValid = false; }
      if (!formData.address.trim()) { nextErrors.address = "Full delivery shipping route address is required."; isValid = false; }
      if (!formData.city.trim()) { nextErrors.city = "Target destination city is required."; isValid = false; }
      if (!formData.state.trim()) { nextErrors.state = "Target state field notation is required."; isValid = false; }
      if (formData.phone.length !== 10) { nextErrors.phone = "Phone mapping requires exactly 10 digits."; isValid = false; }
      if (formData.pincode.length !== 6) { nextErrors.pincode = "Postal code sequence requires exactly 6 digits."; isValid = false; }
    }

    if (currentStep === 3) {
      if (formData.paymentMethod === "card") {
        if (!formData.cardName.trim()) { nextErrors.cardName = "Cardholder name is required."; isValid = false; }
        if (formData.cardNumber.length !== 16) { nextErrors.cardNumber = "Card identification requires 16 digits."; isValid = false; }
        if (!formData.expiryDate.trim()) { nextErrors.expiryDate = "Expiration date code is required."; isValid = false; }
        if (formData.cvv.length !== 3) { nextErrors.cvv = "Security CVV mapping requires 3 digits."; isValid = false; }
      }
      if (formData.paymentMethod === "upi") {
        if (!formData.upiId.trim() || !formData.upiId.includes("@")) {
          nextErrors.upiId = "Please type a valid structured UPI handle ID string (e.g., name@vpa).";
          isValid = false;
        }
      }
    }

    setErrors(nextErrors);
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep() && currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      const response = await api.post("/checkout/place-order", {
        formData,
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          price: item.discountedPrice,
          quantity: item.quantity
        })),
        subtotal,
        gstAmount,
        shippingCost,
        usePoints,
        total,
      });

      if (response.data?.success) {
        toast.custom(() => (
          <div className="bg-slate-950 border border-slate-800 text-white p-4 rounded-2xl flex flex-col gap-1 shadow-2xl font-sans">
            <span className="font-black text-xs text-emerald-400 uppercase tracking-widest flex items-center gap-1">✓ Order Confirmed</span>
            <span className="text-[11px] text-slate-300 font-medium">Earned +{response.data.pointsEarned} Points and logged rewards balance successfully!</span>
          </div>
        ));
        dispatch(clearCart());
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Order placement transaction pipeline broken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-xl font-black uppercase tracking-tight mb-8 text-slate-900 border-b pb-3">Secure Order Dispatch Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step Stepper Indicator Nodes */}
            <div className="flex justify-between relative max-w-md mx-auto mb-8 text-[10px] font-black uppercase tracking-wider text-slate-400">
              {[1, 2, 3].map((step) => (
                <div key={step} className="text-center flex-1 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 font-mono text-xs transition-all ${step <= currentStep ? "bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)] ring-4 ring-red-900/10" : "bg-slate-200 text-slate-600"}`}>
                    {step < currentStep ? <Check size={14} /> : step}
                  </div>
                  <span className={step <= currentStep ? "text-[#7f1d1d] font-black" : "font-bold"}>{step === 1 ? "Address" : step === 2 ? "Shipping" : "Payment"}</span>
                </div>
              ))}
            </div>

            <motion.div layout className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-3xs space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b pb-2">1. Delivery Address Parameters</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">First Name <span className="text-rose-600 font-bold">*</span></label>
                        <input type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} className={`h-10 px-3 border bg-slate-50 rounded-xl text-xs font-bold outline-none w-full ${errors.firstName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200"}`} />
                        {errors.firstName && <p className="text-[10px] font-bold text-rose-600">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Last Name <span className="text-rose-600 font-bold">*</span></label>
                        <input type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} className={`h-10 px-3 border bg-slate-50 rounded-xl text-xs font-bold outline-none w-full ${errors.lastName ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200"}`} />
                        {errors.lastName && <p className="text-[10px] font-bold text-rose-600">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone Number <span className="text-rose-600 font-bold">*</span></label>
                        <input type="text" name="phone" placeholder="9876543210" maxLength={10} value={formData.phone} onChange={handleInputChange} className={`h-10 px-3 border bg-slate-50 rounded-xl text-xs font-bold outline-none w-full font-mono ${errors.phone ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200"}`} />
                        {errors.phone && <p className="text-[10px] font-bold text-rose-600">{errors.phone}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Authenticated Profile Email</label>
                        <input type="email" name="email" value={formData.email} readOnly className="h-10 px-3 border border-slate-200 bg-slate-100 rounded-xl text-xs font-bold text-slate-400 w-full cursor-not-allowed" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full Delivery Shipping Route <span className="text-rose-600 font-bold">*</span></label>
                      <textarea name="address" placeholder="Flat/House No, Building, Street Coordinates" value={formData.address} onChange={handleInputChange} rows={3} className={`w-full p-3 border bg-slate-50 rounded-xl text-xs font-bold outline-none resize-none ${errors.address ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-200"}`} />
                      {errors.address && <p className="text-[10px] font-bold text-rose-600">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">City <span className="text-rose-600 font-bold">*</span></label>
                        <input type="text" name="city" placeholder="Bengaluru" value={formData.city} onChange={handleInputChange} className="h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold outline-none w-full" />
                        {errors.city && <p className="text-[10px] font-bold text-rose-600">{errors.city}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">State <span className="text-rose-600 font-bold">*</span></label>
                        <input type="text" name="state" placeholder="Karnataka" value={formData.state} onChange={handleInputChange} className="h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold outline-none w-full" />
                        {errors.state && <p className="text-[10px] font-bold text-rose-600">{errors.state}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pincode <span className="text-rose-600 font-bold">*</span></label>
                        <input type="text" name="pincode" placeholder="560001" maxLength={6} value={formData.pincode} onChange={handleInputChange} className="h-10 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold outline-none w-full font-mono" />
                        {errors.pincode && <p className="text-[10px] font-bold text-rose-600">{errors.pincode}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b pb-2">2. Shipping Channel Methods</h2>
                    <div className="space-y-2.5">
                      <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${formData.shippingMethod === "standard" ? "border-[#7f1d1d] bg-red-50/5" : "border-slate-200"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shippingMethod" value="standard" checked={formData.shippingMethod === "standard"} onChange={handleInputChange} className="accent-[#7f1d1d] w-4 h-4" />
                          <div className="text-xs font-bold"><p className="text-slate-900 uppercase font-black">Standard Ground Track</p><p className="text-slate-400 mt-0.5 font-medium">3-5 business delivery cycles</p></div>
                        </div>
                        <span className="font-mono text-xs font-black text-slate-900">FREE</span>
                      </label>
                      <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${formData.shippingMethod === "express" ? "border-[#7f1d1d] bg-red-50/5" : "border-slate-200"}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shippingMethod" value="express" checked={formData.shippingMethod === "express"} onChange={handleInputChange} className="accent-[#7f1d1d] w-4 h-4" />
                          <div className="text-xs font-bold"><p className="text-slate-900 uppercase font-black">Express Bullet Mode</p><p className="text-slate-400 mt-0.5 font-medium">1-2 working days delivery window</p></div>
                        </div>
                        <span className="font-mono text-xs font-black text-slate-900">₹100</span>
                      </label>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 border-b pb-2">3. Payment Layer Protocols</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: "cod", l: "Cash on Delivery", icon: <Check size={14} /> },
                        { id: "upi", l: "Unified UPI VPA", icon: <QrCode size={14} /> },
                        { id: "card", l: "Credit/Debit Card", icon: <CreditCard size={14} /> }
                      ].map((m) => (
                        <label key={m.id} className={`flex flex-col justify-between p-4 border rounded-2xl cursor-pointer text-xs font-black uppercase transition-all ${formData.paymentMethod === m.id ? "border-[#7f1d1d] bg-red-50/5 shadow-3xs text-[#7f1d1d]" : "border-slate-200 bg-slate-50/40 text-slate-700"}`}>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-slate-400">{m.icon}</span>
                            <input type="radio" name="paymentMethod" value={m.id} checked={formData.paymentMethod === m.id} onChange={handleInputChange} className="accent-[#7f1d1d]" />
                          </div>
                          <span className="text-slate-800 mt-4 tracking-tight block">{m.l}</span>
                        </label>
                      ))}
                    </div>

                    {/* UPI App Mappings Selection Section */}
                    {formData.paymentMethod === "upi" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 mt-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Select Pre-configured VPA App Engine</span>
                        <div className="flex gap-2">
                          {["gpay", "phonepe", "paytm"].map(provider => (
                            <button key={provider} type="button" onClick={() => setSelectedUpiProvider(provider)} className={`flex-1 h-9 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer ${selectedUpiProvider === provider ? "bg-white border-[#7f1d1d] text-[#7f1d1d] shadow-2xs" : "bg-white text-slate-500"}`}>{provider}</button>
                          ))}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Virtual Payment Address (VPA) <span className="text-rose-600 font-bold">*</span></label>
                          <input type="text" name="upiId" placeholder="username@okaxis" value={formData.upiId} onChange={handleInputChange} className="w-full h-10 px-3 border bg-white rounded-xl text-xs font-bold outline-none" />
                          {errors.upiId && <p className="text-[10px] font-bold text-rose-600 mt-0.5">{errors.upiId}</p>}
                        </div>
                      </motion.div>
                    )}

                    {formData.paymentMethod === "card" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3 mt-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-600" /> Secure Encryption Capture</span>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Cardholder Name <span className="text-rose-600 font-bold">*</span></label>
                          <input type="text" name="cardName" placeholder="Card Holder Name" value={formData.cardName} onChange={handleInputChange} className="w-full h-10 px-3 border bg-white rounded-xl text-xs font-bold outline-none" />
                          {errors.cardName && <p className="text-[10px] font-bold text-rose-600">{errors.cardName}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Card Number <span className="text-rose-600 font-bold">*</span></label>
                          <input type="text" name="cardNumber" placeholder="16 Digit Identification Number" maxLength={16} value={formData.cardNumber} onChange={handleInputChange} className="w-full h-10 px-3 border bg-white rounded-xl text-xs font-bold outline-none font-mono" />
                          {errors.cardNumber && <p className="text-[10px] font-bold text-rose-600">{errors.cardNumber}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Expiry Date <span className="text-rose-600 font-bold">*</span></label>
                            <input type="text" name="expiryDate" placeholder="MM/YY" maxLength={5} value={formData.expiryDate} onChange={handleInputChange} className="h-10 px-3 border bg-white rounded-xl text-xs font-bold outline-none font-mono" />
                            {errors.expiryDate && <p className="text-[10px] font-bold text-rose-600">{errors.expiryDate}</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Security CVV <span className="text-rose-600 font-bold">*</span></label>
                            <input type="password" name="cvv" placeholder="CVV" maxLength={3} value={formData.cvv} onChange={handleInputChange} className="h-10 px-3 border bg-white rounded-xl text-xs font-bold outline-none font-mono" />
                            {errors.cvv && <p className="text-[10px] font-bold text-rose-600">{errors.cvv}</p>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls Footer */}
              <div className="flex justify-between border-t border-slate-100 pt-4 mt-6">
                {currentStep > 1 && (
                  <button onClick={() => setCurrentStep(currentStep - 1)} className="h-9 px-4 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1 cursor-pointer hover:bg-slate-50">
                    <ChevronLeft size={14} /> Back
                  </button>
                )}
                {currentStep < 3 ? (
                  <button onClick={handleNextStep} className="ml-auto h-9 px-5 bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)] rounded-xl text-xs font-black uppercase tracking-widest shadow-xs cursor-pointer hover:opacity-90">
                    Continue Step
                  </button>
                ) : (
                  <button onClick={handlePlaceOrder} disabled={isSubmitting} className="ml-auto h-9 px-5 bg-[var(--dynamic-accent-bg)] text-[var(--dynamic-accent-text)] rounded-xl text-xs font-black uppercase tracking-widest shadow-md cursor-pointer hover:opacity-90 flex items-center gap-1">
                    {isSubmitting ? "Processing..." : "Commit Purchase Order"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Dynamic Sidebar Wallet and Summary Calculations Sheet */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-3xs space-y-3 font-sans">
              <div className="flex items-center gap-2 text-slate-800 border-b pb-2">
                <QrCode className="text-amber-500" size={15} />
                <h3 className="text-xs font-black uppercase tracking-wider">Happy Feet Coin Wallet</h3>
              </div>
              <div className="flex justify-between items-center bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Available Balance</span>
                  <span className="font-mono text-sm font-black text-slate-800">₹{userWalletPointsBalance.toFixed(0)} Tokens</span>
                </div>
                {userWalletPointsBalance > 0 && (
                  <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} className="w-4 h-4 rounded text-amber-600 cursor-pointer const accent-[#7f1d1d]" />
                )}
              </div>
              <div className="bg-emerald-50/40 p-2.5 rounded-xl text-[10px] font-bold text-slate-500 leading-normal">
                🔥 Purchase Reward: returns <span className="text-emerald-700 font-mono font-black">+{potentialPointsEarned} points</span> to wallet layers.
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-3xs space-y-3 text-xs font-bold font-sans">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b pb-1.5">Order Invoice</h3>
              <div className="space-y-2 text-slate-500 font-medium">
                <div className="flex justify-between"><span>Subtotal Base Items</span><span className="font-mono text-slate-800">₹{(subtotal - gstAmount).toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Assessed GST Valuation</span><span className="font-mono text-slate-800">₹{gstAmount.toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Logistics Shipping</span><span className="font-mono text-slate-800">{shippingCost > 0 ? `₹${shippingCost}` : "FREE"}</span></div>
                {applicablePointsDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-black"><span>Wallet Point Offset</span><span className="font-mono">-₹{applicablePointsDiscount.toFixed(0)}</span></div>
                )}
              </div>
              <div className="border-t pt-2.5 flex justify-between text-sm font-black text-slate-900"><span>Net Total Paid</span><span className="font-mono text-[#7f1d1d] text-base">₹{total.toFixed(0)}</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}