import React, { useState, useEffect, useMemo } from "react";
import { roleAPI, routeAPI, mappingAPI } from "../services/api";
import { useTable } from "../hooks/useTable";
import { Pagination } from "../components/Pagination";
import Select, { StylesConfig, MultiValue } from "react-select";
import toast from "react-hot-toast";
import {
  ShieldAlert,
  Save,
  Search,
  Table,
  SlidersHorizontal,
  Edit2,
  Trash2,
  X,
  ShieldCheck,
} from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface GroupedMapping {
  _id: string; // Using Role ID as the unique key for table iterations
  roleId: { _id: string; name: string };
  assignedRoutes: Array<{
    mappingId: string;
    routeId: string;
    name: string;
    path: string;
  }>;
}

export const AccessMappings: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [rawMappings, setRawMappings] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<SelectOption | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<
    MultiValue<SelectOption>
  >([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Shared styling template configuration properties
  const baseSelectTheme = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: "1rem",
      padding: "0.125rem 0.25rem",
      borderColor: state.isFocused
        ? "var(--dynamic-accent-bg, #7f1d1d)"
        : "#e2e8f0",
      boxShadow: state.isFocused
        ? "0 0 0 1px var(--dynamic-accent-bg, #7f1d1d)"
        : "none",
      backgroundColor: "#ffffff",
      "&:hover": { borderColor: "var(--dynamic-accent-bg, #7f1d1d)" },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--dynamic-accent-bg, #7f1d1d)"
        : state.isFocused
          ? "rgba(127, 29, 29, 0.05)"
          : "transparent",
      color: state.isSelected
        ? "var(--dynamic-accent-text, #ffffff)"
        : "#1e293b",
      cursor: "pointer",
      "&:active": { backgroundColor: "var(--dynamic-accent-bg, #7f1d1d)" },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "rgba(127, 29, 29, 0.08)",
      borderRadius: "0.5rem",
      border: "1px solid rgba(127, 29, 29, 0.15)",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "var(--dynamic-accent-bg, #7f1d1d)",
      fontWeight: "700",
      fontSize: "11px",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "var(--dynamic-accent-bg, #7f1d1d)",
      "&:hover": {
        backgroundColor: "var(--dynamic-accent-bg, #7f1d1d)",
        color: "#ffffff",
        borderRadius: "0.4rem",
      },
    }),
  };

  // 2. Type-Safe isolated style hooks for Single Selection elements
  const singleSelectStyles: StylesConfig<SelectOption, false> = baseSelectTheme;

  // 3. Type-Safe isolated style hooks for Multi Selection elements
  const multiSelectStyles: StylesConfig<SelectOption, true> = baseSelectTheme;

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const [rolesRes, routesRes, mappingsRes] = await Promise.all([
        roleAPI.getAll(),
        routeAPI.getAll(),
        mappingAPI.getAll(),
      ]);

      setRoles(rolesRes.data?.data || rolesRes.data || []);
      setAllRoutes(routesRes.data?.data || routesRes.data || []);
      setRawMappings(mappingsRes.data?.data || mappingsRes.data || []);
    } catch (err) {
      toast.error("Initialization exception occurring within data nodes.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Process database rows into a grouped single-row-per-role interface model
  const groupedTableData = useMemo(() => {
    const mapAggregator: Record<string, GroupedMapping> = {};

    rawMappings.forEach((item: any) => {
      if (!item.roleId || !item.routeId) return;
      const rId = item.roleId._id;

      if (!mapAggregator[rId]) {
        mapAggregator[rId] = {
          _id: rId,
          roleId: { _id: rId, name: item.roleId.name },
          assignedRoutes: [],
        };
      }

      mapAggregator[rId].assignedRoutes.push({
        mappingId: item._id,
        routeId: item.routeId._id,
        name: item.routeId.name,
        path: item.routeId.path,
      });
    });

    return Object.values(mapAggregator);
  }, [rawMappings]);

  // Connect structured data metrics with the useTable custom hook infrastructure
  const {
    paginatedData,
    page,
    totalPages,
    itemsPerPage,
    search,
    pageNumbers,
    hasNext,
    hasPrev,
    setPage,
    setSearch,
    setItemsPerPage,
  } = useTable(groupedTableData, {
    itemsPerPage: 10,
    searchableFields: ["roleId.name"],
  });

  const roleOptions = useMemo(
    () => roles.map((r) => ({ value: r._id, label: r.name })),
    [roles],
  );
  const routeOptions = useMemo(
    () => allRoutes.map((r) => ({ value: r._id, label: r.name })),
    [allRoutes],
  );

  const handleRoleChange = async (selected: SelectOption | null) => {
    setSelectedRole(selected);
    if (!selected) {
      setSelectedRoutes([]);
      return;
    }

    // Match existing assignments to pre-populate select targets automatically
    const existingGroup = groupedTableData.find(
      (g) => g.roleId._id === selected.value,
    );
    if (existingGroup) {
      const formattedSelections = existingGroup.assignedRoutes.map((r) => ({
        value: r.routeId,
        label: r.name,
      }));
      setSelectedRoutes(formattedSelections);
    } else {
      setSelectedRoutes([]);
    }
  };

  const resetForm = () => {
    setSelectedRole(null);
    setSelectedRoutes([]);
    setIsEditing(false);
  };

  const commitMappingChanges = async () => {
    if (!selectedRole)
      return toast.error("Please assign a destination profile target.");

    setLoading(true);
    const destinationIds = selectedRoutes.map((opt) => opt.value);

    try {
      await mappingAPI.assign(selectedRole.value, destinationIds);
      toast.success(
        isEditing
          ? "Access permissions updated successfully."
          : "Access permissions assigned successfully.",
      );

      resetForm();

      // Sync list state indexes directly
      const mappingsRes = await mappingAPI.getAll();
      setRawMappings(mappingsRes.data?.data || mappingsRes.data || []);

      // Clear workspace select buckets cleanly
      setSelectedRole(null);
      setSelectedRoutes([]);
      setIsEditing(false);
    } catch (err) {
      toast.error("Operational failure during structural execution.");
    } finally {
      setLoading(false);
    }
  };

  const loadRowToWorkspace = (row: GroupedMapping) => {
    setSelectedRole({
      value: row.roleId._id,
      label: row.roleId.name,
    });

    setSelectedRoutes(
      row.assignedRoutes.map((r) => ({
        value: r.routeId,
        label: r.name,
      })),
    );

    setIsEditing(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const removeCompleteRoleMapping = async (roleId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to completely clear access routes for this role profile?",
      )
    )
      return;

    setLoading(true);
    try {
      // Pass empty array to clear all existing mapping associations for this specific role ID
      await mappingAPI.assign(roleId, []);
      toast.success("Role access configuration cleared successfully.");

      const mappingsRes = await mappingAPI.getAll();
      setRawMappings(mappingsRes.data?.data || mappingsRes.data || []);
    } catch (err) {
      toast.error("Failed to eliminate target permission entries.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full text-slate-800">
      {/* Banner Component Block */}
      <div className="p-6 rounded-3xl bg-[var(--dynamic-accent-bg,#7f1d1d)] text-[var(--dynamic-accent-text,#ffffff)] shadow-sm">
        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
          <ShieldAlert size={32} /> User Access Management
        </h1>

        <p className="text-sm opacity-80 mt-1 font-medium">
          Manage user roles and their access to application pages and features.
        </p>
      </div>

      {/* TOP SECTION: Combined Input Workspace Row Block Layout */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b text-slate-500">
          <SlidersHorizontal size={16} />
          <h3 className="text-xs font-black uppercase tracking-wider">
            Access Permission Setup
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Target Role Dropdown Box */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <Select
              isMulti={false}
              options={roleOptions}
              value={selectedRole}
              onChange={handleRoleChange}
              placeholder="Select Target Role..."
              isClearable
              styles={singleSelectStyles} // ✅ Fixed: Using dedicated single-select mapping type signatures
            />
          </div>

          {/* Searchable Multi-Select Routes Dropdown Box */}
          <div className="md:col-span-6">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Assigned Pages & Features
            </label>
            <Select
              isMulti={true}
              options={routeOptions}
              value={selectedRoutes}
              onChange={(selected) => setSelectedRoutes(selected || [])}
              placeholder="Search and attach functional access routes..."
              styles={multiSelectStyles} // ✅ Fixed: Using dedicated multi-select mapping type signatures
              closeMenuOnSelect={false}
            />
          </div>

          {/* Submission Button Action Panel */}
          <div className="md:col-span-3 flex gap-2">
            <button
              type="button"
              onClick={commitMappingChanges}
              disabled={loading || !selectedRole}
              style={{
                backgroundColor:
                  selectedRole && !loading
                    ? "var(--dynamic-accent-bg, #7f1d1d)"
                    : "#e2e8f0",
                color:
                  selectedRole && !loading
                    ? "var(--dynamic-accent-text, #ffffff)"
                    : "#94a3b8",
              }}
              className="flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all hover:brightness-105 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {isEditing ? "Update Access" : "Save Access"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 border border-slate-300 bg-white text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <X size={14} />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Grouped Structural Governance Grid Table Interface View */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
              <Table size={20} className="text-slate-400" /> Role Access List
            </h3>
            <p className="text-xs text-slate-400">
              View and manage page and feature access assigned to each role.
            </p>
          </div>

          {/* Inline Live Query Filter Element */}
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={15}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search role name..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-slate-400 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="py-4 px-6 w-16 text-center">Sl.No</th>
                <th className="py-4 px-6 w-52">Role Name</th>
                <th className="py-4 px-6">Assigned Pages & Features</th>
                <th className="py-4 px-6 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-16 text-xs font-mono text-slate-400"
                  >
                    No access permissions found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: GroupedMapping, idx: number) => {
                  const serialIndex = (page - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/40 transition-colors items-start"
                    >
                      {/* 1. Sequential Listing Column Index */}
                      <td className="py-5 px-6 font-mono text-xs text-slate-400 text-center font-bold">
                        {String(serialIndex).padStart(2, "0")}
                      </td>

                      {/* 2. Role Component Label View */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <ShieldCheck
                            size={16}
                            className="text-slate-400 shrink-0"
                          />
                          <span className="font-black text-slate-800 tracking-tight text-sm">
                            {item.roleId.name}
                          </span>
                        </div>
                      </td>

                      {/* 3. Aggregated Inline Flow Badges Viewport Matrix */}
                      <td className="py-5 px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-3xl">
                          {item.assignedRoutes.length === 0 ? (
                            <span className="text-xs italic text-slate-400 font-medium bg-slate-50 border px-3 py-1 rounded-xl">
                              No endpoints attached to this profile.
                            </span>
                          ) : (
                            item.assignedRoutes.map((route) => (
                              <div
                                key={route.mappingId}
                                className="group/badge flex items-center gap-1.5 pl-2.5 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 shadow-3xs transition-all text-xs"
                              >
                                <span className="font-bold text-slate-700">
                                  {route.name}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded-md max-w-[120px] truncate">
                                  {route.path}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </td>

                      {/* 4. CRUD Mutation Matrix Control Blocks Panel */}
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => loadRowToWorkspace(item)}
                            title="Edit Permissions Map"
                            className="p-2 border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-900 bg-white rounded-xl shadow-3xs transition-all cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              removeCompleteRoleMapping(item.roleId._id)
                            }
                            title="Purge Role Authorization"
                            className="p-2 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 bg-white rounded-xl shadow-3xs transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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
      </div>
    </div>
  );
};
