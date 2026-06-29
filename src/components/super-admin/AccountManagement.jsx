import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, RefreshCw, Search, Shield, Users, X } from "lucide-react";

export default function AccountManagement({
  subAdmins = [],
  customers = [],
  onRefresh,
  axiosInstance,
}) {
  const navigate = useNavigate();

  const [activeDirectoryTab, setActiveDirectoryTab] = useState("subAdmins");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState(""); // YYYY-MM-DD
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");

  const activeList = activeDirectoryTab === "subAdmins" ? subAdmins : customers;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredList = useMemo(() => {
    if (!normalizedQuery) return activeList;

    return activeList.filter(
      (user) =>
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.fullName.toLowerCase().includes(normalizedQuery),
    );
  }, [activeList, normalizedQuery]);

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

    // expiresAt is Date in backend; in lists it may come as ISO string
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

  const toggleStatus = async (e, userId, currentStatus) => {
    e.stopPropagation();
    setActionLoadingId(userId);
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      await axiosInstance.patch(`/api/management/status/${userId}`, {
        status: nextStatus,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed.");
    } finally {
      setActionLoadingId(null);
    }
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

    // Password optional; only validate if provided
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

      if (activeDirectoryTab === "subAdmins") {
        await axiosInstance.patch(
          `/api/management/subadmins/${editTarget._id}`,
          payload,
        );
      } else {
        await axiosInstance.patch(`/api/customers/${editTarget._id}`, payload);
      }

      if (onRefresh) onRefresh();
      closeEdit();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-2xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1e2238] pb-6 mb-6 gap-6">
          <div>
            <h3 className="text-xl font-bold tracking-wide text-white">
              Account Directory
            </h3>
            <p className="text-xs text-[#6b7280] mt-1">
              Search and audit your platform entities.
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 sm:flex-row md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-[#6b7280] group-focus-within:text-[#644aff] transition-colors pointer-events-none"
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

            {/* View Switcher */}
            <div className="flex bg-[#060814] p-1 rounded-xl border border-[#1e2238] self-start">
              <button
                onClick={() => setActiveDirectoryTab("subAdmins")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all ${
                  activeDirectoryTab === "subAdmins"
                    ? "bg-[#644aff] text-white shadow-lg"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                <Shield size={14} /> Sub-Admins
              </button>
              <button
                onClick={() => setActiveDirectoryTab("customers")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all ${
                  activeDirectoryTab === "customers"
                    ? "bg-[#644aff] text-white shadow-lg"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                <Users size={14} /> Customers
              </button>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto text-xs">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-[#6b7280]">
              <p className="text-sm font-medium">
                No records found for "{searchQuery}"
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
                  <th className="pb-4">Creation Source</th>
                  <th className="pb-4">Access Status</th>
                  <th className="pb-4 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2238]">
                {filteredList.map((userRecord) => (
                  <tr
                    key={userRecord._id}
                    onClick={() => {
                      const base =
                        activeDirectoryTab === "subAdmins"
                          ? `/admin/sub-admins/${userRecord._id}`
                          : `/admin/customers/${userRecord._id}`;
                      navigate(base);
                    }}
                    className="cursor-pointer group hover:bg-[#1a1d33] transition-colors"
                  >
                    <td className="py-4 pl-2">
                      <div className="text-sm font-bold text-white group-hover:text-[#644aff] transition-colors">
                        {userRecord.fullName}
                      </div>
                      <div className="text-[11px] text-[#6b7280] font-medium mt-0.5">
                        {userRecord.email}
                      </div>
                    </td>

                    <td className="py-4">
                      {userRecord.createdBy ? (
                        <div className="flex flex-col">
                          <span className="text-[#644aff] font-semibold">
                            {userRecord.createdBy.fullName}
                          </span>
                          <span className="text-[9px] text-[#6b7280] uppercase">
                            {userRecord.createdBy.role}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6b7280] italic">
                          System Bootstrap
                        </span>
                      )}
                    </td>

                    <td className="py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          userRecord.status === "Active"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {userRecord.status}
                      </span>
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit button */}
                        <button
                          type="button"
                          disabled={
                            editLoading && editTarget?._id === userRecord._id
                          }
                          onClick={(e) => openEditFor(e, userRecord)}
                          className="px-3 py-2 bg-[#060814] hover:bg-[#1a1d33] hover:text-white border border-[#1e2238] hover:border-[#644aff] text-[#8a8fbc] font-bold rounded-lg text-[10px] uppercase transition-all disabled:opacity-40"
                          aria-label="Edit account"
                        >
                          <Pencil size={13} className="inline-block mr-1" />{" "}
                          Edit
                        </button>

                        {/* Manage Status button */}
                        <button
                          type="button"
                          disabled={actionLoadingId === userRecord._id}
                          onClick={(e) =>
                            toggleStatus(e, userRecord._id, userRecord.status)
                          }
                          className="px-4 py-2 bg-[#060814] hover:bg-[#644aff] hover:text-white border border-[#1e2238] hover:border-[#644aff] text-[#8a8fbc] font-bold rounded-lg text-[10px] uppercase transition-all disabled:opacity-40"
                        >
                          {actionLoadingId === userRecord._id ? (
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
      </div>

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
                  Edit{" "}
                  {activeDirectoryTab === "subAdmins"
                    ? "Sub Admin"
                    : "Customer"}
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
    </div>
  );
}
