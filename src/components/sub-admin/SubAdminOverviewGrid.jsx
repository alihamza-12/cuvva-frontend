import React from "react";
import { Car, ShieldCheck, Users, FileText, RefreshCw } from "lucide-react";

export function SubAdminOverviewGrid({ counts = {}, onRefresh }) {
  const metrics = [
    {
      title: "My Sub-Admin Customers",
      value: counts?.myCustomers ?? 0,
      label: "Owned client scope",
      icon: Users,
    },
    {
      title: "My Vehicles",
      value: counts?.myVehicles ?? 0,
      label: "Operational assets",
      icon: Car,
    },
    {
      title: "My Policy Contracts",
      value: counts?.myPolicies ?? 0,
      label: "Coverage contracts",
      icon: FileText,
    },
    {
      title: "Contracts Feed",
      value: counts?.contracts ?? 0,
      label: "Live contract list",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 select-none sm:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
      {metrics.map((card, idx) => {
        const Icon = card.icon;
        const palette = [
          "text-cyan-400",
          "text-yellow-400",
          "text-green-400",
          "text-purple-400",
        ][idx % 4];

        return (
          <div
            key={card.title}
            className="bg-[#0d0f1d] border border-[#1e2238] p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-white/10 group"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a8fbc]">
                {card.title}
              </span>
              <div
                className={`p-2 rounded-xl bg-white/5 ${palette} group-hover:scale-105 transition-transform shrink-0`}
              >
                <Icon size={16} />
              </div>
            </div>

            <div className="mt-5">
              <h2 className="font-mono text-2xl font-black tracking-tight text-white transition-colors group-hover:text-purple-100">
                {(card.value ?? 0).toLocaleString()}
              </h2>
              <p className="text-[11px] text-[#6b7280] mt-1 font-medium tracking-wide">
                {card.label}
              </p>
            </div>

            {idx === 0 && onRefresh && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={onRefresh}
                  className="w-full mt-2 px-3 py-2 bg-white/5 border border-[#1e2238] hover:border-[#00f0ff]/40 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc] hover:text-white"
                >
                  <RefreshCw size={12} className="text-[#00f0ff]" />
                  Refresh Metrics
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
