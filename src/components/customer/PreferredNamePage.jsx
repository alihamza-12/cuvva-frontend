import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  useGetMyProfileQuery,
  useUpdatePreferredNameMutation,
} from "../../app/api/profileApi";
import {
  getPreferredName,
  savePreferredName,
} from "../../utils/profileLocalStorage";
/**
 * frontend/src/components/customer/PreferredNamePage.jsx
 *
 * "Edit preferred name" — opened from AccountDetailsPage.jsx's
 * "Preferred first name" row. Matches reference: header, title,
 * subtitle copy, single pill input pre-filled with the current
 * preferred name, sticky "Save" button.
 *
 * Persists the preferredName to the backend via
 * PATCH /api/customers/me (see customers.js) AND caches locally
 * in localStorage as a fallback/offline override. Invalidates the
 * Profile RTK cache on success so AccountDetailsPage and ProfilePage
 * show the updated name immediately without a manual refresh.
 *
 * Defaults to the server-preferredName if available, otherwise the
 * real fullName's first word (from GET /customers/me).
 */
export default function PreferredNamePage() {
  const navigate = useNavigate();
  const { data, refetch } = useGetMyProfileQuery();
  const [updatePreferredName, { isLoading: isSaving }] =
    useUpdatePreferredNameMutation();

  const serverPreferredName = data?.customer?.preferredName || "";
  const realFirstName =
    data?.customer?.fullName?.trim()?.split(/\s+/)?.[0] || "";

  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    // Priority: server preferredName > localStorage > realFirstName
    const stored = getPreferredName();
    setName(serverPreferredName || stored || realFirstName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverPreferredName, realFirstName]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    setSaved(false);
    setSaveFailed(false);

    // Cache locally regardless of what the backend does — this is
    // what makes AccountDetailsPage.jsx / ProfilePage.jsx pick up the
    // new name even if the network call below fails, since both read
    // getPreferredName() as a fallback.
    savePreferredName(trimmed);

    // Persist to backend. Previously this error was silently
    // swallowed and `setSaved(true)` ran unconditionally afterwards —
    // so the UI showed "Saved." even when the PATCH request actually
    // failed (wrong endpoint, network error, validation error, etc).
    // Now the success/failure message reflects what really happened.
    try {
      await updatePreferredName(trimmed).unwrap();
      // Force a refetch here rather than relying only on RTK Query
      // tag-invalidation being configured correctly on the mutation —
      // this guarantees `data.customer.preferredName` is fresh, which
      // is what ProfilePage.jsx/AccountDetailsPage.jsx read FIRST
      // (before falling back to localStorage).
      await refetch();
      setSaved(true);
    } catch (err) {
      console.log("Update preferred name failed:", err);
      setSaveFailed(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header — back button on the left. Previously this button had
          BOTH aria-label="Back" and aria-label="Help" on the same
          element and only rendered the HelpCircle icon (no
          ChevronLeft anywhere in the file), so the real back button
          never appeared — fixed by giving it its own single label and
          the correct ChevronLeft icon. */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
      </div>

      <div className="flex-1 px-4 pt-4 pb-32">
        <h1 className="text-[24px] font-extrabold text-white leading-tight">
          Edit preferred name
        </h1>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-2">
          Preferred name is optional. We'll refer to you by this name where
          possible, except where your legal name is required
        </p>

        <div className="mt-6">
          <input
            type="text"
            placeholder="Preferred name..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
              setSaveFailed(false);
            }}
            className="w-full px-5 py-4 rounded-full bg-[#242429] text-white placeholder:text-[#8a8a92] text-[15px] outline-none focus:ring-2 focus:ring-[#7c6bff]/50"
          />
        </div>

        {saved && (
          <p className="text-[13px] text-[#7fdba0] mt-4">
            Name Updated Successfully.
          </p>
        )}
        {saveFailed && (
          <p className="text-[13px] text-[#e05a5a] mt-4">
            Couldn't save to the server — kept on this device only. Try
            again when you're back online.
          </p>
        )}
      </div>

      {/* Sticky footer — offset above CustomerBottomNav (bottom-24)
          rather than bottom-0, since this page now renders inside
          CustomerLayout (bottom nav visible) instead of full-screen. */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)] disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
