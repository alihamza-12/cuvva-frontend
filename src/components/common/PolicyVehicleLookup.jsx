import { useState } from "react";
import { Car, CheckCircle2, Search } from "lucide-react";
import {
  createVehicle,
  getExternalVehicleByRegistration,
  getVehicleByRegistration,
} from "../../app/api/vehicleApi";
import { updateVehicle } from "../../app/api/vehicleUpdateApi";

const EMPTY_VEHICLE = {
  _id: "",
  registration: "",
  make: "",
  model: "",
  description: "",
  vehicleIdentificationNumber: "",
  year: "",
  colour: "",
  fuelType: "PETROL",
  engineCapacityCC: "",
  bodyStyle: "",
  variant: "",
  transmission: "",
  numberOfDoors: "",
  numberOfSeats: "",
  vehicleInsuranceGroup: "",
  vehicleInsuranceGroupOutOf: "",
  abiCode: "",
  engineCode: "",
  engineNumber: "",
  immobiliser: "",
  indicativeValue: "",
  driverSide: "",
  imageUrl: "",
  lookupSource: "manual",
  regCheckData: undefined,
};

const cleanRegistration = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

const normalizeFuelType = (value) => {
  const fuel = String(value || "").toUpperCase();
  if (fuel.includes("HYBRID")) return "HYBRID";
  if (fuel.includes("ELECTRIC")) return "ELECTRIC";
  if (fuel.includes("DIESEL")) return "DIESEL";
  return "PETROL";
};

const toVehicleForm = (vehicle, registration) => ({
  ...EMPTY_VEHICLE,
  ...vehicle,
  _id: vehicle?._id || "",
  registration: cleanRegistration(vehicle?.registration || registration),
  vehicleIdentificationNumber: String(
    vehicle?.vehicleIdentificationNumber || "",
  ).toUpperCase(),
  year: vehicle?.year ?? "",
  fuelType: normalizeFuelType(vehicle?.fuelType),
  engineCapacityCC: vehicle?.engineCapacityCC ?? "",
  numberOfDoors: vehicle?.numberOfDoors ?? "",
  numberOfSeats: vehicle?.numberOfSeats ?? "",
  vehicleInsuranceGroup: vehicle?.vehicleInsuranceGroup ?? "",
  vehicleInsuranceGroupOutOf: vehicle?.vehicleInsuranceGroupOutOf ?? "",
  indicativeValue: vehicle?.indicativeValue ?? "",
});

const optionalNumber = (value) =>
  value === "" || value === null || value === undefined
    ? undefined
    : Number(value);

const toVehiclePayload = (vehicle) => ({
  registration: cleanRegistration(vehicle.registration),
  make: vehicle.make.trim(),
  model: vehicle.model.trim(),
  description: vehicle.description?.trim() || "",
  vehicleIdentificationNumber: vehicle.vehicleIdentificationNumber
    .trim()
    .toUpperCase(),
  year: Number(vehicle.year),
  colour: vehicle.colour.trim(),
  fuelType: normalizeFuelType(vehicle.fuelType),
  engineCapacityCC: optionalNumber(vehicle.engineCapacityCC),
  bodyStyle: vehicle.bodyStyle?.trim() || "",
  variant: vehicle.variant?.trim() || "",
  transmission: vehicle.transmission?.trim() || "",
  numberOfDoors: optionalNumber(vehicle.numberOfDoors),
  numberOfSeats: optionalNumber(vehicle.numberOfSeats),
  vehicleInsuranceGroup: optionalNumber(vehicle.vehicleInsuranceGroup),
  vehicleInsuranceGroupOutOf: optionalNumber(
    vehicle.vehicleInsuranceGroupOutOf,
  ),
  abiCode: vehicle.abiCode?.trim() || "",
  engineCode: vehicle.engineCode?.trim() || "",
  engineNumber: vehicle.engineNumber?.trim() || "",
  immobiliser: vehicle.immobiliser?.trim() || "",
  indicativeValue: optionalNumber(vehicle.indicativeValue),
  driverSide: vehicle.driverSide?.trim() || "",
  imageUrl: vehicle.imageUrl?.trim() || "",
  lookupSource: vehicle.lookupSource || "manual",
  regCheckData: vehicle.regCheckData,
});

