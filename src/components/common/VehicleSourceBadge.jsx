export default function VehicleSourceBadge({
  vehicle,
  audience = "super-admin",
}) {
  const automatic = vehicle?.sourceType === "automatic";
  const label = automatic
    ? "Automatically verified"
    : vehicle?.isCreator
      ? "Added by you"
      : audience === "sub-admin"
        ? "Associated vehicle"
        : "Manually added";

  const className = automatic
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
    : audience === "sub-admin"
      ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-200"
      : "border-purple-500/25 bg-purple-500/10 text-purple-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${className}`}
    >
      {label}
    </span>
  );
}
