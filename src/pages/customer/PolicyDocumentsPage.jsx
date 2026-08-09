import React from "react";
import { useNavigate } from "react-router-dom";
import { X, HelpCircle, FileText, ChevronRight } from "lucide-react";

const DOCUMENTS = [
  {
    id: "ipid",
    label: "Insurance summary (IPID)",
    type: "in-app",
    route: "/customer/policies/documents/ipid",
  },
  {
    id: "wording",
    label: "Policy wording (full terms)",
    type: "in-app",
    route: "/customer/policies/documents/wording",
  },
];

export default function PolicyDocumentsPage() {
  const navigate = useNavigate();

  const handleOpen = (doc) => {
    if (doc.type === "in-app") {
      navigate(doc.route);
    } else {
      window.open(doc.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen text-white bg-black">

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Close"
          className="w-10 h-10 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center"
        >
          <X size={18} className="text-white" />
        </button>

        <h1 className="text-[16px] font-bold text-white">Policy documents</h1>

        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="w-10 h-10 rounded-full bg-[#17181c] border border-white/5 flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-white" />
        </button>
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-[#17181c] overflow-hidden">
        {DOCUMENTS.map((doc, idx) => (
          <React.Fragment key={doc.id}>
            <button
              type="button"
              onClick={() => handleOpen(doc)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-white/[0.03] transition-colors"
            >
              <FileText
                size={18}
                className="text-[#c8c9d1] shrink-0"
                strokeWidth={1.8}
              />
              <span className="flex-1 text-[15px] text-white">{doc.label}</span>
              <ChevronRight size={18} className="text-[#5c5e68] shrink-0" />
            </button>
            {idx < DOCUMENTS.length - 1 && (
              <div className="h-px mx-4 bg-white/5" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
