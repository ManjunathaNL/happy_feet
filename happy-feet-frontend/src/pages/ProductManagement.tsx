import React, { useState, useEffect, useRef } from "react";
import { catalogAPI, masterAPI, IMAGE_BASE_URL } from "../services/api";
import { useTable } from "../hooks/useTable";
import { Pagination } from "../components/Pagination";
import { ProductForm } from "./ProductForm";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Table,
  ShoppingBag,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export const ProductManagement: React.FC = () => {
  const [showFormPanel, setShowFormPanel] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Dropdowns State Layers
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<any[]>([]);

  const [genders, setGenders] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  // Images state layers
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variant setups configurations mapping matrix states
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

  const buildCleanProductImageURL = (rawPath: any) => {
    if (!rawPath || typeof rawPath !== "string") return "";
    let clean = rawPath.replace(/\\/g, "/");
    if (clean.includes("uploads/"))
      clean = "uploads/" + clean.split("uploads/")[1];
    const base = IMAGE_BASE_URL.endsWith("/")
      ? IMAGE_BASE_URL
      : IMAGE_BASE_URL + "/";
    return `${base}${clean}`;
  };

  useEffect(() => {
    syncUnifiedDashboardContext();
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      const matches = subCategories.filter(
        (s) => (s.categoryId?._id || s.categoryId) === form.categoryId,
      );
      setFilteredSubCategories(
        matches.map((s) => ({ value: s._id, label: s.name })),
      );
      if (!matches.some((m) => m._id === form.subCategoryId))
        setForm((prev) => ({ ...prev, subCategoryId: "" }));
    } else {
      setFilteredSubCategories([]);
    }
  }, [form.categoryId, subCategories]);

  const syncUnifiedDashboardContext = async () => {
    try {
      setLoading(true);
      const [prodRes, brandRes, catRes, subRes, attrTypeRes, attrRes] =
        await Promise.all([
          catalogAPI.getProducts(),
          masterAPI.brand.getAll(),
          masterAPI.category.getAll(),
          masterAPI.subCategory.getAll(),
          masterAPI.attributeType.getAll(),
          masterAPI.globalAttribute.getAll(),
        ]);

      setProducts(prodRes.data?.data || []);
      setBrands(
        (brandRes.data?.data || []).map((b: any) => ({
          value: b._id,
          label: b.name,
        })),
      );
      setCategories(
        (catRes.data?.data || []).map((c: any) => ({
          value: c._id,
          label: c.name,
        })),
      );
      setSubCategories(subRes.data?.data || []);

      const rawTypes = attrTypeRes.data?.data || [];
      const rawAttributes = attrRes.data?.data || [];

      const getAttrsByType = (typeName: string) => {
        const type = rawTypes.find(
          (t: any) => t.name.toLowerCase() === typeName.toLowerCase(),
        );
        if (!type) return [];
        return rawAttributes
          .filter(
            (a: any) =>
              (a.attributeTypeId?._id || a.attributeTypeId) === type._id,
          )
          .map((x: any) => ({ value: x._id, label: x.name }));
      };

      setGenders(getAttrsByType("Gender"));
      setColors(getAttrsByType("Color"));
      setSizes(getAttrsByType("Size"));
      setMaterials(getAttrsByType("Material"));
    } catch (e) {
      toast.error("Error synchronizing master data.");
    }
    certify: {
      setLoading(false);
    }
  };

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
      setImagePreviews((prev) => [
        ...prev,
        ...filesArray.map((f) => URL.createObjectURL(f)),
      ]);
    }
    if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length)
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    else
      setSelectedImages((prev) =>
        prev.filter((_, i) => i !== index - existingImages.length),
      );
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChangeWithReset = (key: string, val: any) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSelectChangeWithReset = (key: string, opt: any) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    setForm((prev) => ({ ...prev, [key]: opt ? opt.value : "" }));
  };


  const runMatrixGenerationWizard = () => {
    // 🛡️ SECURITY SAFEGUARD: If we are editing, freeze execution immediately
    // so existing variant logs are never overwritten or corrupted.
    if (editingId) return;

    if (
      !wizardColors.length ||
      !wizardSizes.length ||
      !wizardMaterials.length
    ) {
      setErrors((prev) => ({
        ...prev,
        variants: "Please select at least one Color, Size, and Material.",
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, variants: "" }));

    const grid: any[] = [];
    wizardColors.forEach((c) => {
      wizardSizes.forEach((s) => {
        wizardMaterials.forEach((m) => {
          grid.push({
            colorId: c.value,
            colorLabel: c.label,
            sizeId: s.value,
            sizeLabel: s.label,
            materialId: m.value,
            materialLabel: m.label,
            costPrice: form.costPrice || "",
            mrp: form.mrp || "",
            sellingPrice: form.sellingPrice || "",
            stockQuantity: "",
            sku: `${form.sku || "SKU"}-${c.label}-${s.label}-${m.label}`
              .toUpperCase()
              .replace(/\s+/g, ""),
            barcode: `BAR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          });
        });
      });
    });

    setWizardMatrix(grid);
    setMatrixErrors([]);
  };

  const editWizardMatrixCell = (idx: number, key: string, val: any) => {
    const updated = [...wizardMatrix];
    updated[idx][key] = val;
    setWizardMatrix(updated);
    if (matrixErrors.includes(idx))
      setMatrixErrors((prev) => prev.filter((e) => e !== idx));
    if (errors.variants) setErrors((prev) => ({ ...prev, variants: "" }));
  };

  const validateProductForm = () => {
    let local: Record<string, string> = {};
    let matrixErr: number[] = [];

    const fieldsToSkip = [
      "season",
      "collectionYear",
      "occasion",
      "lifestyle",
      "fitType",
      "closureType",
      "toeShape",
    ];

    Object.keys(defaultForm).forEach((k) => {
      if (
        !fieldsToSkip.includes(k) &&
        !String(form[k as keyof typeof form]).trim()
      ) {
        local[k] = "This field is required.";
      }
    });

    if (Number(form.sellingPrice) > Number(form.mrp))
      local.sellingPrice = "Selling Price cannot exceed MRP.";
    if (!existingImages.length && !selectedImages.length)
      local.images = "At least one image is required.";

    // Validate variant rows matrix
    if (!wizardMatrix.length) {
      local.variants =
        "Generate or load at least one variant configuration row.";
    } else {
      wizardMatrix.forEach((v, idx) => {
        // ✅ VALIDATION LOGIC:
        if (editingId) {
          // When updating, make sure they didn't clear out the Initial Stock field
          if (v.stockQuantity === "" || v.stockQuantity === null || undefined) {
            matrixErr.push(idx);
          }
        } else {
          // When creating fresh, all core matrix inputs are required
          if (
            !v.sku ||
            !v.costPrice ||
            !v.sellingPrice ||
            v.stockQuantity === "" ||
            v.stockQuantity === null
          ) {
            matrixErr.push(idx);
          }
        }
      });

      if (matrixErr.length) {
        local.variants = editingId
          ? "Please fill out the Stock fields in the highlighted Matrix rows."
          : "Please fill out all Stock and Price fields in the highlighted Matrix rows.";
      }
    }

    setErrors(local);
    setMatrixErrors(matrixErr);
    return !Object.keys(local).length;
  };
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProductForm()) return;
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(form).forEach((k) =>
        payload.append(k, String(form[k as keyof typeof form])),
      );
      payload.append("retainedImages", JSON.stringify(existingImages));
      selectedImages.forEach((f) => payload.append("images", f));
      payload.append("variants", JSON.stringify(wizardMatrix));

      if (editingId) await catalogAPI.updateProduct(editingId, payload);
      else await catalogAPI.createProduct(payload);

      toast.success("Product sync completed successfully.");
      clearProductFormContext();
      await syncUnifiedDashboardContext();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
    certify: {
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

  const startProductModificationLifecycle = async (item: any) => {
    try {
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
        occasion: item.occasion || "Casual",
        lifestyle: item.lifestyle || "Standard",
        fitType: item.fitType || "Regular",
        closureType: item.closureType || "Lace Up",
        toeShape: item.toeShape || "Round Toe",
        shortDescription: item.shortDescription || "",
        longDescription: item.longDescription || "",
        costPrice: item.costPrice || "",
        landingCost: item.landingCost || "",
        mrp: item.mrp || "",
        sellingPrice: item.sellingPrice || "",
        gstPercentage:
          item.gstPercentage !== undefined ? item.gstPercentage : 18,
      });

      const cleaned = (item.images || []).map((img: string) =>
        img.includes("uploads/") ? "uploads/" + img.split("uploads/")[1] : img,
      );
      setExistingImages(cleaned);
      setImagePreviews(
        cleaned.map((img: string) => buildCleanProductImageURL(img)),
      );
      setSelectedImages([]);

      const res = await catalogAPI.getVariantsByProductId(item._id);
      setWizardMatrix(
        (res.data?.data || []).map((v: any) => ({
          _id: v._id,
          colorId: v.colorId?._id || v.colorId,
          colorLabel: v.colorId?.name || "Color",
          sizeId: v.sizeId?._id || v.sizeId,
          sizeLabel: v.sizeId?.name || "Size",
          materialId: v.materialId?._id || v.materialId,
          materialLabel: v.materialId?.name || "Material",
          sku: v.sku,
          barcode: v.barcode,
          costPrice: v.costPrice,
          mrp: v.mrp,
          sellingPrice: v.sellingPrice,
          stockQuantity: v.stockQuantity,
        })),
      );
      setShowFormPanel(true);
    } catch (e) {
      toast.error("Failed loading variants overview details.");
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!window.confirm("Permanently drop item entry logs?")) return;
    try {
      await catalogAPI.deleteProduct(id);
      toast.success("Dropped cleanly.");
      await syncUnifiedDashboardContext();
    } catch (e) {
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="space-y-6 w-full font-sans text-slate-800 pb-16">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#7f1d1d] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              Product Management
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Configure master footwear catalog inventory models.
            </p>
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

      {showFormPanel ? (
        /* FORM IS ACTIVE: Show only Form Panel Workspace */
        <ProductForm
          form={form}
          editingId={editingId}
          submitting={submitting}
          errors={errors}
          matrixErrors={matrixErrors}
          brands={brands}
          categories={categories}
          filteredSubCategories={filteredSubCategories}
          genders={genders}
          colors={colors}
          sizes={sizes}
          materials={materials}
          imagePreviews={imagePreviews}
          wizardColors={wizardColors}
          wizardSizes={wizardSizes}
          wizardMaterials={wizardMaterials}
          wizardMatrix={wizardMatrix}
          gstOptions={gstOptions}
          fileInputRef={fileInputRef}
          setShowFormPanel={setShowFormPanel}
          handleInputChangeWithReset={handleInputChangeWithReset}
          handleSelectChangeWithReset={handleSelectChangeWithReset}
          handleImageSelection={handleImageSelection}
          removeImage={removeImage}
          setWizardColors={setWizardColors}
          setWizardSizes={setWizardSizes}
          setWizardMaterials={setWizardMaterials}
          runMatrixGenerationWizard={runMatrixGenerationWizard}
          editWizardMatrixCell={editWizardMatrixCell}
          handleProductSubmit={handleProductSubmit}
          clearProductFormContext={clearProductFormContext}
        />
      ) : (
        /* FORM IS HIDDEN: Show clean Registry Table View list layout instead */
        <div className="bg-white rounded-3xl shadow-3xs border border-slate-100 overflow-hidden animate-fadeIn">
          <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
              <Table size={20} className="text-slate-400" /> Product List
            </h3>
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-slate-300 transition-all font-medium"
                placeholder="Search catalog..."
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                  <th className="py-4 px-6 w-16 text-center">Image</th>
                  <th
                    className="py-4 px-6 cursor-pointer hover:bg-slate-50/60"
                    onClick={() => toggleSort("name")}
                  >
                    Product Details
                  </th>
                  <th
                    className="py-4 px-6 cursor-pointer hover:bg-slate-100/60"
                    onClick={() => toggleSort("sku")}
                  >
                    Product SKU
                  </th>
                  <th className="py-4 px-6 text-center">Categorization Path</th>
                  <th className="py-4 px-6 text-right">Selling Price</th>
                  <th className="py-4 px-6 text-right pr-8 w-44">
                    Actions Panel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/40 transition-colors group"
                    >
                      <td className="py-4 px-6 text-center">
                        <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden mx-auto">
                          {item.images?.length > 0 ? (
                            <img
                              src={buildCleanProductImageURL(item.images[0])}
                              alt="product"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <ImageIcon size={16} className="text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-black text-slate-800 tracking-tight text-sm block">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-800 block mt-0.5">
                            {item.brandId && typeof item.brandId === "object"
                              ? item.brandId.name
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">
                        {item.sku}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex flex-col gap-0.5">
                          <span className="px-2 py-0.5 bg-slate-100 border text-[10px] font-bold rounded-md uppercase text-slate-600 tracking-wide">
                            {item.categoryId &&
                            typeof item.categoryId === "object"
                              ? item.categoryId.name
                              : "—"}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {item.subCategoryId &&
                            typeof item.subCategoryId === "object"
                              ? item.subCategoryId.name
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-black text-slate-900">
                        ₹{item.sellingPrice}
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5 pr-8">
                        <button
                          type="button"
                          onClick={() =>
                            startProductModificationLifecycle(item)
                          }
                          className="p-2 border border-slate-200 text-slate-400 hover:text-slate-800 bg-white rounded-xl shadow-3xs transition-all"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProductDelete(item._id)}
                          className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 bg-white rounded-xl shadow-3xs transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center text-xs font-mono text-slate-400"
                    >
                      No active products match search definitions criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
      )}
    </div>
  );
};
