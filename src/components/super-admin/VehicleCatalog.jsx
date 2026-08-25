import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VehicleSourceBadge from "../common/VehicleSourceBadge";
import {
  Search,
  Car,
  Fuel,
  Calendar,
  Paintbrush,
  AlertTriangle,
  User,
} from "lucide-react";

const cleanRegistration = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

export default function VehicleCatalog({
  vehicles = [],
  onRefresh,
  axiosInstance,
}) {
  const navigate = useNavigate();

  const [regInput, setRegInput] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);

    const cleanedRegParam = cleanRegistration(regInput);

    if (!cleanedRegParam) {
      setLookupError("Please enter a registration number.");
      return;
    }

    // The complete Super Admin registry is already loaded on this screen.
    // Resolve an exact canonical match immediately before requesting it again.
    const loadedVehicle = vehicles.find(
      (vehicle) =>
        cleanRegistration(vehicle.registration) === cleanedRegParam,
    );

    if (loadedVehicle) {
      setLookupResult(loadedVehicle);
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/api/vehicles/lookup/${cleanedRegParam}`,
      );
      if (res.data?.vehicle) {
        setLookupResult(res.data.vehicle);
      } else {
        setLookupError("Vehicle not found.");
      }
    } catch (err) {
      setLookupError(err.response?.data?.message || "Lookup failed.");
    }
  };

  return (
    <div className="w-full p-4 space-y-6 animate-fadeIn">

      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Search size={18} className="text-[#644aff]" />
          <h3 className="text-sm font-bold tracking-wider text-white uppercase">
            System Lookup Engine
          </h3>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <input
            type="text"
            placeholder="ENTER PLATE REG"
            value={regInput}
            onChange={(e) => setRegInput(e.target.value)}
            className="w-full min-h-[44px] bg-white/5 border border-[#1e2238] rounded-xl px-4 py-3 uppercase font-mono tracking-widest outline-none text-white focus:border-[#644aff] font-bold text-sm"
          />
          <button
            type="submit"
            className="bg-[#644aff] hover:bg-[#523ad1] text-white px-6 rounded-xl font-bold transition-colors min-h-[44px]"
          >
            Query
          </button>
        </form>

        {lookupError && (
          <div className="flex items-center gap-2 p-3 mt-4 text-xs text-red-400 border bg-red-500/10 border-red-500/20 rounded-xl">
            <AlertTriangle size={14} /> <span>{lookupError}</span>
          </div>
        )}

        {lookupResult && (
          <div
            onClick={() =>
              navigate(
                `/admin/vehicles/${encodeURIComponent(lookupResult.registration)}`,
              )
            }
            className="mt-4 p-5 bg-[#060814] border border-[#1e2238] rounded-xl space-y-3 animate-slideUp cursor-pointer hover:border-white/20 transition-all group"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-mono font-bold rounded tracking-wider text-[11px] uppercase">
                  {lookupResult.registration}
                </span>
                <VehicleSourceBadge vehicle={lookupResult} />
              </div>
              <span className="text-[10px] text-gray-500 group-hover:text-white transition-colors underline">
                View Details
              </span>
            </div>
            <p className="text-sm font-bold text-white">
              {lookupResult.make} {lookupResult.model}
            </p>
            <div className="flex flex-wrap text-xs text-gray-400 gap-x-4">
              <span className="flex items-center gap-1.5">
                <Paintbrush size={12} /> {lookupResult.colour}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={12} /> {lookupResult.year}
              </span>
              <span className="flex items-center gap-1.5">
                <Fuel size={12} /> {lookupResult.fuelType}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white">Master Registry</h3>
          <p className="text-xs text-[#6b7280]">
            Live asset synchronization viewport.
          </p>
        </div>

        <div className="space-y-3">
          {vehicles.length === 0 ? (
            <div className="text-center py-16 text-[#6b7280] font-medium">
              No registered vehicles found.
            </div>
          ) : (
            vehicles.map((v) => (
              <div
                key={v._id}
                onClick={() =>
                  navigate(
                    `/admin/vehicles/${encodeURIComponent(v.registration)}`,
                  )
                }
                className="p-4 bg-[#060814]/60 border border-[#1e2238] rounded-xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:border-white/10 transition-all cursor-pointer group min-w-0"
              >
                <div className="flex items-center min-w-0 gap-4">
                  <div className="p-3 text-gray-400 border bg-white/5 border-white/5 rounded-xl shrink-0">
                    <Car size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-mono font-bold rounded text-xs uppercase break-all">
                        {v.registration}
                      </span>
                      <span className="text-sm font-semibold text-white break-words">
                        {v.make} {v.model}
                      </span>
                      <VehicleSourceBadge vehicle={v} />
                    </div>
                    <div className="text-[11px] text-[#6b7280] break-words">
                      {v.colour} • {v.year} • {v.fuelType}
                    </div>
                  </div>
                </div>

                <div className="hidden text-right sm:block">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">
                    Registered By
                  </span>
                  <span className="text-xs font-medium text-white">
                    {v.createdBy?.fullName || "System"}
                  </span>
                  <span className="mt-1 block text-[10px] text-[#6b7280]">
                    {v.associatedSubAdminCount || 0} associated Sub Admin(s)
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
