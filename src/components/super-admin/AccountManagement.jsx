import React, { useState } from "react";
import {
  UserPlus,
  Shield,
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function AccountManagement({
  subAdmins = [], // Defensive assignment: Prevents mapping crashes if array is initially undefined
  customers = [],
  onRefresh,
  axiosInstance,
}) {
  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Sub Admin",
    durationDays: "",
  });

  // View Toggle State: Let's allow Super Admin to switch views between collections
  const [activeDirectoryTab, setActiveDirectoryTab] = useState("subAdmins");

  // Notification Feedback States
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Form Submission Handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Clean Payload Sanitization
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
    };

    // If durationDays is provided, explicitly cast it to an integer; otherwise, omit it
    if (formData.durationDays && formData.durationDays.trim() !== "") {
      payload.durationDays = parseInt(formData.durationDays, 10);
    }

    try {
      // Direct call to your hierarchical registration endpoint
      const response = await axiosInstance.post("/api/auth/register", payload);

      setSuccess(
        response.data?.message ||
          `Account successfully provisioned as a ${payload.role}.`,
      );

      // Preserve current chosen role during state clean up to avoid unexpected layout jumps
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: formData.role,
        durationDays: "",
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error executing account registration routing.",
      );
    }
  };

  // Status Change State Router
  const toggleStatus = async (userId, currentStatus) => {
    setActionLoadingId(userId);
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      // Maps to your Hierarchical Status Engine
      await axiosInstance.patch(`/api/management/status/${userId}`, {
        status: nextStatus,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Hierarchical validation failed or security boundary violated.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Determine current active rendering context array
  const activeList = activeDirectoryTab === "subAdmins" ? subAdmins : customers;

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 animate-fadeIn">
      {/* COLUMN 1: FORM PROVIDER */}
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 h-fit shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={16} className="text-[#644aff]" />
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">
            Provision System Node
          </h3>
        </div>

        <p className="text-[11px] text-[#6b7280] mb-4 leading-relaxed">
          Create downward accounts. Super Admins can spawn both Sub-Admins and
          basic platform customers.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-400 border bg-red-500/10 border-red-500/20 rounded-xl">
              <AlertTriangle size={14} className="shrink-0" />{" "}
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 text-xs text-green-400 border bg-green-500/10 border-green-500/20 rounded-xl">
              <CheckCircle size={14} className="shrink-0" />{" "}
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Corporate Access Email
            </label>
            <input
              type="email"
              placeholder="name@cuvvaclone.com"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              System Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Security Clearances Assigned
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff] transition-colors"
            >
              <option value="Sub Admin">Sub Admin Node</option>
              <option value="Customer">Standard Customer Profile</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Temporal Limitation (Optional Days)
            </label>
            <input
              type="number"
              min="1"
              placeholder="Infinite Access Window if Blank"
              value={formData.durationDays}
              onChange={(e) =>
                setFormData({ ...formData, durationDays: e.target.value })
              }
              className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#644aff] hover:bg-[#523ad1] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#644aff]/10"
          >
            Commit Node credentials
          </button>
        </form>
      </div>

      {/* COLUMN 2 & 3: INTERACTIVE DIRECTORY SWITCHBOARD */}
      <div className="space-y-6 xl:col-span-2">
        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
          {/* Header & Sub-Tabs Navigation */}
          <div className="sm:flex sm:items-center sm:justify-between border-b border-[#1e2238] pb-4 mb-4 gap-4">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-white">
                Account Registries
              </h3>
              <p className="text-[11px] text-[#6b7280] mt-0.5">
                Audit platform entities and control global authentication access
                barriers.
              </p>
            </div>

            {/* View Switcher Controls */}
            <div className="flex bg-[#060814] p-1 rounded-xl border border-[#1e2238] mt-3 sm:mt-0">
              <button
                onClick={() => setActiveDirectoryTab("subAdmins")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all ${
                  activeDirectoryTab === "subAdmins"
                    ? "bg-[#644aff] text-white shadow"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                <Shield size={12} /> Sub-Admins ({subAdmins.length})
              </button>
              <button
                onClick={() => setActiveDirectoryTab("customers")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all ${
                  activeDirectoryTab === "customers"
                    ? "bg-[#644aff] text-white shadow"
                    : "text-[#6b7280] hover:text-white"
                }`}
              >
                <Users size={12} /> Customers ({customers.length})
              </button>
            </div>
          </div>

          {/* Directory Spreadsheet Container */}
          <div className="overflow-x-auto text-xs">
            {activeList.length === 0 ? (
              <div className="text-center py-12 text-[#6b7280] font-medium tracking-wide">
                No active{" "}
                {activeDirectoryTab === "subAdmins"
                  ? "sub-admin nodes"
                  : "customer records"}{" "}
                found in the collection.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#8a8fbc] border-b border-[#1e2238] font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-1">Identity Details</th>
                    <th className="pb-3">Security Access Anchor</th>
                    <th className="pb-3">Account Status</th>
                    <th className="pb-3 pr-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2238]">
                  {activeList.map((userRecord) => (
                    <tr
                      key={userRecord._id}
                      onClick={() => {
                        // Customers -> /admin/customers/:id, Sub-admins -> /admin/sub-admins/:id
                        const base =
                          activeDirectoryTab === "subAdmins"
                            ? `/admin/sub-admins/${userRecord._id}`
                            : `/admin/customers/${userRecord._id}`;
                        window.location.href = base;
                      }}
                      className="cursor-pointer text-gray-300 hover:bg-white/[0.01] transition-colors"
                    >
                      {/* Identity Details Row */}
                      <td className="py-3.5 pl-1">
                        <div className="text-xs font-bold tracking-tight text-white">
                          {userRecord.fullName}
                        </div>
                        <div className="text-[10px] text-[#6b7280] font-medium mt-0.5">
                          {userRecord.email}
                        </div>
                      </td>

                      {/* Audit Trail Row (Pulls populated properties from backend controllers) */}
                      <td className="py-3.5 align-middle">
                        {userRecord.createdBy ? (
                          <div>
                            <span className="text-[10px] text-gray-400">
                              Created by:{" "}
                            </span>
                            <span className="text-[10px] text-[#644aff] font-semibold">
                              {userRecord.createdBy.fullName}
                            </span>
                            {userRecord.createdBy.role && (
                              <span className="text-[9px] text-[#6b7280] block">
                                ({userRecord.createdBy.role})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#6b7280] font-mono italic">
                            System Bootstrap
                          </span>
                        )}
                      </td>

                      {/* Active/Suspended Tag Indicator Row */}
                      <td className="py-3.5 align-middle">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                            userRecord.status === "Active"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {userRecord.status}
                        </span>

                        {/* Expiry Alert Warning Badge */}
                        {userRecord.expiresAt &&
                          new Date(userRecord.expiresAt) < new Date() && (
                            <span className="block text-[9px] text-amber-500 font-bold mt-1 animate-pulse">
                              ⚠️ System Window Expired
                            </span>
                          )}
                      </td>

                      {/* Action Triggers Row */}
                      <td className="py-3.5 text-right pr-1 align-middle">
                        <button
                          disabled={actionLoadingId === userRecord._id}
                          onClick={() =>
                            toggleStatus(userRecord._id, userRecord.status)
                          }
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg border border-[#1e2238] text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 inline-flex items-center gap-1"
                        >
                          {actionLoadingId === userRecord._id ? (
                            <RefreshCw size={10} className="animate-spin" />
                          ) : (
                            "Toggle State"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
