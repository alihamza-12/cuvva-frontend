import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}) {
  return (
    <div className="cuvva-card p-6 hover:border-cuvva-purple/30 hover:shadow-glow-purple transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-cuvva-muted">{title}</span>
        {Icon && (
          <div className="p-2.5 bg-white/5 rounded-xl text-cuvva-purple group-hover:text-cuvva-cyan transition-colors duration-300">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-bold ${trend.startsWith("+") ? "text-cuvva-green" : "text-cuvva-red"}`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-cuvva-muted mt-2">{subtitle}</p>}
    </div>
  );
}
