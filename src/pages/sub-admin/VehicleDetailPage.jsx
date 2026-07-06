import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Car, ShieldAlert } from "lucide-react";

import { getVehicleByRegistration } from "../../app/api/vehicleApi";

export default function VehicleDetailPage() {
  const { registration } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchVehicle = async () => {
      setLoading(true);
      setError("");
      try {
        const cleaned = (registration || "")
          .trim()
          .toUpperCase()
          .replace(/\s+/g, "");

        const res = await getVehicleByRegistration(cleaned);
        if (!mounted) return;

        setVehicle(res.data?.vehicle || null);
      } catch (err) {
        if (!mounted) return;
        setError(
          err.response?.data?.message || "Failed to load vehicle detail.",
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchVehicle();
    return () => {
      mounted = false;
    };
  }, [registration]);

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

              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Colour
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {vehicle.colour || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Year
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {vehicle.year || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Fuel Type
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {vehicle.fuelType || "Petrol"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    System Owner
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {vehicle.createdBy?.fullName
                      ? `${vehicle.createdBy.fullName} (${vehicle.createdBy.role})`
                      : "Hidden Metadata"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6">
              <h3 className="mb-3 text-xs font-bold tracking-wider text-white uppercase">
                Vehicle Detail Fields
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Vehicle ID
                  </div>
                  <div className="font-mono text-xs text-white">
                    {vehicle?._id}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Registration
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {vehicle?.registration}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Make / Model
                  </div>
                  <div className="text-xs text-[#8a8fbc]">
                    {vehicle?.make} {vehicle?.model}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Year
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {vehicle?.year || "N/A"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Colour
                  </div>
                  <div className="text-xs text-[#8a8fbc]">
                    {vehicle?.colour || "Unspecified"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Fuel Type
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {vehicle?.fuelType || "Petrol"}
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    Created By
                  </div>
                  <div className="text-xs text-[#6b7280]">
                    {vehicle?.createdBy?.fullName
                      ? `${vehicle.createdBy.fullName} (${vehicle.createdBy.role})`
                      : "Hidden Metadata"}
                  </div>
                </div>
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
