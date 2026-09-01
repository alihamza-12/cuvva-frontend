import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  ShieldCheck,
  Users,
  FileText,
  RefreshCw,
  Files,
  Clock3,
} from "lucide-react";

export function SubAdminOverviewGrid({ counts = {}, onRefresh }) {
  const navigate = useNavigate();
  const metrics = [
    { title: "My Sub-Admin Customers", value: counts.myCustomers, label: "Owned client scope", icon: Users, route: "/dashboard?tab=my-customers" },
    { title: "My Vehicles", value: counts.myVehicles, label: "Operational assets", icon: Car, route: "/dashboard?tab=my-vehicles" },
    { title: "My Policy Contracts", value: counts.myPolicies, label: "Coverage contracts", icon: FileText, route: "/dashboard?tab=my-policies" },
    { title: "Contracts Feed", value: counts.contracts, label: "Live contract list", icon: ShieldCheck, route: "/dashboard?tab=contracts" },
    { title: "Total Policies", value: counts.totalPolicies, label: "All policies created by you", icon: Files, route: "/dashboard?tab=my-policies" },
    { title: "Active Policies", value: counts.activePolicies, label: "Currently active coverage", icon: FileText, route: "/dashboard?tab=my-policies" },
    { title: "Expired Policies", value: counts.expiredPolicies, label: "Completed coverage contracts", icon: Clock3, route: "/dashboard?tab=my-policies" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 select-none sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 animate-fadeIn">
      {metrics.map((card, idx) => {
        const Icon = card.icon;
        const palette = ["text-cyan-400", "text-yellow-400", "text-green-400", "text-purple-400"][idx % 4];
        return (
          <div
            key={card.title}
            role="button"
            tabIndex={0}
            onClick={() => navigate(card.route)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") navigate(card.route);
            }}
            className="bg-[#0d0f1d] border border-[#1e2238] p-4 sm:p-5 rounded-2xl flex flex-col justify-between text-left transition-all duration-300 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/40 group min-w-0 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc] leading-tight">{card.title}</span>
              <div className={`p-2 rounded-xl bg-white/5 ${palette} group-hover:scale-105 transition-transform shrink-0`}><Icon size={16} /></div>
            </div>
            <div className="mt-4">
              <h2 className="font-mono text-xl sm:text-2xl font-black tracking-tight text-white transition-colors group-hover:text-purple-100 truncate">
                {Number(card.value || 0).toLocaleString()}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#6b7280] mt-1 font-medium tracking-wide">{card.label}</p>
            </div>
            {idx === 0 && onRefresh && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRefresh();
                  }}
                  className="w-full mt-2 px-3 py-2 bg-white/5 border border-[#1e2238] hover:border-[#00f0ff]/40 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc] hover:text-white"
                >
                  <RefreshCw size={12} className="text-[#00f0ff]" /> Refresh Metrics
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
