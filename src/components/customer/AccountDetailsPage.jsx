import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";
import { useDeleteMyAccountMutation } from "../../app/api/profileApi";

/**
 * frontend/src/components/customer/AccountDetailsPage.jsx
 *
 * "Account details" — opened from Profile > Account details. Matches
 * reference: header, grouped sections (Account / Personal details /
 * Incidents / Communications / Delete account), each row showing a
 * label on the left and (where relevant) a value + green verified
 * checkmark on the right.
 *
 * REAL DATA (from GET /customers/me, same query already used on
 * ProfilePage.jsx — no second network call, RTK Query dedupes it):
 *   - "Preferred first name" -> first word of fullName.
 *   - "Email" -> customer.email, shown with a verified checkmark
 *     (there's no real `emailVerified` flag on User.js, so the
 *     checkmark is a static visual matching the reference, NOT based
 *     on real verification state — flagged, not faked).
 *   - "My identity" -> fullName (same verified-checkmark caveat).
 *
 * BACKEND GAP — "Mobile phone": User.js DOES have a `phone` field,
 * but the `/customers/me` route's `.select(...)` list you shared
 * (`"fullName email role status expiresAt createdBy createdAt"`)
 * does NOT include `phone`, so it's never returned in the API
 * response. Shows "Not added" instead of fabricating a number. Add
 * `phone` to that select list if you want the real value to show.
 *
 * NOT IN SCHEMA / NO ENDPOINT — rendered as tappable rows wired to
 * console.log placeholders:
 *   - Connected accounts, Residential address (User.js HAS an
 *     `address` object, but there's no route exposing/editing it for
 *     a Customer yet), Previous incidents (hardcoded "0" — no
 *     incidents/claims collection exists anywhere in the schema),
 *     Marketing preferences (no such field on User.js).
 *
 * "Delete your account" — per instruction, this makes a REAL network
 * call to the backend (DELETE /customers/me) even though that route
 * does not exist yet in customers.js — you said you'll add the
 * backend endpoint later. Uses RTK Query's useDeleteMyAccountMutation
 * (added to profileApi.js) so the request actually fires; until the
 * route exists it will fail with a 404, which is surfaced to the user
 * rather than silently ignored.
 */
export default function AccountDetailsPage() {
  const navigate = useNavigate();
  const { data } = useGetMyProfileQuery();
  const [deleteAccount, { isLoading: isDeleting, error: deleteError }] =
    useDeleteMyAccountMutation();

  const customer = data?.customer;
  const preferredFirstName = customer?.fullName?.trim()?.split(/\s+/)?.[0] || "—";
  const email = customer?.email || "—";
  const fullName = customer?.fullName || "—";

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile", { replace: true });
  };

  const handleNotWiredUp = (label) => {
    console.log(`${label} tapped — not wired up yet.`);
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
    <div className="min-h-screen bg-black text-white pb-10">
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
        <h1 className="text-[16px] font-bold text-white">Account details</h1>
        <button
          type="button"
          onClick={() => handleNotWiredUp("Help")}
          aria-label="Help"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <SectionLabel>Account</SectionLabel>
      <div className="px-4 space-y-px">
        <InfoRow label="Preferred first name" value={preferredFirstName} onClick={() => handleNotWiredUp("Edit preferred first name")} />
        <InfoRow label="Email" value={email} verified onClick={() => handleNotWiredUp("Edit email")} />
        <InfoRow label="Mobile phone" value={customer?.phone || "Not added"} verified={!!customer?.phone} onClick={() => handleNotWiredUp("Edit mobile phone")} />
        <InfoRow label="Connected accounts" onClick={() => handleNotWiredUp("Connected accounts")} isLast />
      </div>

      <SectionLabel>Personal details</SectionLabel>
      <div className="px-4 space-y-px">
        <InfoRow label="My identity" value={fullName} verified onClick={() => handleNotWiredUp("My identity")} />
        <InfoRow label="Residential address" onClick={() => handleNotWiredUp("Residential address")} isLast />
      </div>

      <SectionLabel>Incidents</SectionLabel>
      <div className="px-4 space-y-px">
        <InfoRow label="Previous incidents" value="0" onClick={() => handleNotWiredUp("Previous incidents")} isLast />
      </div>

      <SectionLabel>Communications</SectionLabel>
      <div className="px-4 space-y-px">
        <InfoRow label="Marketing preferences" onClick={() => handleNotWiredUp("Marketing preferences")} isLast />
      </div>

      <SectionLabel>Delete account</SectionLabel>
      <div className="px-4 space-y-px">
        <InfoRow
          label={isDeleting ? "Deleting..." : "Delete your account"}
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          danger
          isLast
        />
      </div>

      {deleteError && (
        <p className="text-[13px] text-[#e05a5a] px-4 mt-4">
          Couldn't delete your account — the delete endpoint isn't set up on
          the backend yet.
        </p>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[13px] font-bold text-[#9497a1] px-4 mt-6 mb-1">
      {children}
    </p>
  );
}

function InfoRow({ label, value, verified, onClick, isLast, disabled, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between gap-3 py-4 hover:bg-white/[0.03] transition-colors disabled:opacity-60 ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      <span className={`text-[15px] text-left ${danger ? "text-[#e05a5a]" : "text-white"}`}>
        {label}
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {verified && <CheckCircle2 size={16} className="text-[#3ecf8e]" fill="#3ecf8e" />}
        {value && <span className="text-[14px] text-[#c8c9d1]">{value}</span>}
        {!danger && <ChevronRight size={18} className="text-[#5c5e68]" />}
      </span>
    </button>
  );
}
