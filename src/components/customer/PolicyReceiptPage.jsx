import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";

const UK_IPT_RATE = 0.12; 
const ADMIN_FEE_PENCE = 1071; 

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

  const totalAmount =
    typeof policy?.premiumAmount === "number" || policy?.premiumAmount
      ? Number(policy.premiumAmount)
      : 0;

  // Estimate breakdown (all in decimal pounds): total = premium + (premium * IPT) + adminFee
  // => premium = (total - adminFee) / (1 + IPT)
  const adminFee = Math.min(ADMIN_FEE_PENCE / 100, totalAmount);
  const remainder = totalAmount - adminFee;
  const premium = Math.round((remainder / (1 + UK_IPT_RATE)) * 100) / 100;
  const tax = Math.round((remainder - premium) * 100) / 100;

  const formatGBP = (amount) => `£${Number(amount).toFixed(2)}`;

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
          onClick={() => navigate("/customer/support")}
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

        <ReceiptRow label="Insurance premium" value={formatGBP(premium)} />
        <ReceiptRow label="Insurance premium tax" value={formatGBP(tax)} />
        <ReceiptRow label="Admin fee" value={formatGBP(adminFee)} />
        <ReceiptRow
          label="Your total price"
          value={formatGBP(totalAmount)}
          bold
          isLast
        />
      </div>

      {/* Grand total pill */}
      <div className="mx-4 mt-3 rounded-2xl bg-[#17181c] px-4 py-4 flex items-center justify-between">
        <span className="text-[15px] font-bold text-white">Grand total</span>
        <span className="text-[15px] font-bold text-[#8a7bff]">
          {formatGBP(totalAmount)}
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
