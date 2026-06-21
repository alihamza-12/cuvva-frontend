import React from "react";
import { ShieldCheck, Users, Car, FileText } from "lucide-react";

export default function OverviewGrid({ counts = {} }) {
  // Normalized configuration matrix supporting the full 4-tier telemetry profile
  const metrics = [
    {
      title: "Sub-Admin Accounts",
      // Safe fallback pattern handles asynchronous rendering delays cleanly
      value: counts?.subAdmins ?? 0,
      label: "Active administrative nodes",
      icon: ShieldCheck, // Upgraded to distinguish admin nodes from user profiles
      color: "text-purple-400",
      bgLight: "bg-purple-500/5",
      borderLight: "border-purple-500/10",
    },
    {
      title: "Customer Accounts", // Resolved Omission Bug: Integrated into layout dashboard
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
      icon: FileText, // Corrected semantic theme representation
      color: "text-green-400",
      bgLight: "bg-green-500/5",
      borderLight: "border-green-500/10",
    },
  ];

  return (
    /* Layout Structural Correction:
      Transitions cleanly from 1 to 2, and then 4 balanced columns across viewport boundaries.
    */
    <div className="grid grid-cols-1 gap-5 select-none sm:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
      {metrics.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-[#0d0f1d] border border-[#1e2238] p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:border-white/10 group`}
          >
            {/* CARD TITLE & GLYPH LAYERS */}
            <div className="flex items-start justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a8fbc]">
                {card.title}
              </span>
              <div
                className={`p-2 rounded-xl bg-white/5 ${card.color} group-hover:scale-105 transition-transform shrink-0`}
              >
                <Icon size={16} />
              </div>
            </div>

            {/* NUMERICAL DATA METRIC SHELF */}
            <div className="mt-5">
              <h2 className="font-mono text-2xl font-black tracking-tight text-white transition-colors group-hover:text-purple-100">
                {card.value.toLocaleString()}
              </h2>
              <p className="text-[11px] text-[#6b7280] mt-1 font-medium tracking-wide">
                {card.label}
              </p>
            </div>

            {/* SUBTLE CARD FOCUS ACCENT FOOTER BAR */}
            <div
              className={`h-[2px] w-0 group-hover:w-full transition-all duration-300 mt-4 rounded-full ${card.color.replace("text-", "bg-")}/40`}
            />
          </div>
        );
      })}
    </div>
  );
}
