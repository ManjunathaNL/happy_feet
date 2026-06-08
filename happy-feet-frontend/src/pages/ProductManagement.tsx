// import React, { useState, useEffect, useRef } from "react";
// import Select from "react-select";
// import { catalogAPI, masterAPI, IMAGE_BASE_URL } from "../services/api";
// import { useTable } from "../hooks/useTable";
// import { Pagination } from "../components/Pagination";
// import {
//   Package,
//   Plus,
//   Edit2,
//   Trash2,
//   Loader2,
//   Search,
//   Table,
//   Sliders,
//   Box,
//   X,
//   AlertCircle,
//   ShoppingBag,
//   RefreshCw,
//   UploadCloud,
//   Image as ImageIcon,
// } from "lucide-react";
// import toast from "react-hot-toast";

// export const ProductManagement: React.FC = () => {
  

//   const [showFormPanel, setShowFormPanel] = useState<boolean>(false);
//   const [products, setProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   // Structural Dropdowns
//   const [brands, setBrands] = useState<any[]>([]);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [subCategories, setSubCategories] = useState<any[]>([]);
//   const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([]);

//   // Master Attribute Dropdowns
//   const [genders, setGenders] = useState<any[]>([]);
//   const [colors, setColors] = useState<any[]>([]);
//   const [sizes, setSizes] = useState<any[]>([]);
//   const [materials, setMaterials] = useState<any[]>([]);

//   // Image Management
//   const [selectedImages, setSelectedImages] = useState<File[]>([]);
//   const [imagePreviews, setImagePreviews] = useState<string[]>([]);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Variant Wizard
//   const [wizardColors, setWizardColors] = useState<any[]>([]);
//   const [wizardSizes, setWizardSizes] = useState<any[]>([]);
//   const [wizardMaterials, setWizardMaterials] = useState<any[]>([]);
//   const [wizardMatrix, setWizardMatrix] = useState<any[]>([]);

//   const defaultForm = {
//     name: "",
//     sku: "",
//     hsn: "",
//     brandId: "",
//     categoryId: "",
//     subCategoryId: "",
//     gender: "",
//     season: "Summer",
//     collectionYear: "2026 Collection",
//     occasion: "Casual",
//     lifestyle: "Standard",
//     fitType: "Regular",
//     closureType: "Lace Up",
//     toeShape: "Round Toe",
//     shortDescription: "",
//     longDescription: "",
//     costPrice: "",
//     landingCost: "",
//     mrp: "",
//     sellingPrice: "",
//     gstPercentage: 18,
//   };

//   const [form, setForm] = useState(defaultForm);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [matrixErrors, setMatrixErrors] = useState<number[]>([]);

//   const gstOptions = [
//     { value: 0, label: "0% GST" },
//     { value: 5, label: "5% GST" },
//     { value: 12, label: "12% GST" },
//     { value: 18, label: "18% GST" },
//     { value: 28, label: "28% GST" },
//   ];

//   const {
//     paginatedData,
//     page,
//     totalPages,
//     search,
//     itemsPerPage,
//     setSearch,
//     setPage,
//     setItemsPerPage,
//     pageNumbers,
//     hasNext,
//     hasPrev,
//     toggleSort,
//   } = useTable(products, {
//     itemsPerPage: 10,
//     searchableFields: ["name", "sku"],
//   });

//   useEffect(() => {
//     syncUnifiedDashboardContext();
//   }, []);

//   useEffect(() => {
//     if (form.categoryId) {
//       const matches = subCategories.filter(
//         (sub) => sub.categoryId === form.categoryId,
//       );
//       setFilteredSubCategories(
//         matches.map((s) => ({ value: s._id, label: s.name })),
//       );
//       if (!matches.some((m) => m._id === form.subCategoryId)) {
//         setForm((prev) => ({ ...prev, subCategoryId: "" }));
//       }
//     } else {
//       setFilteredSubCategories([]);
//     }
//   }, [form.categoryId, subCategories]);

//   const syncUnifiedDashboardContext = async () => {
//     try {
//       setLoading(true);
//       const [prodRes, brandRes, catRes, subRes, attrTypeRes, attrRes] =
//         await Promise.all([
//           catalogAPI.getProducts(),
//           masterAPI.brand.getAll(),
//           masterAPI.category.getAll(),
//           masterAPI.subCategory.getAll(),
//           masterAPI.attributeType.getAll(),
//           masterAPI.globalAttribute.getAll(),
//         ]);

//       setProducts(prodRes.data?.data || []);
//       setBrands(
//         (brandRes.data?.data || []).map((b: any) => ({
//           value: b._id,
//           label: b.name,
//         })),
//       );
//       setCategories(
//         (catRes.data?.data || []).map((c: any) => ({
//           value: c._id,
//           label: c.name,
//         })),
//       );
//       setSubCategories(subRes.data?.data || []);

//       const rawTypes = attrTypeRes.data?.data || [];
//       const rawAttributes = attrRes.data?.data || [];

//       const getAttrsByType = (typeName: string) => {
//         const type = rawTypes.find(
//           (t: any) => t.name.toLowerCase() === typeName.toLowerCase(),
//         );
//         if (!type) return [];
//         return rawAttributes
//           .filter(
//             (a: any) =>
//               a.attributeTypeId === type._id ||
//               a.attributeTypeId?._id === type._id,
//           )
//           .map((x: any) => ({ value: x._id, label: x.name }));
//       };

//       setGenders(getAttrsByType("Gender"));
//       setColors(getAttrsByType("Color"));
//       setSizes(getAttrsByType("Size"));
//       setMaterials(getAttrsByType("Material"));
//     } catch (e) {
//       toast.error("Error synchronizing master data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ... (handleImageSelection, removeImage, handleInputChangeWithReset, handleSelectChangeWithReset remain the same)

//   const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files);
//       setSelectedImages((prev) => [...prev, ...filesArray]);
//       const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
//       setImagePreviews((prev) => [...prev, ...newPreviews]);
//     }
//     if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
//   };

//   const removeImage = (index: number) => {
//     setSelectedImages((prev) => prev.filter((_, i) => i !== index));
//     setImagePreviews((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleInputChangeWithReset = (
//     fieldNameKey: string,
//     textStringValue: string | number,
//   ) => {
//     if (errors[fieldNameKey])
//       setErrors((prev) => ({ ...prev, [fieldNameKey]: "" }));
//     setForm((prev) => ({ ...prev, [fieldNameKey]: textStringValue }));
//   };

//   const handleSelectChangeWithReset = (
//     fieldNameKey: string,
//     chosenOptionElement: any,
//   ) => {
//     if (errors[fieldNameKey])
//       setErrors((prev) => ({ ...prev, [fieldNameKey]: "" }));
//     setForm((prev) => ({
//       ...prev,
//       [fieldNameKey]: chosenOptionElement ? chosenOptionElement.value : "",
//     }));
//   };

//   const validateProductForm = () => {
//     let local: Record<string, string> = {};
//     let matrixErrIndices: number[] = [];

