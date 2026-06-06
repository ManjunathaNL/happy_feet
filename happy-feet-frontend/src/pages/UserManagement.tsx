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
    filteredCount,
    totalRecords,
    toggleSort,
    sortConfig,
  } = useTable(users, {
    itemsPerPage: 10,
    searchableFields: [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "roleId.name",
    ],
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
      toast.error("Failed to sync team data nodes cleanly.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user profile?"))
      return;
    try {
      await userAPI.delete(id);
      toast.success("User removed from system registry.");
      loadData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to remove target staff profile.",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-[#7f1d1d]" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Synchronizing User Directory...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans text-slate-800">
      
      {/* --- 1. CORPORATE HEADER BANNER --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-3xs border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#7f1d1d] rounded-2xl flex items-center justify-center shadow-sm shadow-red-900/20 shrink-0">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              User Management
            </h1>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Manage users, assign roles, and control account access.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#7f1d1d] hover:bg-[#6b1a1a] text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-98 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={15} /> Create User
        </button>
      </div>

      {/* --- 2. QUERY CONTROL & UTILITIES FILTER BOX --- */}
      <div className="bg-white rounded-3xl shadow-3xs border border-slate-100 overflow-hidden">
        
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        

        <div>
                    <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
                      <Table size={20} className="text-slate-400" />User List
                    </h3>
                    <p className="text-xs text-slate-400">Modify active profile settings and authorization matrix states.</p>
                  </div>

       <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-slate-400 transition-all text-sm"
            placeholder="Search users by name, email, or role..."
          />
        </div>
      </div>
      </div>

      {/* --- 3. MASTER DATA REGISTRY GRID TABLE --- */}
      
        <div className="w-full overflow-x-auto">
          <table className="min-w-[1000px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                <th
                  className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort("firstName")}
                >
                  <div className="flex items-center gap-1.5">
                    User Name <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort("email")}
                >
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} /> Email Address <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort("mobile")}
                >
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} /> Contact Number <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort("roleId.name")}
                >
                  <div className="flex items-center gap-1.5">
                    <Shield size={12} /> Role <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-50/40 transition-colors group"
                  >
                    {/* User Profile Identity Cell */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#7f1d1d] flex items-center justify-center font-black text-xs uppercase border border-slate-200/40 group-hover:bg-white transition-colors">
                          {u.firstName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 tracking-tight block">
                            {u.firstName} {u.lastName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            ID: {u._id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email Identity Cell */}
                    <td className="py-4 px-6 font-medium text-slate-600 font-mono text-xs">
                      {u.email}
                    </td>

                    {/* Contact Mobile Cell */}
                    <td className="py-4 px-6 font-medium text-slate-600 font-mono text-xs">
                      {u.mobile || "—"}
                    </td>

                    {/* Operational Role Cell */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-red-50/60 text-[#7f1d1d] border border-red-100/30">
                        {u.roleId?.name || u.roleName || (
                          <span className="text-slate-400 italic font-medium">
                            Unassigned
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Active Workflow Status Cell */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          u.status === "active"
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/30'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/30'
                        }`}
                      >
                        {u.status === "active" ? (
                          <>
                            <ToggleRight
                              size={12}
                              className="text-emerald-600"
                            />{" "}
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={12} className="text-rose-600" />{" "}
                            Inactive
                          </>
                        )}
                      </span>
                    </td>

                    {/* Action Panel Cluster */}
                    <td className="py-4 px-6 text-right space-x-2 pr-8">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(u);
                          setIsModalOpen(true);
                        }}
                        title="Update User Record"
                        className="p-2 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-800 bg-white rounded-xl shadow-3xs transition-all cursor-pointer inline-flex items-center"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(u._id)}
                        disabled={u.email === "superadmin@happyfeet.com"}
                        title={
                          u.email === "superadmin@happyfeet.com"
                            ? "System Master Account Core Protected"
                            : "Purge Profile Record"
                        }
                        className="p-2 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 bg-white rounded-xl shadow-3xs transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer inline-flex items-center"
                      >
                        <Trash2 size={13} />
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
                    No matching personnel matrices identified within directory indexes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- 4. INTEGRATED STRUCTURAL PAGINATION CONTROLS --- */}
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

      {/* --- 5. EDIT/CREATE TRANSITIONAL MODAL LAYOUT --- */}
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