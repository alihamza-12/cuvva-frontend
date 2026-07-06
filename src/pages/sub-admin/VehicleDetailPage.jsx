import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, ShieldAlert } from "lucide-react";
import { getVehicleByRegistration } from "../../app/api/vehicleApi";
import { updateVehicle } from "../../app/api/vehicleUpdateApi";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"];

// Converts an ISO date string / Date into the yyyy-MM-dd shape <input type="date"> needs.
const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

// Builds the full edit-form state from a fetched vehicle record.
// Every field on the Vehicle schema (except _id / createdBy / timestamps) lives here.
const buildFormFromVehicle = (vehicle) => ({
  registration: vehicle?.registration || "",
  make: vehicle?.make || "",
  model: vehicle?.model || "",
  colour: vehicle?.colour || "",
  year: vehicle?.year != null ? String(vehicle.year) : "",

  fuelType: vehicle?.fuelType || "PETROL",
  engineCapacityCC:
    vehicle?.engineCapacityCC != null ? String(vehicle.engineCapacityCC) : "",
  powerBHP: vehicle?.powerBHP != null ? String(vehicle.powerBHP) : "",
  topSpeed: vehicle?.topSpeed != null ? String(vehicle.topSpeed) : "",
  cylinders: vehicle?.cylinders != null ? String(vehicle.cylinders) : "",
  fuelConsumptionMPG:
    vehicle?.fuelConsumptionMPG != null
      ? String(vehicle.fuelConsumptionMPG)
      : "",

  motStatus: vehicle?.motStatus || "Valid",
  motExpiryDate: toDateInputValue(vehicle?.motExpiryDate),
  taxStatus: vehicle?.taxStatus || "Paid",
  taxDueDate: toDateInputValue(vehicle?.taxDueDate),
  registrationKeeper: vehicle?.registrationKeeper || "",
  v5cIssueDate: toDateInputValue(vehicle?.v5cIssueDate),
  co2Emissions:
    vehicle?.co2Emissions != null ? String(vehicle.co2Emissions) : "",
  euroStatus: vehicle?.euroStatus || "",
  wheelplan: vehicle?.wheelplan || "",
});

// Converts the form state back into the payload shape the API expects
// (numbers as numbers, blank strings as undefined so we don't wipe fields
// the user didn't intend to touch, dates as ISO strings).
const buildPayloadFromForm = (form) => {
  const numOrUndef = (v) => (v === "" || v == null ? undefined : Number(v));
  const strOrUndef = (v) => (v === "" || v == null ? undefined : v);
  const dateOrUndef = (v) => (v ? new Date(v).toISOString() : undefined);

  return {
    registration: strOrUndef(form.registration)
      ?.toUpperCase()
      .replace(/\s+/g, ""),
    make: strOrUndef(form.make),
    model: strOrUndef(form.model),
    colour: strOrUndef(form.colour),
    year: numOrUndef(form.year),

    fuelType: strOrUndef(form.fuelType),
    engineCapacityCC: numOrUndef(form.engineCapacityCC),
    powerBHP: numOrUndef(form.powerBHP),
    topSpeed: numOrUndef(form.topSpeed),
    cylinders: numOrUndef(form.cylinders),
    fuelConsumptionMPG: numOrUndef(form.fuelConsumptionMPG),

    motStatus: strOrUndef(form.motStatus),
    motExpiryDate: dateOrUndef(form.motExpiryDate),
    taxStatus: strOrUndef(form.taxStatus),
    taxDueDate: dateOrUndef(form.taxDueDate),
    registrationKeeper: strOrUndef(form.registrationKeeper),
    v5cIssueDate: dateOrUndef(form.v5cIssueDate),
    co2Emissions: numOrUndef(form.co2Emissions),
    euroStatus: strOrUndef(form.euroStatus),
    wheelplan: strOrUndef(form.wheelplan),
  };
};

// ---------------------------------------------------------------------------
// Small presentational helpers (keeps the JSX below readable)
// ---------------------------------------------------------------------------

const FieldLabel = ({ children }) => (
  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
    {children}
  </div>
);

