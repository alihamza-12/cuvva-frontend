import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, ShieldAlert, Mail } from "lucide-react";

import { getCustomerById } from "../../app/api/customerApi";
import { updateCustomer } from "../../app/api/customerUpdateApi";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    expiresAt: "",
  });

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchCustomer = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getCustomerById(id);
        if (!mounted) return;
        setCustomer(res.data?.customer || null);
      } catch (err) {
        if (!mounted) return;
        setError(
          err.response?.data?.message || "Failed to load customer detail.",
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchCustomer();
    return () => {
      mounted = false;
    };
  }, [id]);

  const statusPill = (status) => {
    const safe = status || "Active";
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${
          safe === "Active"
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}
      >
        {safe}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex">
      <div className="flex-1 max-w-4xl p-6 mx-auto space-y-6 md:p-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-sm font-bold tracking-wider uppercase text-[#8a8fbc]">
            Customer Detail
          </h1>
        </div>

        {loading && (
          <div className="text-xs text-[#8a8fbc] animate-pulse">
            Loading customer record...
          </div>
        )}

        {!loading && error && (
          <div className="inline-flex items-center gap-2 p-4 text-xs font-semibold text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
            <ShieldAlert size={14} /> {error}
          </div>
        )}

        {!loading && !error && customer && (
          <div className="space-y-5">
            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#644aff]">
                    <User size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {customer.fullName}
                    </h2>
                    <div className="text-[11px] text-[#8a8fbc] flex items-center gap-2">
                      <Mail size={12} /> {customer.email}
                    </div>
                  </div>
                </div>
                <div>{statusPill(customer.status)}</div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Role
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {customer.role}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Expiry
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {customer.expiresAt
                      ? new Date(customer.expiresAt).toISOString().split("T")[0]
                      : "Infinite"}
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Created By (Admin / Sub-Admin)
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {customer?.createdBy?.fullName
                      ? `${customer.createdBy.fullName} (${customer.createdBy.role})`
                      : "System Bootstrap / Unknown"}
                  </div>
                  {customer?.createdBy?.email && (
                    <div className="text-xs text-[#6b7280]">
                      {customer.createdBy.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xs font-bold tracking-wider text-white uppercase">
                  Customer Detail
                </h3>

                {!isEditMode ? (
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 text-xs uppercase tracking-wider font-bold"
                    onClick={() => {
                      setEditForm({
                        fullName: customer.fullName || "",
                        email: customer.email || "",
                        expiresAt: customer.expiresAt
                          ? new Date(customer.expiresAt)
                              .toISOString()
                              .split("T")[0]
                          : "",
                      });
                      setIsEditMode(true);
                    }}
                  >
                    Edit Customer
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
                      onClick={() => {
                        setIsEditMode(false);
                        setUpdateError("");
                        setUpdateSuccess("");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={updating}
                      className="px-3 py-2 rounded-xl bg-[#00f0ff] hover:bg-[#00cfe0] disabled:opacity-50 text-black text-xs uppercase tracking-wider font-bold"
                      onClick={async () => {
                        if (!customer?._id) return;

                        setUpdating(true);
                        setUpdateError("");
                        setUpdateSuccess("");

                        try {
                          const payload = {
                            fullName: editForm.fullName,
                            email: editForm.email,
                            expiresAt:
                              editForm.expiresAt && editForm.expiresAt.trim()
                                ? new Date(editForm.expiresAt)
                                : null,
                          };

                          await updateCustomer(customer._id, payload);

                          const refreshed = await getCustomerById(customer._id);
                          setCustomer(refreshed.data?.customer || null);

                          setUpdateSuccess("Customer updated successfully.");
                          setIsEditMode(false);
                        } catch (err) {
                          setUpdateError(
                            err.response?.data?.message ||
                              "Failed to update customer.",
                          );
                        } finally {
                          setUpdating(false);
                        }
                      }}
                    >
                      {updating ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              {(updateError || updateSuccess) && (
                <div className="mt-3 text-xs">
                  {updateError && (
                    <div className="text-red-400">{updateError}</div>
                  )}
                  {updateSuccess && (
                    <div className="text-green-400">{updateSuccess}</div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    User ID
                  </div>
                  <div className="font-mono text-xs text-white">
                    {customer?._id}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Role
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {customer?.role}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Email
                  </div>
                  <div className="text-xs text-[#8a8fbc]">
                    {customer?.email}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Status
                  </div>
                  <div className="text-xs font-bold text-white">
                    {customer?.status || "Active"}
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Expires At
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {customer?.expiresAt
                      ? new Date(customer.expiresAt).toISOString().split("T")[0]
                      : "Infinite"}
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Created By
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {customer?.createdBy?.fullName
                      ? `${customer.createdBy.fullName} (${customer.createdBy.role})`
                      : "System Bootstrap / Unknown"}
                  </div>
                  {customer?.createdBy?.email && (
                    <div className="text-xs text-[#6b7280]">
                      {customer.createdBy.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !customer && (
          <div className="text-xs text-[#8a8fbc]">No record found.</div>
        )}
      </div>
    </div>
  );
}
