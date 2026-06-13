import React from "react";
import Select from "react-select";
import { X, AlertCircle, UploadCloud, RefreshCw, Loader2 } from "lucide-react";

interface ProductFormProps {
  form: any;
  editingId: string | null;
  submitting: boolean;
  errors: Record<string, string>;
  matrixErrors: number[];
  brands: any[];
  categories: any[];
  filteredSubCategories: any[];
  genders: any[];
  colors: any[];
  sizes: any[];
  materials: any[];
  imagePreviews: string[];
  wizardColors: any[];
  wizardSizes: any[];
  wizardMaterials: any[];
  wizardMatrix: any[];
  gstOptions: any[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  setShowFormPanel: (show: boolean) => void;
  handleInputChangeWithReset: (key: string, val: any) => void;
  handleSelectChangeWithReset: (key: string, option: any) => void;
  handleImageSelection: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (idx: number) => void;
  setWizardColors: (val: any) => void;
  setWizardSizes: (val: any) => void;
  setWizardMaterials: (val: any) => void;
  runMatrixGenerationWizard: () => void;
  editWizardMatrixCell: (idx: number, key: string, val: any) => void;
  handleProductSubmit: (e: React.FormEvent) => void;
  clearProductFormContext: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  form,
  editingId,
  submitting,
  errors,
  matrixErrors,
  brands,
  categories,
  filteredSubCategories,
  genders,
  colors,
  sizes,
  materials,
  imagePreviews,
  wizardColors,
  wizardSizes,
  wizardMaterials,
  wizardMatrix,
  gstOptions,
  fileInputRef,
  setShowFormPanel,
  handleInputChangeWithReset,
  handleSelectChangeWithReset,
  handleImageSelection,
  removeImage,
  setWizardColors,
  setWizardSizes,
  setWizardMaterials,
  runMatrixGenerationWizard,
  editWizardMatrixCell,
  handleProductSubmit,
  clearProductFormContext,
}) => {
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
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs animate-fadeIn relative">
      <button
        type="button"
        onClick={() => setShowFormPanel(false)}
        className="absolute top-6 right-6 p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <X size={14} />
      </button>

      <form onSubmit={handleProductSubmit} className="space-y-6" noValidate>
        {/* Core Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                handleInputChangeWithReset("name", e.target.value)
              }
              className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.name ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.name && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.name}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Product SKU Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) =>
                handleInputChangeWithReset("sku", e.target.value)
              }
              className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.sku ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.sku && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.sku}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              HSN Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.hsn}
              onChange={(e) =>
                handleInputChangeWithReset("hsn", e.target.value)
              }
              className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.hsn ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.hsn && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.hsn}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              GST Tax Slab <span className="text-red-500">*</span>
            </label>
            <Select
              options={gstOptions}
              value={
                gstOptions.find((g) => g.value === form.gstPercentage) || null
              }
              onChange={(o: any) =>
                handleSelectChangeWithReset("gstPercentage", o)
              }
              styles={reactSelectControlStyles(!!errors.gstPercentage)}
              placeholder="Select GST %"
            />
            {errors.gstPercentage && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.gstPercentage}
              </span>
            )}
          </div>
        </div>

        {/* Categories & Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Gender <span className="text-red-500">*</span>
            </label>
            <Select
              options={genders}
              value={genders.find((g) => g.value === form.gender) || null}
              onChange={(o: any) => handleSelectChangeWithReset("gender", o)}
              styles={reactSelectControlStyles(!!errors.gender)}
              placeholder="Select Gender"
            />
            {errors.gender && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.gender}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Brand <span className="text-red-500">*</span>
            </label>
            <Select
              options={brands}
              value={brands.find((b) => b.value === form.brandId) || null}
              onChange={(o: any) => handleSelectChangeWithReset("brandId", o)}
              styles={reactSelectControlStyles(!!errors.brandId)}
              placeholder="Select Brand"
            />
            {errors.brandId && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.brandId}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={categories}
              value={
                categories.find((c) => c.value === form.categoryId) || null
              }
              onChange={(o: any) =>
                handleSelectChangeWithReset("categoryId", o)
              }
              styles={reactSelectControlStyles(!!errors.categoryId)}
              placeholder="Select Category"
            />
            {errors.categoryId && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.categoryId}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={filteredSubCategories}
              value={
                filteredSubCategories.find(
                  (s) => s.value === form.subCategoryId,
                ) || null
              }
              onChange={(o: any) =>
                handleSelectChangeWithReset("subCategoryId", o)
              }
              isDisabled={!form.categoryId}
              styles={reactSelectControlStyles(!!errors.subCategoryId)}
              placeholder="Choose Sub Category"
            />
            {errors.subCategoryId && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.subCategoryId}
              </span>
            )}
          </div>
        </div>

        {/* Financial Layout Row Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Cost Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.costPrice}
              onChange={(e) =>
                handleInputChangeWithReset("costPrice", e.target.value)
              }
              className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.costPrice ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.costPrice && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.costPrice}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Selling Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.sellingPrice}
              onChange={(e) =>
                handleInputChangeWithReset("sellingPrice", e.target.value)
              }
              className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.sellingPrice ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.sellingPrice && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.sellingPrice}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Max Retail Price (MRP) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.mrp}
              onChange={(e) =>
                handleInputChangeWithReset("mrp", e.target.value)
              }
              className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.mrp ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.mrp && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.mrp}
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Landing Cost <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.landingCost}
              onChange={(e) =>
                handleInputChangeWithReset("landingCost", e.target.value)
              }
              className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.landingCost ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.landingCost && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.landingCost}
              </span>
            )}
          </div>
        </div>

        {/* Descriptions text inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Short Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) =>
                handleInputChangeWithReset("shortDescription", e.target.value)
              }
              className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:bg-white outline-none ${errors.shortDescription ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.shortDescription && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.shortDescription}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              Long Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.longDescription}
              onChange={(e) =>
                handleInputChangeWithReset("longDescription", e.target.value)
              }
              className={`w-full h-16 p-3 bg-slate-50 border rounded-xl text-sm outline-none resize-none focus:bg-white transition-all ${errors.longDescription ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.longDescription && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 mt-1">
                <AlertCircle size={10} /> {errors.longDescription}
              </span>
            )}
          </div>
        </div>

        {/* Image Picker */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            Product Images <span className="text-red-500">*</span>
          </label>
          <div
            className={`w-full border-2 border-dashed rounded-2xl p-6 transition-all ${errors.images ? "border-red-400 bg-red-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <UploadCloud
                size={28}
                className={errors.images ? "text-red-400" : "text-slate-400"}
              />
              <p className="text-sm font-bold text-slate-600">
                Click to upload product images
              </p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                SVG, PNG, JPG or GIF
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageSelection}
            />
          </div>
          {errors.images && (
            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
              <AlertCircle size={10} /> {errors.images}
            </span>
          )}

          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {imagePreviews.map((src, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 border border-slate-200 rounded-xl overflow-hidden group shadow-sm bg-white p-1"
                >
                  <img
                    src={src}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
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

        {/* VARIANT CONFIGURATION PANEL */}
        <div
          className={`p-5 border rounded-2xl space-y-4 transition-colors ${errors.variants ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
        >
          <div className="flex justify-between items-center border-b pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 select-none">
              {editingId
                ? "Step 2: Active Variants Matrix Inventory (Locked Logs)"
                : "Step 2: Variants Matrix Generator"}
            </h4>
            {!editingId && (
              <button
                type="button"
                onClick={runMatrixGenerationWizard}
                className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-slate-800 transition-colors shadow-3xs"
              >
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
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">
                  1. Select Colors <span className="text-red-500">*</span>
                </label>
                <Select
                  isMulti
                  options={colors}
                  value={wizardColors}
                  onChange={(o: any) => setWizardColors(o)}
                  placeholder="Choose Colors"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">
                  2. Select Sizes <span className="text-red-500">*</span>
                </label>
                <Select
                  isMulti
                  options={sizes}
                  value={wizardSizes}
                  onChange={(o: any) => setWizardSizes(o)}
                  placeholder="Choose Sizes"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">
                  3. Select Materials <span className="text-red-500">*</span>
                </label>
                <Select
                  isMulti
                  options={materials}
                  value={wizardMaterials}
                  onChange={(o: any) => setWizardMaterials(o)}
                  placeholder="Choose Materials"
                />
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
                    <th className="p-2.5 w-28 text-center">
                      Initial Stock <span className="text-red-500">*</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y font-bold text-slate-700">
                  {wizardMatrix.map((v, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-slate-50/50 transition-colors ${matrixErrors.includes(i) ? "bg-red-50/40" : ""}`}
                    >
                      <td className="p-2.5 text-[10px] uppercase tracking-wider">
                        {v.colorLabel} <span className="text-slate-400">/</span>{" "}
                        {v.sizeLabel} <span className="text-slate-400">/</span>{" "}
                        {v.materialLabel}
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          value={v.sku}
                          readOnly={true} // Always read-only because SKUs shouldn't change after creation
                          className="w-full p-1.5 border rounded-md font-mono text-xs uppercase outline-none bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          value={v.costPrice}
                          readOnly={!!editingId} // Read-only only during editing updates
                          onChange={(e) =>
                            editWizardMatrixCell(
                              i,
                              "costPrice",
                              Number(e.target.value),
                            )
                          }
                          className={`w-full p-1.5 border rounded-md outline-none ${editingId ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : !v.costPrice ? "border-red-500 bg-red-50" : "border-slate-200 focus:bg-slate-50"}`}
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          value={v.sellingPrice}
                          readOnly={!!editingId} // Read-only only during editing updates
                          onChange={(e) =>
                            editWizardMatrixCell(
                              i,
                              "sellingPrice",
                              Number(e.target.value),
                            )
                          }
                          className={`w-full p-1.5 border rounded-md outline-none ${editingId ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : !v.sellingPrice ? "border-red-500 bg-red-50" : "border-slate-200 focus:bg-slate-50"}`}
                        />
                      </td>
                      <td className="p-1.5">
                        <input
                          type="number"
                          value={v.stockQuantity}
                          readOnly={false} // ✅ ALWAYS EDITABLE: User can adjust inventory anytime!
                          onChange={(e) =>
                            editWizardMatrixCell(
                              i,
                              "stockQuantity",
                              e.target.value,
                            )
                          }
                          placeholder="Qty Required"
                          className={`w-full p-1.5 border rounded-md text-center font-black outline-none ${matrixErrors.includes(i) || v.stockQuantity === "" ? "border-red-500 bg-white" : editingId ? "bg-amber-50/20 border-slate-200 focus:bg-white" : "border-slate-200 bg-amber-50/40 focus:bg-white"}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t pt-6 mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white px-8 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-3xs flex items-center justify-center min-w-[200px]"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : editingId ? (
              "Update Product Record"
            ) : (
              "Save Product & Variants"
            )}
          </button>
          <button
            type="button"
            onClick={clearProductFormContext}
            className="px-5 h-10 border border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-500 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