const TextInput = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) => (
  <div className="space-y-1">
    <FieldLabel>{label}</FieldLabel>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
    />
  </div>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <div className="space-y-1">
    <FieldLabel>{label}</FieldLabel>
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-[#060814] border border-[#1e2238] rounded-lg p-2 text-white outline-none focus:border-[#00f0ff]"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const ReadRow = ({ label, value }) => (
  <div className="space-y-1">
    <FieldLabel>{label}</FieldLabel>
    <div className="text-xs font-semibold text-white">{value ?? "N/A"}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function VehicleDetailPage() {
  const { registration } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicle, setVehicle] = useState(null);

  const [editForm, setEditForm] = useState(buildFormFromVehicle(null));
  const [isEditMode, setIsEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const setField = (key) => (e) =>
    setEditForm((prev) => ({ ...prev, [key]: e.target.value }));

  const fetchVehicle = useCallback(
    async (regOverride) => {
      setLoading(true);
      setError("");
      try {
        const cleaned = (regOverride || registration || "")
          .trim()
          .toUpperCase()
          .replace(/\s+/g, "");
        const res = await getVehicleByRegistration(cleaned);
        const fetched = res.data?.vehicle || null;
        setVehicle(fetched);
        setEditForm(buildFormFromVehicle(fetched));
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load vehicle detail.",
        );
      } finally {
        setLoading(false);
      }
    },
    [registration],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchVehicle();
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registration]);

  const handleCancel = () => {
    setEditForm(buildFormFromVehicle(vehicle));
    setUpdateError("");
    setUpdateSuccess("");
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!vehicle?._id) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    const payload = buildPayloadFromForm(editForm);
    const registrationChanged =
      payload.registration && payload.registration !== vehicle.registration;

    try {
      await updateVehicle(vehicle._id, payload);
      setUpdateSuccess("Vehicle updated successfully.");
      setIsEditMode(false);

      if (registrationChanged) {
        // Registration is the route key, so navigate to the new URL and
        // let the effect above re-fetch using the updated value.
        navigate(`/admin/vehicles/${payload.registration}`, { replace: true });
      } else {
        await fetchVehicle(vehicle.registration);
      }
    } catch (err) {
      setUpdateError(
        err.response?.data?.message || "Failed to update vehicle.",
      );
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
            Vehicle Detail
          </h1>
        </div>

        {loading && (
          <div className="text-xs text-[#8a8fbc] animate-pulse">
            Loading vehicle record...
          </div>
        )}

        {!loading && error && (
          <div className="inline-flex items-center gap-2 p-4 text-xs font-semibold text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
            <ShieldAlert size={14} /> {error}
          </div>
        )}

        {!loading && !error && vehicle && (
          <div className="space-y-5">
            <div className="flex items-center justify-end gap-2">
              {!isEditMode ? (
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 hover:bg-[#00f0ff]/20 text-xs uppercase tracking-wider font-bold"
                  onClick={() => setIsEditMode(true)}
                >
                  Edit Vehicle
                </button>
              ) : (
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Header card */}
            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#00f0ff]">
                    <Car size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#8a8fbc] font-mono uppercase tracking-wider">
                      {vehicle.registration}
                    </div>
                    <div className="mt-1 text-sm font-bold text-white">
                      {vehicle.make} {vehicle.model}
                    </div>
                  </div>
                </div>
              </div>

              {isEditMode ? (
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="mt-4 space-y-6"
                >
                  {/* --- Core Identity --- */}
                  <div>
                    <h3 className="mb-3 text-[11px] font-bold tracking-wider text-[#00f0ff] uppercase">
                      Core Identity
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <TextInput
                        label="Registration"
                        value={editForm.registration}
                        onChange={setField("registration")}
                        required
                      />
                      <TextInput
                        label="Make"
                        value={editForm.make}
                        onChange={setField("make")}
                        required
                      />
                      <TextInput
                        label="Model"
                        value={editForm.model}
                        onChange={setField("model")}
                        required
                      />
                      <TextInput
                        label="Colour"
                        value={editForm.colour}
                        onChange={setField("colour")}
                      />
                      <TextInput
                        label="Year"
                        type="number"
                        value={editForm.year}
                        onChange={setField("year")}
                        required
                      />
                    </div>
                  </div>

                  {/* --- Technical Specifications --- */}
                  <div>
                    <h3 className="mb-3 text-[11px] font-bold tracking-wider text-[#00f0ff] uppercase">
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <SelectInput
                        label="Fuel Type"
                        value={editForm.fuelType}
                        onChange={setField("fuelType")}
                        options={FUEL_TYPES}
                      />
                      <TextInput
                        label="Engine Capacity (CC)"
                        type="number"
                        value={editForm.engineCapacityCC}
                        onChange={setField("engineCapacityCC")}
                      />
                      <TextInput
                        label="Power (BHP)"
                        type="number"
                        value={editForm.powerBHP}
                        onChange={setField("powerBHP")}
                      />
                      <TextInput
                        label="Top Speed"
                        type="number"
                        value={editForm.topSpeed}
                        onChange={setField("topSpeed")}
                      />
                      <TextInput
                        label="Cylinders"
                        type="number"
                        value={editForm.cylinders}
                        onChange={setField("cylinders")}
                      />
                      <TextInput
                        label="Fuel Consumption (MPG)"
                        type="number"
                        value={editForm.fuelConsumptionMPG}
                        onChange={setField("fuelConsumptionMPG")}
                      />
                    </div>
                  </div>

                  {/* --- DVLA Compliance --- */}
                  <div>
                    <h3 className="mb-3 text-[11px] font-bold tracking-wider text-[#00f0ff] uppercase">
                      DVLA Compliance Status
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <TextInput
                        label="MOT Status"
                        value={editForm.motStatus}
                        onChange={setField("motStatus")}
                      />
                      <TextInput
                        label="MOT Expiry Date"
                        type="date"
                        value={editForm.motExpiryDate}
                        onChange={setField("motExpiryDate")}
                      />
                      <TextInput
                        label="Tax Status"
                        value={editForm.taxStatus}
                        onChange={setField("taxStatus")}
                      />
                      <TextInput
                        label="Tax Due Date"
                        type="date"
                        value={editForm.taxDueDate}
                        onChange={setField("taxDueDate")}
                      />
                      <TextInput
                        label="Registration Keeper"
                        value={editForm.registrationKeeper}
                        onChange={setField("registrationKeeper")}
                      />
                      <TextInput
                        label="V5C Issue Date"
                        type="date"
                        value={editForm.v5cIssueDate}
                        onChange={setField("v5cIssueDate")}
                      />
                      <TextInput
                        label="CO2 Emissions"
                        type="number"
                        value={editForm.co2Emissions}
                        onChange={setField("co2Emissions")}
                      />
                      <TextInput
                        label="Euro Status"
                        value={editForm.euroStatus}
                        onChange={setField("euroStatus")}
                      />
                      <TextInput
                        label="Wheelplan"
                        value={editForm.wheelplan}
                        onChange={setField("wheelplan")}
                      />
                    </div>
                  </div>

                  {(updateError || updateSuccess) && (
                    <div>
                      {updateError && (
                        <div className="text-xs text-red-400">
                          {updateError}
                        </div>
                      )}
                      {updateSuccess && (
                        <div className="text-xs text-green-400">
                          {updateSuccess}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={updating}
                    onClick={handleSave}
                    className="w-full py-3 bg-[#00f0ff] hover:bg-[#00cfe0] disabled:opacity-50 text-black font-bold rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#00f0ff]/20"
                  >
                    {updating ? "Updating..." : "Save Changes"}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                  <ReadRow label="Colour" value={vehicle.colour} />
                  <ReadRow label="Year" value={vehicle.year} />
                  <ReadRow label="Fuel Type" value={vehicle.fuelType} />
                  <ReadRow
                    label="Engine Capacity (CC)"
                    value={vehicle.engineCapacityCC}
                  />
                  <ReadRow label="Power (BHP)" value={vehicle.powerBHP} />
                  <ReadRow label="Top Speed" value={vehicle.topSpeed} />
                  <ReadRow label="Cylinders" value={vehicle.cylinders} />
                  <ReadRow
                    label="Fuel Consumption (MPG)"
                    value={vehicle.fuelConsumptionMPG}
                  />
                  <ReadRow label="MOT Status" value={vehicle.motStatus} />
                  <ReadRow
                    label="MOT Expiry Date"
                    value={
                      vehicle.motExpiryDate
                        ? new Date(vehicle.motExpiryDate).toLocaleDateString()
                        : null
                    }
                  />
                  <ReadRow label="Tax Status" value={vehicle.taxStatus} />
                  <ReadRow
                    label="Tax Due Date"
                    value={
                      vehicle.taxDueDate
                        ? new Date(vehicle.taxDueDate).toLocaleDateString()
                        : null
                    }
                  />
                  <ReadRow
                    label="Registration Keeper"
                    value={vehicle.registrationKeeper}
                  />
                  <ReadRow
                    label="V5C Issue Date"
                    value={
                      vehicle.v5cIssueDate
                        ? new Date(vehicle.v5cIssueDate).toLocaleDateString()
                        : null
                    }
                  />
                  <ReadRow label="CO2 Emissions" value={vehicle.co2Emissions} />
                  <ReadRow label="Euro Status" value={vehicle.euroStatus} />
                  <ReadRow label="Wheelplan" value={vehicle.wheelplan} />
                  <div className="space-y-1 md:col-span-2">
                    <FieldLabel>System Owner</FieldLabel>
                    <div className="text-xs text-[#6b7280]">
                      {vehicle.createdBy?.fullName
                        ? `${vehicle.createdBy.fullName} (${vehicle.createdBy.role})`
                        : "Hidden Metadata"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Read-only system metadata card (never editable) */}
            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <h3 className="mb-3 text-xs font-bold tracking-wider text-white uppercase">
                System Metadata
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ReadRow label="Vehicle ID" value={vehicle?._id} />
                <ReadRow label="Registration" value={vehicle?.registration} />
                <div className="space-y-1 md:col-span-2">
                  <FieldLabel>Created By</FieldLabel>
                  <div className="text-xs text-[#6b7280]">
                    {vehicle?.createdBy?.fullName
                      ? `${vehicle.createdBy.fullName} (${vehicle.createdBy.role})`
                      : "Hidden Metadata"}
                  </div>
                </div>
                <ReadRow
                  label="Created At"
                  value={
                    vehicle?.createdAt
                      ? new Date(vehicle.createdAt).toLocaleString()
                      : null
                  }
                />
                <ReadRow
                  label="Updated At"
                  value={
                    vehicle?.updatedAt
                      ? new Date(vehicle.updatedAt).toLocaleString()
                      : null
                  }
                />
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !vehicle && (
          <div className="text-xs text-[#8a8fbc]">No record found.</div>
        )}
      </div>
    </div>
  );
}
