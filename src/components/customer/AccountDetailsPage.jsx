import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, ChevronRight, Check } from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";
import { getPreferredName, getPreviousIncidents } from "../../utils/profileLocalStorage";

/**
 * frontend/src/components/customer/AccountDetailsPage.jsx
 *
 * "Account details" — opened from Profile > Account details. Matches
 * reference: header, grouped sections (Account / Personal details /
 * Incidents / Communications / Delete account), each row showing a
 * label on the left and (where relevant) a value + green verified
 * checkmark badge on the right (round green circle with a white
 * checkmark, matching the reference icon exactly).
 *
 * UPDATE: every row except "Previous incidents" (explicitly deferred
 * per instruction — "only the incidents option left we will work on
 * that later") now navigates to a real dedicated page matching its
 * own reference screenshot, instead of a shared console.log
 * placeholder:
 *   - Preferred first name -> PreferredNamePage.jsx
 *   - Email                -> EmailAddressPage.jsx
 *   - Mobile phone         -> MobileNumberPage.jsx
 *   - Connected accounts   -> ConnectedAccountsPage.jsx
 *   - My identity          -> MyIdentityPage.jsx
 *   - Residential address  -> ResidentialAddressPage.jsx
 *   - Marketing preferences-> MarketingPreferencesPage.jsx
 *   - Delete your account  -> DeleteAccountInfoPage.jsx (illustrated
 *     info screen matching its own reference screenshot; that page
 *     is what actually fires the real DELETE /customers/me call)
 *
 * REAL DATA (from GET /customers/me, same query already used on
 * ProfilePage.jsx — no second network call, RTK Query dedupes it):
 *   - "Preferred first name" -> first word of fullName.
 *   - "Email" -> customer.email, shown with a verified badge
 *     (there's no real `emailVerified` flag on User.js, so the badge
 *     is a static visual matching the reference, NOT based on real
 *     verification state — flagged, not faked).
 *   - "My identity" -> fullName (same verified-badge caveat).
 *
 * BACKEND GAP — "Mobile phone": User.js DOES have a `phone` field,
 * but the `/customers/me` route's `.select(...)` list you shared
 * (`"fullName email role status expiresAt createdBy createdAt"`)
 * does NOT include `phone`, so it's never returned in the API
 * response. Shows "Not added" instead of fabricating a number. Add
 * `phone` to that select list if you want the real value to show.
 *
 * NOT IN SCHEMA / NO ENDPOINT (each destination page flags its own
 * specifics in its own file header comment):
 *   - Connected accounts — no OAuth/social sign-in exists in auth.js.
 *   - Residential address — User.js HAS an `address` object, but no
 *     route exposes/edits it for a Customer yet; localStorage only.
 *   - Previous incidents — now navigates to PreviousIncidentsPage.jsx
 *     -> AddIncidentPage.jsx. No incidents/claims collection exists
 *     anywhere in the backend schema, so this whole feature (list,
 *     add form, count) is 100% localStorage per instruction — see
 *     profileLocalStorage.js's incidents section. The count shown
 *     here is read fresh every time this page mounts (e.g. coming
 *     back from PreviousIncidentsPage.jsx after adding one), so it
 *     stays in sync without needing a shared global state store.
 *   - Marketing preferences — no such field on User.js; localStorage
 *     only.
 */
export default function AccountDetailsPage() {
  const navigate = useNavigate();
  const { data } = useGetMyProfileQuery();
  const [incidentCount, setIncidentCount] = useState(0);

  // Re-read on every mount (including when navigating back from
  // PreviousIncidentsPage.jsx / AddIncidentPage.jsx) so the count
  // shown here is always current.
  useEffect(() => {
    setIncidentCount(getPreviousIncidents().length);
  }, []);

  const customer = data?.customer;
  const realFirstName = customer?.fullName?.trim()?.split(/\s+/)?.[0] || "—";
  // Same priority order as PreferredNamePage.jsx: server preferredName
  // (if the backend has been updated to return it) > localStorage
  // override (saved by PreferredNamePage.jsx) > real fullName's first
  // word. Previously this always showed realFirstName only, so a
  // saved preferred name never appeared here — fixed by reading it
  // the same way PreferredNamePage.jsx does.
  const preferredFirstName =
    customer?.preferredName || getPreferredName() || realFirstName;
  const email = customer?.email || "—";
  const fullName = customer?.fullName || "—";

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile", { replace: true });
  };

  const handleNotWiredUp = (label) => {
    console.log(`${label} tapped — not wired up yet.`);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-40">
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
        <InfoRow
          label="Preferred first name"
          value={preferredFirstName}
          onClick={() => navigate("/customer/profile/account/preferred-name")}
        />
        <InfoRow
          label="Email"
          value={email}
          verified
          onClick={() => navigate("/customer/profile/account/email")}
        />
        <InfoRow
          label="Mobile phone"
          value={customer?.phone || "Not added"}
          verified={!!customer?.phone}
          onClick={() => navigate("/customer/profile/account/mobile")}
        />
        <InfoRow
          label="Connected accounts"
          onClick={() => navigate("/customer/profile/account/connected")}
          isLast
        />
      </div>

      <SectionLabel>Personal details</SectionLabel>
      <div className="px-4 space-y-px">
        <InfoRow
          label="My identity"
          value={fullName}
          verified
          onClick={() => navigate("/customer/profile/account/identity")}
        />
        <InfoRow
          label="Residential address"
          onClick={() => navigate("/customer/profile/account/address")}
          isLast
        />
      </div>

      <SectionLabel>Incidents</SectionLabel>
      <div className="px-4 space-y-px">
        <InfoRow
          label="Previous incidents"
          value={String(incidentCount)}
          onClick={() => navigate("/customer/profile/account/incidents")}
          isLast
        />
      </div>

      <SectionLabel>Communications</SectionLabel>
      <div className="px-4 space-y-px">
        <InfoRow
          label="Marketing preferences"
          onClick={() => navigate("/customer/profile/account/marketing")}
          isLast
        />
      </div>

      <SectionLabel>Delete account</SectionLabel>
      <div className="px-4 space-y-px">
        <InfoRow
          label="Delete your account"
          onClick={() => navigate("/customer/profile/account/delete")}
          danger
          isLast
        />
      </div>
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
        {verified && (
          <span className="w-[18px] h-[18px] rounded-full bg-[#3ecf8e] flex items-center justify-center shrink-0">
            <Check size={12} className="text-white" strokeWidth={3.5} />
          </span>
        )}
        {value && <span className="text-[14px] text-[#c8c9d1]">{value}</span>}
        {!danger && <ChevronRight size={18} className="text-[#5c5e68]" />}
      </span>
    </button>
  );
}
