import { AlertTriangle, RefreshCw, X } from "lucide-react";

/*
 * Confirmation dialog shown before anything is permanently deleted.
 *
 * Nothing is removed until the user presses "Confirm Delete" — the caller only
 * fires its request from onConfirm. Styling follows the existing edit modal in
 * AccountManagement.jsx (same overlay, sheet-on-mobile, #0d0f1d panel) so it
 * looks native to the dashboard.
 */
export default function ConfirmDeleteModal({
  open,
  title = "Delete record",
  message = "This action cannot be undone.",
  itemLabel = "",
  details = [],
  confirmLabel = "Confirm Delete",
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center md:p-4"
      onClick={loading ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#0d0f1d] border-t border-[#1e2238] shadow-2xl rounded-t-3xl pb-[env(safe-area-inset-bottom)] md:rounded-2xl md:border"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-[#1e2238]">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <AlertTriangle size={16} className="text-red-500" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="mt-1 text-xs text-[#6b7280]">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-[#6b7280] hover:text-white disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {itemLabel && (
            <div className="mb-4 rounded-xl border border-[#1e2238] bg-[#060814] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                Record
              </div>
              <div className="mt-1 break-all text-xs font-semibold text-white">
                {itemLabel}
              </div>
              {details.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {details.map((detail) => (
                    <li key={detail} className="text-[11px] text-[#8a8fbc]">
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
            <p className="text-[11px] leading-relaxed text-red-300">
              This will permanently remove the record from the database. This
              action cannot be undone.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[11px] text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="min-h-[44px] rounded-lg border border-[#1e2238] bg-[#060814] px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-[#8a8fbc] transition-all hover:bg-[#1a1d33] hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-600 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition-all hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Deleting…
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
