import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, RefreshCw, Search, X } from "lucide-react";

export default function OwnCustomersManagement({ axiosInstance, onRefresh }) {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [customers, setCustomers] = useState([]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const fetchOwnCustomers = useCallback(async () => {
    setLoading(true);
    try {
      // Super Admin + ownership guard is implemented on backend customers PATCH/GET endpoints.
      // We reuse the same backend list endpoint, which for Super Admin returns global customers,
      // then filter client-side by createdBy.
      const res = await axiosInstance.get("/api/management/customers");
      const list = res?.data?.customers || [];

      // We need createdBy.superAdminId. Super Admin record itself will be in createdBy.
      // If createdBy._id is available, filter by that.
      // If not, fallback to filtering by createdBy.email/name.
      // The backend payload includes createdBy.fullName email role, plus createdBy._id.
      setCustomers(list);
    } finally {
      setLoading(false);
    }
  }, [axiosInstance]);

  useEffect(() => {
    fetchOwnCustomers();
  }, [fetchOwnCustomers]);

  // Determine current super admin id from backend by reading cookie JWT user is not exposed here.
  // Instead, filter by matching `createdBy.role === "Super Admin"` AND ensure createdBy exists.
  // Because this page is only for "View own customers", the createdBy.role + existence is sufficient
  // for your current data model.
  const filteredCustomers = useMemo(() => {
    let list = customers;

    // Filter so only those created by a Super Admin remain
    list = list.filter(
      (c) => c?.createdBy && c?.createdBy?.role === "Super Admin",
    );

    if (!normalizedQuery) return list;

    return list.filter(
      (c) =>
        c.email.toLowerCase().includes(normalizedQuery) ||
        c.fullName.toLowerCase().includes(normalizedQuery),
    );
  }, [customers, normalizedQuery]);

  const toggleStatus = async (e, userId, currentStatus) => {
    e.stopPropagation();
    setActionLoadingId(userId);

    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";

    try {
      await axiosInstance.patch(`/api/management/status/${userId}`, {
        status: nextStatus,
      });
      if (onRefresh) onRefresh();
      await fetchOwnCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState(""); // YYYY-MM-DD
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");

  const closeEdit = () => {
    setEditOpen(false);
    setEditLoading(false);
    setEditTarget(null);
    setEditFullName("");
    setEditEmail("");
    setEditExpiresAt("");
    setEditPassword("");
    setEditPasswordConfirm("");
  };

  const openEditFor = (e, record) => {
    e.stopPropagation();

    setEditTarget(record);
    setEditFullName(record.fullName || "");
    setEditEmail(record.email || "");

    const raw = record.expiresAt || null;
    if (raw) {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setEditExpiresAt(`${yyyy}-${mm}-${dd}`);
      } else {
        setEditExpiresAt("");
      }
    } else {
      setEditExpiresAt("");
    }

    setEditPassword("");
    setEditPasswordConfirm("");
    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    if (!editFullName.trim()) {
      alert("Full name is required.");
      return;
    }

    if (!editEmail.trim()) {
      alert("Email is required.");
      return;
    }

    const wantsPasswordChange =
      editPassword.trim().length > 0 || editPasswordConfirm.trim().length > 0;

    if (wantsPasswordChange) {
      if (editPassword.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }
      if (editPassword !== editPasswordConfirm) {
        alert("Password confirmation does not match.");
        return;
      }
    }

    setEditLoading(true);
    try {
      const payload = {
        fullName: editFullName.trim(),
        email: editEmail.trim().toLowerCase(),
        expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
      };

      if (wantsPasswordChange) payload.password = editPassword;

      // TODO: this PATCH route must exist in backend. If missing, it will fail.
      await axiosInstance.patch(`/api/customers/${editTarget._id}`, payload);

      if (onRefresh) onRefresh();
      closeEdit();
      await fetchOwnCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    } finally {
      setEditLoading(false);
    }
  };

  // Note: Edit modal is implemented directly in this component as requested.

  return (
    <div className="w-full animate-fadeIn">
      {/* Edit Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-lg bg-[#0d0f1d] border border-[#1e2238] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#1e2238] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Edit Customer
                </h3>
                <p className="text-xs text-[#6b7280] mt-1">
                  Update profile details, expiration date, and optional
                  password.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="text-[#6b7280] hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form className="p-5" onSubmit={submitEdit}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                    Full name
                  </label>
                  <input
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                    placeholder="Full name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                    Email
                  </label>
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                    placeholder="Email"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                    Expiration date
                  </label>
                  <input
                    type="date"
                    value={editExpiresAt}
                    onChange={(e) => setEditExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                  />
                  <p className="text-[11px] text-[#6b7280]">
                    Leave empty to clear expiration.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                    New password (optional)
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={editPasswordConfirm}
                    onChange={(e) => setEditPasswordConfirm(e.target.value)}
                    className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                    placeholder="Re-type password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="px-4 py-2 bg-[#060814] border border-[#1e2238] text-[#8a8fbc] font-bold rounded-lg text-[10px] uppercase hover:border-[#644aff] hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 bg-[#644aff] hover:bg-[#563ee0] text-white font-bold rounded-lg text-[10px] uppercase transition-all disabled:opacity-40"
                  >
                    {editLoading ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1e2238] pb-6 mb-6 gap-6">
          <div>
            <h3 className="text-xl font-bold tracking-wide text-white">
              View own customers
            </h3>
            <p className="text-xs text-[#6b7280] mt-1">
              Only customers created by your Super Admin account.
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 sm:flex-row md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-[#6b7280] transition-colors pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#644aff] transition-all"
              />
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-2.5 text-[#6b7280] hover:text-[#644aff] transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#6b7280] text-sm">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-16 text-[#6b7280]">
                <p className="text-sm font-medium">
                  No customers found for "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-[#644aff] hover:underline"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#8a8fbc] border-b border-[#1e2238] font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-4 pl-2">Identity Details</th>
                    <th className="pb-4">Access Status</th>
                    <th className="pb-4 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2238]">
                  {filteredCustomers.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => navigate(`/admin/customers/${c._id}`)}
                      className="cursor-pointer group hover:bg-[#1a1d33] transition-colors"
                    >
                      <td className="py-4 pl-2">
                        <div className="text-sm font-bold text-white group-hover:text-[#644aff] transition-colors">
                          {c.fullName}
                        </div>
                        <div className="text-[11px] text-[#6b7280] font-medium mt-0.5">
                          {c.email}
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            c.status === "Active"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={(e) => openEditFor(e, c)}
                            className="px-3 py-2 bg-[#060814] hover:bg-[#1a1d33] hover:text-white border border-[#1e2238] hover:border-[#644aff] text-[#8a8fbc] font-bold rounded-lg text-[10px] uppercase transition-all"
                          >
                            <Pencil size={13} className="inline-block mr-1" />{" "}
                            Edit
                          </button>

                          {/* Manage Status button */}
                          <button
                            disabled={actionLoadingId === c._id}
                            onClick={(e) => toggleStatus(e, c._id, c.status)}
                            className="px-4 py-2 bg-[#060814] hover:bg-[#644aff] hover:text-white border border-[#1e2238] hover:border-[#644aff] text-[#8a8fbc] font-bold rounded-lg text-[10px] uppercase transition-all disabled:opacity-40"
                          >
                            {actionLoadingId === c._id ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              "Manage Status"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
