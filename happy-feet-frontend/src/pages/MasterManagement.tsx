// import React, { useState, useEffect, useRef } from "react";
// import Select from "react-select";
// import { masterAPI, IMAGE_BASE_URL } from "../services/api";
// import {
//   Layers,
//   Edit2,
//   Trash2,
//   Loader2,
//   Search,
//   Table,
//   Plus,
//   Image as ImageIcon,
//   AlertCircle,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import { useTable } from "../hooks/useTable";
// import { Pagination } from "../components/Pagination";

// const MASTER_CONFIG: Record<string, any> = {
//   store: {
//     title: "Stores",
//     api: masterAPI.store,
//     fields: [
//       { key: "name", label: "Store Name", type: "text", required: true },
//       { key: "code", label: "Store Code", type: "text", required: true },
//       { key: "city", label: "City", type: "text" },
//       { key: "area", label: "Area", type: "text" },
//     ],
//   },
//   category: {
//     title: "Categories",
//     api: masterAPI.category,
//     fields: [
//       {
//         key: "name",
//         label: "Category Name",
//         type: "text",
//         required: true,
//       },
//       {
//         key: "image",
//         label: "Category Banner",
//         type: "file",
//         accept: "image/*",
//         required: true,
//       },
//     ],
//   },
//   subCategory: {
//     title: "Sub Categories",
//     api: masterAPI.subCategory,
//     fields: [
//       {
//         key: "categoryId",
//         label: "Parent Category",
//         type: "select",
//         fetchFrom: "category",
//         required: true,
//       },
//       { key: "name", label: "Sub Category Name", type: "text", required: true },
//     ],
//   },
//   attributeType: {
//     title: "Attribute Types",
//     api: masterAPI.attributeType,
//     fields: [
//       {
//         key: "name",
//         label: "Type Name (e.g., Color, Size)",
//         type: "text",
//         required: true,
//       },
//       { key: "description", label: "Description", type: "text" },
//     ],
//   },
//   globalAttributes: {
//     title: "Global Attributes",
//     api: masterAPI.globalAttribute,
//     fields: [
//       {
//         key: "attributeTypeId",
//         label: "Attribute Type",
//         type: "select",
//         fetchFrom: "attributeType",
//         required: true,
//       },
//       {
//         key: "name",
//         label: "Value Name (e.g., Red, XL)",
//         type: "text",
//         required: true,
//       },
//       { key: "value", label: "Value Data (e.g., Hex Code)", type: "text" },
//     ],
//   },
//   brand: {
//     title: "Brands",
//     api: masterAPI.brand,
//     fields: [
//       { key: "name", label: "Brand Name", type: "text", required: true },
//       {
//         key: "logo",
//         label: "Brand Logo",
//         type: "file",
//         accept: "image/*",
//         required: true,
//       },
//     ],
//   },
//   banner: {
//     title: "Banners",
//     api: masterAPI.banner,
//     fields: [
//       { key: "title", label: "Banner Title", type: "text", required: true },
//       {
//         key: "image",
//         label: "Desktop Image",
//         type: "file",
//         accept: "image/*",
//         required: true,
//       },
//       {
//         key: "mobileImage",
//         label: "Mobile Image",
//         type: "file",
//         accept: "image/*",
//         required: true,
//       },
//     ],
//   },
// };

// export const MasterManagement: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<string>("store");
//   const [dataList, setDataList] = useState<any[]>([]);
//   const [dropdownData, setDropdownData] = useState<Record<string, any[]>>({});
//   const [formData, setFormData] = useState<any>({});
//   const [previews, setPreviews] = useState<any>({});
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});
//   const fileRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
//   const {
//     paginatedData,
//     filteredCount,
//     page,
//     totalPages,
//     itemsPerPage,
//     search,
//     setPage,
//     setSearch,
//     setItemsPerPage,
//     pageNumbers,
//     hasPrev,
//     hasNext,
//   } = useTable(dataList, {
//     itemsPerPage: 10,
//   });
//   const config = MASTER_CONFIG[activeTab];

