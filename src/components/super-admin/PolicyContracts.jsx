import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, FileText } from "lucide-react";

export default function PolicyContracts({
  policies = [], // Defensive assignment: Prevents array map runtime breaks if undefined
}) {
  const navigate = useNavigate();

  // Helper utility format to make database UTC date arrays cleaner for presentation

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
      {/* FEED VISUALIZATION BLOCK */}
      <div className="xl:col-span-2 bg-[#0d0f1d] border border-[#1e2238] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-white">
              Global Platform Policy Feed
            </h3>
            <p className="text-[11px] text-[#6b7280]">
              Live validation view across instantiated active risk coverage
              profiles.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-white/5 border border-[#1e2238] rounded-lg text-[10px] text-gray-400 font-mono">
            Count: {policies.length}
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[620px] pr-2">
          {policies.length === 0 ? (
            <div className="text-center py-16 text-[#6b7280] font-medium tracking-wide">
              No insurance policies match your system visibility parameters.
            </div>
          ) : (
            policies.map((p) => (
              <div
                key={p._id}
                className="w-full text-left p-4.5 bg-[#060814]/60 border border-[#1e2238] rounded-xl pace-y-3 cursor-pointer hover:border-[#3b4263] hover:ring-1 hover:ring-[#3b4263]/50 transition-all duration-300"
                onClick={() => navigate(`/admin/policies/${p._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/admin/policies/${p._id}`);
                  }
                }}
              >
                {/* ID Token, Scope Tags & Cost Ledger Row */}
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

                {/* Entity Relations Grid Block */}
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

                {/* Expanded Time Horizon Scale Display */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#6b7280] pt-1.5 border-t border-white/5 gap-3">
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

                  {/* Operational Security Audit Signature */}
                  {p.createdBy && (
                    <div className="text-[10px] text-right bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      <span className="text-gray-500">Issued By: </span>
                      <span className="font-medium text-gray-300">
                        {p.createdBy.fullName}
                      </span>
                      <span className="text-[9px] text-[#644aff] ml-1 uppercase tracking-wider font-bold">
                        ({p.createdBy.role})
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
