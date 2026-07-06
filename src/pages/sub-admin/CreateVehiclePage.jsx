import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createVehicle } from "../../app/api/vehicleApi";

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

export default function CreateVehiclePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    registration: "",
    make: "",
    model: "",
    colour: "",
    year: "2024",
    fuelType: "PETROL",

    // optional specs
    engineCapacityCC: "",
    powerBHP: "",
    topSpeed: "",
    cylinders: "",
    fuelConsumptionMPG: "",

    // optional MOT/Tax fields
    motStatus: "Valid",
    motExpiryDate: "",
    taxStatus: "Paid",
    taxDueDate: "",
    registrationKeeper: "",
    v5cIssueDate: "",
    co2Emissions: "",
    euroStatus: "",
    wheelplan: "",

    // UX
    submitting: false,
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isValid = useMemo(() => {
    const regOk = form.registration.trim().length >= 4;
    const makeOk = !!form.make.trim();
    const modelOk = !!form.model.trim();
    const yearNum = Number(form.year);
    const yearOk = Number.isFinite(yearNum) && yearNum > 1900;

    const fuelOk = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"].includes(
      form.fuelType,
    );

    return regOk && makeOk && modelOk && yearOk && fuelOk;
  }, [form]);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toNumberOrUndef = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

  const toDateOrUndef = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return undefined;
    // Accept datetime-local or date string
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return undefined;
    return d;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!isValid) {
      setError("Please complete required fields correctly.");
      return;
    }

    setForm((p) => ({ ...p, submitting: true }));

    try {
      const payload = {
        registration: form.registration,
        make: form.make,
        model: form.model,
        colour: form.colour?.trim() || undefined,
        year: Number(form.year),
        fuelType: form.fuelType,

        engineCapacityCC: toNumberOrUndef(form.engineCapacityCC),
        powerBHP: toNumberOrUndef(form.powerBHP),
        topSpeed: toNumberOrUndef(form.topSpeed),
        cylinders: toNumberOrUndef(form.cylinders),
        fuelConsumptionMPG: toNumberOrUndef(form.fuelConsumptionMPG),

        motStatus: form.motStatus?.trim() || undefined,
        motExpiryDate: toDateOrUndef(form.motExpiryDate),
        taxStatus: form.taxStatus?.trim() || undefined,
        taxDueDate: toDateOrUndef(form.taxDueDate),
        registrationKeeper: form.registrationKeeper?.trim() || undefined,
        v5cIssueDate: toDateOrUndef(form.v5cIssueDate),
        co2Emissions: toNumberOrUndef(form.co2Emissions),
        euroStatus: form.euroStatus?.trim() || undefined,
        wheelplan: form.wheelplan?.trim() || undefined,
      };

      // Clean undefined keys
      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined),
      );

      const res = await createVehicle(cleanedPayload);
      const msg = res?.data?.message || "Vehicle created successfully.";
      setSuccessMsg(msg);

      setTimeout(() => {
        navigate("/dashboard?tab=my-vehicles", { replace: true });
      }, 900);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create vehicle.");
    } finally {
      setForm((p) => ({ ...p, submitting: false }));
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-[#1e2238]">
          <div>
            <h3 className="text-xl font-bold tracking-wide text-white">
              Create Vehicle
            </h3>
            <p className="text-xs text-[#6b7280] mt-1">
              Sub Admins can manually register vehicles into the system.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard?tab=my-vehicles", { replace: true })
            }
            className="px-4 py-2 bg-[#060814] hover:bg-[#1a1d33] border border-[#1e2238] text-[#8a8fbc] hover:text-white font-bold rounded-lg text-[10px] uppercase transition-all"
          >
            Back to My Vehicles
          </button>
        </div>

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
            <Field label="Registration (required)">
              <input
                value={form.registration}
                onChange={handleChange("registration")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                placeholder="e.g. BD55SMR"
              />
            </Field>
            <Field label="Fuel Type (required)">
              <select
                value={form.fuelType}
                onChange={handleChange("fuelType")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              >
                <option value="PETROL">PETROL</option>
                <option value="DIESEL">DIESEL</option>
                <option value="ELECTRIC">ELECTRIC</option>
                <option value="HYBRID">HYBRID</option>
              </select>
            </Field>

            <Field label="Make (required)">
              <input
                value={form.make}
                onChange={handleChange("make")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                placeholder="e.g. Ford"
              />
            </Field>
            <Field label="Model (required)">
              <input
                value={form.model}
                onChange={handleChange("model")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                placeholder="e.g. Focus"
              />
            </Field>

            <Field label="Colour (optional)">
              <input
                value={form.colour}
                onChange={handleChange("colour")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#00f0ff]"
                placeholder="e.g. Blue"
              />
            </Field>

            <Field label="Year (required)">
              <input
                value={form.year}
                onChange={handleChange("year")}
                type="number"
                min={1900}
                max={2100}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              />
            </Field>
          </div>

          <div className="mt-8 text-[11px] uppercase font-bold tracking-wider text-[#8a8fbc] mb-3">
            Optional Technical Specs
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Engine Capacity (CC)">
              <input
                value={form.engineCapacityCC}
                onChange={handleChange("engineCapacityCC")}
                type="number"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="e.g. 1598"
              />
            </Field>
            <Field label="Power (BHP)">
              <input
                value={form.powerBHP}
                onChange={handleChange("powerBHP")}
                type="number"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="e.g. 120"
              />
            </Field>
            <Field label="Top Speed (optional)">
              <input
                value={form.topSpeed}
                onChange={handleChange("topSpeed")}
                type="number"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="e.g. 120"
              />
            </Field>
            <Field label="Cylinders (optional)">
              <input
                value={form.cylinders}
                onChange={handleChange("cylinders")}
                type="number"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="e.g. 4"
              />
            </Field>
            <Field label="Fuel Consumption (MPG)">
              <input
                value={form.fuelConsumptionMPG}
                onChange={handleChange("fuelConsumptionMPG")}
                type="number"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="e.g. 45"
              />
            </Field>
          </div>

          <div className="mt-8 text-[11px] uppercase font-bold tracking-wider text-[#8a8fbc] mb-3">
            Optional Compliance (MOT/Tax)
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="MOT Status">
              <input
                value={form.motStatus}
                onChange={handleChange("motStatus")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="Valid / Expired"
              />
            </Field>
            <Field label="MOT Expiry Date">
              <input
                value={form.motExpiryDate}
                onChange={handleChange("motExpiryDate")}
                type="date"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              />
            </Field>

            <Field label="Tax Status">
              <input
                value={form.taxStatus}
                onChange={handleChange("taxStatus")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="Paid / Due"
              />
            </Field>
            <Field label="Tax Due Date">
              <input
                value={form.taxDueDate}
                onChange={handleChange("taxDueDate")}
                type="date"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              />
            </Field>

            <Field label="Registration Keeper">
              <input
                value={form.registrationKeeper}
                onChange={handleChange("registrationKeeper")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="Owner name"
              />
            </Field>

            <Field label="V5C Issue Date">
              <input
                value={form.v5cIssueDate}
                onChange={handleChange("v5cIssueDate")}
                type="date"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
              />
            </Field>

            <Field label="CO2 Emissions">
              <input
                value={form.co2Emissions}
                onChange={handleChange("co2Emissions")}
                type="number"
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="e.g. 120"
              />
            </Field>
            <Field label="EURO Status">
              <input
                value={form.euroStatus}
                onChange={handleChange("euroStatus")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="e.g. Euro 6"
              />
            </Field>

            <Field label="Wheelplan">
              <input
                value={form.wheelplan}
                onChange={handleChange("wheelplan")}
                className="w-full px-3 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white outline-none focus:border-[#00f0ff]"
                placeholder="e.g. 2WD"
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() =>
                setForm({
                  registration: "",
                  make: "",
                  model: "",
                  colour: "",
                  year: "2024",
                  fuelType: "PETROL",

                  engineCapacityCC: "",
                  powerBHP: "",
                  topSpeed: "",
                  cylinders: "",
                  fuelConsumptionMPG: "",

                  motStatus: "Valid",
                  motExpiryDate: "",
                  taxStatus: "Paid",
                  taxDueDate: "",
                  registrationKeeper: "",
                  v5cIssueDate: "",
                  co2Emissions: "",
                  euroStatus: "",
                  wheelplan: "",

                  submitting: false,
                })
              }
              disabled={form.submitting}
              className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-[#1e2238] text-[#8a8fbc] hover:text-white font-bold rounded-xl text-[10px] uppercase transition-all disabled:opacity-40"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={!isValid || form.submitting}
              className="px-5 py-2 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/25 text-[#e9fdff] font-bold rounded-xl text-[10px] uppercase transition-all disabled:opacity-40"
            >
              {form.submitting ? "Creating..." : "Create Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
