import { useState } from "react";
import { AlertTriangle, Link2Off, Trash2, X } from "lucide-react";
import { removeVehicleForCurrentAdmin } from "../../app/api/vehicleUpdateApi";

export default function VehicleDeleteControl({
  vehicle,
  onDeleted,
  accent = "purple",
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const permission = vehicle?.permissions || {};
  const canDelete = Boolean(permission.canDelete);
  const permanent = permission.deletionMode === "permanent";
  const actionLabel = permanent ? "Delete Vehicle" : "Remove From My Vehicles";
  const disabledReason =
    permission.deleteDisabledReason || "This vehicle is not linked to your account.";
  const accentClass =
    accent === "cyan"
      ? "focus-visible:ring-[#00f0ff]"
      : "focus-visible:ring-[#644aff]";
  const ActionIcon = permanent ? Trash2 : Link2Off;

  const handleDelete = async () => {
    if (!canDelete || !vehicle?._id) return;
    setDeleting(true);
    setError("");
    try {
      const response = await removeVehicleForCurrentAdmin(vehicle._id);
      setOpen(false);
      onDeleted?.(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to remove vehicle.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-end gap-1.5">
        <button
          type="button"
          disabled={!canDelete}
          onClick={() => {
            setError("");
            setOpen(true);
          }}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 text-[10px] font-bold uppercase tracking-wider text-red-300 transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:border-[#1e2238] disabled:bg-white/[0.03] disabled:text-[#555b78] ${accentClass}`}
        >
          <ActionIcon size={14} /> {actionLabel}
        </button>
        {!canDelete && (
          <p className="max-w-sm text-right text-[10px] leading-relaxed text-[#6b7280]">
            {disabledReason}
          </p>
        )}
      </div>

      {open && canDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-vehicle-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#2a2f49] bg-[#0d0f1d] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-red-300">
                  <AlertTriangle size={18} />
                </span>
                <div>
                  <h2 id="remove-vehicle-title" className="text-base font-bold text-white">
                    {permanent ? "Delete vehicle permanently?" : "Remove this vehicle from your account?"}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#8a8fbc]">
                    {permanent
                      ? "No other admin or policy uses this manually added vehicle. This action cannot be undone."
                      : permission.retainedReason || "Only your association will be removed; the database vehicle will be retained."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                aria-label="Close confirmation"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8a8fbc] hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-[#1e2238] bg-[#060814] p-4">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                {vehicle.registration}
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                {vehicle.make} {vehicle.model}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="min-h-[44px] rounded-xl border border-[#1e2238] bg-white/5 px-5 text-xs font-bold text-[#b0b5cf] hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 px-5 text-xs font-bold text-red-200 hover:bg-red-500/25 disabled:opacity-40"
              >
                <ActionIcon size={14} />
                {deleting ? "Processing..." : permanent ? "Confirm Delete" : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
