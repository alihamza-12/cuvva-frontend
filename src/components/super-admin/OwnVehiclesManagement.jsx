import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Search, AlertTriangle } from "lucide-react";

export default function OwnVehiclesManagement({ axiosInstance, onRefresh }) {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("/api/vehicles/all");
      const list = res?.data?.vehicles || [];
      setVehicles(list);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }, [axiosInstance]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const filteredVehicles = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = vehicles.filter((v) => v?.createdBy?.role === "Super Admin");

    if (!q) return list;

    return list.filter((v) => {
      const reg = (v.registration || "").toLowerCase();
      const makeModel = `${v.make || ""} ${v.model || ""}`.toLowerCase();
      const owner = v.createdBy?.fullName?.toLowerCase() || "";
      return reg.includes(q) || makeModel.includes(q) || owner.includes(q);
    });
  }, [vehicles, query]);

  return (
    <div className="w-full animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#1e2238]">
          <div>
            <h3 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
              <span className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#644aff]">
                <Car size={18} />
              </span>
              Own Vehicles
            </h3>
            <p className="text-xs text-[#6b7280] mt-1">
              Vehicles created by your Super Admin account.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-[#6b7280] pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search registration, model, owner..."
              className="w-full pl-10 pr-4 py-2 bg-[#060814] border border-[#1e2238] rounded-xl text-xs text-white placeholder:text-[#3a3f5f] outline-none focus:border-[#644aff] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#6b7280] text-sm">Loading...</div>
        ) : error ? (
          <div className="mt-4 flex items-center gap-2 p-4 text-xs font-semibold text-red-400 border rounded-2xl border-red-500/20 bg-red-500/10">
            <AlertTriangle size={14} /> {error}
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-16 text-[#6b7280]">
                <p className="text-sm font-medium">No own vehicles found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#8a8fbc] border-b border-[#1e2238] font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-4 pl-2">Vehicle</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2238]">
                  {filteredVehicles.map((v) => (
                    <tr
                      key={v._id}
                      className="group cursor-pointer hover:bg-[#1a1d33] transition-colors"
                      onClick={() =>
                        navigate(
                          `/admin/vehicles/${encodeURIComponent(v.registration)}`,
                        )
                      }
                    >
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-mono font-bold rounded text-[10px] uppercase">
                            {v.registration}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-[#644aff] transition-colors">
                              {v.make} {v.model}
                            </div>
                            <div className="text-[11px] text-[#6b7280]">{v.colour} • {v.year}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-[#6b7280]">
                        {v.fuelType || "Petrol"}
                      </td>
                      <td className="py-4 pr-2 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/admin/vehicles/${encodeURIComponent(v.registration)}`,
                            );
                          }}
                          className="px-4 py-2 bg-[#060814] hover:bg-[#1a1d33] hover:text-white border border-[#1e2238] hover:border-[#644aff] text-[#8a8fbc] font-bold rounded-lg text-[10px] uppercase transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