//   useEffect(() => {
//     fetchData();
//     fetchDropdowns();
//     resetForm();
//       setPage(1);
//   }, [activeTab]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const res = await config.api.getAll();
//       setDataList(res.data?.data || []);
//     } catch (e) {
//       toast.error("Failed to load data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDropdowns = async () => {
//     for (let f of config.fields) {
//       if (f.type === "select" && f.fetchFrom) {
//         try {
//           const res = await MASTER_CONFIG[f.fetchFrom].api.getAll();
//           // Format for react-select: { value, label }
//           const options = res.data.data.map((item: any) => ({
//             value: item._id,
//             label: item.name,
//           }));
//           setDropdownData((prev) => ({ ...prev, [f.fetchFrom]: options }));
//         } catch (e) {
//           console.error("Dropdown error");
//         }
//       }
//     }
//   };

//   const resetForm = () => {
//     setFormData({});
//     setPreviews({});
//     setEditingId(null);
//     setFormErrors({});
//     Object.values(fileRefs.current).forEach((el) => {
//       if (el) el.value = "";
//     });
//   };

//   // Standard inputs and files
//   const handleInputChange = (e: any) => {
//     const { name, type, files, value } = e.target;

//     if (formErrors[name]) {
//       setFormErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }

//     if (type === "file" && files?.length) {
//       const file = files[0];

//       const allowedTypes = [
//         "image/jpeg",
//         "image/jpg",
//         "image/png",
//         "image/webp",
//       ];

//       if (!allowedTypes.includes(file.type)) {
//         toast.error("Only JPG, JPEG, PNG and WEBP images are allowed");

//         e.target.value = "";

//         return;
//       }

//       if (file.size > 2 * 1024 * 1024) {
//         toast.error("Image size must be less than 2 MB");

//         e.target.value = "";

//         return;
//       }

//       setFormData((prev: any) => ({
//         ...prev,
//         [name]: file,
//       }));

//       setPreviews((prev: any) => ({
//         ...prev,
//         [name]: URL.createObjectURL(file),
//       }));

//       return;
//     }

//     setFormData((prev: any) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // React-Select handler
//   const handleSelectChange = (selectedOption: any, actionMeta: any) => {
//     const { name } = actionMeta;
//     if (formErrors[name]) setFormErrors({ ...formErrors, [name]: "" });
//     setFormData({
//       ...formData,
//       [name]: selectedOption ? selectedOption.value : "",
//     });
//   };

//   //   const validateForm = () => {
//   //     const errors: Record<string, string> = {};
//   //     let isValid = true;

//   //     config.fields.forEach((f: any) => {
//   //       if (f.required && (!formData[f.key] || formData[f.key].toString().trim() === "")) {
//   //         errors[f.key] = `${f.label} is required`;
//   //         isValid = false;
//   //       }
//   //     });

//   //     setFormErrors(errors);
//   //     return isValid;
//   //   };

//   const validateForm = () => {
//     const errors: Record<string, string> = {};
//     let isValid = true;

//     config.fields.forEach((f: any) => {
//       // Required validation
//       if (f.required) {
//         // File Validation
//         if (f.type === "file") {
//           const existingImage =
//             editingId && formData[f.key] && !(formData[f.key] instanceof File);

//           const newImage = formData[f.key] instanceof File;

//           if (!existingImage && !newImage) {
//             errors[f.key] = `${f.label} is required`;
//             isValid = false;
//           }
//         }

//         // Normal Validation
//         else if (!formData[f.key] || formData[f.key].toString().trim() === "") {
//           errors[f.key] = `${f.label} is required`;
//           isValid = false;
//         }
//       }

//       // File Type Validation
//       if (formData[f.key] instanceof File) {
//         const file = formData[f.key];

//         const allowedTypes = [
//           "image/jpeg",
//           "image/jpg",
//           "image/png",
//           "image/webp",
//         ];

