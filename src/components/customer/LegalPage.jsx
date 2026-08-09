import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageCircleQuestion,
} from "lucide-react";

const LEGAL_ITEMS = [
  { label: "Privacy", to: "/customer/profile/legal/privacy", ready: true },
  { label: "Terms", to: "/customer/profile/legal/terms", ready: true },
  { label: "FON", to: "/customer/profile/legal/fon", ready: true },
];

export default function LegalPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile", { replace: true });
  };

  const handleRowTap = (item) => {
    if (item.ready && item.to) {
      navigate(item.to);
      return;
    }

    console.log(`${item.label} tapped — no document content provided yet.`);
  };

  return (
    <div className="min-h-screen pb-32 text-white bg-black">

      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <h1 className="text-[16px] font-bold text-white">Legal</h1>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <MessageCircleQuestion size={18} className="text-white" />
        </button>
      </div>

      <div className="mx-4 mt-5 rounded-2xl bg-[#17181c] border border-white/5 overflow-hidden">
        {LEGAL_ITEMS.map((item, i) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleRowTap(item)}
            className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-white/[0.03] transition-colors ${
              i !== LEGAL_ITEMS.length - 1 ? "border-b border-white/5" : ""
            }`}
          >
            <FileText size={20} className="text-white shrink-0" />
            <span className="flex-1 text-left text-[15px] text-white">
              {item.label}
            </span>
            <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
