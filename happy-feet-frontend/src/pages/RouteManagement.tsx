import React, { useState, useEffect, useRef } from "react";
import { routeAPI } from "../services/api";
import { useTable } from "../hooks/useTable";
import { Pagination } from "../components/Pagination";
import {
  Edit2,
  Trash2,
  Loader2,
  Search,
  ArrowUpDown,
  Route,
  Heading,
  AlertCircle,
  Table,
} from "lucide-react";
import toast from "react-hot-toast";

export const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [form, setForm] = useState({ path: "", name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline reference-driven validation states
  const [errors, setErrors] = useState<{ path?: string; name?: string }>({});
  const pathInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Connect active state array directly into our structural useTable engine
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
    filteredCount,
    totalRecords,
    toggleSort,
  } = useTable(routes, {
    itemsPerPage: 10,
    searchableFields: ["name", "path"],
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const res = await routeAPI.getAll();
      setRoutes(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to sync route indices.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const localErrors: typeof errors = {};

    // 🛑 Inline Client-Side Validation Gates
    if (!form.path.trim()) {
      localErrors.path = "Route URL path is required.";
    } else if (!form.path.startsWith("/")) {
      localErrors.path =
        "Route paths must explicitly begin with a forward slash (/).";
    }

    if (!form.name.trim()) {
      localErrors.name = "Sidebar view display name is required.";
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      if (localErrors.path) pathInputRef.current?.focus();
      else if (localErrors.name) nameInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const computedPayload = {
        path: form.path.trim(),
        name: form.name.trim(),
      };

      if (editingId) {
        await routeAPI.update(editingId, computedPayload);
        toast.success("Route parameters modified successfully.");
      } else {
        await routeAPI.create(computedPayload);
        toast.success("New navigation route registered successfully.");
      }
      resetForm();
      await loadRoutes();
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.message || "Failed to save navigation parameters.";
      setErrors({ path: serverMessage });
      pathInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const deleteRoute = async (id: string, pathName: string) => {
    if (pathName === "/dashboard") {
      toast.error(
        "The core /dashboard system pathway is protected and cannot be deleted.",
      );
      return;
    }
    if (
      !window.confirm(
        `Are you certain you want to remove the route destination "${pathName}"?`,
      )
    )
      return;

    try {
      setLoading(true);
      await routeAPI.delete(id);
      toast.success("Navigation route dropped from active system registries.");
      await loadRoutes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Purge action failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (route: any) => {
    if (route.path === "/dashboard") {
      toast.error("The core system dashboard route rules cannot be modified.");
      return;
    }
    setEditingId(route._id);
    setForm({ path: route.path, name: route.name });
    setErrors({});
    pathInputRef.current?.focus();
  };

  const resetForm = () => {
    setForm({ path: "", name: "" });
    setEditingId(null);
    setErrors({});
  };

  if (loading && routes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-[#7f1d1d]" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Synchronizing Navigation Routes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans text-slate-800">
      {/* --- 1. HEADER BANNER --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-3xs border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#7f1d1d] rounded-2xl flex items-center justify-center shadow-sm shadow-red-900/20 shrink-0">
            <Route className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              Navigation Management
            </h1>

            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Manage application pages and menu navigation links.
            </p>
          </div>
        </div>
      </div>

      {/* --- 2. WORKSPACE CONTROL PANEL (TOP POSITION) --- */}
      <div className="bg-white p-6 rounded-3xl shadow-3xs border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b text-slate-500">
          <Route size={15} />
          <h3 className="text-xs font-black uppercase tracking-wider">
            {editingId ? "Update Navigation Menu" : "Create Navigation Menu"}
          </h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
        >
          {/* Path Parameter Input field */}
          <div className="md:col-span-5 flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Page URL
            </label>
            <input
              ref={pathInputRef}
              type="text"
              value={form.path}
              onChange={(e) => {
                setForm({ ...form, path: e.target.value });
                if (errors.path) setErrors((p) => ({ ...p, path: undefined }));
              }}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl focus:bg-white focus:outline-none transition-all text-sm font-medium ${
                errors.path
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 focus:ring-2 focus:ring-[#7f1d1d] focus:border-transparent"
              }`}
              placeholder="e.g. /inventory"
            />
            {errors.path && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 mt-1.5">
                <AlertCircle size={12} /> {errors.path}
              </span>
            )}
          </div>

          {/* Display Name Input field */}
          <div className="md:col-span-5 flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Menu Name
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl focus:bg-white focus:outline-none transition-all text-sm font-medium ${
                errors.name
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 focus:ring-2 focus:ring-[#7f1d1d] focus:border-transparent"
              }`}
              placeholder="e.g. Inventory Tracking"
            />
            {errors.name && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 mt-1.5">
                <AlertCircle size={12} /> {errors.name}
              </span>
            )}
          </div>

          {/* Action Buttons Panel */}
          <div className="md:col-span-2 flex gap-2 md:mt-[21px] w-full">
            <button
              type="submit"
              className="flex-1 bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-3xs active:scale-98 cursor-pointer h-[42px]"
            >
             {editingId ? 'Update Menu' : 'Create Menu'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer h-[42px]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- 3. DATA TABLE LISTING (BOTTOM POSITION) --- */}
      <div className="bg-white rounded-3xl shadow-3xs border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
              <Table size={20} className="text-slate-400" />Navigation Menu List
            </h3>
            <p className="text-xs text-slate-400">
               View and manage all application pages and menu links.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-slate-400 transition-all text-xs"
                placeholder="Search menu name or page URL..."
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                <th className="py-4 px-6 w-20 text-center">Sl.no</th>
                <th
                  className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1.5">
                    <Heading size={12} /> Menu Name{" "}
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort("path")}
                >
                  <div className="flex items-center gap-1.5">
                    <Route size={12} /> placeholder="Search menu name or page URL..."{" "}
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-4 px-6 text-center w-36">Status</th>
                <th className="py-4 px-6 text-right pr-8 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((r, idx) => {
                  const serialIndex = (page - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr
                      key={r._id}
                      className="hover:bg-slate-50/40 transition-colors group"
                    >
                      <td className="py-4 px-6 text-center font-mono text-xs font-bold text-slate-400">
                        {String(serialIndex).padStart(2, "0")}
                      </td>
                      <td className="py-4 px-6 font-black text-slate-800 tracking-tight text-sm">
                        {r.name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200/40">
                          {r.path}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            r.status === "active" || !r.status
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/30"
                              : "bg-rose-50 text-rose-700 border border-rose-200/30"
                          }`}
                        >
                          {r.status || "active"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 pr-8">
                        <button
                          type="button"
                          onClick={() => startEditing(r)}
                          disabled={r.path === "/dashboard"}
                          className="p-2 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-800 bg-white rounded-xl shadow-3xs transition-all disabled:opacity-20 disabled:cursor-not-allowed inline-flex items-center"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRoute(r._id, r.path)}
                          disabled={r.path === "/dashboard"}
                          className="p-2 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 bg-white rounded-xl shadow-3xs transition-all disabled:opacity-20 disabled:cursor-not-allowed inline-flex items-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-xs font-mono text-slate-400"
                  >
                   No navigation menus found.
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
    </div>
  );
};
