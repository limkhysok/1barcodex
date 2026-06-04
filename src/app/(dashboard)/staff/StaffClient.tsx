"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/src/context/AuthContext";
import type { User } from "@/src/types/auth.types";
import { getStaffUsers, createStaffUser, updateStaffUser, deleteStaffUser } from "@/src/services/user.service";
import { toast } from "sonner";
import {
  Users,
  User as
  Search,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit2,
  Trash2,
  X as CloseIcon,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";



const SortIcon = ({ field, currentOrdering }: { field: string; currentOrdering: string }) => {
  const isAsc = currentOrdering === field;
  const isDesc = currentOrdering === `-${field}`;
  if (!isAsc && !isDesc) return null;
  return isAsc ? (
    <ArrowUp size={10} className="ml-1.5 text-orange-500" strokeWidth={3} />
  ) : (
    <ArrowDown size={10} className="ml-1.5 text-orange-500" strokeWidth={3} />
  );
};

const Header = ({
  label,
  field,
  className,
  ordering,
  handleSort,
}: {
  label: string;
  field?: string;
  className?: string;
  ordering: string;
  handleSort: (f: string) => void;
}) => {
  const isSortable = !!field;
  const isActive = field && (ordering === field || ordering === `-${field}`);
  return (
    <th
      onClick={() => isSortable && field && handleSort(field)}
      className={`px-4 py-2 text-left text-sm font-medium transition-all duration-200 select-none ${isSortable ? "cursor-pointer hover:bg-slate-100/50" : ""
        } ${isActive ? "text-orange-600 bg-orange-50/30" : "text-gray-800"} ${className || ""}`}
    >
      <div className={`flex items-center ${className?.includes('center') ? 'justify-center' : ''} ${className?.includes('right') ? 'justify-end' : ''}`}>
        {label}
        {isSortable && field && <SortIcon field={field} currentOrdering={ordering} />}
      </div>
    </th>
  );
};

function RoleBadge({ user }: Readonly<{ user: User }>) {
  if (user.is_superuser) return <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">Superadmin</span>;
  if (user.is_boss)      return <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">Boss</span>;
  return                        <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">Staff</span>;
}

export default function StaffClient() {
  const { role, isLoading: authLoading } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("username");

  const hasAccess = role === "boss" || role === "superadmin";

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    is_boss: false,
    is_staff: true,
  });

  const loadStaff = useCallback(() => {
    if (authLoading || !hasAccess) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getStaffUsers()
      .then(setStaff)
      .catch((err) => {
        if (err?.response?.status === 403) {
          setError("403 Forbidden: You do not have permission to view staff users.");
        } else {
          setError("Failed to load staff users. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [hasAccess, authLoading]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      username: "",
      name: "",
      password: "",
      is_boss: false,
      is_staff: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      password: "",
      is_boss: false,
      is_staff: true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === "create") {
        await createStaffUser(formData);
        toast.success("Staff member created successfully.");
      } else if (selectedUser) {
        // Only send password if it was changed
        const updateData: Partial<typeof formData> = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateStaffUser(selectedUser.id, updateData);
        toast.success("Staff member updated successfully.");
      }
      setModalOpen(false);
      loadStaff();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "An error occurred. Please check your data.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = globalThis.confirm?.("Are you sure you want to delete this staff member? This action is permanent.");
    if (!confirmed) return;

    try {
      await deleteStaffUser(id);
      toast.success("Staff member deleted successfully.");
      loadStaff();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete staff member.");
    }
  };

  const displayed = useMemo(() => {
    let list = [...staff];

    // Search
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(u =>
        u.username.toLowerCase().includes(s) ||
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
      );
    }

    // Sort
    if (ordering) {
      const isDesc = ordering.startsWith("-");
      const field = isDesc ? ordering.substring(1) : ordering;

      list.sort((a: User, b: User) => {
        const valA = (a[field as keyof User] || "").toString().toLowerCase();
        const valB = (b[field as keyof User] || "").toString().toLowerCase();
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    return list;
  }, [staff, search, ordering]);

  const handleSort = (field: string) => {
    if (ordering === field) setOrdering(`-${field}`);
    else if (ordering === `-${field}`) setOrdering("");
    else setOrdering(field);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#FA4900", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <p className="max-w-md text-center py-4 text-[10px] font-black text-red-500 bg-red-50/50 rounded-sm border border-red-100 uppercase tracking-[0.2em] leading-loose">
          UNAUTHORIZED ACCESS. THIS PAGE IS RESTRICTED TO BOSS AND ADMINISTRATORS ONLY.
        </p>
      </div>
    );
  }

  const submitText = modalMode === "create" ? "Create Member" : "Save Changes";

  return (
    <div className="px-4 py-5 sm:px-5 sm:py-5 space-y-4">
      {/* ── MOBILE (< sm) ── */}
      <div className="sm:hidden flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg font-normal text-slate-950">Staff</h1>
          <p className="text-xs text-slate-600">Management</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-2 py-1 rounded-md text-[13px] font-regular bg-orange-500 text-white active:scale-[0.98] transition-all cursor-pointer"
        >
          Add
        </button>
      </div>

      {/* ── MOBILE search row ── */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 bg-slate-50 border border-gray-400 rounded-lg px-2.5 h-8 focus-within:border-orange-200 focus-within:bg-white transition-all overflow-hidden">
          <Search size={13} className="text-gray-700 shrink-0" strokeWidth={3} />
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-[13px] text-slate-900 placeholder:text-gray-500 w-full font-regular"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-300 hover:text-slate-900 cursor-pointer shrink-0">
              <CloseIcon size={13} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* ── TABLET (sm → lg) ── */}
      <div className="hidden sm:flex lg:hidden items-center justify-between">
        <div className="flex flex-col border-l-2 border-orange-500 pl-3">
          <h1 className="text-xl font-normal text-slate-950">Staff</h1>
          <p className="text-sm text-slate-600">View and manage authorized staff members.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 border border-gray-400 rounded-lg px-2.5 h-8 w-52 focus-within:border-orange-200 focus-within:bg-white transition-all overflow-hidden">
            <Search size={13} className="text-gray-700 shrink-0" strokeWidth={3} />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-slate-900 placeholder:text-gray-500 w-full font-regular"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-300 hover:text-slate-900 cursor-pointer shrink-0">
                <CloseIcon size={13} strokeWidth={2} />
              </button>
            )}
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-regular bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.97] transition-all cursor-pointer shrink-0"
          >
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* ── DESKTOP (≥ lg) ── */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div className="flex flex-col border-l-4 border-orange-500 pl-4">
          <h1 className="text-2xl font-normal text-slate-950">Staff</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-slate-600">View and manage authorized staff members.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-gray-400 rounded-lg px-2.5 h-8 w-64 focus-within:border-orange-200 focus-within:bg-white transition-all overflow-hidden">
            <Search size={13} className="text-gray-700 shrink-0" strokeWidth={3} />
            <input
              type="text"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] text-slate-900 placeholder:text-gray-500 w-full font-regular"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-300 hover:text-slate-900 cursor-pointer shrink-0">
                <CloseIcon size={13} strokeWidth={2} />
              </button>
            )}
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm bg-orange-500 font-regular text-white hover:bg-orange-600 active:scale-[0.96] transition-all cursor-pointer shrink-0"
          >
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Loading progress bar */}
      <div className={`h-0.5 w-full overflow-hidden rounded-full transition-opacity duration-300 ${loading ? "opacity-100" : "opacity-0"}`}>
        <div className="h-full bg-orange-500 animate-pulse w-full" />
      </div>

      {/* Table Section */}
      <div className="overflow-hidden bg-white border border-slate-500 rounded-lg">
        {error && (
          <div className="flex items-center justify-center py-20 px-4">
            <p className="max-w-md text-center py-4 text-[10px] font-black text-red-500 bg-red-50/50 rounded-sm border border-red-100 uppercase tracking-[0.2em] leading-loose">
              {error}
            </p>
          </div>
        )}

        {!error && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-300">
            <Users className="w-10 h-10 opacity-20" strokeWidth={1} />
            <p className="text-[9px] font-black uppercase tracking-[0.25em]">No staff users found.</p>
          </div>
        )}

        {!error && displayed.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-gray-600">
                <tr>
                  <Header label="No" field="id" ordering={ordering} handleSort={handleSort} className="pl-6 w-16" />
                  <Header label="Full Name" field="name" ordering={ordering} handleSort={handleSort} />
                  <Header label="Username" field="username" ordering={ordering} handleSort={handleSort} />
                  <Header label="Role" ordering={ordering} handleSort={handleSort} className="w-32" />
                  <Header label="Actions" ordering={ordering} handleSort={handleSort} className="w-32 pr-6 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {displayed.map((u) => (
                  <tr key={u.id} className="group hover:bg-orange-50/60 transition-colors">
                    <td className="pl-6 px-4 py-2">
                      <span className="text-[11px] font-black text-slate-500 tabular-nums group-hover:text-orange-600 transition-colors">{u.id}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        
                        <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[13px] font-medium text-slate-900">{u.username}</span>
                    </td>
                    <td className="px-4 py-2">
                      <RoleBadge user={u} />
                    </td>
                    <td className="pr-6 px-4 py-2 text-right">
                      {u.is_superuser ? (
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic pr-2">System Admin</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-sm transition-all"
                            title="Edit Staff"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                            title="Delete Staff"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Showing {displayed.length} {displayed.length === 1 ? "staff member" : "staff members"}
        </p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Total Staff: {staff.length}
        </p>
      </div>
      {/* Staff Management Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
          <button className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-default" onClick={() => setModalOpen(false)} aria-label="Close modal" />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-400 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                  {modalMode === "create"
                    ? <Plus size={18} strokeWidth={2.5} className="text-white" />
                    : <Edit2 size={16} strokeWidth={2.5} className="text-white" />}
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900">
                    {modalMode === "create" ? "New Staff Member" : "Edit Staff Member"}
                  </h2>
                  <p className="text-[13px] text-gray-400">
                    {modalMode === "create" ? "Fill in the details below" : "Update staff details below"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0 active:scale-95"
              >
                <CloseIcon size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/40 min-h-0 pb-8">

              {/* Username & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="staff-username" className="text-[13px] font-medium text-gray-800">Username</label>
                    <span className="text-[13px] font-medium px-2 py-0.5 rounded-full text-orange-500 bg-orange-50">Required</span>
                  </div>
                  <input
                    id="staff-username"
                    required
                    type="text"
                    placeholder="e.g. john_doe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-600 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-1 focus:border-orange-400 focus:bg-white transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="staff-name" className="text-[13px] font-medium text-gray-800">Full Name</label>
                    <span className="text-[13px] font-medium px-2 py-0.5 rounded-full text-orange-500 bg-orange-50">Required</span>
                  </div>
                  <input
                    id="staff-name"
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-600 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-1 focus:border-orange-400 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="staff-password" className="text-[13px] font-medium text-gray-800">Password</label>
                  <span className={`text-[13px] font-medium px-2 py-0.5 rounded-full ${modalMode === "edit" ? "text-gray-300 bg-gray-50" : "text-orange-500 bg-orange-50"}`}>
                    {modalMode === "edit" ? "Optional" : "Required"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="staff-password"
                    required={modalMode === "create"}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={modalMode === "edit" ? "Leave blank to keep current" : "Enter password"}
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-gray-600 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-1 focus:border-orange-400 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-[13px] font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 active:scale-[0.97] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl text-[13px] font-medium text-white bg-orange-500 hover:bg-orange-600 active:scale-[0.97] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Processing…
                    </>
                  ) : (
                    submitText
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