//     if (!form.name.trim()) local.name = "Product Name is required.";
//     if (!form.sku.trim()) local.sku = "Product SKU code is required.";
//     if (!form.hsn.trim()) local.hsn = "HSN Code is required.";
//     if (!form.brandId) local.brandId = "Brand is required.";
//     if (!form.categoryId) local.categoryId = "Category is required.";
//     if (!form.subCategoryId) local.subCategoryId = "Sub Category is required.";
//     if (!form.gender) local.gender = "Gender is required.";
//     if (form.gstPercentage === null || form.gstPercentage === undefined)
//       local.gstPercentage = "GST Tax Slab is required.";
//     if (!form.costPrice || Number(form.costPrice) <= 0)
//       local.costPrice = "Cost Price is required.";
//     if (!form.mrp || Number(form.mrp) <= 0) local.mrp = "MRP is required.";
//     if (!form.sellingPrice || Number(form.sellingPrice) <= 0)
//       local.sellingPrice = "Selling Price is required.";
//     if (!form.landingCost || Number(form.landingCost) <= 0)
//       local.landingCost = "Landing Cost is required.";
//     if (!form.shortDescription.trim())
//       local.shortDescription = "Short Description is required.";
//     if (!form.longDescription.trim())
//       local.longDescription = "Long Description is required.";

//     if (Number(form.sellingPrice) > Number(form.mrp)) {
//       local.sellingPrice = "Selling Price cannot exceed MRP.";
//     }

//     if (!editingId && selectedImages.length === 0) {
//       local.images = "At least one product image is required.";
//     }

//     if (!editingId && wizardMatrix.length === 0) {
//       local.variants =
//         "You must generate and fill at least one variant configuration.";
//     } else if (!editingId && wizardMatrix.length > 0) {
//       wizardMatrix.forEach((v, idx) => {
//         if (
//           !v.sku ||
//           !v.costPrice ||
//           !v.sellingPrice ||
//           v.stockQuantity === "" ||
//           v.stockQuantity === null
//         ) {
//           matrixErrIndices.push(idx);
//         }
//       });
//       if (matrixErrIndices.length > 0) {
//         local.variants =
//           "Please fill out all Stock and Price fields in the highlighted Matrix rows.";
//       }
//     }
// const baseSku = (form.sku || "").toUpperCase().trim();
// const duplicateVariant = wizardMatrix.some(v => 
//   v.sku.toUpperCase().trim() === baseSku
// );

// if (duplicateVariant) {
//   setErrors(prev => ({ ...prev, variants: "Variant SKU cannot be same as base product SKU." }));
//   return;
// }


//     setErrors(local);
//     setMatrixErrors(matrixErrIndices);
//     return Object.keys(local).length === 0;
//   };

//   const handleProductSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateProductForm()) {
//       toast.error("Please resolve the highlighted validation errors.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload = new FormData();
//       Object.keys(form).forEach((key) => {
//         if (
//           form[key as keyof typeof form] !== undefined &&
//           form[key as keyof typeof form] !== ""
//         ) {
//           payload.append(key, String(form[key as keyof typeof form]));
//         }
//       });

//       selectedImages.forEach((file) => payload.append("images", file));

//       if (!editingId && wizardMatrix.length > 0) {
//         payload.append("variants", JSON.stringify(wizardMatrix));
//       }

//       if (editingId) {
//         await catalogAPI.updateProduct(editingId, payload);
//         toast.success("Product updated successfully.");
//       } else {
//         await catalogAPI.createProduct(payload);
//         toast.success("Product and Variants created successfully.");
//       }

//       clearProductFormContext();
//       await syncUnifiedDashboardContext();
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || "Error submitting product.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const clearProductFormContext = () => {
//     setForm(defaultForm);
//     setEditingId(null);
//     setErrors({});
//     setMatrixErrors([]);
//     setWizardMatrix([]);
//     setWizardColors([]);
//     setWizardSizes([]);
//     setWizardMaterials([]);
//     setSelectedImages([]);
//     setImagePreviews([]);
//     setShowFormPanel(false);
//   };

//  const runMatrixGenerationWizard = () => {
//   if (wizardColors.length === 0 || wizardSizes.length === 0 || wizardMaterials.length === 0) {
//     setErrors((prev) => ({
//       ...prev,
//       variants: "Please select at least one Color, Size, and Material.",
//     }));
//     return;
//   }
//   setErrors((prev) => ({ ...prev, variants: "" }));

//   const configurationsGrid: any[] = [];
  
//  wizardColors.forEach((color) => {
//     wizardSizes.forEach((size) => {
//       wizardMaterials.forEach((material) => {
//        const blockSku = `${form.sku || "SKU"}-${color.label}-${size.label}-${material.label}`
//           .toUpperCase()
//           .replace(/\s+/g, "");
          
//         configurationsGrid.push({
//           // Store these so they can be rendered
//           colorId: color.value, 
//           colorLabel: color.label,
//           sizeId: size.value, 
//           sizeLabel: size.label,
//           materialId: material.value, 
//           materialLabel: material.label,
          
//           sku: blockSku,
//           barcode: `BAR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
//           costPrice: form.costPrice || "",
//           mrp: form.mrp || "",
//           sellingPrice: form.sellingPrice || "",
//           stockQuantity: ""
//         });
//       });
//     });
//   });

//   setWizardMatrix(configurationsGrid);
//   setMatrixErrors([]);
// };

//   const editWizardMatrixCell = (
//     idx: number,
//     objectFieldKey: string,
//     updatedTextValue: any,
//   ) => {
//     const updatedGrid = [...wizardMatrix];
//     updatedGrid[idx][objectFieldKey] = updatedTextValue;
//     setWizardMatrix(updatedGrid);

//     if (matrixErrors.includes(idx)) {
//       setMatrixErrors((prev) => prev.filter((e) => e !== idx));
//     }
//     if (errors.variants) setErrors((prev) => ({ ...prev, variants: "" }));
//   };

//   const startProductModificationLifecycle = (item: any) => {
//     setEditingId(item._id);
//     setErrors({});
//     setMatrixErrors([]);

//     setForm({
//       name: item.name,
//       sku: item.sku,
//       hsn: item.hsn || "",
//       brandId: item.brandId?._id || "",
//       categoryId: item.categoryId?._id || "",
//       subCategoryId: item.subCategoryId?._id || "",
//       gender: item.gender?._id || item.gender || "",
//       season: item.season || "Summer",
//       collectionYear: item.collectionYear || "2026 Collection",
//       occasion: item.occasion || "",
//       lifestyle: item.lifestyle || "",
//       fitType: item.fitType || "Regular",
//       closureType: item.closureType || "",
//       toeShape: item.toeShape || "",
//       shortDescription: item.shortDescription || "",
//       longDescription: item.longDescription || "",
//       costPrice: item.costPrice,
//       landingCost: item.landingCost,
//       mrp: item.mrp,
//       sellingPrice: item.sellingPrice,
//       gstPercentage: item.gstPercentage || 18,
//     });

//     if (item.images?.length > 0) {
//       setImagePreviews(
//         item.images.map((img: string) => `${IMAGE_BASE_URL}${img}`),
//       );
//     } else {
//       setImagePreviews([]);
//     }
//     setShowFormPanel(true);
//   };

//   const handleProductDelete = async (id: string) => {
//     if (!window.confirm("Delete this product and all variants?")) return;
//     try {
//       await catalogAPI.deleteProduct(id);
//       toast.success("Deleted successfully.");
//       await syncUnifiedDashboardContext();
//     } catch (e) {
//       toast.error("Delete failed.");
//     }
//   };

