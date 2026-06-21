import React, { useState } from "react";
import {
  ShieldCheck,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  AlertTriangle,
  User,
  Car,
} from "lucide-react";

export default function PolicyContracts({
  policies = [], // Defensive assignment: Prevents array map runtime breaks if undefined
  onRefresh,
  axiosInstance,
}) {
  // Form Initialization
  const [form, setForm] = useState({
    customerId: "",
    vehicleId: "",
    premiumAmount: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    policyType: "Short Term",
    coverageType: "Comprehensive",
    underwriter: "",
    internalNotes: "",
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Policy Issuance Controller
  const handleIssuePolicy = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    // Defensive Payload Sanitization and Type Formatting
    const preparedPayload = {
      ...form,
      customerId: form.customerId.trim(), // Trims spaces that trigger ObjectId conversion faults
      vehicleId: form.vehicleId.trim(),
      premiumAmount: parseFloat(form.premiumAmount), // Forces proper numerical data casting
      policyType: form.policyType,
      coverageType: form.coverageType,
      underwriter: form.underwriter.trim(),
      internalNotes: form.internalNotes.trim(),
    };

    try {
      // Post payload securely to backend router pipeline
      const res = await axiosInstance.post("/api/policies", preparedPayload);

      setFormSuccess(
        res.data?.message ||
          "Coverage contract issued successfully without database conflicts.",
      );

      // Reset layout forms back to original structural state safely
      setForm({
        customerId: "",
        vehicleId: "",
        premiumAmount: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        policyType: "Short Term",
        coverageType: "Comprehensive",
        underwriter: "",
        internalNotes: "",
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Timeline timeline collision or system routing fault.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper utility format to make database UTC date arrays cleaner for presentation
  const formatDateString = (rawDate) => {
    if (!rawDate) return "N/A";
    return new Date(rawDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 text-xs xl:grid-cols-3 animate-fadeIn">
      {/* FORM INTERFACE BLOCK */}
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 h-fit shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-[#644aff]" />
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">
            Issue Short-Term Policy Contract
          </h3>
        </div>

        <form onSubmit={handleIssuePolicy} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-400 border bg-red-500/10 border-red-500/20 rounded-xl">
              <AlertTriangle size={14} className="shrink-0" />{" "}
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs text-green-400 border bg-green-500/10 border-green-500/20 rounded-xl">
              <ShieldCheck size={14} className="shrink-0" />{" "}
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Customer Mapping Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Customer Reference Hash ID
            </label>
            <div className="relative">
              <User
                size={12}
                className="absolute left-3.5 top-3.5 text-[#6b7280]"
              />
              <input
                type="text"
                placeholder="24-character hexadecimal ObjectId"
                required
                value={form.customerId}
                onChange={(e) =>
                  setForm({ ...form, customerId: e.target.value })
                }
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl py-2.5 pl-9 pr-3 text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          {/* Vehicle Mapping Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Vehicle Reference Hash ID
            </label>
            <div className="relative">
              <Car
                size={12}
                className="absolute left-3.5 top-3.5 text-[#6b7280]"
              />
              <input
                type="text"
                placeholder="24-character hexadecimal ObjectId"
                required
                value={form.vehicleId}
                onChange={(e) =>
                  setForm({ ...form, vehicleId: e.target.value })
                }
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl py-2.5 pl-9 pr-3 text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          {/* Pricing Premium & Carrier Tier */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Premium Cost (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="45.50"
                required
                value={form.premiumAmount}
                onChange={(e) =>
                  setForm({ ...form, premiumAmount: e.target.value })
                }
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Underwriter
              </label>
              <input
                type="text"
                placeholder="Mulsanne Ltd"
                required
                value={form.underwriter}
                onChange={(e) =>
                  setForm({ ...form, underwriter: e.target.value })
                }
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          {/* Coverage Type Options Configuration Dropdowns */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Policy Class
              </label>
              <select
                value={form.policyType}
                onChange={(e) =>
                  setForm({ ...form, policyType: e.target.value })
                }
                className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-2.5 text-white outline-none focus:border-[#644aff]"
              >
                <option value="Short Term">Short Term</option>
                <option value="Hourly">Hourly Tier</option>
                <option value="Subscription">Monthly Auto-Roll</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Coverage Scope
              </label>
              <select
                value={form.coverageType}
                onChange={(e) =>
                  setForm({ ...form, coverageType: e.target.value })
                }
                className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-2.5 text-white outline-none focus:border-[#644aff]"
              >
                <option value="Comprehensive">Comprehensive</option>
                <option value="Third Party Only">Third Party Only (TPO)</option>
                <option value="Third Party Fire & Theft">
                  TPFT Asset Cover
                </option>
              </select>
            </div>
          </div>

          {/* Temporal Boundaries (Activation Horizon) */}
          <div className="p-3 bg-white/[0.02] border border-[#1e2238] rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase">
                  Start Time (HH:MM)
                </label>
                <input
                  type="text"
                  placeholder="08:00"
                  required
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase">
                  End Time (HH:MM)
                </label>
                <input
                  type="text"
                  placeholder="18:00"
                  required
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                  className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none mt-1"
                />
              </div>
            </div>
          </div>

          {/* Audit Notes field mapping to internalNotes properties */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Administrative Internal Notes (Optional)
            </label>
            <textarea
              placeholder="Specify vehicle allocation parameters or override justifications..."
              value={form.internalNotes}
              onChange={(e) =>
                setForm({ ...form, internalNotes: e.target.value })
              }
              rows="2"
              className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 text-white outline-none focus:border-[#644aff] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#644aff] hover:bg-[#523ad1] disabled:opacity-50 text-white font-bold rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#644aff]/10"
          >
            {submitting
              ? "Verifying Conflict Array..."
              : "Execute Policy Block"}
          </button>
        </form>
      </div>

      {/* FEED VISUALIZATION BLOCK */}
      <div className="xl:col-span-2 bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-white">
              Global Platform Policy Feed
            </h3>
            <p className="text-[11px] text-[#6b7280]">
              Live validation view across instantiated active risk coverage
              profiles.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-white/5 border border-[#1e2238] rounded-lg text-[10px] text-gray-400 font-mono">
            Count: {policies.length}
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[620px] pr-2">
          {policies.length === 0 ? (
            <div className="text-center py-16 text-[#6b7280] font-medium tracking-wide">
              No insurance policies match your system visibility parameters.
            </div>
          ) : (
            policies.map((p) => (
              <div
                key={p._id}
                className="p-4.5 bg-[#060814]/60 border border-[#1e2238] rounded-xl space-y-3 hover:border-white/10 transition-colors"
              >
                {/* ID Token, Scope Tags & Cost Ledger Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[#644aff]" />
                    <span className="text-[#8a8fbc] font-bold font-mono text-[11px]">
                      ID: {p._id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[#8a8fbc] font-bold rounded text-[9px] uppercase tracking-wide">
                      {p.policyType || "Short Term"}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-cyan-400 font-bold rounded text-[9px] uppercase tracking-wide">
                      {p.coverageType || "Comprehensive"}
                    </span>
                    <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 font-extrabold rounded text-xs inline-flex items-center">
                      £{p.premiumAmount}
                    </span>
                  </div>
                </div>

                {/* Entity Relations Grid Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[#8a8fbc] text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-[#6b7280] block tracking-wide">
                      Assigned Driver
                    </span>
                    <div className="font-semibold text-white">
                      {p.customerId?.fullName || "Deleted Driver Context"}
                    </div>
                    <div className="text-[10px] text-[#6b7280] truncate">
                      {p.customerId?.email || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-[#6b7280] block tracking-wide">
                      Covered Vehicle Asset
                    </span>
                    {p.vehicleId ? (
                      <div>
                        <span className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-mono font-bold rounded text-[10px] tracking-wider inline-block mr-2">
                          {p.vehicleId.registration}
                        </span>
                        <span className="font-medium text-white">
                          {p.vehicleId.make} {p.vehicleId.model}
                        </span>
                      </div>
                    ) : (
                      <span className="italic font-medium text-red-400">
                        Core Catalog Reference Missing
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Time Horizon Scale Display */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#6b7280] pt-1.5 border-t border-white/5 gap-3">
                  <div className="flex items-center gap-1 font-medium text-gray-300">
                    <Calendar size={13} className="text-[#644aff]" />
                    <span>
                      {formatDateString(p.startDate)} ({p.startTime})
                    </span>
                    <span className="text-[#6b7280] px-1">➔</span>
                    <span>
                      {formatDateString(p.endDate)} ({p.endTime})
                    </span>
                  </div>

                  {/* Operational Security Audit Signature */}
                  {p.createdBy && (
                    <div className="text-[10px] text-right bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      <span className="text-gray-500">Issued By: </span>
                      <span className="font-medium text-gray-300">
                        {p.createdBy.fullName}
                      </span>
                      <span className="text-[9px] text-[#644aff] ml-1 uppercase tracking-wider font-bold">
                        ({p.createdBy.role})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
