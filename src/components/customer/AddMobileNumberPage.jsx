import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircleQuestion } from "lucide-react";
import {
  useGetMyProfileQuery,
  useUpdatePhoneNumberMutation,
} from "../../app/api/profileApi";

/**
 * frontend/src/components/customer/AddMobileNumberPage.jsx
 *
 * "Add another mobile number" — opened from MobileNumberPage.jsx's
 * "Add another mobile number" row. Follows the same pattern as
 * AddEmailPage.jsx: header (back + help), title, subtitle, single
 * pill input, sticky "Next" button (disabled until the number is a
 * VALID UK mobile format, enabled once it is).
 *
 * PHONE VALIDATION: matches standard UK mobile number formats —
 *   07XXX XXXXXX / 07XXXXXXXXX
 *   +44 7XXX XXXXXX / +447XXXXXXXXX
 *   0044 7XXX XXXXXX / 00447XXXXXXXXX
 * Spaces and hyphens inside the number are allowed/ignored for
 * validation purposes (e.g. "07588 566474" and "07588566474" are both
 * accepted). This is a UK-specific format per your reference
 * screenshot showing a +44 number — deliberately NOT a generic
 * international phone validator. Runs live as you type (once you've
 * typed something) and again as a hard guard on submit.
 *
 * Calls PATCH /api/customers/me with { phone } to set/update the
 * phone field on the User model. On success:
 *   - Shows a success message ("Mobile number added successfully").
 *   - Clears the input back to empty.
 *   - Shows the just-added number in a second, DISABLED input below,
 *     confirming it's been saved.
 * On failure, shows the real error message from the backend.
 *
 * NOTE: The User model has a single `phone` field (not an array),
 * so adding a number here overwrites any previously saved number.
 */

// UK mobile format: 07xxx xxxxxx, +447xxx xxxxxx, or 00447xxx xxxxxx —
// spaces/hyphens between digit groups are tolerated.
const UK_MOBILE_REGEX = /^(?:\+44\s?7|0044\s?7|07)\d{3}[\s-]?\d{6}$/;

export default function AddMobileNumberPage() {
  const navigate = useNavigate();
  const { refetch } = useGetMyProfileQuery();
  const [updatePhoneNumber, { isLoading: isSaving }] =
    useUpdatePhoneNumberMutation();

  const [phoneInput, setPhoneInput] = useState("");
  const [addedPhone, setAddedPhone] = useState("");
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmedInput = phoneInput.trim();
  const isValidFormat = UK_MOBILE_REGEX.test(trimmedInput);
  const showFormatError = touched && trimmedInput.length > 0 && !isValidFormat;
  const canSubmit = isValidFormat && !isSaving;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account/mobile", { replace: true });
  };

  const handleHelp = () => {
    console.log("Help tapped — not wired up yet.");
  };

  const handleNext = async () => {
    const trimmed = phoneInput.trim();
    setTouched(true);

    // Hard guard — re-validates even if this were somehow triggered
    // without going through the disabled-button UI.
    if (!UK_MOBILE_REGEX.test(trimmed)) {
      setStatus("error");
      setErrorMessage("Enter a valid mobile number, like 07588 566474");
      return;
    }
    if (isSaving) return;

    setStatus(null);
    setErrorMessage("");

    try {
      await updatePhoneNumber(trimmed).unwrap();
      // Refetch so MobileNumberPage.jsx and AccountDetailsPage.jsx
      // show the updated phone immediately when the user goes back.
      await refetch();
      setAddedPhone(trimmed);
      setPhoneInput("");
      setTouched(false);
      setStatus("success");
    } catch (error) {
      const message =
        error?.data?.message ||
        "Failed to add mobile number. Please try again.";
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
          Add another mobile number
        </h1>
        <p className="text-[15px] text-[#9497a1] leading-relaxed mt-2">
          We'll use this number in an emergency, or if we need to contact you
          for some other reason.
        </p>

        <div className="mt-6">
          <input
            type="tel"
            placeholder="e.g. 07588 566474"
            value={phoneInput}
            onChange={(e) => {
              // Was mangled to `setPhoneInput([e.target](http://e.target).value)`
              // in a previous paste (markdown-link corruption) — fixed
              // to the plain e.target.value, which would otherwise
              // throw on every keystroke.
              setPhoneInput(e.target.value);
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

        {/* Persistent format hint, shown whenever there's no error to
            display instead — so the expected format is visible even
            before the user starts typing, not just after a mistake. */}
        {!showFormatError && (
          <p className="text-[13px] text-[#8a8a92] mt-3">
            Mobile numbers only, e.g. 07588 566474 or +44 7588 566474
          </p>
        )}

        {/* Live format-validation error — separate from the
            backend/status error below. */}
        {showFormatError && (
          <p className="text-[13px] text-[#e05a5a] mt-3">
            Enter a valid UK mobile number, like 07588 566474
          </p>
        )}

        {status === "success" && (
          <p className="text-[13px] text-[#7fdba0] mt-4">
            Mobile number added successfully.
          </p>
        )}
        {status === "error" && (
          <p className="text-[13px] text-[#e05a5a] mt-4">{errorMessage}</p>
        )}

        {/* Just-added number shown here, disabled, confirming it's
            saved — appears only after a successful add. */}
        {addedPhone && (
          <div className="mt-3">
            <span className="block text-[12px] text-[#8a8a92] px-1 mb-1.5">
              Added mobile number
            </span>
            <input
              type="tel"
              value={addedPhone}
              disabled
              readOnly
              className="w-full px-5 py-4 rounded-full bg-[#1a1a1e] text-[#8a8a92] text-[15px] outline-none cursor-not-allowed"
            />
          </div>
        )}
      </div>

      {/* Sticky footer — button color reflects whether the input has
          a VALID UK mobile number, not just any text. */}
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
          {isSaving ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
}