//         if (!allowedTypes.includes(file.type)) {
//           errors[f.key] = "Only JPG, JPEG, PNG and WEBP images are allowed";
//           isValid = false;
//         }

//         // 2 MB Limit
//         if (file.size > 2 * 1024 * 1024) {
//           errors[f.key] = "Image size must be less than 2 MB";
//           isValid = false;
//         }
//       }
//     });

//     setFormErrors(errors);
//     return isValid;
//   };
//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       toast.error("Please fill in all required fields.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const hasFiles = Object.values(formData).some((v) => v instanceof File);
//       let payload = formData;

//       if (hasFiles) {
//         payload = new FormData();
//         Object.keys(formData).forEach((key) => {
//           if (formData[key] !== undefined && formData[key] !== null) {
//             payload.append(key, formData[key]);
//           }
//         });
//       }

//       if (editingId) {
//         await config.api.update(editingId, payload);
//         toast.success(`${config.title} updated`);
//       } else {
//         await config.api.create(payload);
//         toast.success(`${config.title} created`);
//       }
//       resetForm();
//       await fetchData();
//     } catch (e: any) {
//       toast.error(e.response?.data?.message || "Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startEdit = (item: any) => {
//     setEditingId(item._id);
//     setFormErrors({});
//     setFormData(item);
//     const existingPreviews: any = {};
//     config.fields.forEach((f: any) => {
//       if (f.type === "file" && item[f.key])
//         existingPreviews[f.key] = `${IMAGE_BASE_URL}${item[f.key]}`;
//     });
//     setPreviews(existingPreviews);
//   };

