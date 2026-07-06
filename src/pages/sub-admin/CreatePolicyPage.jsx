import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpClient } from "../../app/api/httpClient";

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase font-bold tracking-wider text-[#8a8fbc] mb-2">
        {label}
      </div>
      {children}
    </label>
  );
}

export default function CreatePolicyPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({
    customerId: "",
    vehicleId: "",
    premiumAmount: "",
    startDate: "",
    endDate: "",
    startTime: "14:30",
    endTime: "15:30",
    policyType: "Temporary Car",
    coverageType: "Comprehensive",
    underwriter: "Wakam",
    internalNotes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        // For Sub Admin: list customers in their scope (backend restricts via ownership)
        const custRes = await httpClient.get("/api/customers");
        const custList = custRes?.data?.customers || [];
        const vehRes = await httpClient.get("/api/vehicles/all");
        const vehList = vehRes?.data?.vehicles || [];

        if (!mounted) return;
        setCustomers(custList);
        setVehicles(vehList);
      } catch (e) {
        if (!mounted) return;
        setLoadError(
          e?.response?.data?.message || "Failed to load customers/vehicles.",
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const customerOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c._id,
      label: c.fullName ? `${c.fullName} (${c.email})` : c.email,
    }));
  }, [customers]);

  const vehicleOptions = useMemo(() => {
    return vehicles.map((v) => ({
      value: v._id,
      label: v.registration
        ? `${v.registration} - ${v.make} ${v.model}`
        : `${v.make} ${v.model}`,
    }));
  }, [vehicles]);

  const isValid = useMemo(() => {
    if (!form.customerId) return false;
    if (!form.vehicleId) return false;
    if (!form.premiumAmount || Number(form.premiumAmount) <= 0) return false;
    if (!form.startDate || !form.endDate) return false;
    if (!form.startTime || !form.endTime) return false;
    return true;
  }, [form]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!isValid) {
      setError("Please complete required fields.");
      return;
    }

    setSubmitting(true);
    try {
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

      const res = await httpClient.post("/api/policies", payload);
      setSuccessMsg(res?.data?.message || "Policy created successfully.");

      setTimeout(() => {
        navigate("/dashboard?tab=my-policies", { replace: true });
      }, 900);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create policy.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full animate-fadeIn">
        <div className="py-16 text-center text-[#6b7280] text-sm">
          Loading form data...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-[#1e2238]">
          <div>
            <h3 className="text-xl font-bold tracking-wide text-white">
              Create Policy
            </h3>
            <p className="text-xs text-[#6b7280] mt-1">
              Create a policy only for customers registered by you (Sub Admin
              scope).
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard?tab=my-policies", { replace: true })
            }
            className="px-4 py-2 bg-[#060814] hover:bg-[#1a1d33] border border-[#1e2238] text-[#8a8fbc] hover:text-white font-bold rounded-lg text-[10px] uppercase transition-all"
          >
            Back to My Policies
          </button>
        </div>

        {loadError && (
          <div className="px-4 py-3 mt-4 text-xs font-medium text-red-200 border rounded-xl bg-red-500/10 border-red-500/20">
            {loadError}
          </div>
        )}

        {error && (
          <div className="px-4 py-3 mt-4 text-xs font-medium text-red-200 border rounded-xl bg-red-500/10 border-red-500/20">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="px-4 py-3 mt-4 text-xs font-medium text-green-200 border rounded-xl bg-green-500/10 border-green-500/20">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Customer (required)">
              <select
                value={form.customerId}
                onChange={handleChange("customerId")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              >
                <option value="" disabled>
                  Select your customer
                </option>
                {customerOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Vehicle (required)">
              <select
                value={form.vehicleId}
                onChange={handleChange("vehicleId")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              >
                <option value="" disabled>
                  Select vehicle
                </option>
                {vehicleOptions.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Premium Amount (£) (required)">
              <input
                value={form.premiumAmount}
                onChange={handleChange("premiumAmount")}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="e.g. 45.50"
              />
            </Field>

            <Field label="Underwriter (required)">
              <select
                value={form.underwriter}
                onChange={handleChange("underwriter")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              >
                <option value="Wakam">Wakam</option>
                <option value="ERS Syndicate">ERS Syndicate</option>
                <option value="Crawford">Crawford</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 mt-8 md:grid-cols-2">
            <Field label="Policy Type (required)">
              <select
                value={form.policyType}
                onChange={handleChange("policyType")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              >
                <option value="Temporary Car">Temporary Car</option>
                <option value="Temporary Van">Temporary Van</option>
                <option value="Learner Driver">Learner Driver</option>
                <option value="Impound">Impound</option>
                <option value="Motorhome">Motorhome</option>
                <option value="Drive Away">Drive Away</option>
              </select>
            </Field>

            <Field label="Coverage Type (required)">
              <select
                value={form.coverageType}
                onChange={handleChange("coverageType")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              >
                <option value="Comprehensive">Comprehensive</option>
                <option value="Third Party Only">Third Party Only</option>
              </select>
            </Field>

            <Field label="Start Date (required)">
              <input
                value={form.startDate}
                onChange={handleChange("startDate")}
                type="date"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              />
            </Field>

            <Field label="End Date (required)">
              <input
                value={form.endDate}
                onChange={handleChange("endDate")}
                type="date"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              />
            </Field>

            <Field label="Start Time (required)">
              <input
                value={form.startTime}
                onChange={handleChange("startTime")}
                type="text"
                placeholder="14:30"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              />
            </Field>

            <Field label="End Time (required)">
              <input
                value={form.endTime}
                onChange={handleChange("endTime")}
                type="text"
                placeholder="15:30"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              />
            </Field>
          </div>

          <div className="mt-8">
            <Field label="Internal Notes (optional)">
              <textarea
                value={form.internalNotes}
                onChange={handleChange("internalNotes")}
                rows={3}
                placeholder="Add notes..."
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff] resize-none"
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                setForm({
                  customerId: "",
                  vehicleId: "",
                  premiumAmount: "",
                  startDate: "",
                  endDate: "",
                  startTime: "14:30",
                  endTime: "15:30",
                  policyType: "Temporary Car",
                  coverageType: "Comprehensive",
                  underwriter: "Wakam",
                  internalNotes: "",
                })
              }
              className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-[#1e2238] text-[#8a8fbc] hover:text-white font-bold rounded-xl text-[10px] uppercase transition-all disabled:opacity-40"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="px-5 py-2 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/25 text-[#e9fdff] font-bold rounded-xl text-[10px] uppercase transition-all disabled:opacity-40"
            >
              {submitting ? "Creating..." : "Create Policy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
