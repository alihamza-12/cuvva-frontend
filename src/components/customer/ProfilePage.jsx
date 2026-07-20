import { useMemo } from "react";
import {
  MessageCircleQuestion,
  Camera,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";
import { useLogoutUserMutation } from "../../app/api/authApi";
import { useDispatch } from "react-redux";
import { logOut } from "../../features/authSlice";
import { useNavigate } from "react-router-dom";
import referFriendImg from "/referfriendillustration.png";

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
 * BACKEND GAP FOUND — flagging clearly, not silently working around it:
 * `profileApi.js` calls `GET /customers/me`, but the `customers.js`
 * routes file only defines `GET /`, `GET /:id`, and `PATCH /:id` — no
 * dedicated `/me` handler. As written, Express will match `/me` against
 * the `/:id` route with `id === "me"`, which is not a valid Mongo
 * ObjectId and will likely throw a cast error / return a failure
 * response rather than the signed-in user's own record. If this is
 * already working for you, there must be a `/me`-handling route
 * elsewhere I haven't seen — otherwise this needs a real backend route
 * added (e.g. `GET /customers/me` reading `req.user` from verifyJWT,
 * before the `/:id` route so it isn't shadowed). This page is built to
 * degrade gracefully (shows a fallback) if that call fails, so it we
 * can still ship the case UI now.
 *
 * REAL DATA (from GET /customers/me via useGetMyProfileQuery):
 *   - fullName -> header name.
 *   - createdAt (User schema has `{ timestamps: true }`, so this
 *     exists on the model IF the route selects/returns it) -> "Member
 *     since <Month Year>". If it's missing from the response, falls
 *     back to a generic "Member since —" rather than fabricating a date.
 *
 * NOT IN YOUR SCHEMA / NO BACKEND ENDPOINT — all rendered as real,
 * tappable rows (per your instruction to "implement everything now,
 * wire later") but wired to a shared `handleNotWiredUp` placeholder
 * that just logs to console until real endpoints exist:
 *   - Profile photo upload (no photo/avatar field on User.js).
 *   - Payment methods / Apple Pay (no payment fields on User.js; the
 *     "Apple Pay" pill is a generic placeholder badge, not real Apple
 *     Pay branding/integration).
 *   - Apply discount code, Refer a friend, Your discounts, Invite
 *     friends (no discount/referral fields or endpoints anywhere).
 *   - Bank details (no bank/payout fields — this is Cuvva's car-SHARING
 *     host payout feature, unrelated to insurance policies).
 *   - Help centre, Chat to customer support, Previous chats, Rate the
 *     app, Blog, Careers at Cuvva, Legal, Change icon — all static
 *     informational links with no corresponding routes/pages built yet.
 *   - Delete account — no DELETE endpoint exists in customers.js for a
 *     customer to remove their own account. Flagged, not wired.
 *
 * REAL AND WORKING (untouched from your existing code):
 *   - Logout -> useLogoutUserMutation, dispatch(logOut()), navigate to
 *     /login. Copied over exactly as you had it.
 *
 * "Refer a friend" illustration: referfriendillustration.png, a
 * hand-drawn-style confetti/party-horn graphic recreated to match your
 * reference screenshot (traced curl geometry + colour-matched), saved
 * as a transparent PNG per your image-import convention
 * (`import x from "/filename.png"`).
 *
 * Version string ("v6.26.1 (28650)") is static placeholder text
 * matching the reference — not wired to any real build/version system.
 */
export default function ProfilePage() {
  const { data, isLoading, error } = useGetMyProfileQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();

  const customer = data?.customer;
  const name = customer?.fullName || "Your account";

  const memberSinceLabel = useMemo(() => {
    if (!customer?.createdAt) return "Member since —";
    const d = new Date(customer.createdAt);
    if (Number.isNaN(d.getTime())) return "Member since —";
    return `Member since ${d.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`;
  }, [customer?.createdAt]);

  const handleNotWiredUp = (label) => {
    // Placeholder — no backend endpoint / destination page exists yet
    // for this action.
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
          onClick={() => handleNotWiredUp("Account details")}
        />
        <Row
          label="Payment methods"
          onClick={() => handleNotWiredUp("Payment methods")}
          right={<ApplePayBadge />}
        />
        <Row
          label="Apply discount code"
          onClick={() => handleNotWiredUp("Apply discount code")}
        />
        <Row
          label="Refer a friend"
          onClick={() => handleNotWiredUp("Refer a friend")}
        />
        <Row
          label="Your discounts"
          onClick={() => handleNotWiredUp("Your discounts")}
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
            onClick={() => handleNotWiredUp("Invite friends")}
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
          onClick={() => handleNotWiredUp("Bank details")}
          isLast
        />
      </Card>

      {/* Support */}
      <SectionLabel>Support</SectionLabel>
      <Card>
        <Row
          label="Help centre"
          onClick={() => handleNotWiredUp("Help centre")}
        />
        <Row
          label="Chat to customer support"
          onClick={() => handleNotWiredUp("Chat to customer support")}
        />
        <Row
          label="Previous chats"
          onClick={() => handleNotWiredUp("Previous chats")}
          isLast
        />
      </Card>

      {/* Feedback */}
      <SectionLabel>Feedback</SectionLabel>
      <Card>
        <Row
          label="Rate the app"
          onClick={() => handleNotWiredUp("Rate the app")}
          isLast
        />
      </Card>

      {/* About */}
      <SectionLabel>About</SectionLabel>
      <Card>
        <Row label="Blog" onClick={() => handleNotWiredUp("Blog")} />
        <Row
          label="Careers at Cuvva"
          onClick={() => handleNotWiredUp("Careers at Cuvva")}
        />
        <Row label="Legal" onClick={() => handleNotWiredUp("Legal")} isLast />
      </Card>

      {/* Settings */}
      <SectionLabel>Settings</SectionLabel>
      <Card>
        <Row
          label="Change icon"
          onClick={() => handleNotWiredUp("Change icon")}
          isLast
        />
      </Card>

      <Card className="mt-3">
        <Row
          label={isLoggingOut ? "Logging out..." : "Logout"}
          onClick={handleLogout}
          disabled={isLoggingOut}
        />
        <Row
          label="Delete account"
          onClick={() => handleNotWiredUp("Delete account")}
          isLast
        />
      </Card>

      {/* Version */}
      <p className="text-center text-[12px] text-[#5c5e68] mt-6">
        v6.26.1 (28650)
      </p>
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
 * Generic payment-method badge. NOT real Apple Pay branding/logo (that's
 * a trademarked asset and there's no real Apple Pay integration behind
 * it anyway) — just a small pill mimicking the reference screenshot's
 * layout so the row isn't empty. Swap for a real payment provider once
 * one exists.
 */
function ApplePayBadge() {
  return (
    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white text-black">
      <span className="text-[11px] font-extrabold leading-none"></span>
      <span className="text-[12px] font-bold leading-none">Apple Pay</span>
    </span>
  );
}
