import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { useDeleteMyAccountMutation } from "../../app/api/profileApi";
import deleteAccountIllustration from "/deleteaccountillustration.png";

/**
 * frontend/src/components/customer/DeleteAccountInfoPage.jsx
 *
 * "Delete your account" info screen — opened from
 * AccountDetailsPage.jsx's "Delete your account" row (replacing the
 * previous plain window.confirm() flow). Matches reference: header,
 * illustration, title, informational copy with a "privacy notice"
 * link, sticky "Delete account" button.
 *
 * Tapping "Delete account" makes a REAL network call to
 * DELETE /customers/me via useDeleteMyAccountMutation (already added
 * to profileApi.js) — per instruction, even though that backend route
 * does not exist yet in customers.js (you said you'll add it later).
 * Until it exists, this will fail with a 404, which is surfaced to
 * the user rather than silently ignored or faked as a success.
 *
 * deleteaccountillustration.png: AI-generated illustration matching
 * the reference screenshot (hand holding a phone showing a "GB PLATE"
 * badge + slider, on a pink-to-purple gradient circle), placed in
 * frontend/public/ per the project's image-import convention.
 */
export default function DeleteAccountInfoPage() {
  const navigate = useNavigate();
  const [deleteAccount, { isLoading: isDeleting, error: deleteError }] =
    useDeleteMyAccountMutation();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handlePrivacyNotice = () => {
    console.log("Privacy notice tapped — not wired up yet.");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      // Real network call — backend route (DELETE /customers/me) is
      // not implemented yet on the server per your note ("I will
      // implement that api later"), so this is expected to fail with
      // a 404 until that route exists. The call is real, not faked.
      await deleteAccount().unwrap();
      navigate("/login", { replace: true });
    } catch (err) {
      console.log("Delete account request failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button
          type="button"
          onClick={() => console.log("Help tapped — not wired up yet.")}
          aria-label="Help"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-8 pt-16 pb-32 text-center">
        <img
          src={deleteAccountIllustration}
          alt=""
          className="w-[210px] h-auto object-contain select-none pointer-events-none"
          draggable={false}
        />

        <h1 className="text-[24px] font-extrabold text-white mt-8">
          Delete your account
        </h1>

        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-4 max-w-[340px]">
          In some cases, we need to keep a record of your information in case
          of any future claims. So if you've ever bought insurance from
          Cuvva, we may not be able to delete your account just yet.
        </p>

        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-4">
          For more information, read our{" "}
          <button
            type="button"
            onClick={handlePrivacyNotice}
            className="underline text-[#9497a1]"
          >
            privacy notice
          </button>
          .
        </p>

        {deleteError && (
          <p className="text-[13px] text-[#e05a5a] mt-6">
            Couldn't delete your account — the delete endpoint isn't set up
            on the backend yet.
          </p>
        )}
      </div>

      {/* Sticky footer — offset above CustomerBottomNav (bottom-24)
          rather than bottom-0, since this page now renders inside
          CustomerLayout (bottom nav visible) instead of full-screen. */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="w-full py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[16px] font-bold text-white disabled:opacity-60 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          {isDeleting ? "Deleting..." : "Delete account"}
        </button>
      </div>
    </div>
  );
}