//   const handleDelete = async (id: string) => {
//     if (!window.confirm("Delete record permanently?")) return;
//     setLoading(true);
//     try {
//       await config.api.delete(id);
//       toast.success("Deleted successfully");
//       await fetchData();
//     } catch (e) {
//       toast.error("Delete failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6 w-full font-sans text-slate-800">
//       {/* HEADER & TABS */}
//       <div className="bg-white p-6 rounded-3xl shadow-3xs border border-slate-100 space-y-6">
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 bg-[#7f1d1d] rounded-2xl flex items-center justify-center shadow-sm">
//             <Layers className="text-white" size={24} />
//           </div>
//           <div>
//             <h1 className="text-2xl font-black text-slate-900 uppercase">
//               Master Management
//             </h1>
//             <p className="text-xs text-slate-400 font-medium">
//               Configure global system parameters.
//             </p>
//           </div>
//         </div>

//         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//           {Object.entries(MASTER_CONFIG).map(([key, c]) => (
//             <button
//               key={key}
//               onClick={() => setActiveTab(key)}
//               className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${activeTab === key ? "bg-[#7f1d1d] text-white shadow-md shadow-red-900/10" : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"}`}
//             >
//               {c.title}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* FORM WORKSPACE */}
//       <div className="bg-white p-6 rounded-3xl shadow-3xs border border-slate-100">
//         <div className="flex items-center gap-2 pb-4 mb-4 border-b text-slate-500">
//           <Plus size={15} />{" "}
//           <h3 className="text-xs font-black uppercase tracking-wider">
//             {editingId ? `Edit ${config.title}` : `Create New ${config.title}`}
//           </h3>
//         </div>

//         <form
//           onSubmit={handleSave}
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
//         >
//           {config.fields.map((f: any) => (
//             <div key={f.key} className="flex flex-col">
//               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
//                 {f.label}{" "}
//                 {f.required && <span className="text-red-500">*</span>}
//               </label>

//               {f.type === "file" ? (
//                 <div className="relative">
//                   {previews[f.key] ? (
//                     <div
//                       className={`w-full h-[42px] rounded-xl overflow-hidden border ${formErrors[f.key] ? "border-red-500" : "border-slate-200"} cursor-pointer relative group`}
//                       onClick={() => fileRefs.current[f.key]?.click()}
//                     >
//                       <img
//                         src={previews[f.key]}
//                         className="w-full h-full object-cover group-hover:opacity-40 transition-all"
//                         alt="Preview"
//                       />
//                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs font-bold bg-black/40 text-white">
//                         Change
//                       </div>
//                     </div>
//                   ) : (
//                     <div
//                       onClick={() => fileRefs.current[f.key]?.click()}
//                       className={`w-full h-[42px] bg-slate-50 border border-dashed ${formErrors[f.key] ? "border-red-500" : "border-slate-300"} rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 text-xs font-bold text-slate-500`}
//                     >
//                       <ImageIcon size={16} /> Upload
//                     </div>
//                   )}
//                   <input
//                     ref={(el) => (fileRefs.current[f.key] = el)}
//                     type="file"
//                     name={f.key}
//                     accept={f.accept}
//                     onChange={handleInputChange}
//                     className="hidden"
//                   />
//                 </div>
//               ) : f.type === "select" ? (
//                 <Select
//                   name={f.key}
//                   options={dropdownData[f.fetchFrom] || []}
//                   value={
//                     (dropdownData[f.fetchFrom] || []).find(
//                       (opt: any) => opt.value === formData[f.key],
//                     ) || null
//                   }
//                   onChange={handleSelectChange}
//                   placeholder={`Select ${f.label}`}
//                   className="react-select-container text-sm font-medium"
//                   classNamePrefix="react-select"
//                   styles={{
//                     control: (base) => ({
//                       ...base,
//                       height: "42px",
//                       minHeight: "42px",
//                       borderRadius: "0.75rem",
//                       borderColor: formErrors[f.key] ? "#ef4444" : "#e2e8f0",
//                       backgroundColor: "#f8fafc",
//                       boxShadow: "none",
//                       "&:hover": { borderColor: "#cbd5e1" },
//                     }),
//                   }}
//                 />
//               ) : (
//                 <input
//                   type={f.type}
//                   name={f.key}
//                   value={formData[f.key] || ""}
//                   onChange={handleInputChange}
//                   className={`w-full h-[42px] px-4 bg-slate-50 border ${formErrors[f.key] ? "border-red-500" : "border-slate-200"} rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#7f1d1d] outline-none transition-all`}
//                 />
//               )}
//               {formErrors[f.key] && (
//                 <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 mt-1.5">
//                   <AlertCircle size={10} /> {formErrors[f.key]}
//                 </span>
//               )}
//             </div>
//           ))}

//           <div className="flex gap-2 lg:col-span-full mt-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="bg-[#7f1d1d] text-white px-8 h-[42px] rounded-xl text-xs font-black uppercase tracking-widest shadow-3xs disabled:opacity-50 hover:bg-[#6b1a1a] transition-all"
//             >
//               {editingId ? "Update Record" : "Save Record"}
//             </button>
//             {editingId && (
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="px-5 h-[42px] border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 transition-all"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </form>
//       </div>

//       {/* DATA TABLE */}
//       <div className="bg-white rounded-3xl shadow-3xs border border-slate-100 overflow-hidden">
//         <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
//           <div className="flex items-center gap-3">
//             <h3 className="font-black text-xl flex items-center gap-2 tracking-tight">
//               <Table size={20} className="text-slate-400" />
//               Active {config.title}
//             </h3>

//             <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
//               {filteredCount} Records
//             </span>
//           </div>
//           <div className="relative w-full md:w-64">
//             <Search
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//               size={15}
//             />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-slate-300 transition-all"
//               placeholder={`Search ${config.title}...`}
//             />
//           </div>
//         </div>

//         {loading && dataList.length === 0 ? (
//           <div className="py-20 flex justify-center">
//             <Loader2 className="animate-spin text-[#7f1d1d]" size={40} />
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
//                   <th className="py-4 px-6 w-16 text-center">Sl.no</th>
//                   {config.fields.map((f: any) => (
//                     <th key={f.key} className="py-4 px-6">
//                       {f.label}
//                     </th>
//                   ))}
//                   <th className="py-4 px-6 text-center">Status</th>
//                   <th className="py-4 px-6 text-right pr-8">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-sm">
//                 {paginatedData.map((item, idx) => (
//                   <tr
//                     key={item._id}
//                     className="hover:bg-slate-50/40 transition-colors"
//                   >
//                     <td className="py-4 px-6 text-center font-mono text-xs font-bold text-slate-400">
//                       {(page - 1) * itemsPerPage + idx + 1}
//                     </td>

//                     {config.fields.map((f: any) => (
//                       <td
//                         key={f.key}
//                         className="py-4 px-6 font-bold text-slate-800"
//                       >
//                         {f.type === "file" ? (
//                           item[f.key] ? (
//                             <img
//                               src={`${IMAGE_BASE_URL}${item[f.key]}`}
//                               alt="img"
//                               className="w-10 h-10 object-contain rounded-md border border-slate-200 bg-white"
//                             />
//                           ) : (
//                             <span className="text-xs font-medium text-slate-300 italic">
//                               No image
//                             </span>
//                           )
//                         ) : f.type === "select" ? (
//                           dropdownData[f.fetchFrom]?.find(
//                             (d: any) => d.value === item[f.key],
//                           )?.label || "—"
//                         ) : (
//                           item[f.key] || "—"
//                         )}
//                       </td>
//                     ))}

//                     <td className="py-4 px-6 text-center">
//                       <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/50 rounded-lg text-[9px] font-black uppercase tracking-wider">
//                         {item.status || "Active"}
//                       </span>
//                     </td>

//                     <td className="py-4 px-6 text-right space-x-2 pr-8">
//                       <button
//                         onClick={() => startEdit(item)}
//                         className="p-2 border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 rounded-xl transition-all shadow-3xs bg-white"
//                       >
//                         <Edit2 size={13} />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(item._id)}
//                         className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all shadow-3xs bg-white"
//                       >
//                         <Trash2 size={13} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {paginatedData.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan={6}
//                       className="py-16 text-center text-xs font-medium text-slate-400"
//                     >
//                       No active records found matching criteria.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//       <Pagination
//   page={page}
//   totalPages={totalPages}
//   itemsPerPage={itemsPerPage}
//   setPage={setPage}
//   setItemsPerPage={setItemsPerPage}
//   pageNumbers={pageNumbers}
//   hasPrev={hasPrev}
//   hasNext={hasNext}
// />
//     </div>
//   );
// };




import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { masterAPI, IMAGE_BASE_URL } from "../services/api";
import {
  Layers,
  Edit2,
  Trash2,
  Loader2,
  Search,
  Table,
  Plus,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTable } from "../hooks/useTable";
import { Pagination } from "../components/Pagination";

const MASTER_CONFIG: Record<string, any> = {
  store: {
    title: "Stores",
    api: masterAPI.store,
    fields: [
      { key: "name", label: "Store Name", type: "text", required: true },
      { key: "code", label: "Store Code", type: "text", required: true },
      { key: "city", label: "City", type: "text" },
      { key: "area", label: "Area", type: "text" },
    ],
  },
  category: {
    title: "Categories",
    api: masterAPI.category,
    fields: [
      { key: "name", label: "Category Name", type: "text", required: true },
      { key: "image", label: "Category Banner", type: "file", accept: "image/*", required: true },
    ],
  },
  subCategory: {
    title: "Sub Categories",
    api: masterAPI.subCategory,
    fields: [
      { key: "categoryId", label: "Parent Category", type: "select", fetchFrom: "category", required: true },
      { key: "name", label: "Sub Category Name", type: "text", required: true },
    ],
  },
  attributeType: {
    title: "Attribute Types",
    api: masterAPI.attributeType,
    fields: [
      { key: "name", label: "Type Name (e.g., Color, Size)", type: "text", required: true },
      { key: "description", label: "Description", type: "text" },
    ],
  },
  globalAttributes: {
    title: "Global Attributes",
    api: masterAPI.globalAttribute,
    fields: [
      { key: "attributeTypeId", label: "Attribute Type", type: "select", fetchFrom: "attributeType", required: true },
      { key: "name", label: "Value Name (e.g., Red, XL)", type: "text", required: true },
      { key: "value", label: "Value Data (e.g., Hex Code)", type: "text" },
    ],
  },
  brand: {
    title: "Brands",
    api: masterAPI.brand,
    fields: [
      { key: "name", label: "Brand Name", type: "text", required: true },
      { key: "logo", label: "Brand Logo", type: "file", accept: "image/*", required: true },
    ],
  },
  banner: {
    title: "Banners",
    api: masterAPI.banner,
    fields: [
      { key: "title", label: "Banner Title", type: "text", required: true },
      { key: "image", label: "Desktop Image", type: "file", accept: "image/*", required: true },
      { key: "mobileImage", label: "Mobile Image", type: "file", accept: "image/*", required: true },
    ],
  },
};

export const MasterManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("store");
  const [dataList, setDataList] = useState<any[]>([]);
  const [dropdownData, setDropdownData] = useState<Record<string, any[]>>({});
  const [formData, setFormData] = useState<any>({});
  const [previews, setPreviews] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const {
    paginatedData,
    filteredCount,
    page,
    totalPages,
    itemsPerPage,
    search,
    setPage,
    setSearch,
    setItemsPerPage,
    pageNumbers,
    hasPrev,
    hasNext,
  } = useTable(dataList, {
    itemsPerPage: 10,
  });

  const config = MASTER_CONFIG[activeTab];

  // Helper utility function to parse dirty paths safely
  const buildCleanImageURL = (pathValue: any) => {
    if (!pathValue || typeof pathValue !== "string") return "";
    let cleanPath = pathValue.replace(/\\/g, "/");
    if (cleanPath.includes("uploads/")) {
      cleanPath = "uploads/" + cleanPath.split("uploads/")[1];
    }
    // Remove duplicate slashes between base domain name and path string
    const base = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL : IMAGE_BASE_URL + "/";
    return `${base}${cleanPath}`;
  };

  useEffect(() => {
    fetchData();
    fetchDropdowns();
    resetForm();
    setPage(1);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await config.api.getAll();
      setDataList(res.data?.data || []);
    } catch (e) {
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    for (let f of config.fields) {
      if (f.type === "select" && f.fetchFrom) {
        try {
          const res = await MASTER_CONFIG[f.fetchFrom].api.getAll();
          const options = (res.data?.data || []).map((item: any) => ({
            value: item._id,
            label: item.name,
          }));
          setDropdownData((prev) => ({ ...prev, [f.fetchFrom]: options }));
        } catch (e) {
          console.error("Dropdown error");
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({});
    setPreviews({});
    setEditingId(null);
    setFormErrors({});
    Object.values(fileRefs.current).forEach((el) => {
      if (el) el.value = "";
    });
  };

  const handleInputChange = (e: any) => {
    const { name, type, files, value } = e.target;

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (type === "file" && files?.length) {
      const file = files[0];
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, PNG and WEBP images are allowed");
        e.target.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2 MB");
        e.target.value = "";
        return;
      }

      setFormData((prev: any) => ({ ...prev, [name]: file }));
      setPreviews((prev: any) => ({ ...prev, [name]: URL.createObjectURL(file) }));
      return;
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption: any, actionMeta: any) => {
    const { name } = actionMeta;
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: "" });
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : "",
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    config.fields.forEach((f: any) => {
      if (f.required) {
        if (f.type === "file") {
          const val = formData[f.key];
          const hasExistingImage = editingId && val && typeof val === "string";
          const hasNewImage = val instanceof File;

          if (!hasExistingImage && !hasNewImage) {
            errors[f.key] = `${f.label} is required`;
            isValid = false;
          }
        } else {
          const val = formData[f.key];
          if (val === undefined || val === null || val.toString().trim() === "") {
            errors[f.key] = `${f.label} is required`;
            isValid = false;
          }
        }
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const hasFiles = Object.values(formData).some((v) => v instanceof File);
      let payload: any;

      if (hasFiles) {
        payload = new FormData();
        Object.keys(formData).forEach((key) => {
          if (formData[key] !== undefined && formData[key] !== null) {
            // If it's a structural relational populated object, extract just the raw _id string
            if (formData[key] && typeof formData[key] === "object" && !(formData[key] instanceof File)) {
              payload.append(key, formData[key]._id || JSON.stringify(formData[key]));
            } else {
              payload.append(key, formData[key]);
            }
          }
        });
      } else {
        payload = {};
        Object.keys(formData).forEach((key) => {
          if (formData[key] && typeof formData[key] === "object") {
            payload[key] = formData[key]._id || formData[key];
          } else {
            payload[key] = formData[key];
          }
        });
      }

      if (editingId) {
        await config.api.update(editingId, payload);
        toast.success(`${config.title} updated successfully`);
      } else {
        await config.api.create(payload);
        toast.success(`${config.title} created successfully`);
      }
      resetForm();
      await fetchData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item._id);
    setFormErrors({});
    
    // Normalize properties for editing view form fields
    const normalizedFormValues = { ...item };
    config.fields.forEach((f: any) => {
      if (f.type === "select" && item[f.key] && typeof item[f.key] === "object") {
        normalizedFormValues[f.key] = item[f.key]._id;
      }
    });
    setFormData(normalizedFormValues);

    const existingPreviews: any = {};
    config.fields.forEach((f: any) => {
      if (f.type === "file" && item[f.key]) {
        existingPreviews[f.key] = buildCleanImageURL(item[f.key]);
      }
    });
    setPreviews(existingPreviews);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete record permanently?")) return;
    setLoading(true);
    try {
      await config.api.delete(id);
      toast.success("Deleted successfully");
      await fetchData();
    } catch (e) {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full font-sans text-slate-800 pb-16">
      {/* HEADER & TABS */}
      <div className="bg-white p-6 rounded-3xl shadow-3xs border border-slate-100 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#7f1d1d] rounded-2xl flex items-center justify-center shadow-sm">
            <Layers className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Master Management
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Configure global system parameters.
            </p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(MASTER_CONFIG).map(([key, c]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${activeTab === key ? "bg-[#7f1d1d] text-white shadow-md shadow-red-900/10" : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"}`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* FORM WORKSPACE */}
      <div className="bg-white p-6 rounded-3xl shadow-3xs border border-slate-100">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b text-slate-500">
          <Plus size={15} />{" "}
          <h3 className="text-xs font-black uppercase tracking-wider">
            {editingId ? `Edit ${config.title}` : `Create New ${config.title}`}
          </h3>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {config.fields.map((f: any) => (
            <div key={f.key} className="flex flex-col">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>

              {f.type === "file" ? (
                <div className="relative">
                  {previews[f.key] ? (
                    <div
                      className={`w-full h-[42px] rounded-xl overflow-hidden border ${formErrors[f.key] ? "border-red-500" : "border-slate-200"} cursor-pointer relative group`}
                      onClick={() => fileRefs.current[f.key]?.click()}
                    >
                      <img
                        src={previews[f.key]}
                        className="w-full h-full object-contain bg-slate-50 group-hover:opacity-40 transition-all"
                        alt="Preview"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs font-bold bg-black/40 text-white">
                        Change
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRefs.current[f.key]?.click()}
                      className={`w-full h-[42px] bg-slate-50 border border-dashed ${formErrors[f.key] ? "border-red-500" : "border-slate-300"} rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 text-xs font-bold text-slate-500`}
                    >
                      <ImageIcon size={16} /> Upload Layout Asset
                    </div>
                  )}
                  <input
                    ref={(el) => (fileRefs.current[f.key] = el)}
                    type="file"
                    name={f.key}
                    accept={f.accept}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>
              ) : f.type === "select" ? (
                <Select
                  name={f.key}
                  options={dropdownData[f.fetchFrom] || []}
                  value={
                    (dropdownData[f.fetchFrom] || []).find((opt: any) => {
                      const targetVal = formData[f.key] && typeof formData[f.key] === "object" ? formData[f.key]._id : formData[f.key];
                      return opt.value === targetVal;
                    }) || null
                  }
                  onChange={handleSelectChange}
                  placeholder={`Select ${f.label}`}
                  className="react-select-container text-sm font-medium"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      height: "42px",
                      minHeight: "42px",
                      borderRadius: "0.75rem",
                      borderColor: formErrors[f.key] ? "#ef4444" : "#e2e8f0",
                      backgroundColor: "#f8fafc",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#cbd5e1" },
                    }),
                  }}
                />
              ) : (
                <input
                  type={f.type}
                  name={f.key}
                  value={formData[f.key] && typeof formData[f.key] === "object" ? formData[f.key].name || "" : formData[f.key] || ""}
                  onChange={handleInputChange}
                  className={`w-full h-[42px] px-4 bg-slate-50 border ${formErrors[f.key] ? "border-red-500" : "border-slate-200"} rounded-xl text-sm font-medium focus:bg-white focus:ring-1 focus:ring-[#7f1d1d] outline-none transition-all`}
                />
              )}
              {formErrors[f.key] && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 mt-1.5">
                  <AlertCircle size={10} /> {formErrors[f.key]}
                </span>
              )}
            </div>
          ))}

          <div className="flex gap-2 lg:col-span-full mt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#7f1d1d] text-white px-8 h-[42px] rounded-xl text-xs font-black uppercase tracking-widest shadow-3xs disabled:opacity-50 hover:bg-[#6b1a1a] transition-all"
            >
              {editingId ? "Update Record" : "Save Record"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 h-[42px] border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-3xl shadow-3xs border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-black text-xl flex items-center gap-2 tracking-tight">
              <Table size={20} className="text-slate-400" /> Active {config.title}
            </h3>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {filteredCount} Records
            </span>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-slate-300 transition-all"
              placeholder={`Search ${config.title}...`}
            />
          </div>
        </div>

        {loading && dataList.length === 0 ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-[#7f1d1d]" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="py-4 px-6 w-16 text-center">Sl.no</th>
                  {config.fields.map((f: any) => (
                    <th key={f.key} className="py-4 px-6">{f.label}</th>
                  ))}
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedData.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 text-center font-mono text-xs font-bold text-slate-400">
                      {(page - 1) * itemsPerPage + idx + 1}
                    </td>

                    {config.fields.map((f: any) => {
                      const valueRaw = item[f.key];
                      return (
                        <td key={f.key} className="py-4 px-6 font-bold text-slate-800">
                          {f.type === "file" ? (
                            valueRaw ? (
                              <img
                                src={buildCleanImageURL(valueRaw)}
                                alt="Master File Asset"
                                className="w-10 h-10 object-contain rounded-md border border-slate-200 bg-white p-0.5"
                                onError={(e) => {
                                  // Fallback indicator if asset asset drops out
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-xs font-medium text-slate-300 italic">No image</span>
                            )
                          ) : f.type === "select" ? (
                            // Safe populated lookup conditional evaluation check
                            valueRaw && typeof valueRaw === "object"
                              ? valueRaw.name || "—"
                              : dropdownData[f.fetchFrom]?.find((d: any) => d.value === valueRaw)?.label || "—"
                          ) : (
                            valueRaw || "—"
                          )}
                        </td>
                      );
                    })}

                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/50 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        {item.status || "Active"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2 pr-8">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 rounded-xl transition-all shadow-3xs bg-white"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-all shadow-3xs bg-white"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={config.fields.length + 3} className="py-16 text-center text-xs font-medium text-slate-400">
                      No active records found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          setPage={setPage}
          setItemsPerPage={setItemsPerPage}
          pageNumbers={pageNumbers}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}
    </div>
  );
};
