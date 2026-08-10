import { useMemo, useRef, useState } from "react";
import {
  MessageCircleQuestion,
  Camera,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  useGetMyProfileQuery,
  useUpdateProfilePhotoMutation,
} from "../../app/api/profileApi";
import { useLogoutUserMutation } from "../../app/api/authApi";
import { useDispatch } from "react-redux";
import { logOut } from "../../features/authSlice";
import { useNavigate } from "react-router-dom";
import referFriendImg from "/referfriendillustration.png";
import PaymentMethodsSheet from "./PaymentMethodsSheet";
import RateAppModal from "./RateAppModal";
import {
  getPaymentMethod,
  getPreferredName,
} from "../../utils/profileLocalStorage";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import Spinner from "../common/Spinner";

export default function ProfilePage() {
  const { data, isLoading, error, refetch } = useGetMyProfileQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();
  const [updateProfilePhoto] = useUpdateProfilePhotoMutation();

  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  const fileInputRef = useRef(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const customer = data?.customer;

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

  const avatarSrc = localPreviewUrl || customer?.profilePhotoUrl || null;

  const handleNotWiredUp = (label) => {
    console.log(`${label} tapped — not wired up yet.`);
  };

  const handleAvatarTap = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";
    if (!file) return;

    setPhotoError(null);

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setIsUploadingPhoto(true);

    try {
      const secureUrl = await uploadToCloudinary(file);
      await updateProfilePhoto(secureUrl).unwrap();
      await refetch();
      setLocalPreviewUrl(null);
    } catch (err) {
      setLocalPreviewUrl(null);
      setPhotoError(
        err?.message || "Couldn't update your photo. Please try again.",
      );
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
      dispatch(logOut());
      navigate("/login", { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-32 text-white bg-black">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      <div className="flex items-start justify-end px-4 pt-3 min-h-12">
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex items-center justify-center border rounded-full w-9 h-9 bg-white/5 border-white/10"
        >
          <MessageCircleQuestion size={17} className="text-white" />
        </button>
      </div>

      <h1 className="px-4 pt-3 text-[26px] font-extrabold tracking-tight leading-none">
        Profile
      </h1>

      <div className="flex flex-col items-center pt-8 pb-2">
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
        <Row
          label="Help centre"
          onClick={() => navigate("/customer/support")}
        />
        <Row
          label="Chat to customer support"
          onClick={() => navigate("/customer/support")}
        />
        <Row
          label="Previous chats"
          onClick={() => navigate("/customer/support")}
          isLast
        />
      </Card>

      {/* Feedback */}
      <SectionLabel>Feedback</SectionLabel>
      <Card>
        <Row
          label="Rate the app"
          onClick={() => setShowRateModal(true)}
          isLast
        />
      </Card>

      {/* About */}
      <SectionLabel>About</SectionLabel>
      <Card>
        <Row label="Blog" href="https://www.cuvva.com/news" />
        <Row label="Careers at Cuvva" href="https://www.cuvva.com/careers" />
        <Row
          label="Legal"
          onClick={() => navigate("/customer/profile/legal")}
          isLast
        />
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
    <p className="text-[14px] font-medium text-[#a7a7ad] px-7 mt-7 mb-3">
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
 * OR — when href is given — as a real anchor tag opening in a new tab
 * (used for Blog / Careers at Cuvva).
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
 * Payment-method badge shown once a method has been chosen in
 * PaymentMethodsSheet.jsx (persisted to localStorage). Renders the
 * real Apple Pay mark (Apple logo + "Pay" wordmark) as a small white
 * rounded chip with a black glyph, built as inline SVG.
 *
 * The white chip contains ONLY the Apple logo + "Pay" wordmark — the
 * "Apple Pay" text no longer sits inside the icon. (The logo + "Pay"
 * wordmark together already read as "Apple Pay", so the extra text
 * was redundant and was wrongly appearing inside the badge.)
 */
function ApplePayBadge() {
  return (
    <span className="flex items-center gap-1.5" aria-label="Apple Pay">
      {/* White chip contains ONLY the Apple Pay mark (icon keeps its bg) */}
      <span className="flex items-center justify-center px-2 py-1 bg-white rounded-md">
        <svg
          width="34"
          height="16"
          viewBox="0 0 34 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M6.53 2.06c-.4.47-1.04.85-1.68.8-.08-.64.24-1.32.6-1.74C5.86.63 6.56.28 7.13.25c.07.67-.19 1.32-.6 1.81Zm.59.95c-.93-.05-1.72.53-2.16.53-.45 0-1.12-.5-1.86-.49-.96.01-1.85.56-2.34 1.42-1 1.73-.26 4.29.72 5.7.48.7 1.05 1.47 1.8 1.44.72-.03.99-.46 1.86-.46.88 0 1.12.46 1.87.45.78-.01 1.27-.7 1.74-1.4.55-.8.77-1.57.78-1.61-.02-.01-1.5-.58-1.51-2.3-.01-1.43 1.17-2.12 1.22-2.15-.67-.98-1.71-1.09-2.07-1.12Z"
            fill="#000000"
          />
          <text
            x="13.5"
            y="12"
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
            fontWeight="600"
            fontSize="11"
            fill="#000000"
          >
            Pay
          </text>
        </svg>
      </span>
      {/* "Apple Pay" text — OUTSIDE the white chip, no background */}
      <span className="text-[12px] font-bold leading-none text-white">
        Apple Pay
      </span>
    </span>
  );
}
