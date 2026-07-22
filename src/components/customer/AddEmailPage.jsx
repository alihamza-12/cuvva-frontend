import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircleQuestion } from "lucide-react";
import {
  useGetMyProfileQuery,
  useAddAdditionalEmailMutation,
} from "../../app/api/profileApi";

/**
 * frontend/src/components/customer/AddEmailPage.jsx
 *
 * "Add another email address" — opened from EmailAddressPage.jsx's
 * "Add another email address" row. Matches reference screenshot
 * exactly: header (back + help), title, subtitle ("We will send you
 * a six digit number to verify it's yours"), single pill input,
 * sticky "Next" button (disabled/dark-purple until a value is typed
 * AND it's a properly-formatted email, enabled/bright-purple once
 * both are true).
 *
 * EMAIL VALIDATION: checks for a standard, properly-formatted email
 * address (local-part@domain.tld) — NOT restricted to Gmail
 * specifically, any real provider (gmail.com, yahoo.com, outlook.com,
 * a company domain, etc.) is accepted, matching how "Main email"
 * above already works for any provider. Validation runs:
 *   - Live, as you type (once you've typed something) — shows an
 *     inline "Enter a valid email address" error and keeps the
 *     "Next" button disabled while the format is invalid.
 *   - Again on submit, as a hard guard, in case validation is ever
 *     bypassed (e.g. programmatic form submission).
 * This is pure client-side format validation (regex-based) — it does
 * NOT verify the address actually exists or can receive mail (that
 * would require a real verification-code send, which doesn't exist
 * in the backend yet, per the note below).
 *
 * REAL BACKEND CALL: useAddAdditionalEmailMutation (already added to
 * profileApi.js), hitting PATCH /customers/me/additional-email (or
 * whatever route you wired server-side) to push the new address into
 * the `additionalEmails` array on the User model. On success:
 *   - Shows a success message ("Email added successfully").
 *   - Clears the input back to empty.
 *   - Shows the just-added email in a second, DISABLED input below,
 *     confirming it's been saved (matches your requested behavior).
 * On failure, shows the real error message from the backend (or a
 * generic fallback) — never silently pretends success.
 *
 * NOTE: this page does NOT actually implement the "six digit
 * verification code" flow described in the subtitle copy (that's
 * just the reference screenshot's own static text) — there's no
 * OTP/verification-code endpoint in your backend for email addresses.
 * The email is added directly on Next. Flagged here so it's not
 * mistaken for a working verification flow; let me know if you want
 * that built out for real once a backend endpoint exists for it.
 */

// Standard, widely-used email format check: one-or-more non-space/@
// chars, an @, one-or-more non-space/@ chars containing at least one
// dot, then 2+ letters for the TLD. Deliberately NOT Gmail-specific —
// accepts any real provider/domain.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AddEmailPage() {
  const navigate = useNavigate();
  const { refetch } = useGetMyProfileQuery();
  const [addAdditionalEmail, { isLoading: isAdding }] =
    useAddAdditionalEmailMutation();

  const [emailInput, setEmailInput] = useState("");
  const [addedEmail, setAddedEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmedInput = emailInput.trim();
  const isValidFormat = EMAIL_REGEX.test(trimmedInput);
  const showFormatError = touched && trimmedInput.length > 0 && !isValidFormat;
  const canSubmit = isValidFormat && !isAdding;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account/email", { replace: true });
  };

  const handleHelp = () => {
    console.log("Help tapped — not wired up yet.");
  };

  const handleNext = async () => {
    const trimmed = emailInput.trim();
    setTouched(true);

    // Hard guard — re-validates even if this were ever triggered
    // without going through the disabled-button UI (e.g. pressing
    // Enter in the field).
    if (!EMAIL_REGEX.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Enter a valid email address, like name@example.com");
      return;
    }
    if (isAdding) return;

    setStatus(null);
    setErrorMessage("");

    try {
      await addAdditionalEmail(trimmed).unwrap();
      // Refetch so EmailAddressPage.jsx's additionalEmails list (read
      // from GET /customers/me) is fresh the moment the user goes back.
      await refetch();
      setAddedEmail(trimmed);
      setEmailInput("");
      setTouched(false);
      setStatus("success");
    } catch (error) {
      const message =
        error?.data?.message || "Failed to add email. Please try again.";
      setErrorMessage(message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
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
          onClick={handleHelp}
          aria-label="Help"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <MessageCircleQuestion size={18} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-32">
        <h1 className="text-[24px] font-extrabold text-white leading-tight">
          Add another email address
        </h1>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-2">
          We will send you a six digit number to verify it's yours
        </p>

        <div className="mt-6">
          <input
            type="email"
            placeholder="Enter your email address"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setTouched(true);
              setStatus(null);
            }}
            onBlur={() => setTouched(true)}
            aria-invalid={showFormatError}
            className={`w-full px-5 py-4 rounded-full bg-[#242429] text-white placeholder:text-[#8a8a92] text-[15px] outline-none focus:ring-2 transition-shadow ${
              showFormatError
                ? "ring-2 ring-[#e05a5a]/60 focus:ring-[#e05a5a]/80"
                : "focus:ring-[#7c6bff]/50"
            }`}
          />
        </div>

        {/* Live format-validation error — separate from the
            backend/status error below, shown as soon as the user has
            typed something that isn't a valid email shape yet. */}
        {showFormatError && (
          <p className="text-[13px] text-[#e05a5a] mt-3">
            Enter a valid email address, like name@example.com
          </p>
        )}

        {status === "success" && (
          <p className="text-[13px] text-[#7fdba0] mt-4">
            Email added successfully.
          </p>
        )}
        {status === "error" && (
          <p className="text-[13px] text-[#e05a5a] mt-4">{errorMessage}</p>
        )}

        {/* Just-added email shown here, disabled, confirming it's
            saved — appears only after a successful add. */}
        {addedEmail && (
          <div className="mt-3">
            <span className="block text-[12px] text-[#8a8a92] px-1 mb-1.5">
              Added email
            </span>
            <input
              type="email"
              value={addedEmail}
              disabled
              readOnly
              className="w-full px-5 py-4 rounded-full bg-[#1a1a1e] text-[#8a8a92] text-[15px] outline-none cursor-not-allowed"
            />
          </div>
        )}
      </div>

      {/* Sticky footer — button color reflects whether the input has
          a VALID email (not just any text): bright purple +
          interactive once it's a real-looking address, dark/muted
          purple + non-interactive while empty or malformed. */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <button
          type="button"
          onClick={handleNext}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-full text-[16px] font-bold text-white transition-all shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
            canSubmit
              ? "bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98]"
              : "bg-[#3a3567] cursor-not-allowed"
          }`}
        >
          {isAdding ? "Adding..." : "Next"}
        </button>
      </div>
    </div>
  );
}
