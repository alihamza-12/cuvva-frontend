import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, ChevronRight, Check } from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";
import {
  getPreferredName,
  getPreviousIncidents,
} from "../../utils/profileLocalStorage";

export default function AccountDetailsPage() {
  const navigate = useNavigate();
  const { data } = useGetMyProfileQuery();
  const [incidentCount, setIncidentCount] = useState(0);

  useEffect(() => {
    setIncidentCount(getPreviousIncidents().length);
  }, []);

  const customer = data?.customer;
  const realFirstName = customer?.fullName?.trim()?.split(/\s+/)?.[0] || "—";

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
    <div className="min-h-screen pb-40 text-white bg-black">

      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Account details</h1>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
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

function InfoRow({
  label,
  value,
  verified,
  onClick,
  isLast,
  disabled,
  danger,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between gap-3 py-4 hover:bg-white/[0.03] transition-colors disabled:opacity-60 ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      <span
        className={`text-[15px] text-left ${danger ? "text-[#e05a5a]" : "text-white"}`}
      >
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
