import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Mail,
  Shield,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  Phone,
  Table,
} from "lucide-react";
import toast from "react-hot-toast";
import { UserModal } from "../components/UserModal";
import { Pagination } from "../components/Pagination";
import { userAPI, roleAPI } from "../services/api";
import { useTable } from "../hooks/useTable";

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hook into our unified custom useTable engine
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
  } = useTable(users, {
    itemsPerPage: 10,
    searchableFields: ["firstName", "lastName", "email", "mobile", "roleId.name"],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        userAPI.getAll(),
        roleAPI.getAll(),
      ]);
      setUsers(uRes.data || []);
      setRoles(rRes.data?.data || rRes.data || []);
    } catch (err) {
      toast.error("Failed to sync team directory mappings securely.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently drop this profile context?")) return;
    try {
      await userAPI.delete(id);
      toast.success("User profile removed cleanly.");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to drop staff directory mapping.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-[#7f1d1d]" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Synchronizing User Registry Nodes...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans text-slate-800">
      
      {/* HEADER HERO ACCENT BANNER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#7f1d1d] rounded-2xl flex items-center justify-center shadow-md shadow-red-900/10 shrink-0">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">User Management</h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Configure operational staff profiles and security matrix layers.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white px-5 h-11 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-3xs cursor-pointer"
        >
          <UserPlus size={14} /> Create User
        </button>
      </div>

      {/* FILTER SEARCH DRAWER CORE WRAPPER CONTROLLER & MASTER CONTAINER */}
      <div className="bg-white rounded-3xl shadow-3xs border border-slate-100 overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-xl tracking-tight flex items-center gap-2 text-slate-900">
              <Table size={20} className="text-slate-400" /> System Access Directories
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Modify operational roles, parameters, and status vectors.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-300 transition-all text-xs font-medium"
              placeholder="Search by name, email, or role..."
            />
          </div>
        </div>

        {/* DATA CONTAINER INTERFACE TABLE FRAME */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/60 transition-colors w-1/4" onClick={() => toggleSort("firstName")}>
                  <div className="flex items-center gap-1.5">User Identity <ArrowUpDown size={12} className="text-slate-400 shrink-0" /></div>
                </th>
                <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/60 transition-colors w-1/4" onClick={() => toggleSort("email")}>
                  <div className="flex items-center gap-1.5"><Mail size={12} className="shrink-0" /> Email Address <ArrowUpDown size={12} className="text-slate-400 shrink-0" /></div>
                </th>
                <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/60 transition-colors w-1/5" onClick={() => toggleSort("mobile")}>
                  <div className="flex items-center gap-1.5"><Phone size={12} className="shrink-0" /> Contact Number <ArrowUpDown size={12} className="text-slate-400 shrink-0" /></div>
                </th>
                <th className="py-4 px-6 cursor-pointer hover:bg-slate-100/60 transition-colors" onClick={() => toggleSort("roleId.name")}>
                  <div className="flex items-center gap-1.5"><Shield size={12} className="shrink-0" /> Authorization Role <ArrowUpDown size={12} className="text-slate-400 shrink-0" /></div>
                </th>
                <th className="py-4 px-6 text-center w-28">Status</th>
                <th className="py-4 px-6 text-right pr-8 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#7f1d1d] flex items-center justify-center font-black text-xs uppercase border border-slate-200/30 group-hover:bg-white transition-colors shrink-0">
                          {u.firstName?.charAt(0) || "U"}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-800 tracking-tight block truncate">{u.firstName} {u.lastName}</span>
                          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">ID: {u._id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600 font-mono text-xs truncate">{u.email}</td>
                    <td className="py-4 px-6 font-medium text-slate-600 font-mono text-xs">{u.mobile || "—"}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-red-50 text-[#7f1d1d] border border-red-100/40">
                        {u.roleId?.name || u.roleName || "Unassigned Staff"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                        u.status === "active" ? 'bg-emerald-50 text-emerald-700 border-emerald-200/30' : 'bg-rose-50 text-rose-700 border-rose-200/30'
                      }`}>
                        {u.status === "active" ? (
                          <><ToggleRight size={12} className="text-emerald-600 shrink-0" /> Active</>
                        ) : (
                          <><ToggleLeft size={12} className="text-rose-600 shrink-0" /> Inactive</>
                        )}
                      </span>
                    </td>
                    
                    {/* FIXED FLEX ACTION PANEL ELEMENT CELL */}
                    <td className="py-4 px-6 text-right pr-8">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(u);
                            setIsModalOpen(true);
                          }}
                          className="p-2 border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 bg-white rounded-xl transition-all cursor-pointer inline-flex items-center shadow-3xs"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(u._id)}
                          disabled={u.email === "superadmin@happyfeet.com"}
                          className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 bg-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer inline-flex items-center shadow-3xs"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs font-mono text-slate-400">
                    No matching registry references allocated in this workspace index.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL FOOTER BOUND */}
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

      {isModalOpen && (
        <UserModal
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
          onSave={loadData}
          roles={roles}
        />
      )}
    </div>
  );
};