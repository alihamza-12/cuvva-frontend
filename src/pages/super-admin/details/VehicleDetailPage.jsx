import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, ShieldAlert } from "lucide-react";

import Sidebar from "../../../components/super-admin/Sidebar";
import { getVehicleByRegistration } from "../../../app/api/vehicleApi";
import { updateVehicle } from "../../../app/api/vehicleUpdateApi";
import VehicleSourceBadge from "../../../components/common/VehicleSourceBadge";
import VehicleDeleteControl from "../../../components/common/VehicleDeleteControl";

export default function VehicleDetailPage() {
  const { registration } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [vin, setVin] = useState("");
  const [savingVin, setSavingVin] = useState(false);
  const [vinMessage, setVinMessage] = useState("");

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
        const loadedVehicle = res.data?.vehicle || null;
        setVehicle(loadedVehicle);
        setVin(loadedVehicle?.vehicleIdentificationNumber || "");
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

  const handleSaveVin = async () => {
    const normalizedVin = vin.trim().toUpperCase();
    if (!normalizedVin || !vehicle?._id) {
      setVinMessage("VIN is required.");
      return;
    }

    setSavingVin(true);
    setVinMessage("");
    try {
      const response = await updateVehicle(vehicle._id, {
        vehicleIdentificationNumber: normalizedVin,
      });
      setVehicle(response.data?.vehicle || {
        ...vehicle,
        vehicleIdentificationNumber: normalizedVin,
      });
      setVin(normalizedVin);
      setVinMessage("VIN saved successfully.");
    } catch (saveError) {
      setVinMessage(
        saveError.response?.data?.message || "Failed to save the VIN.",
      );
    } finally {
      setSavingVin(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060814] text-white flex">
      <Sidebar
        activeTab={"vehicles"}
        setActiveTab={(tabId) => {
          if (tabId === "overview") navigate("/admin/dashboard");
          else navigate(`/admin/dashboard?tab=${tabId}`);
        }}
        user={{
          fullName: vehicle?.registration || "Super Admin",
          role: "Super Admin",
        }}
        onLogout={() => {}}
      />

<div className="flex-1 w-full p-4 space-y-6 pb-28 md:p-10 md:pb-24 lg:pb-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl bg-white/5 border border-[#1e2238] hover:bg-white/10 text-xs uppercase tracking-wider font-bold"
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
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#644aff]">
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
                <div className="flex flex-col items-end gap-3">
                  <VehicleSourceBadge vehicle={vehicle} />
                  <VehicleDeleteControl
                    vehicle={vehicle}
                    accent="purple"
                    onDeleted={() =>
                      navigate("/admin/dashboard?tab=vehicles", { replace: true })
                    }
                  />
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xs font-bold tracking-wider text-white uppercase">
                  Associated Sub Admins
                </h3>
                <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-200">
                  {vehicle.associatedSubAdminCount || 0} associated
                </span>
              </div>

              {vehicle.associatedSubAdmins?.length ? (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {vehicle.associatedSubAdmins.map((admin) => (
                    <div
                      key={admin._id}
                      className="rounded-xl border border-[#1e2238] bg-[#060814] p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {admin.fullName || "Unnamed Sub Admin"}
                        </span>
                        {admin.isCreator && (
                          <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-200">
                            Creator
                          </span>
                        )}
                      </div>
                      <div className="mt-1 break-all text-xs text-[#8a8fbc]">
                        {admin.email || "Email unavailable"}
                      </div>
                      <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                        {admin.role}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs text-[#6b7280]">
                  No Sub Admins are currently associated with this vehicle.
                </p>
              )}
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
                  <div className="font-mono text-xs text-white break-all">
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
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc]">
                    VIN
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={vin}
                      onChange={(event) => setVin(event.target.value.toUpperCase())}
                      required
                      className="min-h-[44px] flex-1 rounded-xl border border-[#1e2238] bg-[#060814] px-3 font-mono text-xs uppercase text-white outline-none focus:border-[#644aff]"
                      placeholder="Vehicle identification number"
                    />
                    <button
                      type="button"
                      onClick={handleSaveVin}
                      disabled={savingVin || !vin.trim()}
                      className="min-h-[44px] rounded-xl bg-[#644aff] px-5 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-50"
                    >
                      {savingVin ? "Saving..." : "Save VIN"}
                    </button>
                  </div>
                  {vinMessage && (
                    <div className="text-[11px] text-[#8a8fbc]">{vinMessage}</div>
                  )}
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
      </div>
    </div>
  );
}
