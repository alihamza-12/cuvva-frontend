import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  User,
  Car,
  ShieldCheck,
} from "lucide-react";

export default function CreatePolicy({
  axiosInstance,
  onCreated,
  customers = [],
  vehicles = [],
}) {
  const [localCustomers, setLocalCustomers] = useState(customers);
  const [localVehicles, setLocalVehicles] = useState(vehicles);

  const [form, setForm] = useState({
    customerId: "",
    vehicleId: "",
    premiumAmount: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    policyType: "Temporary Car",
    coverageType: "Comprehensive",
    underwriter: "Wakam",
    internalNotes: "",
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const needsFetchCustomers = useMemo(
    () => localCustomers.length === 0,
    [localCustomers],
  );
  const needsFetchVehicles = useMemo(
    () => localVehicles.length === 0,
    [localVehicles],
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (needsFetchCustomers) {
          const res = await axiosInstance.get("/api/management/customers");
          if (!mounted) return;
          setLocalCustomers(res.data?.customers || []);
        }
        if (needsFetchVehicles) {
          const res = await axiosInstance.get("/api/vehicles/all");
          if (!mounted) return;
          setLocalVehicles(res.data?.vehicles || []);
        }
      } catch (err) {
        // Keep UX clean: show error only on submit, not instantly.
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [needsFetchCustomers, needsFetchVehicles, axiosInstance]);

  const customerOptions = useMemo(() => {
    return localCustomers.map((c) => ({
      value: c._id,
      label: c.fullName ? `${c.fullName} (${c.email})` : c.email,
    }));
  }, [localCustomers]);

  const vehicleOptions = useMemo(() => {
    return localVehicles.map((v) => ({
      value: v._id,
      label: v.registration
        ? `${v.registration} - ${v.make} ${v.model}`
        : `${v.make} ${v.model}`,
    }));
  }, [localVehicles]);

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    const payload = {
      customerId: form.customerId,
      vehicleId: form.vehicleId,
      premiumAmount: parseFloat(form.premiumAmount),
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: form.startTime,
      endTime: form.endTime,
      policyType: form.policyType,
      coverageType: form.coverageType,
      underwriter: form.underwriter,
      internalNotes: form.internalNotes?.trim() || "",
    };

    try {
      const res = await axiosInstance.post("/api/policies", payload);
      setFormSuccess(res.data?.message || "Policy created successfully.");

      setForm({
        customerId: "",
        vehicleId: "",
        premiumAmount: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        policyType: "Temporary Car",
        coverageType: "Comprehensive",
        underwriter: "Wakam",
        internalNotes: "",
      });

      if (onCreated) onCreated();
    } catch (err) {
      setFormError(err.response?.data?.message || "Error creating policy.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 text-xs xl:grid-cols-3 animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 h-fit shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle size={16} className="text-[#644aff]" />
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">
            Create Policey
          </h3>
        </div>

        <p className="text-[11px] text-[#6b7280] mb-4 leading-relaxed">
          Select Customer + Vehicle and fill policy details. Customers and
          vehicles are loaded from the backend.
        </p>

        <form onSubmit={handleCreatePolicy} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-400 border bg-red-500/10 border-red-500/20 rounded-xl">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs text-green-400 border bg-green-500/10 border-green-500/20 rounded-xl">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Customer
            </label>
            <div className="relative">
              <User
                size={12}
                className="absolute left-3.5 top-3.5 text-[#6b7280]"
              />
              <select
                required
                value={form.customerId}
                onChange={(e) =>
                  setForm({ ...form, customerId: e.target.value })
                }
                className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl py-2.5 pl-9 pr-3 text-white outline-none focus:border-[#644aff]"
              >
                <option value="" disabled>
                  Select customer
                </option>
                {customerOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Vehicle
            </label>
            <div className="relative">
              <Car
                size={12}
                className="absolute left-3.5 top-3.5 text-[#6b7280]"
              />
              <select
                required
                value={form.vehicleId}
                onChange={(e) =>
                  setForm({ ...form, vehicleId: e.target.value })
                }
                className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl py-2.5 pl-9 pr-3 text-white outline-none focus:border-[#644aff]"
              >
                <option value="" disabled>
                  Select vehicle
                </option>
                {vehicleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Premium Amount (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.premiumAmount}
                onChange={(e) =>
                  setForm({ ...form, premiumAmount: e.target.value })
                }
                placeholder="45.50"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Underwriter
              </label>
              <select
                required
                value={form.underwriter}
                onChange={(e) =>
                  setForm({ ...form, underwriter: e.target.value })
                }
                className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
              >
                <option value="Wakam">Wakam</option>
                <option value="ERS Syndicate">ERS Syndicate</option>
                <option value="Crawford">Crawford</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Policy Type
              </label>
              <select
                required
                value={form.policyType}
                onChange={(e) =>
                  setForm({ ...form, policyType: e.target.value })
                }
                className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
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
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Coverage Type
              </label>
              <select
                required
                value={form.coverageType}
                onChange={(e) =>
                  setForm({ ...form, coverageType: e.target.value })
                }
                className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
              >
                <option value="Comprehensive">Comprehensive</option>
                <option value="Third Party Only">Third Party Only</option>
              </select>
            </div>
          </div>

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
                  required
                  placeholder="14:30"
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
                  required
                  placeholder="15:30"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                  className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none mt-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Internal Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={form.internalNotes}
              onChange={(e) =>
                setForm({ ...form, internalNotes: e.target.value })
              }
              placeholder="Add notes for this policy..."
              className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 text-white outline-none focus:border-[#644aff] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#644aff] hover:bg-[#523ad1] disabled:opacity-50 text-white font-bold rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#644aff]/10"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ShieldCheck size={14} />
              {submitting ? "Creating policy..." : "Create Policey"}
            </span>
          </button>
        </form>
      </div>

      <div className="xl:col-span-2 space-y-6">
        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
          <h4 className="text-sm font-bold tracking-wide text-white uppercase">
            Uses backend Policy.js fields
          </h4>
          <p className="text-[11px] text-[#6b7280] mt-2 leading-relaxed">
            customerId, vehicleId, premiumAmount, startDate, endDate, startTime,
            endTime, policyType, coverageType, underwriter, internalNotes.
          </p>
        </div>
      </div>
    </div>
  );
}
