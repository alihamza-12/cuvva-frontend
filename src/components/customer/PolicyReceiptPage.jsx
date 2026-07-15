import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";

/**
 * frontend/src/pages/customer/PolicyReceiptPage.jsx
 *
 * "Receipt" screen — opened from the Receipt quick-action / Payment
 * information row on PolicyDetailPage.jsx. Matches the reference
 * screenshot: back arrow + help icon header, bold "Receipt" title, a
 * card with issue date/time + line-item breakdown + total, and a
 * separate "Grand total" pill below it.
 *
 * DATA SOURCE: the policy object is passed via router state from
 * PolicyDetailPage.jsx (already in memory, no new API call).
 *
 * IMPORTANT — LINE-ITEM BREAKDOWN IS ESTIMATED, NOT REAL DATA:
 * Your Policy.js schema only stores ONE total figure (`premiumAmount`,
 * in pence). There is no backend field for "Insurance premium",
 * "Insurance premium tax", or "Admin fee" as separate line items — so
 * this page reconstructs a plausible breakdown FROM the total using a
 * fixed, clearly-labeled split (12% IPT — the UK's actual standard
 * Insurance Premium Tax rate — plus a fixed admin fee, with the base
 * premium as the remainder). This is presented as an ESTIMATE so the
 * UI isn't empty, but it is NOT sourced from real backend data. If you
 * want a truthful receipt, the backend needs to store these three
 * amounts separately when a policy is created (e.g. at checkout time,
 * when the actual premium calculation happens) rather than only the
 * combined total.
 */

const UK_IPT_RATE = 0.12; // standard UK Insurance Premium Tax rate
const ADMIN_FEE_PENCE = 1071; // matches the reference screenshot's £10.71 admin fee

export default function PolicyReceiptPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const policy = location.state?.policy;

  if (!policy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center text-white bg-black">
        <p className="text-[15px] text-[#9497a1]">
          We couldn't load this receipt. Please go back and try again.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-3 bg-[#7c6bff] rounded-full text-[14px] font-bold text-white"
        >
          Go back
        </button>
      </div>
    );
  }

  const totalPence =
    typeof policy?.premiumAmount === "number" ? policy.premiumAmount : 0;

  // Estimate breakdown: total = premium + (premium * IPT) + adminFee
  // => premium = (total - adminFee) / (1 + IPT)
  const adminFeePence = Math.min(ADMIN_FEE_PENCE, totalPence);
  const remainderPence = totalPence - adminFeePence;
  const premiumPence = Math.round(remainderPence / (1 + UK_IPT_RATE));
  const taxPence = remainderPence - premiumPence;

  const formatGBP = (pence) => `£${(pence / 100).toFixed(2)}`;

  const issuedAt = policy?.createdAt ? new Date(policy.createdAt) : null;
  const issuedLabel = issuedAt
    ? `${issuedAt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} at ${issuedAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}`
    : "—";

  return (
    <div className="min-h-screen text-white bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <button
          type="button"
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="px-4 pt-3">
        <h1 className="text-[26px] font-extrabold tracking-tight">Receipt</h1>
      </div>

      {/* Line-item breakdown card */}
      <div className="mx-4 mt-5 rounded-2xl bg-[#17181c] overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <p className="text-[13px] text-[#9497a1]">{issuedLabel}</p>
        </div>

        <ReceiptRow label="Insurance premium" value={formatGBP(premiumPence)} />
        <ReceiptRow label="Insurance premium tax" value={formatGBP(taxPence)} />
        <ReceiptRow label="Admin fee" value={formatGBP(adminFeePence)} />
        <ReceiptRow
          label="Your total price"
          value={formatGBP(totalPence)}
          bold
          isLast
        />
      </div>

      {/* Grand total pill */}
      <div className="mx-4 mt-3 rounded-2xl bg-[#17181c] px-4 py-4 flex items-center justify-between">
        <span className="text-[15px] font-bold text-white">Grand total</span>
        <span className="text-[15px] font-bold text-[#8a7bff]">
          {formatGBP(totalPence)}
        </span>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, bold, isLast }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${
        !isLast ? "border-b border-white/5" : ""
      }`}
    >
      <span
        className={`text-[14px] ${bold ? "font-bold text-white" : "text-[#c8c9d1]"}`}
      >
        {label}
      </span>
      <span
        className={`text-[14px] font-bold ${bold ? "text-[#8a7bff]" : "text-[#8a7bff]"}`}
      >
        {value}
      </span>
    </div>
  );
}
