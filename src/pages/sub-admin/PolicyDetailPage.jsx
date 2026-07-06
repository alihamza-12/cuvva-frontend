import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, FileText, User, ShieldAlert } from "lucide-react";

import { httpClient } from "../../app/api/httpClient";

export default function PolicyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [policy, setPolicy] = useState(null);

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const [editForm, setEditForm] = useState({
    premiumAmount: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    policyType: "Temporary Car",
    coverageType: "Comprehensive",
    underwriter: "Wakam",
    status: "Upcoming",
    internalNotes: "",
  });

  const locationSearch = new URLSearchParams(window.location.search);
  const isEditMode = useMemo(() => {
    return locationSearch.get("edit") === "1";
  }, [locationSearch]);

  useEffect(() => {
    let mounted = true;

    const fetchPolicy = async () => {
      setLoading(true);
      setError("");

      try {
        // Backend allows Sub Admin access to: GET /api/policies/my
        const res = await httpClient.get("/api/policies/my");
        const list = res?.data?.policies || res?.data?.policy || [];
        const found = Array.isArray(list)
          ? list.find((p) => p._id === id || String(p._id) === String(id))
          : null;

        if (!mounted) return;
        if (!found) {
          setPolicy(null);
          setError("Policy not found in your scope.");
          return;
        }

        setPolicy(found);
      } catch (err) {
        if (!mounted) return;
        setError(
          err.response?.data?.message || "Failed to load policy detail.",
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchPolicy();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!policy) return;

    setEditForm({
      premiumAmount: policy.premiumAmount ?? "",
      startDate: policy.startDate
        ? new Date(policy.startDate).toISOString().split("T")[0]
        : "",
      endDate: policy.endDate
        ? new Date(policy.endDate).toISOString().split("T")[0]
        : "",
      startTime: policy.startTime || "",
      endTime: policy.endTime || "",
      policyType: policy.policyType || "Temporary Car",
      coverageType: policy.coverageType || "Comprehensive",
      underwriter: policy.underwriter || "Wakam",
      status: policy.status || "Upcoming",
      internalNotes: policy.internalNotes || "",
    });
  }, [policy]);

  const formatDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return "N/A";
    }
  };

  const statusPill = (status) => {
    const safe = status || "Upcoming";
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border ${
          safe === "Active"
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : safe === "Upcoming"
              ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}
      >
        {safe}
      </span>
    );
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    if (!policy?._id) return;

    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const payload = {
        premiumAmount: parseFloat(editForm.premiumAmount),
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        policyType: editForm.policyType,
        coverageType: editForm.coverageType,
        underwriter: editForm.underwriter,
        status: editForm.status,
        internalNotes: editForm.internalNotes,
      };

      const res = await httpClient.put(`/api/policies/${policy._id}`, payload);
      setUpdateSuccess(res?.data?.message || "Policy updated successfully.");

      // Refresh policy record from scope list
      const refreshed = await httpClient.get("/api/policies/my");
      const list = refreshed?.data?.policies || [];
      const found = Array.isArray(list)
        ? list.find((p) => String(p._id) === String(policy._id))
        : null;

      setPolicy(found || null);
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Failed to update policy.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex">
      <div className="flex-1 max-w-4xl p-6 mx-auto space-y-6 md:p-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-sm font-bold tracking-wider uppercase text-[#8a8fbc]">
            Policy Detail
          </h1>
        </div>

        {loading && (
          <div className="text-xs text-[#8a8fbc] animate-pulse">
            Loading policy record...
          </div>
        )}

        {!loading && error && (
          <div className="inline-flex items-center gap-2 p-4 text-xs font-semibold text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
            <ShieldAlert size={14} /> {error}
          </div>
        )}

        {!loading && !error && policy && (
          <div className="space-y-5">
            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#00f0ff]">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="text-[11px] text-[#8a8fbc] font-mono uppercase tracking-wider">
                        {policy.policyNumber ? policy.policyNumber : policy._id}
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">
                        {policy.policyType || "Short Term"} •{" "}
                        {policy.coverageType || "Comprehensive"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {statusPill(policy.status)}

                  {!isEditMode ? (
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 text-xs uppercase tracking-wider font-bold"
                      onClick={() => navigate("?edit=1")}
                    >
                      Edit Policy
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
                      onClick={() => navigate("?")}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Assigned Driver (Customer)
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#6b7280]" />
                    <div className="text-xs font-semibold text-white">
                      {policy.customerId?.fullName || "N/A"}
                    </div>
                  </div>
                  <div className="text-[11px] text-[#6b7280]">
                    {policy.customerId?.email || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Covered Vehicle Asset
                  </div>
                  {policy.vehicleId ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-[#6b7280]" />
                        <div className="text-xs font-semibold text-white">
                          {policy.vehicleId.make} {policy.vehicleId.model}
                        </div>
                      </div>
                      <div className="mt-1 text-[11px] text-[#6b7280]">
                        Registration: {policy.vehicleId.registration}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs italic text-red-400">
                      Missing vehicle reference
                    </div>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Coverage Window
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7280]">
                    <span className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg">
                      {formatDate(policy.startDate)} • {policy.startTime}
                    </span>
                    <span className="text-[#00f0ff] font-bold">→</span>
                    <span className="px-2.5 py-1 bg-white/[0.04] border border-white/5 rounded-lg">
                      {formatDate(policy.endDate)} • {policy.endTime}
                    </span>
                  </div>
                </div>

                {!isEditMode ? (
                  <>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                        Premium Amount
                      </div>
                      <div className="text-xs font-semibold text-white">
                        £{policy.premiumAmount}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                        Underwriter
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {policy.underwriter || "N/A"}
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                        Internal Notes
                      </div>
                      <div className="text-xs text-[#6b7280]">
                        {policy.internalNotes || "—"}
                      </div>
                    </div>
                  </>
                ) : (
                  <form
                    onSubmit={handleUpdatePolicy}
                    className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 md:col-span-2"
                  >
                    <h3 className="mb-3 text-xs font-bold tracking-wider text-white uppercase">
                      Update Policy
                    </h3>

                    {updateError && (
                      <div className="flex items-center gap-2 p-3 mb-3 text-xs text-red-400 border bg-red-500/10 border-red-500/20 rounded-xl">
                        {updateError}
                      </div>
                    )}
                    {updateSuccess && (
                      <div className="flex items-center gap-2 p-3 mb-3 text-xs text-green-400 border bg-green-500/10 border-green-500/20 rounded-xl">
                        {updateSuccess}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          Premium Amount
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.premiumAmount}
                          required
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              premiumAmount: e.target.value,
                            })
                          }
                          className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2 text-white outline-none focus:border-[#00f0ff]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          Status
                        </label>
                        <select
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                          className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-2 text-white outline-none focus:border-[#00f0ff]"
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Active">Active</option>
                          <option value="Expired">Expired</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={editForm.startDate}
                          required
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          Start Time
                        </label>
                        <input
                          type="text"
                          value={editForm.startTime}
                          required
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              startTime: e.target.value,
                            })
                          }
                          placeholder="08:00"
                          className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={editForm.endDate}
                          required
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              endDate: e.target.value,
                            })
                          }
                          className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          End Time
                        </label>
                        <input
                          type="text"
                          value={editForm.endTime}
                          required
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              endTime: e.target.value,
                            })
                          }
                          placeholder="18:00"
                          className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          Policy Type
                        </label>
                        <select
                          value={editForm.policyType}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              policyType: e.target.value,
                            })
                          }
                          className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-2 text-white outline-none focus:border-[#00f0ff]"
                        >
                          <option value="Temporary Car">Temporary Car</option>
                          <option value="Temporary Van">Temporary Van</option>
                          <option value="Learner Driver">Learner Driver</option>
                          <option value="Impound">Impound</option>
                          <option value="Motorhome">Motorhome</option>
                          <option value="Drive Away">Drive Away</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          Coverage Type
                        </label>
                        <select
                          value={editForm.coverageType}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              coverageType: e.target.value,
                            })
                          }
                          className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-2 text-white outline-none focus:border-[#00f0ff]"
                        >
                          <option value="Comprehensive">Comprehensive</option>
                          <option value="Third Party Only">
                            Third Party Only
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          Underwriter
                        </label>
                        <select
                          value={editForm.underwriter}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              underwriter: e.target.value,
                            })
                          }
                          className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-2 text-white outline-none focus:border-[#00f0ff]"
                        >
                          <option value="Wakam">Wakam</option>
                          <option value="ERS Syndicate">ERS Syndicate</option>
                          <option value="Crawford">Crawford</option>
                        </select>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                          Internal Notes
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.internalNotes}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              internalNotes: e.target.value,
                            })
                          }
                          className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 text-white outline-none resize-none focus:border-[#00f0ff]"
                          placeholder="Administrative internal notes (optional)"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="mt-4 w-full py-3 bg-[#00f0ff] hover:bg-[#00cfe0] disabled:opacity-50 text-black font-bold rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#00f0ff]/20"
                    >
                      {updating ? "Updating Policy..." : "Save Changes"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !policy && (
          <div className="text-xs text-[#8a8fbc]">No record found.</div>
        )}
      </div>
    </div>
  );
}