export default function PolicyVehicleLookup({
  onVehicleResolved,
  accent = "purple",
}) {
  const accentBorder =
    accent === "cyan" ? "focus:border-[#00f0ff]" : "focus:border-[#644aff]";
  const buttonClass =
    accent === "cyan"
      ? "bg-[#00f0ff]/15 border-[#00f0ff]/25 text-[#e9fdff] hover:bg-[#00f0ff]/20"
      : "bg-[#644aff] border-[#644aff] text-white hover:bg-[#523ad1]";

  const [registration, setRegistration] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [lookupState, setLookupState] = useState("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  const vehicleIsComplete = (value) =>
    Boolean(
      value?.registration &&
        value?.make?.trim() &&
        value?.model?.trim() &&
        value?.vehicleIdentificationNumber?.trim() &&
        Number(value?.year) > 0 &&
        value?.fuelType,
    );

  const resolveVehicle = (savedVehicle, sourceMessage) => {
    if (!savedVehicle?._id) {
      setError("The server did not return a valid saved vehicle.");
      onVehicleResolved(null);
      return;
    }

    const next = toVehicleForm(savedVehicle, savedVehicle.registration);
    setVehicle(next);
    setRegistration(next.registration);
    setDirty(false);
    setMessage(sourceMessage);
    setError("");
    onVehicleResolved(savedVehicle);
  };

  const handleSearch = async () => {
    const cleaned = cleanRegistration(registration);
    if (!cleaned) {
      setError("Enter a registration number.");
      return;
    }

    setLookupState("searching");
    setError("");
    setMessage("");
    setVehicle(null);
    onVehicleResolved(null);

    try {
      const localResponse = await getVehicleByRegistration(cleaned);
      resolveVehicle(
        localResponse.data?.vehicle,
        "Vehicle found in the database and linked to your account.",
      );
      setLookupState("ready");
      return;
    } catch (localError) {
      if (localError.response?.status !== 404) {
        setLookupState("idle");
        setError(
          localError.response?.data?.message || "Could not search the vehicle database.",
        );
        return;
      }
    }

    let externalVehicle;
    try {
      const externalResponse = await getExternalVehicleByRegistration(cleaned, {
        bypassCache: true,
      });
      externalVehicle = toVehicleForm(
        externalResponse.data?.vehicle || {},
        cleaned,
      );
      // RegCheck uses the registration as a frontend-only _id. Clear it here
      // because this vehicle has not received a MongoDB id yet.
      externalVehicle._id = "";
      externalVehicle.lookupSource = "regcheck";
      setVehicle(externalVehicle);
    } catch (externalError) {
      setVehicle({
        ...EMPTY_VEHICLE,
        registration: cleaned,
      });
      setLookupState("manual");
      setMessage(
        "Vehicle could not be found through RegCheck. Enter its details manually, then save it.",
      );
      setError(externalError.response?.data?.message || externalError.message || "");
      return;
    }

    if (!vehicleIsComplete(externalVehicle)) {
      setLookupState("manual");
      setMessage(
        "Vehicle found, but some required details are missing. Complete them manually and save the vehicle.",
      );
      return;
    }

    try {
      const savedResponse = await createVehicle(toVehiclePayload(externalVehicle));
      resolveVehicle(
        savedResponse.data?.vehicle,
        "Vehicle found through RegCheck, saved, and linked to your account.",
      );
      setLookupState("ready");
    } catch (saveError) {
      setLookupState("manual");
      setMessage(
        "Vehicle details were found. Review them and save the vehicle to continue.",
      );
      setError(saveError.response?.data?.message || "Could not save the vehicle.");
    }
  };

  const setField = (field) => (event) => {
    const value = event.target.value;
    setVehicle((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setMessage("Vehicle details changed. Save them before creating the policy.");
    setError("");
    onVehicleResolved(null);
  };

  const handleSave = async () => {
    if (!vehicleIsComplete(vehicle)) {
      setError(
        "Registration, make, model, VIN, year and fuel type are required.",
      );
      return;
    }

    setLookupState("saving");
    setError("");
    try {
      const payload = toVehiclePayload(vehicle);
      const response = vehicle._id
        ? await updateVehicle(vehicle._id, payload)
        : await createVehicle(payload);
      resolveVehicle(
        response.data?.vehicle,
        vehicle._id
          ? "Vehicle details updated and ready for this policy."
          : "Vehicle saved and ready for this policy.",
      );
      setLookupState("ready");
    } catch (saveError) {
      setLookupState("manual");
      setError(saveError.response?.data?.message || "Could not save vehicle details.");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#1e2238] bg-white/[0.02] p-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
          Vehicle registration (required)
        </div>
        <div className="flex flex-col gap-2 mt-2 sm:flex-row">
          <div className="relative flex-1">
            <Car
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]"
            />
            <input
              value={registration}
              onChange={(event) => {
                const nextRegistration = cleanRegistration(event.target.value);
                setRegistration(nextRegistration);

                if (
                  vehicle &&
                  nextRegistration !== cleanRegistration(vehicle.registration)
                ) {
                  setVehicle(null);
                  setLookupState("idle");
                  setMessage("");
                  setError("");
                  setDirty(false);
                  onVehicleResolved(null);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Enter registration"
              className={`min-h-[44px] w-full rounded-xl border border-[#1e2238] bg-[#060814] py-2.5 pl-10 pr-3 text-xs uppercase text-white outline-none ${accentBorder}`}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={lookupState === "searching" || !registration}
            className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-5 text-[10px] font-bold uppercase disabled:opacity-40 ${buttonClass}`}
          >
            <Search size={14} />
            {lookupState === "searching" ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-green-200">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-amber-200">
          {error}
        </div>
      )}

      {vehicle && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <VehicleInput label="Make" value={vehicle.make} onChange={setField("make")} required accentBorder={accentBorder} />
          <VehicleInput label="Model" value={vehicle.model} onChange={setField("model")} required accentBorder={accentBorder} />
          <div className="md:col-span-2">
            <VehicleInput label="Description" value={vehicle.description} onChange={setField("description")} accentBorder={accentBorder} />
          </div>
          <VehicleInput label="VIN" value={vehicle.vehicleIdentificationNumber} onChange={setField("vehicleIdentificationNumber")} required uppercase accentBorder={accentBorder} />
          <VehicleInput label="Year" value={vehicle.year} onChange={setField("year")} required inputMode="numeric" accentBorder={accentBorder} />
          <VehicleInput label="Colour" value={vehicle.colour} onChange={setField("colour")} accentBorder={accentBorder} />
          <label className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">Fuel type *</span>
            <select value={vehicle.fuelType} onChange={setField("fuelType")} className={`min-h-[44px] w-full rounded-xl border border-[#1e2238] bg-[#060814] px-3 py-2 text-xs text-white outline-none ${accentBorder}`}>
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </label>
          <VehicleInput label="Engine capacity (CC)" value={vehicle.engineCapacityCC} onChange={setField("engineCapacityCC")} inputMode="numeric" accentBorder={accentBorder} />
          <VehicleInput label="Body style" value={vehicle.bodyStyle} onChange={setField("bodyStyle")} accentBorder={accentBorder} />
          <VehicleInput label="Variant" value={vehicle.variant} onChange={setField("variant")} accentBorder={accentBorder} />
          <VehicleInput label="Transmission" value={vehicle.transmission} onChange={setField("transmission")} accentBorder={accentBorder} />
          <VehicleInput label="Doors" value={vehicle.numberOfDoors} onChange={setField("numberOfDoors")} inputMode="numeric" accentBorder={accentBorder} />
          <VehicleInput label="Seats" value={vehicle.numberOfSeats} onChange={setField("numberOfSeats")} inputMode="numeric" accentBorder={accentBorder} />
          <VehicleInput label="Insurance group" value={vehicle.vehicleInsuranceGroup} onChange={setField("vehicleInsuranceGroup")} inputMode="numeric" accentBorder={accentBorder} />
          <VehicleInput label="Insurance group out of" value={vehicle.vehicleInsuranceGroupOutOf} onChange={setField("vehicleInsuranceGroupOutOf")} inputMode="numeric" accentBorder={accentBorder} />
          <VehicleInput label="ABI code" value={vehicle.abiCode} onChange={setField("abiCode")} accentBorder={accentBorder} />
          <VehicleInput label="Engine code" value={vehicle.engineCode} onChange={setField("engineCode")} accentBorder={accentBorder} />
          <VehicleInput label="Engine number" value={vehicle.engineNumber} onChange={setField("engineNumber")} accentBorder={accentBorder} />
          <VehicleInput label="Immobiliser" value={vehicle.immobiliser} onChange={setField("immobiliser")} accentBorder={accentBorder} />
          <VehicleInput label="Indicative value" value={vehicle.indicativeValue} onChange={setField("indicativeValue")} inputMode="decimal" accentBorder={accentBorder} />
          <VehicleInput label="Driver side" value={vehicle.driverSide} onChange={setField("driverSide")} accentBorder={accentBorder} />
          <div className="md:col-span-2">
            <VehicleInput label="Vehicle image URL" value={vehicle.imageUrl} onChange={setField("imageUrl")} accentBorder={accentBorder} />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={lookupState === "saving" || (!dirty && lookupState === "ready")}
              className={`min-h-[44px] w-full rounded-xl border px-5 text-[10px] font-bold uppercase disabled:opacity-40 ${buttonClass}`}
            >
              {lookupState === "saving" ? "Saving vehicle..." : "Save vehicle details"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleInput({
  label,
  value,
  onChange,
  required = false,
  uppercase = false,
  inputMode,
  accentBorder,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
        {label}{required ? " *" : ""}
      </span>
      <input
        value={value ?? ""}
        onChange={onChange}
        required={required}
        inputMode={inputMode}
        className={`min-h-[44px] w-full rounded-xl border border-[#1e2238] bg-[#060814] px-3 py-2 text-xs text-white outline-none ${uppercase ? "uppercase" : ""} ${accentBorder}`}
      />
    </label>
  );
}