//   const reactSelectControlStyles = (hasErrors: boolean) => ({
//     control: (base: any) => ({
//       ...base,
//       height: "40px",
//       minHeight: "40px",
//       borderRadius: "12px",
//       borderColor: hasErrors ? "#ef4444" : "#e2e8f0",
//       backgroundColor: "#f8fafc",
//       boxShadow: "none",
//       "&:hover": { borderColor: "#cbd5e1" },
//     }),
//   });

//   return (
//     <div className="space-y-6 w-full font-sans text-slate-800 pb-16">
//       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs">
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 bg-[#7f1d1d] rounded-2xl flex items-center justify-center shadow-sm text-white shrink-0">
//             <ShoppingBag size={24} />
//           </div>
//           <div>
//             <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
//               Product Catalog
//             </h1>
//             <p className="text-xs font-medium text-slate-400 mt-0.5">
//               Configure master footwear products, images, costs, and variant
//               matrices.
//             </p>
//           </div>
//         </div>
//         {!showFormPanel && (
//           <button
//             onClick={() => {
//               clearProductFormContext();
//               setShowFormPanel(true);
//             }}
//             className="bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-3xs transition-all shrink-0"
//           >
//             <Plus size={14} /> Add Product
//           </button>
//         )}
//       </div>

//       {showFormPanel && (
//         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs animate-fadeIn relative">
//           <button
//             type="button"
//             onClick={() => setShowFormPanel(false)}
//             className="absolute top-6 right-6 p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
//           >
//             <X size={14} />
//           </button>

//           <div className="flex items-center gap-2 pb-4 mb-4 border-b text-slate-500">
//             <Package size={16} />
//             <h3 className="text-xs font-black uppercase tracking-wider">
//               {editingId
//                 ? "Edit Existing Product"
//                 : "Step 1: Base Product & Financials"}
//             </h3>
//           </div>

//           <form onSubmit={handleProductSubmit} className="space-y-6" noValidate>
//             <div className="space-y-2">
//               <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
//                 Product Images <span className="text-red-600">*</span>
//               </label>
//               <div
//                 className={`w-full border-2 border-dashed rounded-2xl p-6 transition-all ${errors.images ? "border-red-400 bg-red-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer"}`}
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 <div className="flex flex-col items-center justify-center text-center gap-2">
//                   <UploadCloud
//                     size={28}
//                     className={
//                       errors.images ? "text-red-400" : "text-slate-400"
//                     }
//                   />
//                   <p className="text-sm font-bold text-slate-600">
//                     Click to upload product images
//                   </p>
//                   <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
//                     SVG, PNG, JPG or GIF
//                   </p>
//                 </div>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleImageSelection}
//                 />
//               </div>
//               {errors.images && (
//                 <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
//                   <AlertCircle size={10} />
//                   {errors.images}
//                 </span>
//               )}

//               {imagePreviews.length > 0 && (
//                 <div className="flex flex-wrap gap-4 mt-4">
//                   {imagePreviews.map((src, index) => (
//                     <div
//                       key={index}
//                       className="relative w-24 h-24 border border-slate-200 rounded-xl overflow-hidden group shadow-sm bg-white p-1"
//                     >
//                       <img
//                         src={src}
//                         alt="Preview"
//                         className="w-full h-full object-contain"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index)}
//                         className="absolute top-1 right-1 bg-white/90 backdrop-blur text-rose-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
//                       >
//                         <X size={12} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Product Name <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.name}
//                   onChange={(e) =>
//                     handleInputChangeWithReset("name", e.target.value)
//                   }
//                   className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.name ? "border-red-500" : "border-slate-200"}`}
//                 />
//                 {errors.name && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.name}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Product SKU Code <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.sku}
//                   onChange={(e) =>
//                     handleInputChangeWithReset("sku", e.target.value)
//                   }
//                   className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.sku ? "border-red-500" : "border-slate-200"}`}
//                 />
//                 {errors.sku && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.sku}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   HSN Code <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.hsn}
//                   onChange={(e) =>
//                     handleInputChangeWithReset("hsn", e.target.value)
//                   }
//                   className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.hsn ? "border-red-500" : "border-slate-200"}`}
//                 />
//                 {errors.hsn && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.hsn}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   GST Tax Slab <span className="text-red-600">*</span>
//                 </label>
//                 <Select
//                   options={gstOptions}
//                   value={
//                     gstOptions.find((g) => g.value === form.gstPercentage) ||
//                     null
//                   }
//                   onChange={(o: any) =>
//                     handleSelectChangeWithReset("gstPercentage", o)
//                   }
//                   styles={reactSelectControlStyles(!!errors.gstPercentage)}
//                   placeholder="Select GST %"
//                 />
//                 {errors.gstPercentage && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.gstPercentage}
//                   </span>
//                 )}
//               </div>

//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Gender <span className="text-red-600">*</span>
//                 </label>
//                 <Select
//                   options={genders}
//                   value={genders.find((g) => g.value === form.gender) || null}
//                   onChange={(o: any) =>
//                     handleSelectChangeWithReset("gender", o)
//                   }
//                   styles={reactSelectControlStyles(!!errors.gender)}
//                   placeholder="Select Gender"
//                 />
//                 {errors.gender && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.gender}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Brand <span className="text-red-600">*</span>
//                 </label>
//                 <Select
//                   options={brands}
//                   value={brands.find((b) => b.value === form.brandId) || null}
//                   onChange={(o: any) =>
//                     handleSelectChangeWithReset("brandId", o)
//                   }
//                   styles={reactSelectControlStyles(!!errors.brandId)}
//                   placeholder="Select Brand"
//                 />
//                 {errors.brandId && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.brandId}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Category <span className="text-red-600">*</span>
//                 </label>
//                 <Select
//                   options={categories}
//                   value={
//                     categories.find((c) => c.value === form.categoryId) || null
//                   }
//                   onChange={(o: any) =>
//                     handleSelectChangeWithReset("categoryId", o)
//                   }
//                   styles={reactSelectControlStyles(!!errors.categoryId)}
//                   placeholder="Select Category"
//                 />
//                 {errors.categoryId && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.categoryId}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Sub Category <span className="text-red-600">*</span>
//                 </label>
//                 <Select
//                   options={filteredSubCategories}
//                   value={
//                     filteredSubCategories.find(
//                       (s) => s.value === form.subCategoryId,
//                     ) || null
//                   }
//                   onChange={(o: any) =>
//                     handleSelectChangeWithReset("subCategoryId", o)
//                   }
//                   isDisabled={!form.categoryId}
//                   styles={reactSelectControlStyles(!!errors.subCategoryId)}
//                   placeholder="Choose Sub Category"
//                 />
//                 {errors.subCategoryId && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.subCategoryId}
//                   </span>
//                 )}
//               </div>

//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Cost Price <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.costPrice}
//                   onChange={(e) =>
//                     handleInputChangeWithReset("costPrice", e.target.value)
//                   }
//                   className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.costPrice ? "border-red-500" : "border-slate-200"}`}
//                 />
//                 {errors.costPrice && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.costPrice}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Selling Price <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.sellingPrice}
//                   onChange={(e) =>
//                     handleInputChangeWithReset("sellingPrice", e.target.value)
//                   }
//                   className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.sellingPrice ? "border-red-500" : "border-slate-200"}`}
//                 />
//                 {errors.sellingPrice && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.sellingPrice}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Max Retail Price (MRP) <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.mrp}
//                   onChange={(e) =>
//                     handleInputChangeWithReset("mrp", e.target.value)
//                   }
//                   className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.mrp ? "border-red-500" : "border-slate-200"}`}
//                 />
//                 {errors.mrp && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.mrp}
//                   </span>
//                 )}
//               </div>
//               <div>
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Landing Cost <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={form.landingCost}
//                   onChange={(e) =>
//                     handleInputChangeWithReset("landingCost", e.target.value)
//                   }
//                   className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.landingCost ? "border-red-500" : "border-slate-200"}`}
//                 />
//                 {errors.landingCost && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.landingCost}
//                   </span>
//                 )}
//               </div>

//               <div className="lg:col-span-2">
//                 <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
//                   Short Description <span className="text-red-600">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={form.shortDescription}
//                   onChange={(e) =>
//                     handleInputChangeWithReset(
//                       "shortDescription",
//                       e.target.value,
//                     )
//                   }
//                   className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.shortDescription ? "border-red-500" : "border-slate-200"}`}
//                 />
//                 {errors.shortDescription && (
//                   <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                     <AlertCircle size={10} />
//                     {errors.shortDescription}
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="flex flex-col">
//               <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
//                 Long Description <span className="text-red-600">*</span>
//               </label>
//               <textarea
//                 value={form.longDescription}
//                 onChange={(e) =>
//                   handleInputChangeWithReset("longDescription", e.target.value)
//                 }
//                 className={`w-full h-16 p-3 bg-slate-50 border rounded-xl text-sm outline-none resize-none focus:bg-white transition-all ${errors.longDescription ? "border-red-500" : "border-slate-200"}`}
//               />
//               {errors.longDescription && (
//                 <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
//                   <AlertCircle size={10} />
//                   {errors.longDescription}
//                 </span>
//               )}
//             </div>

//             {/* DYNAMIC VARIANT MATRIX WIZARD */}
//             {!editingId && (
//               <div
//                 className={`p-5 border rounded-2xl space-y-4 transition-colors ${errors.variants ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
//               >
//                 <div className="flex justify-between items-center border-b pb-2">
//                   <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 select-none">
//                     Step 2: Variants Matrix Generator
//                   </h4>
//                   <button
//                     type="button"
//                     onClick={runMatrixGenerationWizard}
//                     className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-slate-800 transition-colors shadow-3xs"
//                   >
//                     <RefreshCw size={11} /> Compile Matrix
//                   </button>
//                 </div>
//                 {errors.variants && (
//                   <span className="text-xs font-bold text-red-600 flex items-center gap-1">
//                     <AlertCircle size={14} /> {errors.variants}
//                   </span>
//                 )}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">
//                       1. Select Colors *
//                     </label>
//                     <Select
//                       isMulti
//                       options={colors}
//                       value={wizardColors}
//                       onChange={(o: any) => setWizardColors(o)}
//                       placeholder="Choose Colors"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">
//                       2. Select Sizes *
//                     </label>
//                     <Select
//                       isMulti
//                       options={sizes}
//                       value={wizardSizes}
//                       onChange={(o: any) => setWizardSizes(o)}
//                       placeholder="Choose Sizes"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">
//                       3. Select Materials *
//                     </label>
//                     <Select
//                       isMulti
//                       options={materials}
//                       value={wizardMaterials}
//                       onChange={(o: any) => setWizardMaterials(o)}
//                       placeholder="Choose Materials"
//                     />
//                   </div>
//                 </div>

//                 {wizardMatrix.length > 0 && (
//                   <div className="border border-slate-200 rounded-xl bg-white overflow-hidden max-h-[30vh] overflow-y-auto shadow-3xs mt-2">
//                     <table className="w-full text-left text-xs border-collapse">
//                       <thead>
//                         <tr className="bg-slate-100 border-b text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10">
//                           <th className="p-2.5">Variant Vector Layout</th>
//                           <th className="p-2.5">Variant SKU</th>
//                           <th className="p-2.5 w-24">Cost Price</th>
//                           <th className="p-2.5 w-24">Selling Price</th>
//                           <th className="p-2.5 w-28 text-center">
//                             Initial Stock{" "}
//                             <span className="text-red-600">*</span>
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y font-bold text-slate-700">
//                         {wizardMatrix.map((v, i) => (
//                           <tr
//                             key={i}
//                             className={`hover:bg-slate-50/50 transition-colors ${matrixErrors.includes(i) ? "bg-red-50/40" : ""}`}
//                           >
//                            <td className="p-2.5 text-[10px] uppercase tracking-wider">
//         {v.colorLabel} <span className="text-slate-400">/</span> {v.sizeLabel} <span className="text-slate-400">/</span> {v.materialLabel}
//       </td>
//                             <td className="p-1.5">
//                               <input
//                                 type="text"
//                                 value={v.sku}
//                                 onChange={(e) =>
//                                   editWizardMatrixCell(i, "sku", e.target.value)
//                                 }
//                                 className={`w-full p-1.5 border rounded-md font-mono text-xs uppercase outline-none ${!v.sku ? "border-red-500 bg-red-50" : "border-slate-200 focus:bg-slate-50"}`}
//                               />
//                             </td>
//                             <td className="p-1.5">
//                               <input
//                                 type="number"
//                                 value={v.costPrice}
//                                 onChange={(e) =>
//                                   editWizardMatrixCell(
//                                     i,
//                                     "costPrice",
//                                     Number(e.target.value),
//                                   )
//                                 }
//                                 className={`w-full p-1.5 border rounded-md outline-none ${!v.costPrice ? "border-red-500 bg-red-50" : "border-slate-200 focus:bg-slate-50"}`}
//                               />
//                             </td>
//                             <td className="p-1.5">
//                               <input
//                                 type="number"
//                                 value={v.sellingPrice}
//                                 onChange={(e) =>
//                                   editWizardMatrixCell(
//                                     i,
//                                     "sellingPrice",
//                                     Number(e.target.value),
//                                   )
//                                 }
//                                 className={`w-full p-1.5 border rounded-md outline-none ${!v.sellingPrice ? "border-red-500 bg-red-50" : "border-slate-200 focus:bg-slate-50"}`}
//                               />
//                             </td>
//                             <td className="p-1.5">
//                               <input
//                                 type="number"
//                                 value={v.stockQuantity}
//                                 onChange={(e) =>
//                                   editWizardMatrixCell(
//                                     i,
//                                     "stockQuantity",
//                                     e.target.value,
//                                   )
//                                 }
//                                 placeholder="Qty Required"
//                                 className={`w-full p-1.5 border rounded-md text-center font-black outline-none ${matrixErrors.includes(i) || v.stockQuantity === "" ? "border-red-500 bg-white" : "border-slate-200 bg-amber-50/40 focus:bg-white"}`}
//                               />
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             )}

