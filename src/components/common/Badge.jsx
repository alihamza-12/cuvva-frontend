import React from "react";

export default function Badge({ status }) {
  const config = {
    Active: "bg-cuvva-green/10 text-cuvva-green border-cuvva-green/20",
    Upcoming: "bg-cuvva-cyan/10 text-cuvva-cyan border-cuvva-cyan/20",
    Expired: "bg-white/5 text-cuvva-muted border-cuvva-border",
    Cancelled: "bg-cuvva-red/10 text-cuvva-red border-cuvva-red/20",
    Suspended: "bg-cuvva-amber/10 text-cuvva-amber border-cuvva-amber/20",
  };

  const style = config[status] || "bg-white/5 text-white border-cuvva-border";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${style}`}
    >
      {status}
    </span>
  );
}
