import React from "react";
import { ShieldCheck, Users, Car, FileText } from "lucide-react";

export default function OverviewGrid({ counts = {} }) {

  const metrics = [
    {
      title: "Sub-Admin Accounts",

      value: counts?.subAdmins ?? 0,
      label: "Active administrative nodes",
      icon: ShieldCheck, 
      color: "text-purple-400",
      bgLight: "bg-purple-500/5",
      borderLight: "border-purple-500/10",
    },
    {
      title: "Customer Accounts", 
      value: counts?.customers ?? 0,
      label: "Global registered client base",
      icon: Users,
      color: "text-blue-400",
      bgLight: "bg-blue-500/5",
      borderLight: "border-blue-500/10",
    },
    {
      title: "Registered Vehicles",
      value: counts?.vehicles ?? 0,
      label: "System asset specification data",
      icon: Car,
      color: "text-cyan-400",
      bgLight: "bg-cyan-500/5",
      borderLight: "border-cyan-500/10",
    },
    {
      title: "Active Insurance Policies",
      value: counts?.policies ?? 0,
      label: "Short-term coverage contracts",
      icon: FileText, 
      color: "text-green-400",
      bgLight: "bg-green-500/5",
      borderLight: "border-green-500/10",
    },
  ];

  return (

    <div className="grid grid-cols-2 gap-3 select-none sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 animate-fadeIn">
      {metrics.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-[#0d0f1d] border border-[#1e2238] p-4 sm:p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-white/10 group min-w-0`}
          >

            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8fbc] leading-tight">
                {card.title}
              </span>
              <div
                className={`p-2 rounded-xl bg-white/5 ${card.color} group-hover:scale-105 transition-transform shrink-0`}
              >
                <Icon size={16} />
              </div>
            </div>

            <div className="mt-4">
              <h2 className="font-mono text-xl sm:text-2xl font-black tracking-tight text-white transition-colors group-hover:text-purple-100 truncate">
                {card.value.toLocaleString()}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#6b7280] mt-1 font-medium tracking-wide">
                {card.label}
              </p>
            </div>

            <div
              className={`h-[2px] w-0 group-hover:w-full transition-all duration-300 mt-4 rounded-full ${card.color.replace("text-", "bg-")}/40`}
            />
          </div>
        );
      })}
    </div>
  );
}