//             <div className="flex gap-2 border-t pt-6 mt-4">
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white px-8 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-3xs flex items-center justify-center min-w-[200px]"
//               >
//                 {submitting ? (
//                   <Loader2 size={16} className="animate-spin" />
//                 ) : editingId ? (
//                   "Update Product Record"
//                 ) : (
//                   "Save Product & Variants"
//                 )}
//               </button>
//               <button
//                 type="button"
//                 onClick={clearProductFormContext}
//                 className="px-5 h-10 border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 transition-all"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* CATALOG DATA LIST TABLE */}
//       <div className="bg-white rounded-3xl shadow-3xs border border-slate-100 overflow-hidden">
//         <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
//           <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
//             <Table size={20} className="text-slate-400" /> Active Product
//             Registry
//           </h3>
//           <div className="relative w-full sm:w-64">
//             <Search
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//               size={14}
//             />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-slate-300 transition-all font-medium"
//               placeholder="Search catalog..."
//             />
//           </div>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
//                 <th className="py-4 px-6 w-16 text-center">Image</th>
//                 <th
//                   className="py-4 px-6 cursor-pointer hover:bg-slate-50/60"
//                   onClick={() => toggleSort("name")}
//                 >
//                   Product Details
//                 </th>
//                 <th
//                   className="py-4 px-6 cursor-pointer hover:bg-slate-100/60"
//                   onClick={() => toggleSort("sku")}
//                 >
//                   Product SKU
//                 </th>
//                 <th className="py-4 px-6 text-center">Categorization Path</th>
//                 <th className="py-4 px-6 text-right">Selling Price</th>
//                 <th className="py-4 px-6 text-right pr-8 w-44">
//                   Actions Panel
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-sm">
//               {paginatedData.length > 0 ? (
//                 paginatedData.map((item, idx) => (
//                   <tr
//                     key={item._id}
//                     className="hover:bg-slate-50/40 transition-colors group"
//                   >
//                     <td className="py-4 px-6 text-center">
//                       <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden mx-auto">
//                         {item.images && item.images.length > 0 ? (
//                           <img
//                             src={`${IMAGE_BASE_URL}${item.images[0]}`}
//                             alt="product"
//                             className="w-full h-full object-contain"
//                           />
//                         ) : (
//                           <ImageIcon size={16} className="text-slate-300" />
//                         )}
//                       </div>
//                     </td>
//                     <td className="py-4 px-6">
//                       <div>
//                         <span className="font-black text-slate-800 tracking-tight text-sm block">
//                           {item.name}
//                         </span>
//                         <span className="text-[10px] font-black uppercase tracking-wider text-red-800 block mt-0.5">
//                           {item.brandId?.name}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">
//                       {item.sku}
//                     </td>
//                     <td className="py-4 px-6 text-center">
//                       <div className="inline-flex flex-col gap-0.5">
//                         <span className="px-2 py-0.5 bg-slate-100 border text-[10px] font-bold rounded-md uppercase text-slate-600 tracking-wide">
//                           {item.categoryId?.name}
//                         </span>
//                         <span className="text-[9px] font-mono text-slate-400">
//                           {item.subCategoryId?.name}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="py-4 px-6 text-right font-mono font-black text-slate-900">
//                       ₹{item.sellingPrice}
//                     </td>
//                     <td className="py-4 px-6 text-right space-x-1.5 pr-8">
//                       <button
//                         type="button"
//                         onClick={() => startProductModificationLifecycle(item)}
//                         className="p-2 border border-slate-200 text-slate-400 hover:text-slate-800 bg-white rounded-xl shadow-3xs transition-all"
//                       >
//                         <Edit2 size={12} />
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => handleProductDelete(item._id)}
//                         className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 bg-white rounded-xl shadow-3xs transition-all"
//                       >
//                         <Trash2 size={12} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={6}
//                     className="py-16 text-center text-xs font-mono text-slate-400"
//                   >
//                     No active products match search definitions criteria.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         {totalPages > 1 && (
//           <Pagination
//             page={page}
//             totalPages={totalPages}
//             itemsPerPage={itemsPerPage}
//             setPage={setPage}
//             setItemsPerPage={setItemsPerPage}
//             pageNumbers={pageNumbers}
//             hasPrev={hasPrev}
//             hasNext={hasNext}
//           />
//         )}
//       </div>
//     </div>
//   );
// };



