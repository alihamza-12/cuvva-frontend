import { useMemo, useState } from "react";
import {
  MessageCircleQuestion,
  Camera,
  ChevronRight,
} from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";
import { useLogoutUserMutation } from "../../app/api/authApi";
import { useDispatch } from "react-redux";
import { logOut } from "../../features/authSlice";
import { useNavigate } from "react-router-dom";
import referFriendImg from "/referfriendillustration.png";
import PaymentMethodsSheet from "./PaymentMethodsSheet";
import RateAppModal from "./RateAppModal";
import { getPaymentMethod, getPreferredName } from "../../utils/profileLocalStorage";

/**
 * frontend/src/components/customer/ProfilePage.jsx
 *
 * Customer tab: Profile — full rebuild matching the 3-screenshot
 * reference (top -> mid-scroll -> bottom-scroll): avatar/name header,
 * Account card, "Refer a friend" promo card, Car sharing card,
 * Support card, Feedback card, About card, Settings cards, version
 * string, then CustomerBottomNav (rendered by CustomerLayout, not
 * here).
 *
 * UPDATE: header name now shows the saved PREFERRED name instead of
 * always showing the real fullName — same priority order used by
 * AccountDetailsPage.jsx / PreferredNamePage.jsx: server
 * customer.preferredName (once the backend returns it) > localStorage
 * override (saved by PreferredNamePage.jsx) > real fullName. Without
 * this, editing your preferred name on PreferredNamePage.jsx updated
 * AccountDetailsPage.jsx but NOT this header, since this component
 * never read preferredName/localStorage at all before.
 *
 * UPDATE: Account/Payment/Discount/Refer/Bank rows now navigate to
 * real pages/sheets (see below) instead of a shared console.log
 * placeholder. Only Help centre, Chat to customer support, Previous
 * chats, Blog, Careers at Cuvva, Legal, Change icon remain
 * placeholders — explicitly deferred per instruction ("this will the
 * implement later").
 *
 *   - Account details      -> /customer/profile/account (real API data)
 *   - Payment methods      -> PaymentMethodsSheet (localStorage only)
 *   - Apply discount code  -> /customer/profile/discount-code (localStorage only)
 *   - Refer a friend       -> /customer/profile/refer (no backend, static referral link)
 *   - Your discounts       -> /customer/profile/discounts (localStorage only)
 *   - Bank details         -> /customer/profile/bank-details (localStorage only)
 *   - Rate the app         -> RateAppModal (localStorage only)
 *   - Delete account       -> now inside AccountDetailsPage.jsx (real
 *     network call to a not-yet-built DELETE /customers/me route)
 *
 * BACKEND GAP FOUND — flagging clearly, not silently working around it:
 * `profileApi.js` calls `GET /customers/me`. Confirmed working via a
 * real API response you shared: { fullName, email, role, status,
 * expiresAt, createdBy } — note `createdAt` was MISSING from that
 * response even though User.js has `{ timestamps: true }`, because
 * the route's `.select(...)` list didn't include it. Fix: add
 * `createdAt` to that select list on the backend so "Member since"
 * below shows a real date instead of the "—" fallback.
 *
 * "Refer a friend" illustration on THIS page (small promo card):
 * referfriendillustration.png, a hand-drawn-style confetti/party-horn
 * graphic recreated to match your reference screenshot. The dedicated
 * ReferFriendPage.jsx uses a separate illustration
 * (referillustration.png) matching ITS OWN reference screenshot
 * (hand+phone+friends) — these are two different images for two
 * different screens, not a mix-up.
 */
