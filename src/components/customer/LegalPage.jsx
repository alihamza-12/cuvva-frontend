import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, FileText, MessageCircleQuestion } from "lucide-react";

/**
 * frontend/src/components/customer/LegalPage.jsx
 *
 * "Legal" — opened from ProfilePage.jsx's About > Legal row. Matches
 * the afterlegal.jpeg reference exactly: dark theme (unlike the
 * documents it links to, which are white-background), back button,
 * centered "Legal" title, help icon, single rounded card grouping 3
 * rows (Privacy / Terms / FON), each with a document icon + chevron.
 *
 * Only "Privacy" is wired to a real document page (PrivacyPolicyPage.jsx)
 * per instruction — "Terms" and "FON" (Fair Obtaining Notice) are
 * flagged as placeholders below since no content/reference screenshots
 * were provided for them yet. Ask for their text/screenshots the same
 * way Privacy's were provided, and they can be built the same way.
 */
const LEGAL_ITEMS = [
  { label: "Privacy", to: "/customer/profile/legal/privacy", ready: true },
  { label: "Terms", to: null, ready: false },
  { label: "FON", to: null, ready: false },
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
    // Terms / FON — no content/reference provided yet, flagged clearly
    // rather than silently doing nothing or faking a document.
    console.log(`${item.label} tapped — no document content provided yet.`);
  };

  return (
    <div className="min-h-screen pb-32 text-white bg-black">
      {/* Header */}
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
          onClick={() => console.log("Help tapped — not wired up yet.")}
          aria-label="Help"
          className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/5 border-white/10"
        >
          <MessageCircleQuestion size={18} className="text-white" />
        </button>
      </div>

      {/* Legal documents card */}
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
