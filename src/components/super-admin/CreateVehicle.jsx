import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, PlusCircle, Car } from "lucide-react";

const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];

export default function CreateVehicle({ axiosInstance, onCreated }) {
  const [form, setForm] = useState({
    // --- Core Identity ---
    registration: "",
    make: "",
    model: "",
    colour: "",
    year: "",

    // --- Technical Specifications ---
    fuelType: "PETROL",
    engineCapacityCC: "",
    powerBHP: "",
    topSpeed: "",
    cylinders: "",
    fuelConsumptionMPG: "",

    // --- DVLA Compliance Status (Manually Managed) ---
    motStatus: "Valid",
    motExpiryDate: "",
    taxStatus: "Paid",
    taxDueDate: "",
    registrationKeeper: "",
    v5cIssueDate: "",
    co2Emissions: "",
    euroStatus: "",
    wheelplan: "",
  });

  const vehicleFieldList = useMemo(
    () => [
      "registration",
      "make",
      "model",
      "colour",
      "year",
      "fuelType",
      "engineCapacityCC",
      "powerBHP",
      "topSpeed",
      "cylinders",
      "fuelConsumptionMPG",
      "motStatus",
      "motExpiryDate",
      "taxStatus",
      "taxDueDate",
      "registrationKeeper",
      "v5cIssueDate",
      "co2Emissions",
      "euroStatus",
      "wheelplan",
    ],
    [],
  );

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const toNumberOrUndefined = (v) => {
        if (v === "" || v === null || v === undefined) return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };

      const toDateOrUndefined = (v) => {
        if (!v) return undefined;
        // Expect YYYY-MM-DD from <input type="date" />
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? undefined : d;
      };

      const payload = {
        registration: form.registration.trim(),
        make: form.make.trim(),
        model: form.model.trim(),
        colour: (form.colour || "").trim(),
        year: parseInt(form.year, 10),
        fuelType: form.fuelType,

        engineCapacityCC: toNumberOrUndefined(form.engineCapacityCC),
        powerBHP: toNumberOrUndefined(form.powerBHP),
        topSpeed: toNumberOrUndefined(form.topSpeed),
        cylinders: toNumberOrUndefined(form.cylinders),
        fuelConsumptionMPG: toNumberOrUndefined(form.fuelConsumptionMPG),

        motStatus: form.motStatus,
        motExpiryDate: toDateOrUndefined(form.motExpiryDate),
        taxStatus: form.taxStatus,
        taxDueDate: toDateOrUndefined(form.taxDueDate),
        registrationKeeper: (form.registrationKeeper || "").trim() || undefined,
        v5cIssueDate: toDateOrUndefined(form.v5cIssueDate),
        co2Emissions: toNumberOrUndefined(form.co2Emissions),
        euroStatus: (form.euroStatus || "").trim() || undefined,
        wheelplan: (form.wheelplan || "").trim() || undefined,
      };

      await axiosInstance.post("/api/vehicles", payload);

      setFormSuccess(`Vehicle created: ${payload.registration.toUpperCase()}`);

      setForm({
        registration: "",
        make: "",
        model: "",
        colour: "",
        year: "",
        fuelType: "PETROL",
      });

      if (onCreated) onCreated();
    } catch (err) {
      setFormError(err.response?.data?.message || "Error creating vehicle.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 text-xs xl:grid-cols-2 xl:items-start animate-fadeIn w-full">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 h-fit shadow-xl w-full">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle size={16} className="text-[#644aff]" />
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">
            Create Vehicle
          </h3>
        </div>

        <p className="text-[11px] text-[#6b7280] mb-4 leading-relaxed">
          Adds a new vehicle spec to the database. Uses POST /api/vehicles.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Registration
            </label>
            <input
              type="text"
              required
              value={form.registration}
              onChange={(e) =>
                setForm({ ...form, registration: e.target.value })
              }
              placeholder="KV16WYZ"
              className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Make
              </label>
              <input
                type="text"
                required
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                placeholder="Audi"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Model
              </label>
              <input
                type="text"
                required
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="A3"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Colour
              </label>
              <input
                type="text"
                value={form.colour}
                onChange={(e) => setForm({ ...form, colour: e.target.value })}
                placeholder="Metallic Grey"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Year
              </label>
              <input
                type="number"
                required
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="2018"
                min="1900"
                max="2100"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Fuel Type
            </label>
            <select
              value={form.fuelType}
              onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
              className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-3 text-xs outline-none text-white focus:border-[#644aff]"
            >
              <option value="PETROL">PETROL</option>
              <option value="DIESEL">DIESEL</option>
              <option value="ELECTRIC">ELECTRIC</option>
              <option value="HYBRID">HYBRID</option>
            </select>
          </div>

          {/* Technical specs */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Engine Capacity (CC)
              </label>
              <input
                type="number"
                value={form.engineCapacityCC}
                onChange={(e) =>
                  setForm({ ...form, engineCapacityCC: e.target.value })
                }
                placeholder="e.g. 1968"
                min="0"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Power (BHP)
              </label>
              <input
                type="number"
                value={form.powerBHP}
                onChange={(e) => setForm({ ...form, powerBHP: e.target.value })}
                placeholder="e.g. 150"
                min="0"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Top Speed
              </label>
              <input
                type="number"
                value={form.topSpeed}
                onChange={(e) => setForm({ ...form, topSpeed: e.target.value })}
                placeholder="e.g. 180"
                min="0"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Cylinders
              </label>
              <input
                type="number"
                value={form.cylinders}
                onChange={(e) =>
                  setForm({ ...form, cylinders: e.target.value })
                }
                placeholder="e.g. 4"
                min="0"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Fuel Consumption (MPG)
            </label>
            <input
              type="number"
              value={form.fuelConsumptionMPG}
              onChange={(e) =>
                setForm({ ...form, fuelConsumptionMPG: e.target.value })
              }
              placeholder="e.g. 55"
              min="0"
              className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
            />
          </div>

          {/* MOT / Tax + Compliance fields */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                MOT Status
              </label>
              <input
                type="text"
                value={form.motStatus}
                onChange={(e) =>
                  setForm({ ...form, motStatus: e.target.value })
                }
                placeholder="Valid"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                MOT Expiry Date
              </label>
              <input
                type="date"
                value={form.motExpiryDate}
                onChange={(e) =>
                  setForm({ ...form, motExpiryDate: e.target.value })
                }
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Tax Status
              </label>
              <input
                type="text"
                value={form.taxStatus}
                onChange={(e) =>
                  setForm({ ...form, taxStatus: e.target.value })
                }
                placeholder="Paid"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Tax Due Date
              </label>
              <input
                type="date"
                value={form.taxDueDate}
                onChange={(e) =>
                  setForm({ ...form, taxDueDate: e.target.value })
                }
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Registration Keeper
              </label>
              <input
                type="text"
                value={form.registrationKeeper}
                onChange={(e) =>
                  setForm({ ...form, registrationKeeper: e.target.value })
                }
                placeholder="e.g. John Smith"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                V5C Issue Date
              </label>
              <input
                type="date"
                value={form.v5cIssueDate}
                onChange={(e) =>
                  setForm({ ...form, v5cIssueDate: e.target.value })
                }
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                CO2 Emissions
              </label>
              <input
                type="number"
                value={form.co2Emissions}
                onChange={(e) =>
                  setForm({ ...form, co2Emissions: e.target.value })
                }
                placeholder="e.g. 120"
                min="0"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
                Euro Status
              </label>
              <input
                type="text"
                value={form.euroStatus}
                onChange={(e) =>
                  setForm({ ...form, euroStatus: e.target.value })
                }
                placeholder="Euro 6"
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
              Wheelplan
            </label>
            <input
              type="text"
              value={form.wheelplan}
              onChange={(e) => setForm({ ...form, wheelplan: e.target.value })}
              placeholder="e.g. 4x2"
              className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-3 text-xs text-white outline-none focus:border-[#644aff]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#644aff] hover:bg-[#523ad1] disabled:opacity-50 text-white font-bold rounded-xl uppercase tracking-wider transition-all shadow-md shadow-[#644aff]/10"
          >
            {submitting ? "Creating vehicle..." : "Create Vehicle"}
          </button>
        </form>
      </div>

      <div className="xl:col-span-2 space-y-6">
        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Car size={16} className="text-[#644aff]" />
            <h4 className="text-sm font-bold tracking-wide text-white uppercase">
              Vehicle fields used
            </h4>
          </div>
          <div className="text-[11px] text-[#6b7280] leading-relaxed space-y-2">
            <p>
              Backend schema fields sent to{" "}
              <span className="text-white/90">POST /api/vehicles</span>.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
              {vehicleFieldList.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#644aff] rounded-full shrink-0" />
                  <span className="text-white/80">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