export default function ProfilePage() {
  const { data, isLoading, error } = useGetMyProfileQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();

  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  const customer = data?.customer;

  // Header name: prefer the saved preferred name (server value first,
  // then the localStorage fallback saved by PreferredNamePage.jsx),
  // falling back to the real fullName, then a generic placeholder.
  // Only replaces the FIRST word of fullName with the preferred name
  // (matching how "Preferred first name" is scoped everywhere else in
  // this app) rather than replacing the whole name.
  const name = useMemo(() => {
    const fullName = customer?.fullName;
    if (!fullName) return "Your account";

    const preferred = customer?.preferredName || getPreferredName();
    if (!preferred) return fullName;

    const parts = fullName.trim().split(/\s+/);
    const rest = parts.slice(1).join(" ");
    return rest ? `${preferred} ${rest}` : preferred;
  }, [customer?.fullName, customer?.preferredName]);

  const memberSinceLabel = useMemo(() => {
    if (!customer?.createdAt) return "Member since —";
    const d = new Date(customer.createdAt);
    if (Number.isNaN(d.getTime())) return "Member since —";
    return `Member since ${d.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;
  }, [customer?.createdAt]);

  const paymentMethodLabel = useMemo(() => {
    const method = getPaymentMethod();
    return method === "apple-pay" ? "Apple Pay" : null;
  }, [showPaymentSheet]);

  const handleNotWiredUp = (label) => {
    // Placeholder — explicitly deferred, no destination page yet.
    console.log(`${label} tapped — not wired up yet.`);
  };

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logOut());
      navigate("/login", { replace: true });
    } catch {
      // Even if the API fails, clear local auth state to avoid being stuck.
      dispatch(logOut());
      navigate("/login", { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-32 text-white bg-black">
        <p className="text-white/80">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="w-9 h-9" />
        <h1 className="text-[18px] font-extrabold">Profile</h1>
        <button
          type="button"
          onClick={() => handleNotWiredUp("Help")}
          aria-label="Help"
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <MessageCircleQuestion size={17} className="text-white" />
        </button>
      </div>

      {/* Avatar / name / member since */}
      <div className="flex flex-col items-center pt-4 pb-2">
        <button
          type="button"
          onClick={() => handleNotWiredUp("Change profile photo")}
          aria-label="Change profile photo"
          className="w-[72px] h-[72px] rounded-full bg-[#7c6bff]/20 flex items-center justify-center"
        >
          <Camera size={26} className="text-[#7c6bff]" />
        </button>
        <p className="text-[18px] font-extrabold text-white mt-3">{name}</p>
        {error ? (
          <p className="text-[13px] text-[#9497a1] mt-1">
            Member since — (couldn't load profile)
          </p>
        ) : (
          <p className="text-[13px] text-[#9497a1] mt-1">{memberSinceLabel}</p>
        )}
      </div>

      {/* Account */}
      <SectionLabel>Account</SectionLabel>
      <Card>
        <Row
          label="Account details"
          onClick={() => navigate("/customer/profile/account")}
        />
        <Row
          label="Payment methods"
          onClick={() => setShowPaymentSheet(true)}
          right={paymentMethodLabel && <ApplePayBadge />}
        />
        <Row
          label="Apply discount code"
          onClick={() => navigate("/customer/profile/discount-code")}
        />
        <Row
          label="Refer a friend"
          onClick={() => navigate("/customer/profile/refer")}
        />
        <Row
          label="Your discounts"
          onClick={() => navigate("/customer/profile/discounts")}
          isLast
        />
      </Card>

      {/* Refer a friend promo card */}
      <div className="mx-4 mt-3 rounded-2xl bg-[#17181c] border border-white/5 p-4 relative overflow-hidden">
        <div className="max-w-[62%]">
          <p className="text-[16px] font-extrabold text-white leading-snug">
            Refer a friend and both get £10 off
          </p>
          <button
            type="button"
            onClick={() => navigate("/customer/profile/refer")}
            className="mt-3 px-5 py-2.5 bg-[#7c6bff] hover:bg-[#6c5ae8] active:scale-[0.98] transition-all rounded-full text-[14px] font-bold text-white"
          >
            Invite friends
          </button>
        </div>
        <img
          src={referFriendImg}
          alt=""
          className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-[46%] object-contain select-none pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Car sharing */}
      <SectionLabel>Car sharing</SectionLabel>
      <Card>
        <Row
          label="Bank details"
          onClick={() => navigate("/customer/profile/bank-details")}
          isLast
        />
      </Card>

      {/* Support */}
      <SectionLabel>Support</SectionLabel>
      <Card>
        <Row label="Help centre" onClick={() => handleNotWiredUp("Help centre")} />
        <Row label="Chat to customer support" onClick={() => handleNotWiredUp("Chat to customer support")} />
        <Row label="Previous chats" onClick={() => handleNotWiredUp("Previous chats")} isLast />
      </Card>

      {/* Feedback */}
      <SectionLabel>Feedback</SectionLabel>
      <Card>
        <Row label="Rate the app" onClick={() => setShowRateModal(true)} isLast />
      </Card>

      {/* About */}
      <SectionLabel>About</SectionLabel>
      <Card>
        <Row label="Blog" onClick={() => handleNotWiredUp("Blog")} />
        <Row label="Careers at Cuvva" onClick={() => handleNotWiredUp("Careers at Cuvva")} />
        <Row label="Legal" onClick={() => handleNotWiredUp("Legal")} isLast />
      </Card>

      {/* Settings */}
      <SectionLabel>Settings</SectionLabel>
      <Card>
        <Row label="Change icon" onClick={() => handleNotWiredUp("Change icon")} isLast />
      </Card>

      <Card className="mt-3">
        <Row
          label={isLoggingOut ? "Logging out..." : "Logout"}
          onClick={handleLogout}
          disabled={isLoggingOut}
          isLast
        />
      </Card>

      {/* Version */}
      <p className="text-center text-[12px] text-[#5c5e68] mt-6">
        v6.26.1 (28650)
      </p>

      {showPaymentSheet && (
        <PaymentMethodsSheet onClose={() => setShowPaymentSheet(false)} />
      )}
      {showRateModal && (
        <RateAppModal onClose={() => setShowRateModal(false)} />
      )}
    </div>
  );
}

/** Grey uppercase-ish section label, matches "Account" / "Support" / etc. */
function SectionLabel({ children }) {
  return (
    <p className="text-[13px] font-bold text-[#9497a1] px-4 mt-6 mb-2">
      {children}
    </p>
  );
}

/** Rounded card wrapper grouping a set of Rows. */
function Card({ children, className = "" }) {
  return (
    <div
      className={`mx-4 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

/** Single tappable row: label left, optional right-side content, chevron. */
function Row({ label, onClick, right, isLast, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={disabled}
      className={`w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-white/[0.03] transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      <span className="text-[15px] text-white text-left">{label}</span>
      <span className="flex items-center gap-2 shrink-0">
        {right}
        <ChevronRight size={18} className="text-[#5c5e68]" />
      </span>
    </button>
  );
}

/**
 * Generic payment-method badge shown once a method has been chosen in
 * PaymentMethodsSheet.jsx (persisted to localStorage). NOT real Apple
 * Pay branding/logo — just a small pill mimicking the reference
 * screenshot's layout.
 */
function ApplePayBadge() {
  return (
    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white text-black">
      <span className="text-[12px] font-bold leading-none">Apple Pay</span>
    </span>
  );
}
