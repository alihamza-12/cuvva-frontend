import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import ConfirmDeleteModal from "../common/ConfirmDeleteModal";
import UppercaseInput from "../common/UppercaseInput";
import {
  getSuspensionSummary,
  requestSuspensionDays,
} from "../../utils/customerSuspension";

export default function AccountManagement({
  subAdmins = [],
  customers = [],
  onRefresh,
  axiosInstance,
  ownCustomersOnly = false,
}) {
  const navigate = useNavigate();

  const [activeDirectoryTab, setActiveDirectoryTab] = useState("subAdmins");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Delete flow — nothing happens until Confirm Delete is pressed.
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await axiosInstance.delete(`/api/management/customers/${deleteTarget._id}`);
      setDeleteTarget(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      setDeleteError(
        error?.response?.data?.message || "Failed to delete this customer.",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState(""); 
  const [editPassword, setEditPassword] = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Residential address — customers only. Sub Admin accounts have no address.
  const [editPhone, setEditPhone] = useState("");
  const [editAdditionalPhones, setEditAdditionalPhones] = useState([]);
  const [editAddress, setEditAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    postcode: "",
  });

  const activeList = activeDirectoryTab === "subAdmins" ? subAdmins : customers;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredList = useMemo(() => {
    if (!normalizedQuery) return activeList;

    return activeList.filter(
      (user) =>
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.fullName.toLowerCase().includes(normalizedQuery) ||
        (user.drivingLicenceNumber || "")
          .toLowerCase()
          .includes(normalizedQuery),
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
    setShowPassword(false);
    setShowPasswordConfirm(false);
    setEditPhone("");
    setEditAdditionalPhones([]);
    setEditAddress({ line1: "", line2: "", city: "", postcode: "" });
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
    setShowPassword(false);
    setShowPasswordConfirm(false);

    setEditPhone(record.phone || "");
    setEditAdditionalPhones(record.additionalPhones || []);

    // Prefill the saved address so the admin edits real values, not blanks.
    setEditAddress({
      line1: record.address?.line1 || "",
      line2: record.address?.line2 || "",
      city: record.address?.city || "",
      postcode: record.address?.postcode || "",
    });

    setEditOpen(true);
  };

  const toggleStatus = async (e, userId, currentStatus) => {
    e.stopPropagation();
    setActionLoadingId(userId);
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    const suspensionDays =
      nextStatus === "Suspended" && activeDirectoryTab === "customers"
        ? requestSuspensionDays()
        : undefined;
    if (nextStatus === "Suspended" && activeDirectoryTab === "customers" && !suspensionDays) {
      setActionLoadingId(null);
      return;
    }
    try {
      await axiosInstance.patch(`/api/management/status/${userId}`, {
        status: nextStatus,
        suspensionDays,
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

      // Only customers have a phone / residential address.
      if (activeDirectoryTab !== "subAdmins") {
        if (editPhone.trim()) payload.phone = editPhone.trim();
        payload.additionalPhones = editAdditionalPhones
          .map((value) => value.trim())
          .filter(Boolean);
        payload.address = {
          line1: editAddress.line1.trim(),
          line2: editAddress.line2.trim(),
          city: editAddress.city.trim(),
          postcode: editAddress.postcode.trim().toUpperCase(),
        };
      }

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
    <div className="w-full animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-2xl">

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
          
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-[#6b7280] group-focus-within:text-[#644aff] transition-colors pointer-events-none"
              />

              <input
                type="text"
                placeholder="Search name, email or licence..."
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
            <>
              {/* Phone cards */}
              <div className="mt-4 space-y-3 md:hidden">
                {filteredList.map((userRecord) => (
                  <article
                    key={userRecord._id}
                    onClick={() => {
                      const base =
                        activeDirectoryTab === "subAdmins"
                          ? `/admin/sub-admins/${userRecord._id}`
                          : `/admin/customers/${userRecord._id}`;
                      navigate(base);
                    }}
                    className="rounded-2xl border border-[#1e2238] bg-[#0d0f1d] p-4 cursor-pointer"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-white">
                          {userRecord.fullName}
                        </h3>
                        <p className="text-sm text-[#8a8fbc] break-all mt-0.5">
                          {userRecord.email}
                        </p>
                        {userRecord.drivingLicenceNumber && (
                          <p className="mt-1 font-mono text-[11px] text-[#6b7280]">
                            {userRecord.drivingLicenceNumber}
                          </p>
                        )}
                        {getSuspensionSummary(userRecord) && (
                          <p className="mt-1 text-[10px] leading-snug text-red-300">
                            {getSuspensionSummary(userRecord)}
                          </p>
                        )}
                        {userRecord.createdBy ? (
                          <p className="text-[11px] text-[#6b7280] mt-1.5 leading-snug">
                            <span className="text-[#644aff] font-semibold">
                              {userRecord.createdBy.fullName}
                            </span>{" "}
                            <span className="uppercase text-[10px]">
                              ({userRecord.createdBy.role})
                            </span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#6b7280] italic mt-1.5">
                            System Bootstrap
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase mt-1 ${
                          userRecord.status === "Active"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {userRecord.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const base =
                            activeDirectoryTab === "subAdmins"
                              ? `/admin/sub-admins/${userRecord._id}`
                              : `/admin/customers/${userRecord._id}`;
                          navigate(base);
                        }}
                        className="w-full min-h-[44px] rounded-xl bg-[#060814] border border-[#1e2238] text-[#8a8fbc] font-bold text-[11px] uppercase tracking-wider hover:border-[#644aff] hover:text-white transition-all"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        disabled={
                          editLoading && editTarget?._id === userRecord._id
                        }
                        onClick={(e) => openEditFor(e, userRecord)}
                        className="w-full min-h-[44px] rounded-xl bg-[#060814] border border-[#1e2238] text-[#8a8fbc] font-bold text-[11px] uppercase tracking-wider hover:border-[#644aff] hover:text-white transition-all disabled:opacity-40"
                        aria-label="Edit account"
                      >
                        <Pencil size={13} className="inline-block mr-1" /> Edit
                      </button>

                      <button
                        type="button"
                        disabled={actionLoadingId === userRecord._id}
                        onClick={(e) =>
                          toggleStatus(e, userRecord._id, userRecord.status)
                        }
                        className="w-full min-h-[44px] rounded-xl bg-[#060814] border border-[#1e2238] text-[#8a8fbc] font-bold text-[11px] uppercase tracking-wider hover:bg-[#644aff] hover:text-white hover:border-[#644aff] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                      >
                        {actionLoadingId === userRecord._id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          "Manage Status"
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Existing desktop table */}
              <div className="hidden overflow-x-auto text-xs md:block">
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
                      {userRecord.drivingLicenceNumber && (
                        <div className="mt-1 font-mono text-[10px] text-[#6b7280]">
                          {userRecord.drivingLicenceNumber}
                        </div>
                      )}
                      {getSuspensionSummary(userRecord) && (
                        <div className="mt-1 text-[10px] text-red-300">
                          {getSuspensionSummary(userRecord)}
                        </div>
                      )}
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

                        {/* Customers only — sub admin accounts are not deleted here. */}
                        {activeDirectoryTab !== "subAdmins" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteError("");
                              setDeleteTarget(userRecord);
                            }}
                            className="px-3 py-2 bg-red-500/10 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white font-bold rounded-lg text-[10px] uppercase transition-all"
                            aria-label="Delete customer"
                          >
                            <Trash2 size={13} className="inline-block mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
          )}
        </div>
      </div>

      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center md:p-4"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0d0f1d] border-t border-[#1e2238] shadow-2xl rounded-t-3xl pb-[env(safe-area-inset-bottom)] md:rounded-2xl md:border"
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
                    className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
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
                    className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
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
                    className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                  />
                  <p className="text-[11px] text-[#6b7280]">
                    Leave empty to clear expiration.
                  </p>
                </div>

                {/* Residential address — customers only. */}
                {activeDirectoryTab !== "subAdmins" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                        Mobile number
                      </label>
                      <input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                        placeholder="07xxx xxxxxx"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                        Additional numbers
                      </label>
                      {editAdditionalPhones.map((extraPhone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            value={extraPhone}
                            onChange={(e) =>
                              setEditAdditionalPhones((previous) =>
                                previous.map((value, i) =>
                                  i === index ? e.target.value : value,
                                ),
                              )
                            }
                            className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                            placeholder="07xxx xxxxxx"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditAdditionalPhones((previous) =>
                                previous.filter((_, i) => i !== index),
                              )
                            }
                            aria-label="Remove number"
                            className="shrink-0 min-h-[44px] px-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setEditAdditionalPhones((previous) => [...previous, ""])
                        }
                        className="self-start min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] text-[#8a8fbc] font-bold rounded-lg text-[10px] uppercase hover:border-[#644aff] hover:text-white transition-all"
                      >
                        + Add number
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                        Address line 1
                      </label>
                      <input
                        value={editAddress.line1}
                        onChange={(e) =>
                          setEditAddress((previous) => ({
                            ...previous,
                            line1: e.target.value,
                          }))
                        }
                        className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                        placeholder="Address line 1"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                        Address line 2 (optional)
                      </label>
                      <input
                        value={editAddress.line2}
                        onChange={(e) =>
                          setEditAddress((previous) => ({
                            ...previous,
                            line2: e.target.value,
                          }))
                        }
                        className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                        placeholder="Address line 2"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                        City / town
                      </label>
                      <input
                        value={editAddress.city}
                        onChange={(e) =>
                          setEditAddress((previous) => ({
                            ...previous,
                            city: e.target.value,
                          }))
                        }
                        className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff]"
                        placeholder="City / town"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                        Postcode
                      </label>
                      <UppercaseInput
                        value={editAddress.postcode}
                        onChange={(e) =>
                          setEditAddress((previous) => ({
                            ...previous,
                            postcode: e.target.value,
                          }))
                        }
                        className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff] uppercase"
                        placeholder="Postcode"
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                    New password (optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff] pr-10"
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#6b7280] uppercase font-semibold tracking-wider">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      value={editPasswordConfirm}
                      onChange={(e) => setEditPasswordConfirm(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#644aff] pr-10"
                      placeholder="Re-type password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirm((previous) => !previous)
                      }
                      aria-label={
                        showPasswordConfirm ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white transition-colors"
                    >
                      {showPasswordConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="min-h-[44px] px-4 py-2 bg-[#060814] border border-[#1e2238] text-[#8a8fbc] font-bold rounded-lg text-[10px] uppercase hover:border-[#644aff] hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="min-h-[44px] px-4 py-2 bg-[#644aff] hover:bg-[#563ee0] text-white font-bold rounded-lg text-[10px] uppercase transition-all disabled:opacity-40"
                  >
                    {editLoading ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete customer"
        message="The customer and all of their policies will be permanently removed."
        itemLabel={deleteTarget?.fullName || ""}
        details={
          deleteTarget
            ? [
                deleteTarget.email,
                "All policies for this customer will also be deleted.",
              ].filter(Boolean)
            : []
        }
        loading={deleteLoading}
        error={deleteError}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError("");
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
