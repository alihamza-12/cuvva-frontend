import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Users, Car, FileText, Files, Clock3 } from "lucide-react";

export default function OverviewGrid({ counts = {} }) {
  const navigate = useNavigate();
  const metrics = [
    {
      title: "Sub-Admin Accounts",
      value: counts?.subAdmins ?? 0,
      label: "Active administrative nodes",
      icon: ShieldCheck,
      color: "text-purple-400",
      route: "/admin/dashboard?tab=sub-admins",
    },
    {
      title: "Customer Accounts",
      value: counts?.customers ?? 0,
      label: "Global registered client base",
      icon: Users,
      color: "text-blue-400",
      route: "/admin/dashboard?tab=accounts",
    },
    {
      title: "Registered Vehicles",
      value: counts?.vehicles ?? 0,
      label: "System asset specification data",
      icon: Car,
      color: "text-cyan-400",
      route: "/admin/dashboard?tab=vehicles",
    },
    {
      title: "Active Insurance Policies",
      value: counts?.activePolicies ?? 0,
      label: "Currently active coverage",
      icon: FileText,
      color: "text-green-400",
      route: "/admin/dashboard?tab=policies",
    },
    {
      title: "Total Policies",
      value: counts?.totalPolicies ?? 0,
      label: "All policy contracts",
      icon: Files,
      color: "text-indigo-400",
      route: "/admin/dashboard?tab=policies",
    },
    {
      title: "Expired Policies",
      value: counts?.expiredPolicies ?? 0,
      label: "Completed coverage contracts",
      icon: Clock3,
      color: "text-amber-400",
      route: "/admin/dashboard?tab=policies",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 select-none sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6 animate-fadeIn">
      {metrics.map((card) => {
        const Icon = card.icon;
        return (
          <button
            type="button"
            key={card.title}
            onClick={() => navigate(card.route)}
            className="bg-[#0d0f1d] border border-[#1e2238] p-4 sm:p-5 rounded-2xl flex flex-col justify-between text-left transition-all duration-300 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#644aff]/50 group min-w-0"
          >
            <div className="flex items-start justify-between w-full gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc] leading-tight">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-white/5 ${card.color} group-hover:scale-105 transition-transform shrink-0`}>
                <Icon size={16} />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="font-mono text-xl sm:text-2xl font-black tracking-tight text-white transition-colors group-hover:text-purple-100 truncate">
                {Number(card.value || 0).toLocaleString()}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#6b7280] mt-1 font-medium tracking-wide">
                {card.label}
              </p>
            </div>
            <div className={`h-[2px] w-0 group-hover:w-full transition-all duration-300 mt-4 rounded-full ${card.color.replace("text-", "bg-")}/40`} />
          </button>
        );
      })}
    </div>
  );
}
