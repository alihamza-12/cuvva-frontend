import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  User,
  ShieldCheck,
} from "lucide-react";
import CurrencyInput from "../common/CurrencyInput";
import MaskedDateInput from "../common/MaskedDateInput";
import MaskedTimeInput from "../common/MaskedTimeInput";
import { normalizeTime } from "../../utils/normalizeTime";
import PolicyVehicleLookup from "../common/PolicyVehicleLookup";

export default function CreatePolicy({
  axiosInstance,
  onCreated,
  customers = [],
}) {
  const [localCustomers, setLocalCustomers] = useState(customers);

  const [form, setForm] = useState({
    customerId: "",
    vehicleId: "",
    premiumAmount: "",
    excess: "500",
    cardLast4: "",
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
  const [vehicleLookupKey, setVehicleLookupKey] = useState(0);

  const needsFetchCustomers = useMemo(
    () => localCustomers.length === 0,
    [localCustomers],
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
      } catch (err) {

      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [needsFetchCustomers, axiosInstance]);

  const customerOptions = useMemo(() => {
    return localCustomers.map((c) => ({
      value: c._id,
      label: c.fullName ? `${c.fullName} (${c.email})` : c.email,
    }));
  }, [localCustomers]);

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.customerId || !form.vehicleId) {
      setFormError("Select a customer and search/save a vehicle first");
      return;
    }

    if (!/^\d{4}$/.test(form.cardLast4)) {
      setFormError("Enter exactly the last 4 digits of the payment card");
      return;
    }

    const normalizedStartTime = normalizeTime(form.startTime);
    const normalizedEndTime = normalizeTime(form.endTime);

    if (normalizedStartTime === null || normalizedEndTime === null) {
      setFormError("Enter a valid time (e.g. 09:30 or 5 PM)");
      return;
    }

    if (
      form.startDate === form.endDate &&
      normalizedEndTime <= normalizedStartTime
    ) {
      setFormError("End time must be after start time");
      return;
    }


    setSubmitting(true);

    const payload = {
      customerId: form.customerId,
      vehicleId: form.vehicleId,

      premiumAmount: form.premiumAmount,
      excess: form.excess,
      cardLast4: form.cardLast4,
      startDate: form.startDate,
      endDate: form.endDate,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
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
        excess: "500",
        cardLast4: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        policyType: "Temporary Car",
        coverageType: "Comprehensive",
        underwriter: "Wakam",
        internalNotes: "",
      });

      setVehicleLookupKey((current) => current + 1);
      if (onCreated) onCreated();
    } catch (err) {
      setFormError(err.response?.data?.message || "Error creating policy.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid w-full grid-cols-1 gap-8 text-xs animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-4 md:p-6 h-fit shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle size={16} className="text-[#644aff]" />
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">
            Create Policey
          </h3>
        </div>

        <p className="text-[11px] text-[#6b7280] mb-4 leading-relaxed">
          Select a customer, then search by registration. Existing vehicles are
          loaded from the database; new vehicles are retrieved automatically.
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
                className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl py-2.5 pl-9 pr-3 text-white outline-none focus:border-[#644aff]"
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

          <PolicyVehicleLookup
            key={vehicleLookupKey}
            accent="purple"
            onVehicleResolved={(vehicle) =>
              setForm((current) => ({
                ...current,
                vehicleId: vehicle?._id || "",
              }))
            }
          />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2">
            <div className="space-y-1">
              <CurrencyInput
                label="Premium Amount (£)"
                value={form.premiumAmount}
                onChange={(v) => setForm({ ...form, premiumAmount: v })}
                required
                accentClass="focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <CurrencyInput
                label="Excess (£)"
                value={form.excess}
                onChange={(v) => setForm({ ...form, excess: v })}
                required
                accentClass="focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Last 4 digits of payment card
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                required
                value={form.cardLast4}
                onChange={(event) =>
                  setForm({
                    ...form,
                    cardLast4: event.target.value.replace(/\D/g, "").slice(0, 4),
                  })
                }
                placeholder="0000"
                className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
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
                className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
              >
                <option value="Wakam">Wakam</option>
                <option value="ERS Syndicate">ERS Syndicate</option>
                <option value="Crawford">Crawford</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2">
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
                className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
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
                className="w-full min-h-[44px] bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
              >
                <option value="Comprehensive">Comprehensive</option>
                <option value="Third Party Only">Third Party Only</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] border border-[#1e2238] rounded-xl space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2">
              <MaskedDateInput
                label="Start Date"
                value={form.startDate}
                onChange={(v) => setForm({ ...form, startDate: v })}
                required
                disablePast
                accentClass="focus:border-[#644aff]"
              />
              <MaskedTimeInput
                label="Start Time (HH:MM)"
                value={form.startTime}
                onChange={(v) => setForm({ ...form, startTime: v })}
                required
                accentClass="focus:border-[#644aff]"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-2">
              <MaskedDateInput
                label="End Date"
                value={form.endDate}
                onChange={(v) => setForm({ ...form, endDate: v })}
                required
                disablePast
                accentClass="focus:border-[#644aff]"
              />
              <MaskedTimeInput
                label="End Time (HH:MM)"
                value={form.endTime}
                onChange={(v) => setForm({ ...form, endTime: v })}
                required
                accentClass="focus:border-[#644aff]"
              />
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
              className="w-full min-h-[88px] bg-white/5 border border-[#1e2238] rounded-xl p-3 text-white outline-none focus:border-[#644aff] resize-none"
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

      <div className="w-full space-y-6">
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
