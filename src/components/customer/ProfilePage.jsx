import { useMemo, useRef, useState } from "react";
import {
  MessageCircleQuestion,
  Camera,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useGetMyProfileQuery, useUpdateProfilePhotoMutation } from "../../app/api/profileApi";
import { useLogoutUserMutation } from "../../app/api/authApi";
import { useDispatch } from "react-redux";
import { logOut } from "../../features/authSlice";
import { useNavigate } from "react-router-dom";
import referFriendImg from "/referfriendillustration.png";
import PaymentMethodsSheet from "./PaymentMethodsSheet";
import RateAppModal from "./RateAppModal";
import { getPaymentMethod, getPreferredName } from "../../utils/profileLocalStorage";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

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
 * FIXED (this pass): two syntax bugs from a recurring copy-paste
 * corruption pattern:
 *   1. `console.log\`...\`)` was missing its opening `(` — restored to
 *      `console.log(\`...\`)`.
 *   2. `Card`'s `className=\`...\`}` was missing its opening `{` —
 *      restored to `className={\`...\`}`.
 *
 * NEW FEATURE (this pass): real profile photo upload. Tapping the
 * avatar circle opens the device's native file picker
 * (`<input type="file" accept="image/*">` — no custom picker UI).
 * On file select: an instant local preview shows via
 * `URL.createObjectURL`, the file uploads DIRECTLY from the browser to
 * Cloudinary using an unsigned upload preset (utils/uploadToCloudinary.js
 * — our backend never touches the image bytes), then the resulting
 * secure_url is saved via PATCH /customers/me (api/profileApi.js's
 * updateProfilePhoto mutation). On success the Profile cache is
 * invalidated so the avatar updates everywhere. On any failure the
 * local preview is discarded and an honest error message shows.
 *
 * UPDATE: header name now shows the saved PREFERRED name instead of
 * always showing the real fullName — same priority order used by
 * AccountDetailsPage.jsx / PreferredNamePage.jsx: server
 * customer.preferredName (once the backend returns it) > localStorage
 * override (saved by PreferredNamePage.jsx) > real fullName.
 *
 * UPDATE: Account/Payment/Discount/Refer/Bank rows now navigate to
 * real pages/sheets instead of a shared console.log placeholder. Only
 * Help centre, Chat to customer support, Previous chats, Change icon
 * remain placeholders — explicitly deferred. Blog and Careers at
 * Cuvva are real outbound links (see Row's href handling below).
 *
 *   - Account details      -> /customer/profile/account (real API data)
 *   - Payment methods      -> PaymentMethodsSheet (localStorage only)
 *   - Apply discount code  -> /customer/profile/discount-code (localStorage only)
 *   - Refer a friend       -> /customer/profile/refer (no backend, static referral link)
 *   - Your discounts       -> /customer/profile/discounts (localStorage only)
 *   - Bank details         -> /customer/profile/bank-details (localStorage only)
 *   - Rate the app         -> RateAppModal (localStorage only)
 *   - Blog                 -> https://www.cuvva.com/news (real outbound link, new tab)
 *   - Careers at Cuvva     -> https://www.cuvva.com/careers (real outbound link, new tab)
 *   - Legal                -> /customer/profile/legal
 *   - Change profile photo -> real Cloudinary upload + backend save (see above)
 *   - Delete account       -> now inside AccountDetailsPage.jsx (real
 *     network call to a not-yet-built DELETE /customers/me route)
 *
 * "Refer a friend" illustration on THIS page (small promo card):
 * referfriendillustration.png — the dedicated ReferFriendPage.jsx uses
 * a separate illustration (referillustration.png) for ITS OWN
 * reference screenshot — two different images, not a mix-up.
 */
export default function ProfilePage() {
  const { data, isLoading, error, refetch } = useGetMyProfileQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();
  const [updateProfilePhoto] = useUpdateProfilePhotoMutation();

  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  // Profile photo upload state
  const fileInputRef = useRef(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);

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

  // Avatar image priority: a fresh local preview (mid-upload) > the
  // real saved photo from the server > nothing (falls back to the
  // placeholder Camera icon below).
  const avatarSrc = localPreviewUrl || customer?.profilePhotoUrl || null;

  const handleNotWiredUp = (label) => {
    // Placeholder — explicitly deferred, no destination page yet.
    console.log(`${label} tapped — not wired up yet.`);
  };

  const handleAvatarTap = () => {
    // Programmatically clicking the hidden <input type="file"> is
    // what actually opens the OS's native picker (photo library /
    // camera / file browser) — no custom UI needed for that part.
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    // Always reset the input's value, even on failure, so selecting
    // the SAME file again later still fires this onChange handler.
    event.target.value = "";
    if (!file) return;

    setPhotoError(null);

    // Instant local preview so the UI feels responsive immediately,
    // before the network round-trip to Cloudinary even starts.
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setIsUploadingPhoto(true);

    try {
      const secureUrl = await uploadToCloudinary(file);
      await updateProfilePhoto(secureUrl).unwrap();
      await refetch();
      // Real server value is now in `customer.profilePhotoUrl` via
      // refetch — safe to drop the local blob preview.
      setLocalPreviewUrl(null);
    } catch (err) {
      // Never silently pretend the upload worked — discard the
      // preview and surface a real, honest error message.
      setLocalPreviewUrl(null);
      setPhotoError(err?.message || "Couldn't update your photo. Please try again.");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsUploadingPhoto(false);
    }
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
          className="flex items-center justify-center border rounded-full w-9 h-9 bg-white/5 border-white/10"
        >
          <MessageCircleQuestion size={17} className="text-white" />
        </button>
      </div>

      {/* Avatar / name / member since */}
      <div className="flex flex-col items-center pt-4 pb-2">
        {/* Hidden native file input — accept="image/*" is what makes
            mobile browsers offer "Camera" as an option alongside the
            photo library / file browser, with zero custom UI. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleAvatarTap}
          disabled={isUploadingPhoto}
          aria-label={avatarSrc ? "Change profile photo" : "Add profile photo"}
          className="w-[72px] h-[72px] rounded-full bg-[#7c6bff]/20 flex items-center justify-center overflow-hidden relative disabled:opacity-70"
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt=""
              className="object-cover w-full h-full"
              draggable={false}
            />
          ) : (
            <Camera size={26} className="text-[#7c6bff]" />
          )}
          {isUploadingPhoto && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 size={22} className="text-white animate-spin" />
            </div>
          )}
        </button>
        <p className="text-[18px] font-extrabold text-white mt-3">{name}</p>
        {error ? (
          <p className="text-[13px] text-[#9497a1] mt-1">
            Member since — (couldn't load profile)
          </p>
        ) : (
          <p className="text-[13px] text-[#9497a1] mt-1">{memberSinceLabel}</p>
        )}
        {photoError && (
          <p className="text-[12px] text-[#e05a5a] mt-2 px-8 text-center">
            {photoError}
          </p>
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
        <Row label="Blog" href="https://www.cuvva.com/news" />
        <Row label="Careers at Cuvva" href="https://www.cuvva.com/careers" />
        <Row label="Legal" onClick={() => navigate("/customer/profile/legal")} isLast />
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

/**
 * Single tappable row: label left, optional right-side content,
 * chevron. Renders as a plain <button> for in-app navigation/actions,
 * OR — when `href` is given — as a real anchor tag opening in a new
 * tab (used for Blog / Careers at Cuvva, both real outbound links to
 * cuvva.com). Matches the pattern already established in
 * BookMechanicPage.jsx's "Continue to ClickMechanic" link: an <a
 * target="_blank" rel="noopener noreferrer"> is used instead of a
 * window.open() call inside an onClick handler, because anchor-tag
 * navigation is treated as a genuine user-initiated action by mobile
 * browsers (iOS Safari in particular) and reliably opens a new tab,
 * whereas script-triggered window.open() can get silently blocked as
 * a popup on some mobile browsers/webviews.
 */
function Row({ label, onClick, href, right, isLast, disabled }) {
  const sharedClassName = `w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-white/[0.03] transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
    !isLast ? "border-b border-white/5" : ""
  }`;

  const content = (
    <>
      <span className="text-[15px] text-white text-left">{label}</span>
      <span className="flex items-center gap-2 shrink-0">
        {right}
        <ChevronRight size={18} className="text-[#5c5e68]" />
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={disabled}
      className={sharedClassName}
    >
      {content}
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
