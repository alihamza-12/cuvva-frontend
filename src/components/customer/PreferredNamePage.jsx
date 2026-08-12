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

    savePreferredName(trimmed);

    try {
      await updatePreferredName(trimmed).unwrap();

      await refetch();
      setSaved(true);
    } catch (err) {
      console.log("Update preferred name failed:", err);
      setSaveFailed(true);
    }
  };

  return (
    <div className="text-white flex flex-col">

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