import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { catalogAPI, masterAPI, IMAGE_BASE_URL } from "../services/api";
import { useTable } from "../hooks/useTable";
import { Pagination } from "../components/Pagination";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  Table,
  X,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export const ProductManagement: React.FC = () => {
  const [showFormPanel, setShowFormPanel] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Structural Dropdowns Options
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([]);

  // Master Attribute Dropdowns Options
  const [genders, setGenders] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  // Image Core Management State Layers
  const [existingImages, setExistingImages] = useState<string[]>([]); 
  const [selectedImages, setSelectedImages] = useState<File[]>([]);   
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);   
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variant Wizard Allocation Layout Grid
  const [wizardColors, setWizardColors] = useState<any[]>([]);
  const [wizardSizes, setWizardSizes] = useState<any[]>([]);
  const [wizardMaterials, setWizardMaterials] = useState<any[]>([]);
  const [wizardMatrix, setWizardMatrix] = useState<any[]>([]);

  const defaultForm = {
    name: "",
    sku: "",
    hsn: "",
    brandId: "",
    categoryId: "",
    subCategoryId: "",
    gender: "",
    season: "Summer",
    collectionYear: "2026 Collection",
    occasion: "Casual",
    lifestyle: "Standard",
    fitType: "Regular",
    closureType: "Lace Up",
    toeShape: "Round Toe",
    shortDescription: "",
    longDescription: "",
    costPrice: "",
    landingCost: "",
    mrp: "",
    sellingPrice: "",
    gstPercentage: 18,
  };

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [matrixErrors, setMatrixErrors] = useState<number[]>([]);

  const gstOptions = [
    { value: 0, label: "0% GST" },
    { value: 5, label: "5% GST" },
    { value: 12, label: "12% GST" },
    { value: 18, label: "18% GST" },
    { value: 28, label: "28% GST" },
  ];

  const {
    paginatedData,
    page,
    totalPages,
    search,
    itemsPerPage,
    setSearch,
    setPage,
    setItemsPerPage,
    pageNumbers,
    hasNext,
    hasPrev,
    toggleSort,
  } = useTable(products, {
    itemsPerPage: 10,
    searchableFields: ["name", "sku"],
  });

  useEffect(() => {
    syncUnifiedDashboardContext();
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      const matches = subCategories.filter((sub) => sub.categoryId === form.categoryId);
      setFilteredSubCategories(matches.map((s) => ({ value: s._id, label: s.name })));
      if (!matches.some((m) => m._id === form.subCategoryId)) {
        setForm((prev) => ({ ...prev, subCategoryId: "" }));
      }
    } else {
      setFilteredSubCategories([]);
    }
  }, [form.categoryId, subCategories]);

  const syncUnifiedDashboardContext = async () => {
    try {
      setLoading(true);
      const [prodRes, brandRes, catRes, subRes, attrTypeRes, attrRes] = await Promise.all([
        catalogAPI.getProducts(),
        masterAPI.brand.getAll(),
        masterAPI.category.getAll(),
        masterAPI.subCategory.getAll(),
        masterAPI.attributeType.getAll(),
        masterAPI.globalAttribute.getAll(),
      ]);

      setProducts(prodRes.data?.data || []);
      setBrands((brandRes.data?.data || []).map((b: any) => ({ value: b._id, label: b.name })));
      setCategories((catRes.data?.data || []).map((c: any) => ({ value: c._id, label: c.name })));
      setSubCategories(subRes.data?.data || []);

      const rawTypes = attrTypeRes.data?.data || [];
      const rawAttributes = attrRes.data?.data || [];

      const getAttrsByType = (typeName: string) => {
        const type = rawTypes.find((t: any) => t.name.toLowerCase() === typeName.toLowerCase());
        if (!type) return [];
        return rawAttributes
          .filter((a: any) => a.attributeTypeId === type._id || a.attributeTypeId?._id === type._id)
          .map((x: any) => ({ value: x._id, label: x.name }));
      };

      setGenders(getAttrsByType("Gender"));
      setColors(getAttrsByType("Color"));
      setSizes(getAttrsByType("Size"));
      setMaterials(getAttrsByType("Material"));
    } catch (e) {
      toast.error("Error synchronizing master data.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
    if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImages.length;
      setSelectedImages((prev) => prev.filter((_, i) => i !== fileIndex));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChangeWithReset = (fieldNameKey: string, textStringValue: string | number) => {
    if (errors[fieldNameKey]) setErrors((prev) => ({ ...prev, [fieldNameKey]: "" }));
    setForm((prev) => ({ ...prev, [fieldNameKey]: textStringValue }));
  };

  const handleSelectChangeWithReset = (fieldNameKey: string, chosenOptionElement: any) => {
    if (errors[fieldNameKey]) setErrors((prev) => ({ ...prev, [fieldNameKey]: "" }));
    setForm((prev) => ({
      ...prev,
      [fieldNameKey]: chosenOptionElement ? chosenOptionElement.value : "",
    }));
  };

  const validateProductForm = () => {
    let local: Record<string, string> = {};
    let matrixErrIndices: number[] = [];

    if (!form.name.trim()) local.name = "Product Name is required.";
    if (!form.sku.trim()) local.sku = "Product SKU code is required.";
    if (!form.hsn.trim()) local.hsn = "HSN Code is required.";
    if (!form.brandId) local.brandId = "Brand is required.";
    if (!form.categoryId) local.categoryId = "Category is required.";
    if (!form.subCategoryId) local.subCategoryId = "Sub Category is required.";
    if (!form.gender) local.gender = "Gender is required.";
    if (form.gstPercentage === null || form.gstPercentage === undefined) local.gstPercentage = "GST Tax Slab is required.";
    if (!form.costPrice || Number(form.costPrice) <= 0) local.costPrice = "Cost Price is required.";
    if (!form.mrp || Number(form.mrp) <= 0) local.mrp = "MRP is required.";
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) local.sellingPrice = "Selling Price is required.";
    if (!form.landingCost || Number(form.landingCost) <= 0) local.landingCost = "Landing Cost is required.";
    if (!form.shortDescription.trim()) local.shortDescription = "Short Description is required.";
    if (!form.longDescription.trim()) local.longDescription = "Long Description is required.";

    if (Number(form.sellingPrice) > Number(form.mrp)) {
      local.sellingPrice = "Selling Price cannot exceed MRP.";
    }

    if (existingImages.length === 0 && selectedImages.length === 0) {
      local.images = "At least one product image is required.";
    }

    if (wizardMatrix.length === 0) {
      local.variants = "You must generate and fill at least one variant configuration row item.";
    } else {
      wizardMatrix.forEach((v, idx) => {
        if (!v.sku || !v.costPrice || !v.sellingPrice || v.stockQuantity === "" || v.stockQuantity === null) {
          matrixErrIndices.push(idx);
        }
      });
      if (matrixErrIndices.length > 0) {
        local.variants = "Please fill out all Stock and Price fields in the highlighted Matrix rows.";
      }
    }

    const baseSku = (form.sku || "").toUpperCase().trim();
    if (!editingId) {
      const duplicateVariant = wizardMatrix.some(v => v.sku.toUpperCase().trim() === baseSku);
      if (duplicateVariant) {
        local.variants = "Variant SKU cannot be same as base product SKU.";
      }
    }

    setErrors(local);
    setMatrixErrors(matrixErrIndices);
    return Object.keys(local).length === 0;
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProductForm()) {
      toast.error("Please resolve the highlighted validation errors.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key as keyof typeof form] !== undefined && form[key as keyof typeof form] !== "") {
          payload.append(key, String(form[key as keyof typeof form]));
        }
      });

      payload.append("retainedImages", JSON.stringify(existingImages));
      selectedImages.forEach((file) => payload.append("images", file));
      payload.append("variants", JSON.stringify(wizardMatrix));

      if (editingId) {
        await catalogAPI.updateProduct(editingId, payload);
        toast.success("Product and variation maps sync saved cleanly.");
      } else {
        await catalogAPI.createProduct(payload);
        toast.success("Product and Variants created successfully.");
      }

      clearProductFormContext();
      await syncUnifiedDashboardContext();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error submitting product.");
    } finally {
      setSubmitting(false);
    }
  };

  const clearProductFormContext = () => {
    setForm(defaultForm);
    setEditingId(null);
    setErrors({});
    setMatrixErrors([]);
    setWizardMatrix([]);
    setWizardColors([]);
    setWizardSizes([]);
    setWizardMaterials([]);
    setSelectedImages([]);
    setExistingImages([]);
    setImagePreviews([]);
    setShowFormPanel(false);
  };

  const runMatrixGenerationWizard = () => {
    if (wizardColors.length === 0 || wizardSizes.length === 0 || wizardMaterials.length === 0) {
      setErrors((prev) => ({
        ...prev,
        variants: "Please select at least one Color, Size, and Material.",
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, variants: "" }));

    const configurationsGrid: any[] = [];
    wizardColors.forEach((color) => {
      wizardSizes.forEach((size) => {
        wizardMaterials.forEach((material) => {
          const blockSku = `${form.sku || "SKU"}-${color.label}-${size.label}-${material.label}`
            .toUpperCase()
            .replace(/\s+/g, "");

          configurationsGrid.push({
            colorId: color.value,
            colorLabel: color.label,
            sizeId: size.value,
            sizeLabel: size.label,
            materialId: material.value,
            materialLabel: material.label,
            sku: blockSku,
            barcode: `BAR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            costPrice: form.costPrice || "",
            mrp: form.mrp || "",
            sellingPrice: form.sellingPrice || "",
            stockQuantity: "",
          });
        });
      });
    });

    setWizardMatrix(configurationsGrid);
    setMatrixErrors([]);
  };

  const editWizardMatrixCell = (idx: number, objectFieldKey: string, updatedTextValue: any) => {
    const updatedGrid = [...wizardMatrix];
    updatedGrid[idx][objectFieldKey] = updatedTextValue;
    setWizardMatrix(updatedGrid);

    if (matrixErrors.includes(idx)) {
      setMatrixErrors((prev) => prev.filter((e) => e !== idx));
    }
    if (errors.variants) setErrors((prev) => ({ ...prev, variants: "" }));
  };

  const startProductModificationLifecycle = async (item: any) => {
    try {
      setErrors({});
      setMatrixErrors([]);
      setEditingId(item._id);

      setForm({
        name: item.name,
        sku: item.sku,
        hsn: item.hsn || "",
        brandId: item.brandId?._id || item.brandId || "",
        categoryId: item.categoryId?._id || item.categoryId || "",
        subCategoryId: item.subCategoryId?._id || item.subCategoryId || "",
        gender: item.gender?._id || item.gender || "",
        season: item.season || "Summer",
        collectionYear: item.collectionYear || "2026 Collection",
        occasion: item.occasion || "",
        lifestyle: item.lifestyle || "",
        fitType: item.fitType || "Regular",
        closureType: item.closureType || "",
        toeShape: item.toeShape || "",
        shortDescription: item.shortDescription || "",
        longDescription: item.longDescription || "",
        costPrice: item.costPrice,
        landingCost: item.landingCost,
        mrp: item.mrp,
        sellingPrice: item.sellingPrice,
        gstPercentage: item.gstPercentage || 18,
      });

      if (item.images?.length > 0) {
        setExistingImages(item.images);
        setImagePreviews(item.images.map((img: string) => `${IMAGE_BASE_URL}${img}`));
      } else {
        setExistingImages([]);
        setImagePreviews([]);
      }
      setSelectedImages([]);

      // Fetch dynamic active variations tied directly to this target profile
      const res = await catalogAPI.getVariantsByProductId(item._id);
      const parsedVariants = (res.data?.data || []).map((v: any) => ({
        _id: v._id,
        colorId: v.colorId?._id || v.colorId,
        colorLabel: v.colorId?.name || "Matrix Color",
        sizeId: v.sizeId?._id || v.sizeId,
        sizeLabel: v.sizeId?.name || "Size Setup",
        materialId: v.materialId?._id || v.materialId,
        materialLabel: v.materialId?.name || "Material",
        sku: v.sku,
        barcode: v.barcode,
        costPrice: v.costPrice,
        mrp: v.mrp,
        sellingPrice: v.sellingPrice,
        stockQuantity: v.stockQuantity,
      }));

      setWizardMatrix(parsedVariants);
      setShowFormPanel(true);
    } catch (e) {
      toast.error("Failed loading internal system sub-variant specifications matrix layout.");
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!window.confirm("Delete this product and all variants?")) return;
    try {
      await catalogAPI.deleteProduct(id);
      toast.success("Deleted successfully.");
      await syncUnifiedDashboardContext();
    } catch (e) {
      toast.error("Delete failed.");
    }
  };

  const reactSelectControlStyles = (hasErrors: boolean) => ({
    control: (base: any) => ({
      ...base,
      height: "40px",
      minHeight: "40px",
      borderRadius: "12px",
      borderColor: hasErrors ? "#ef4444" : "#e2e8f0",
      backgroundColor: "#f8fafc",
      boxShadow: "none",
      "&:hover": { borderColor: "#cbd5e1" },
    }),
  });

  return (
    <div className="space-y-6 w-full font-sans text-slate-800 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#7f1d1d] rounded-2xl flex items-center justify-center shadow-sm text-white shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Product Catalog</h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Configure master footwear products, images, costs, and variant matrices.</p>
          </div>
        </div>
        {!showFormPanel && (
          <button
            onClick={() => {
              clearProductFormContext();
              setShowFormPanel(true);
            }}
            className="bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-3xs transition-all shrink-0"
          >
            <Plus size={14} /> Add Product
          </button>
        )}
      </div>

      {showFormPanel && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs animate-fadeIn relative">
          <button
            type="button"
            onClick={() => setShowFormPanel(false)}
            className="absolute top-6 right-6 p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <X size={14} />
          </button>

          <div className="flex items-center gap-2 pb-4 mb-4 border-b text-slate-500">
            <Package size={16} />
            <h3 className="text-xs font-black uppercase tracking-wider">
              {editingId ? "Edit Existing Product Matrix Overview" : "Step 1: Base Product & Financials"}
            </h3>
          </div>

          <form onSubmit={handleProductSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                Product Images <span className="text-red-600">*</span>
              </label>
              <div
                className={`w-full border-2 border-dashed rounded-2xl p-6 transition-all ${errors.images ? "border-red-400 bg-red-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <UploadCloud size={28} className={errors.images ? "text-red-400" : "text-slate-400"} />
                  <p className="text-sm font-bold text-slate-600">Click to upload product images</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">SVG, PNG, JPG or GIF</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelection} />
              </div>
              {errors.images && (
                <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.images}
                </span>
              )}

              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative w-24 h-24 border border-slate-200 rounded-xl overflow-hidden group shadow-sm bg-white p-1" >
                      <img src={src} alt="Preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white/90 backdrop-blur text-rose-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => handleInputChangeWithReset("name", e.target.value)} className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.name ? "border-red-500" : "border-slate-200"}`} />
                {errors.name && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.name}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Product SKU Code *</label>
                <input type="text" value={form.sku} onChange={(e) => handleInputChangeWithReset("sku", e.target.value)} className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.sku ? "border-red-500" : "border-slate-200"}`} />
                {errors.sku && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.sku}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">HSN Code *</label>
                <input type="text" value={form.hsn} onChange={(e) => handleInputChangeWithReset("hsn", e.target.value)} className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.hsn ? "border-red-500" : "border-slate-200"}`} />
                {errors.hsn && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.hsn}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">GST Tax Slab *</label>
                <Select options={gstOptions} value={gstOptions.find((g) => g.value === form.gstPercentage) || null} onChange={(o: any) => handleSelectChangeWithReset("gstPercentage", o)} styles={reactSelectControlStyles(!!errors.gstPercentage)} placeholder="Select GST %" />
                {errors.gstPercentage && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.gstPercentage}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Gender *</label>
                <Select options={genders} value={genders.find((g) => g.value === form.gender) || null} onChange={(o: any) => handleSelectChangeWithReset("gender", o)} styles={reactSelectControlStyles(!!errors.gender)} placeholder="Select Gender" />
                {errors.gender && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.gender}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Brand *</label>
                <Select options={brands} value={brands.find((b) => b.value === form.brandId) || null} onChange={(o: any) => handleSelectChangeWithReset("brandId", o)} styles={reactSelectControlStyles(!!errors.brandId)} placeholder="Select Brand" />
                {errors.brandId && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.brandId}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Category *</label>
                <Select options={categories} value={categories.find((c) => c.value === form.categoryId) || null} onChange={(o: any) => handleSelectChangeWithReset("categoryId", o)} styles={reactSelectControlStyles(!!errors.categoryId)} placeholder="Select Category" />
                {errors.categoryId && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.categoryId}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Sub Category *</label>
                <Select options={filteredSubCategories} value={filteredSubCategories.find((s) => s.value === form.subCategoryId) || null} onChange={(o: any) => handleSelectChangeWithReset("subCategoryId", o)} isDisabled={!form.categoryId} styles={reactSelectControlStyles(!!errors.subCategoryId)} placeholder="Choose Sub Category" />
                {errors.subCategoryId && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.subCategoryId}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Cost Price *</label>
                <input type="number" value={form.costPrice} onChange={(e) => handleInputChangeWithReset("costPrice", e.target.value)} className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.costPrice ? "border-red-500" : "border-slate-200"}`} />
                {errors.costPrice && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.costPrice}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Selling Price *</label>
                <input type="number" value={form.sellingPrice} onChange={(e) => handleInputChangeWithReset("sellingPrice", e.target.value)} className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.sellingPrice ? "border-red-500" : "border-slate-200"}`} />
                {errors.sellingPrice && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.sellingPrice}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Max Retail Price (MRP) *</label>
                <input type="number" value={form.mrp} onChange={(e) => handleInputChangeWithReset("mrp", e.target.value)} className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.mrp ? "border-red-500" : "border-slate-200"}`} />
                {errors.mrp && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.mrp}</span>}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Landing Cost *</label>
                <input type="number" value={form.landingCost} onChange={(e) => handleInputChangeWithReset("landingCost", e.target.value)} className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.landingCost ? "border-red-500" : "border-slate-200"}`} />
                {errors.landingCost && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.landingCost}</span>}
              </div>
              <div className="lg:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Short Description *</label>
                <input type="text" value={form.shortDescription} onChange={(e) => handleInputChangeWithReset("shortDescription", e.target.value)} className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.shortDescription ? "border-red-500" : "border-slate-200"}`} />
                {errors.shortDescription && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.shortDescription}</span>}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Long Description *</label>
              <textarea value={form.longDescription} onChange={(e) => handleInputChangeWithReset("longDescription", e.target.value)} className={`w-full h-16 p-3 bg-slate-50 border rounded-xl text-sm outline-none resize-none focus:bg-white transition-all ${errors.longDescription ? "border-red-500" : "border-slate-200"}`} />
              {errors.longDescription && <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1"><AlertCircle size={10} /> {errors.longDescription}</span>}
            </div>

            {/* VARIANT CONFIGURATION PANEL */}
            <div className={`p-5 border rounded-2xl space-y-4 transition-colors ${errors.variants ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 select-none">
                  {editingId ? "Step 2: Manage Active Variants Matrix Inventory" : "Step 2: Variants Matrix Generator"}
                </h4>
                {!editingId && (
                  <button type="button" onClick={runMatrixGenerationWizard} className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-slate-800 transition-colors shadow-3xs">
                    <RefreshCw size={11} /> Compile Matrix
                  </button>
                )}
              </div>
              {errors.variants && (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.variants}
                </span>
              )}
              
              {!editingId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">1. Select Colors *</label>
                    <Select isMulti options={colors} value={wizardColors} onChange={(o: any) => setWizardColors(o)} placeholder="Choose Colors" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">2. Select Sizes *</label>
                    <Select isMulti options={sizes} value={wizardSizes} onChange={(o: any) => setWizardSizes(o)} placeholder="Choose Sizes" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">3. Select Materials *</label>
                    <Select isMulti options={materials} value={wizardMaterials} onChange={(o: any) => setWizardMaterials(o)} placeholder="Choose Materials" />
                  </div>
                </div>
              )}

              {wizardMatrix.length > 0 && (
                <div className="border border-slate-200 rounded-xl bg-white overflow-hidden max-h-[30vh] overflow-y-auto shadow-3xs mt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-[9px] font-black text-slate-400 uppercase tracking-widest sticky top-0 z-10">
                        <th className="p-2.5">Variant Vector Layout</th>
                        <th className="p-2.5">Variant SKU</th>
                        <th className="p-2.5 w-24">Cost Price</th>
                        <th className="p-2.5 w-24">Selling Price</th>
                        <th className="p-2.5 w-28 text-center">Initial Stock <span className="text-red-600">*</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-bold text-slate-700">
                      {wizardMatrix.map((v, i) => (
                        <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${matrixErrors.includes(i) ? "bg-red-50/40" : ""}`}>
                          <td className="p-2.5 text-[10px] uppercase tracking-wider">
                            {v.colorLabel} <span className="text-slate-400">/</span> {v.sizeLabel} <span className="text-slate-400">/</span> {v.materialLabel}
                          </td>
                          <td className="p-1.5">
                            <input type="text" value={v.sku} onChange={(e) => editWizardMatrixCell(i, "sku", e.target.value)} className={`w-full p-1.5 border rounded-md font-mono text-xs uppercase outline-none ${!v.sku ? "border-red-500 bg-red-50" : "border-slate-200 focus:bg-slate-50"}`} />
                          </td>
                          <td className="p-1.5">
                            <input type="number" value={v.costPrice} onChange={(e) => editWizardMatrixCell(i, "costPrice", Number(e.target.value))} className={`w-full p-1.5 border rounded-md outline-none ${!v.costPrice ? "border-red-500 bg-red-50" : "border-slate-200 focus:bg-slate-50"}`} />
                          </td>
                          <td className="p-1.5">
                            <input type="number" value={v.sellingPrice} onChange={(e) => editWizardMatrixCell(i, "sellingPrice", Number(e.target.value))} className={`w-full p-1.5 border rounded-md outline-none ${!v.sellingPrice ? "border-red-500 bg-red-50" : "border-slate-200 focus:bg-slate-50"}`} />
                          </td>
                          <td className="p-1.5">
                            <input type="number" value={v.stockQuantity} onChange={(e) => editWizardMatrixCell(i, "stockQuantity", e.target.value)} placeholder="Qty Required" className={`w-full p-1.5 border rounded-md text-center font-black outline-none ${matrixErrors.includes(i) || v.stockQuantity === "" ? "border-red-500 bg-white" : "border-slate-200 bg-amber-50/40 focus:bg-white"}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t pt-6 mt-4">
              <button type="submit" disabled={submitting} className="bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white px-8 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-3xs flex items-center justify-center min-w-[200px]">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : editingId ? "Update Product Record" : "Save Product & Variants"}
              </button>
              <button type="button" onClick={clearProductFormContext} className="px-5 h-10 border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* CATALOG DATA LIST TABLE */}
      <div className="bg-white rounded-3xl shadow-3xs border border-slate-100 overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
            <Table size={20} className="text-slate-400" /> Active Product Registry
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-slate-300 transition-all font-medium" placeholder="Search catalog..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                <th className="py-4 px-6 w-16 text-center">Image</th>
                <th className="py-4 px-6 cursor-pointer hover:bg-slate-50/60" onClick={() => toggleSort("name")}>Product Details</th>
                <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/60" onClick={() => toggleSort("sku")}>Product SKU</th>
                <th className="py-4 px-6 text-center">Categorization Path</th>
                <th className="py-4 px-6 text-right">Selling Price</th>
                <th className="py-4 px-6 text-right pr-8 w-44">Actions Panel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="py-4 px-6 text-center">
                      <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden mx-auto">
                        {item.images && item.images.length > 0 ? (
                          <img src={`${IMAGE_BASE_URL}${item.images[0]}`} alt="product" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon size={16} className="text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-black text-slate-800 tracking-tight text-sm block">{item.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-800 block mt-0.5">{item.brandId?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">{item.sku}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex flex-col gap-0.5">
                        <span className="px-2 py-0.5 bg-slate-100 border text-[10px] font-bold rounded-md uppercase text-slate-600 tracking-wide">{item.categoryId?.name}</span>
                        <span className="text-[9px] font-mono text-slate-400">{item.subCategoryId?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-black text-slate-900">₹{item.sellingPrice}</td>
                    <td className="py-4 px-6 text-right space-x-1.5 pr-8">
                      <button type="button" onClick={() => startProductModificationLifecycle(item)} className="p-2 border border-slate-200 text-slate-400 hover:text-slate-800 bg-white rounded-xl shadow-3xs transition-all"><Edit2 size={12} /></button>
                      <button type="button" onClick={() => handleProductDelete(item._id)} className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 bg-white rounded-xl shadow-3xs transition-all"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs font-mono text-slate-400">
                    No active products match search definitions criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} itemsPerPage={itemsPerPage} setPage={setPage} setItemsPerPage={setItemsPerPage} pageNumbers={pageNumbers} hasPrev={hasPrev} hasNext={hasNext} />
        )}
      </div>
    </div>
  );
};