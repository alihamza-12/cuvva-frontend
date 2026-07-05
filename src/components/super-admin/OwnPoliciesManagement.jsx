import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, FileText } from "lucide-react";

export default function OwnPoliciesManagement({ policies = [], onRefresh }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredPolicies = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return policies;

    return policies.filter((p) => {
      const id = (p?._id || "").toLowerCase();
      const policyNumber = (p?.policyNumber || "").toLowerCase();
      const customerName = (p?.customerId?.fullName || "").toLowerCase();
      const vehicleReg = (p?.vehicleId?.registration || "").toLowerCase();
      const policyType = (p?.policyType || "").toLowerCase();
      const coverageType = (p?.coverageType || "").toLowerCase();

      return (
        id.includes(q) ||
        policyNumber.includes(q) ||
        customerName.includes(q) ||
        vehicleReg.includes(q) ||
        policyType.includes(q) ||
        coverageType.includes(q)
      );
    });
  }, [policies, query]);

  const formatDateString = (rawDate) => {
    if (!rawDate) return "N/A";
    return new Date(rawDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 text-xs xl:grid-cols-3 animate-fadeIn">
      <div className="bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 h-fit shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#644aff] font-bold">
              <FileText size={16} />
            </div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">
              Own Policy Contracts
            </h3>
          </div>

          <span className="px-2.5 py-1 bg-white/5 border border-[#1e2238] rounded-lg text-[10px] text-gray-400 font-mono">
            Count: {policies.length}
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#8a8fbc] uppercase tracking-wider">
            Search
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Policy ID, number, driver, vehicle, type..."
            className="w-full bg-white/5 border border-[#1e2238] rounded-xl py-2.5 px-3 text-white outline-none focus:border-[#644aff]"
          />
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="w-full py-3 mt-4 font-bold tracking-wider text-white uppercase transition-all border shadow-lg bg-white/5 hover:bg-white/10 rounded-xl shadow-white/5 border-white/10"
          >
            Refresh
          </button>
        )}

        <div className="mt-4 text-[11px] text-[#6b7280]">
          Showing policies created by Super Admin.
        </div>
      </div>

      <div className="xl:col-span-2 bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-white">
              Policy Feed
            </h3>
            <p className="text-[11px] text-[#6b7280]">
              Click any policy to view details.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-white/5 border border-[#1e2238] rounded-lg text-[10px] text-gray-400 font-mono">
            Filtered: {filteredPolicies.length}
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[620px] pr-2">
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-16 text-[#6b7280] font-medium tracking-wide">
              No policies found for your search.
            </div>
          ) : (
            filteredPolicies.map((p) => (
              <div
                key={p._id}
                className="p-4.5 bg-[#060814]/60 border border-[#1e2238] rounded-xl space-y-3 hover:border-white/10 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/policies/${p._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/admin/policies/${p._id}`);
                  }
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[#644aff]" />
                    <span className="text-[#8a8fbc] font-bold font-mono text-[11px]">
                      ID: {p._id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[#8a8fbc] font-bold rounded text-[9px] uppercase tracking-wide">
                      {p.policyType || "Short Term"}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-cyan-400 font-bold rounded text-[9px] uppercase tracking-wide">
                      {p.coverageType || "Comprehensive"}
                    </span>
                    <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 font-extrabold rounded text-xs inline-flex items-center">
                      £{p.premiumAmount}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[#8a8fbc] text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-[#6b7280] block tracking-wide">
                      Assigned Driver
                    </span>
                    <div className="font-semibold text-white">
                      {p.customerId?.fullName || "Deleted Driver Context"}
                    </div>
                    <div className="text-[10px] text-[#6b7280] truncate">
                      {p.customerId?.email || "N/A"}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-[#6b7280] block tracking-wide">
                      Covered Vehicle Asset
                    </span>
                    {p.vehicleId ? (
                      <div>
                        <span className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-mono font-bold rounded text-[10px] tracking-wider inline-block mr-2">
                          {p.vehicleId.registration}
                        </span>
                        <span className="font-medium text-white">
                          {p.vehicleId.make} {p.vehicleId.model}
                        </span>
                      </div>
                    ) : (
                      <span className="italic font-medium text-red-400">
                        Core Catalog Reference Missing
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6b7280] pt-1.5 border-t border-white/5">
                  <div className="flex items-center gap-1 font-medium text-gray-300">
                    <Calendar size={13} className="text-[#644aff]" />
                    <span>
                      {formatDateString(p.startDate)} ({p.startTime})
                    </span>
                    <span className="text-[#6b7280] px-1">➔</span>
                    <span>
                      {formatDateString(p.endDate)} ({p.endTime})
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
