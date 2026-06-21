import React, { useState } from "react";
import {
  Search,
  Car,
  PlusCircle,
  Fuel,
  Calendar,
  Paintbrush,
  AlertTriangle,
  CheckCircle2,
  User,
} from "lucide-react";

export default function VehicleCatalog({
  vehicles = [], // Defensive assignment: Prevents map loop runtime crashes if array is undefined
  onRefresh,
  axiosInstance,
}) {
  // Operational States
  const [regInput, setRegInput] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");

  // Creation States
  const [newVehicle, setNewVehicle] = useState({
    registration: "",
    make: "",
    model: "",
    colour: "",
    year: "",
    fuelType: "Petrol", // Sensible default mapping choice
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Controller: Registry Plate Verification Lookup
  const handleLookup = async (e) => {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);

    // Sanitize string parameter to ensure no raw spaces break path parameters
    const cleanedRegParam = regInput.trim().toUpperCase().replace(/\s+/g, "");

    if (!cleanedRegParam) {
      setLookupError("Please submit a structural plate signature identifier.");
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/api/vehicles/lookup/${cleanedRegParam}`,
      );
      if (res.data?.vehicle) {
        setLookupResult(res.data.vehicle);
      } else {
        setLookupError(
          "Asset record returned empty or corrupt structural layout.",
        );
      }
    } catch (err) {
      setLookupError(
        err.response?.data?.message ||
          "Vehicle plate mismatch within master databases.",
      );
    }
  };

  // Controller: Asset Specifications Provisioning Pipeline
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setActionLoading(true);

    // Format structural entity body arrays cleanly before network ingestion
    const sanitizedPayload = {
      ...newVehicle,
      registration: newVehicle.registration
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ""),
      make: newVehicle.make.trim(),
      model: newVehicle.model.trim(),
      colour: newVehicle.colour.trim(),
      year: parseInt(newVehicle.year, 10) || new Date().getFullYear(), // Cast securely to numerical values
    };

    try {
      await axiosInstance.post("/api/vehicles", sanitizedPayload);
      setFormSuccess(
        `Asset specification template [${sanitizedPayload.registration}] injected successfully.`,
      );

      // Reset form variables cleanly back to original architectural structures
      setNewVehicle({
        registration: "",
        make: "",
        model: "",
        colour: "",
        year: "",
        fuelType: "Petrol",
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Error inserting asset specifications map.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 text-xs lg:grid-cols-3 animate-fadeIn">
      {/* FORM INTERFACE SIDEBAR CONTROL SHELF */}
      <div className="space-y-6">
        {/* PLATFORM REGISTRY LOOKUP ENGINE */}
        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Search size={14} className="text-[#644aff]" />
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
              System Lookup Engine
            </h3>
          </div>

          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER PLATE REG"
              value={regInput}
              onChange={(e) => setRegInput(e.target.value)}
              className="bg-white/5 border border-[#1e2238] rounded-xl px-3 py-2.5 uppercase font-mono tracking-widest outline-none text-white focus:border-[#644aff] flex-1 text-center font-bold text-xs"
            />
            <button
              type="submit"
              className="bg-[#644aff] hover:bg-[#523ad1] text-white px-4 rounded-xl font-bold transition-colors"
            >
              Query
            </button>
          </form>

          {/* LOOKUP ALERTS & FEEDBACK VIEWS */}
          {lookupError && (
            <div className="mt-3 p-2.5 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
              <AlertTriangle size={13} className="shrink-0" />{" "}
              <span>{lookupError}</span>
            </div>
          )}

          {lookupResult && (
            <div className="mt-4 p-4 bg-[#060814] border border-[#1e2238] rounded-xl space-y-3 animate-slideUp">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-mono font-bold rounded tracking-wider text-[11px] uppercase">
                  {lookupResult.registration}
                </span>
                <span className="text-[10px] text-[#6b7280] font-mono">
                  ID: {lookupResult._id?.substring(18)}
                </span>
              </div>
              <div className="space-y-1 text-[#8a8fbc]">
                <p className="text-xs font-bold text-white">
                  {lookupResult.make} {lookupResult.model}
                </p>
                <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Paintbrush size={10} /> {lookupResult.colour || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={10} /> {lookupResult.year || "N/A"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Fuel size={10} /> {lookupResult.fuelType || "N/A"}
                  </span>
                </div>
              </div>
              {lookupResult.createdBy && (
                <div className="text-[10px] text-[#644aff] pt-1.5 border-t border-white/5 flex items-center gap-1">
                  <User size={10} />{" "}
                  <span>Configured By: {lookupResult.createdBy.fullName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PROVISION NEW ASSET SPECIFICATIONS PANEL */}
        <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <PlusCircle size={14} className="text-[#644aff]" />
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
              Add Asset Template
            </h3>
          </div>

          <form onSubmit={handleCreateVehicle} className="space-y-3.5">
            {formError && (
              <div className="p-2.5 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                <AlertTriangle size={13} className="shrink-0" />{" "}
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-2.5 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={13} className="shrink-0" />{" "}
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Core Identification Plate */}
            <div>
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase block mb-1">
                Plate Registration
              </label>
              <input
                type="text"
                placeholder="E.G. KV16WYZ"
                required
                value={newVehicle.registration}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, registration: e.target.value })
                }
                className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 uppercase font-mono tracking-wider outline-none text-white focus:border-[#644aff]"
              />
            </div>

            {/* Make and Model Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase block mb-1">
                  Make
                </label>
                <input
                  type="text"
                  placeholder="Audi"
                  required
                  value={newVehicle.make}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, make: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 outline-none text-white focus:border-[#644aff]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase block mb-1">
                  Model
                </label>
                <input
                  type="text"
                  placeholder="A3 Sportback"
                  required
                  value={newVehicle.model}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, model: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 outline-none text-white focus:border-[#644aff]"
                />
              </div>
            </div>

            {/* Extended Missing Fields Layer: Colour & Manufacturing Year */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase block mb-1">
                  Colour Spec
                </label>
                <input
                  type="text"
                  placeholder="Metallic Grey"
                  required
                  value={newVehicle.colour}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, colour: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 outline-none text-white focus:border-[#644aff]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8a8fbc] uppercase block mb-1">
                  Year of Manufacture
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  placeholder="2018"
                  required
                  value={newVehicle.year}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, year: e.target.value })
                  }
                  className="w-full bg-white/5 border border-[#1e2238] rounded-xl p-2.5 outline-none text-white focus:border-[#644aff]"
                />
              </div>
            </div>

            {/* Extended Missing Fields Layer: Fuel Core Classification */}
            <div>
              <label className="text-[10px] font-bold text-[#8a8fbc] uppercase block mb-1">
                Engine Fuel Classification
              </label>
              <select
                value={newVehicle.fuelType}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, fuelType: e.target.value })
                }
                className="w-full bg-[#0d0f1d] border border-[#1e2238] rounded-xl p-2.5 text-white outline-none focus:border-[#644aff]"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel Core</option>
                <option value="Electric">Electric Propulsion (BEV)</option>
                <option value="Hybrid">Plug-in Hybrid (PHEV)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 bg-[#644aff] hover:bg-[#523ad1] disabled:opacity-50 text-white font-bold rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-[#644aff]/10"
            >
              {actionLoading
                ? "Injecting Configuration Matrix..."
                : "Inject Asset Spec"}
            </button>
          </form>
        </div>
      </div>

      {/* MASTER DATA VISUALIZATION FEED FRAME */}
      <div className="lg:col-span-2 bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-sm font-bold tracking-wide text-white">
            Master Vehicle Registry Catalog
          </h3>
          <p className="text-[11px] text-[#6b7280]">
            Live asset manifest synchronization viewport.
          </p>
        </div>

        <div className="overflow-y-auto max-h-[580px] space-y-3 pr-2 flex-1">
          {vehicles.length === 0 ? (
            <div className="text-center py-24 text-[#6b7280] tracking-wide font-medium">
              No registered vehicles found within your system configuration
              arrays.
            </div>
          ) : (
            vehicles.map((v) => (
              <div
                key={v._id}
                className="p-4 bg-[#060814]/60 border border-[#1e2238] rounded-xl flex flex-wrap justify-between items-center gap-4 hover:border-white/10 transition-colors"
              >
                {/* Plate and Identity Column */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 shrink-0">
                    <Car size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-mono font-bold rounded text-[11px] tracking-wider uppercase">
                        {v.registration}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {v.make} {v.model}
                      </span>
                    </div>
                    {/* Displaying Missing Field Context Variables */}
                    <div className="flex items-center gap-3 text-[10px] text-[#8a8fbc]">
                      <span className="capitalize">
                        Colour: {v.colour || "Unspecified"}
                      </span>
                      <span className="text-[#1e2238]">|</span>
                      <span>Year: {v.year || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Audit Tracking Signatures */}
                <div className="text-right text-[11px] space-y-1.5 ml-auto">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium rounded font-mono text-[9px] uppercase tracking-wide">
                    <Fuel size={10} /> {v.fuelType || "Petrol"}
                  </div>

                  {v.createdBy && (
                    <div className="text-[9px] text-[#6b7280]">
                      Registered by:{" "}
                      <span className="font-medium text-gray-400">
                        {v.createdBy.fullName}
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
