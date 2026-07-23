import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle, User } from "lucide-react";
import { useGetMyProfileQuery } from "../../app/api/profileApi";

/**
 * frontend/src/components/customer/MyIdentityPage.jsx
 *
 * "My Identity" — opened from AccountDetailsPage.jsx's "My identity"
 * row. Matches reference: header, avatar circle + full name, "About
 * me" card (Date of birth / Name / Gender / Driving licence, each
 * with a small green dot), "chat to us" link for licence updates,
 * "Verification photos" card (Driving licence / Selfie, each showing
 * "Taken"). UI is unchanged — same rows, same layout, same
 * "Not provided"/"Not taken" fallback pattern as before.
 *
 * REAL DATA (from GET /customers/me):
 *   - "Name" -> customer.fullName.
 *   - "Date of birth" -> customer.dateOfBirth, formatted via
 *     formatDob(). Falls back to "Not provided" if null/missing on a
 *     given customer's record.
 *   - "Gender" -> customer.gender. Falls back to "Not provided" if
 *     null/missing.
 *   - "Driving licence" -> customer.drivingLicenceNumber. Falls back
 *     to "Not provided" if null/missing.
 *
 * UPDATE: all 4 fields above are now REAL backend data — the
 * create-customer flow (Super Admin's CreateUser.jsx and Sub Admin's
 * CreateCustomerPage.jsx) now collects and requires
 * dateOfBirth/gender/drivingLicenceNumber when a customer is created,
 * User.js's schema has gender/drivingLicenceNumber added, and
 * GET /customers/me's `.select(...)` list includes both. So any
 * customer created going forward will have real values for all 4
 * fields; any "Not provided" shown here for an OLDER customer account
 * (created before these fields existed) is accurate — that record
 * genuinely has no value stored for it, not a frontend gap.
 *
 * "Verification photos" (Driving licence / Selfie "Taken" status) —
 * no such concept exists anywhere in the schema (no file-upload/
 * verification-status collection) — left as static "Not taken"
 * placeholders, NOT real data.
 */
export default function MyIdentityPage() {
  const navigate = useNavigate();
  const { data } = useGetMyProfileQuery();
  const customer = data?.customer;
  const fullName = customer?.fullName || "—";

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/account", { replace: true });
  };

  const handleNotWiredUp = (label) => {
    console.log(`${label} tapped — not wired up yet.`);
  };

  const formatDob = (dob) => {
    if (!dob) return "Not provided";
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return "Not provided";
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-40">
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">My Identity</h1>
        <button
          type="button"
          onClick={() => handleNotWiredUp("Help")}
          aria-label="Help"
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center pt-3 pb-2">
        <div className="w-16 h-16 rounded-full bg-[#242429] flex items-center justify-center">
          <User size={28} className="text-[#5c5e68]" />
        </div>
        <p className="text-[18px] font-extrabold text-white mt-3">{fullName}</p>
      </div>

      <p className="text-[13px] font-bold text-[#9497a1] px-4 mt-6 mb-1">About me</p>
      <div className="px-4 space-y-px">
        <IdentityRow
          label="Date of birth"
          value={formatDob(customer?.dateOfBirth)}
          onClick={() => handleNotWiredUp("Date of birth")}
        />
        <IdentityRow
          label="Name"
          value={fullName}
          onClick={() => handleNotWiredUp("Name")}
        />
        <IdentityRow
          label="Gender"
          value={customer?.gender || "Not provided"}
          onClick={() => handleNotWiredUp("Gender")}
        />
        <IdentityRow
          label="Driving licence"
          value={customer?.drivingLicenceNumber || "Not provided"}
          onClick={() => handleNotWiredUp("Driving licence")}
          isLast
        />
      </div>

      <p className="text-[14px] text-[#9497a1] px-4 mt-4">
        To update your licence details, you'll need to{" "}
        <button
          type="button"
          onClick={() => handleNotWiredUp("Chat to us")}
          className="font-semibold text-[#7c6bff]"
        >
          chat to us
        </button>
      </p>

      <p className="text-[13px] font-bold text-[#9497a1] px-4 mt-6 mb-1">
        Verification photos
      </p>
      <div className="px-4 space-y-px">
        <IdentityRow label="Driving licence" value="Not taken" onClick={() => handleNotWiredUp("Driving licence photo")} />
        <IdentityRow label="Selfie" value="Not taken" onClick={() => handleNotWiredUp("Selfie photo")} isLast />
      </div>
    </div>
  );
}

function IdentityRow({ label, value, onClick, isLast }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 justify-between py-4 hover:bg-white/[0.03] transition-colors ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-[#3ecf8e] shrink-0" />
        <span className="text-[15px] text-white text-left">{label}</span>
      </span>
      <span className="text-[14px] text-[#c8c9d1]">{value}</span>
    </button>
  );
}