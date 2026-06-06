import React, { useState, useEffect, useRef } from "react";
import { roleAPI } from "../services/api";
import { useTable } from "../hooks/useTable";
import { Pagination } from "../components/Pagination";
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  ArrowUpDown,
  KeyRound,
  Radio,
  AlertCircle,
  Table,
} from "lucide-react";
import toast from "react-hot-toast";

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [roleForm, setRoleForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inline reference-driven validation states
  const [inputError, setInputError] = useState<string | null>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);

  // Connect backend storage indices with the table management engine
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
    sortConfig,
  } = useTable(roles, {
    itemsPerPage: 10,
    searchableFields: ["name"],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await roleAPI.getAll();
      const rolesData = res.data?.data || res.data || [];
      setRoles(rolesData);
    } catch (e: any) {
      toast.error("Failed to sync system role matrices.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    // 🛑 Inline Client-Side Edge Cases Gate
    if (!roleForm.name.trim()) {
      setInputError("Role designation label cannot be left empty.");
      roleInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await roleAPI.update(editingId, { name: roleForm.name.trim() });
        toast.success("Role profile updated safely.");
      } else {
        await roleAPI.create({ name: roleForm.name.trim() });
        toast.success("New functional role profile deployed.");
      }
      setRoleForm({ name: "" });
      setEditingId(null);
      setInputError(null);
      await fetchRoles();
    } catch (e: any) {
      const serverMessage =
        e.response?.data?.message ||
        "Operational submission execution failure.";
      setInputError(serverMessage);
      roleInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (roleItem: any) => {
    if (roleItem.isSystemRole) {
      toast.error("Protected core system roles cannot be modified or deleted.");
      return;
    }
    if (
      !window.confirm(
        `Are you certain you want to purge the role profile "${roleItem.name}"?`,
      )
    )
      return;

    try {
      setLoading(true);
      await roleAPI.delete(roleItem._id);
      toast.success("Target role profile dropped from active registries.");
      await fetchRoles();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Purge transmission failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (role: any) => {
    if (role.isSystemRole) {
      toast.error("System role parameter labels cannot be altered.");
      return;
    }
    setEditingId(role._id);
    setRoleForm({ name: role.name });
    setInputError(null);
    roleInputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleForm({ name: e.target.value });
    if (inputError) {
      setInputError(null); // Clear borders instantly upon adjustment inputs
    }
  };

  if (loading && roles.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-[#7f1d1d]" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Synchronizing Security Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans text-slate-800">
      {/* --- 1. HEAD BANNER CONSOLE --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-3xs border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#7f1d1d] rounded-2xl flex items-center justify-center shadow-sm shadow-red-900/20 shrink-0">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              Role Management
            </h1>

            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Create and manage user roles and access levels across the
              application.
            </p>
          </div>
        </div>
      </div>

      {/* --- 2. STACKED WORKSPACE CONTROL PANEL (TOP POSITION) --- */}
      <div className="bg-white p-6 rounded-3xl shadow-3xs border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b text-slate-500">
          <KeyRound size={15} />
          <h3 className="text-xs font-black uppercase tracking-wider">
            {editingId
              ? "Edit Role"
              : "Create New Role"}
          </h3>
        </div>

        <form
          onSubmit={handleSaveRole}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
        >
          <div className="md:col-span-8 flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
             Role Name
            </label>
            <input
              ref={roleInputRef}
              type="text"
              value={roleForm.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-2xl focus:bg-white focus:outline-none transition-all text-sm font-medium ${
                inputError
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 focus:ring-2 focus:ring-[#7f1d1d] focus:border-transparent"
              }`}
              placeholder="Enter role name"
            />
            {inputError && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 mt-1.5">
                <AlertCircle size={12} /> {inputError}
              </span>
            )}
          </div>

          <div className="md:col-span-4 flex gap-2 md:mt-[21px] w-full">
            <button
              type="submit"
              className="flex-1 bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-3xs active:scale-98 cursor-pointer h-[42px]"
            >
              {editingId ? "Update Parameters" : "Create Role"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setRoleForm({ name: "" });
                  setInputError(null);
                }}
                className="px-5 py-3 border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer h-[42px]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- 3. GOVERNANCE REGISTRY ACTIVE TABLE DATA GRID (BOTTOM POSITION) --- */}
      <div className="bg-white rounded-3xl shadow-3xs border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
              <Table size={20} className="text-slate-400" />
              Role List
            </h3>
            <p className="text-xs text-slate-400">
              View and manage all roles available in the system.
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
                placeholder="Filter corporate roles..."
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
                    Role Name <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-4 px-6 text-center w-40">
                  System Core Designation
                </th>
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
                      {/* Serial Index Position */}
                      <td className="py-4 px-6 text-center font-mono text-xs font-bold text-slate-400">
                        {String(serialIndex).padStart(2, "0")}
                      </td>

                      {/* Role Title Node */}
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-black text-slate-800 tracking-tight block text-sm">
                            {r.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            UID: {r._id}
                          </span>
                        </div>
                      </td>

                      {/* System Role Flag Indicator */}
                      <td className="py-4 px-6 text-center">
                        {r.isSystemRole ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/40 rounded-xl text-[9px] font-black uppercase tracking-wider">
                            <Radio size={10} className="animate-pulse" />{" "}
                            Protected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-50 text-slate-400 border border-slate-200/30 rounded-xl text-[9px] font-bold uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                      </td>

                      {/* Operations Mutation Control Links Panel */}
                      <td className="py-4 px-6 text-right space-x-2 pr-8">
                        <button
                          type="button"
                          onClick={() => startEditing(r)}
                          disabled={r.isSystemRole}
                          title={
                            r.isSystemRole
                              ? "System Master Core Labels Cannot Be Modified"
                              : "Update Role Label"
                          }
                          className="p-2 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-800 bg-white rounded-xl shadow-3xs transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer inline-flex items-center"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRole(r)}
                          disabled={r.isSystemRole}
                          title={
                            r.isSystemRole
                              ? "System Core Operational Constraints Enforced"
                              : "Purge Role Profile"
                          }
                          className="p-2 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 bg-white rounded-xl shadow-3xs transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer inline-flex items-center"
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
                    colSpan={4}
                    className="py-16 text-center text-xs font-mono text-slate-400"
                  >
                    No active configuration records aligned with search queries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- 4. PAGINATION CONTROLS BAR --- */}
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
