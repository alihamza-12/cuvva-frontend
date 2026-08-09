import React, { useRef, useState } from "react";
import { Check, Info, ChevronDown } from "lucide-react";

const STATEMENTS = [
  {
    text: "I am not currently banned from driving, nor have I received a driving ban outside of the UK during the last 5 years",
    info: false,
  },
  {
    text: "The vehicle has no modifications other than those on the approved list",
    info: true,
  },
  {
    text: "The vehicle has a valid MOT and Tax where required by law",
    info: true,
  },
  {
    text: "The vehicle is not currently impounded",
    info: true,
  },
  {
    text: "I have declared any relevant medical conditions or disabilities to the DVLA and have been cleared to drive",
    info: true,
  },
  {
    text: "The driving licence I used to purchase this policy is valid and in date",
    info: false,
  },
  {
    text: "I understand I can only use the vehicle for social or domestic activities, leisure or commuting, or in connection with my business but only if driven by me",
    info: true,
  },
  {
    text: "I have never had a policy cancelled, refused or voided by an insurer",
    info: false,
  },
  {
    text: "I have no unspent criminal convictions or prosecutions pending (excluding motoring offences)",
    info: true,
  },
  {
    text: "The vehicle will be in the UK when the policy starts and ends and I will not permanently export the vehicle",
    info: false,
  },
  {
    text: "I will not use the vehicle for any motor trade related activities",
    info: true,
  },
  {
    text: "I am aware how much my vehicle is worth and understand this impacts my settlement in the event of a claim",
    info: true,
  },
];

export default function StatementsConfirmationModal({
  open,
  onClose,
  onConfirm,
}) {
  const scrollRef = useRef(null);
  const [atBottom, setAtBottom] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const reachedBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    setAtBottom(reachedBottom);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#0b0b0e] flex flex-col">

      <h1 className="shrink-0 text-[26px] font-extrabold text-white leading-tight px-6 pt-4 pb-4">
        Are all of these statements true and correct?
      </h1>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 pb-6"
      >
        <ul className="space-y-6">
          {STATEMENTS.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#7c6bff]/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={14} className="text-[#7c6bff]" strokeWidth={3} />
              </span>
              <span className="flex-1 text-[15px] text-[#e5e5ea] leading-relaxed">
                {item.text}
              </span>
              {item.info && (
                <button
                  type="button"
                  aria-label="More information"
                  className="shrink-0 mt-0.5"
                >
                  <Info size={18} className="text-[#7c6bff]/80" />
                </button>
              )}
            </li>
          ))}
        </ul>

        <p className="text-[13px] text-[#8b8d98] leading-relaxed mt-8">
          By accepting, you acknowledge that all of these statements are true.
          If anything is found to be untrue, your policy could be voided or
          cancelled and claims could be rejected or not paid in full.
        </p>

        <div className="h-2" />
      </div>

      <div className="px-6 pb-8 pt-3 bg-[#0b0b0e] shrink-0">
        {!atBottom ? (
          <button
            type="button"
            onClick={scrollToBottom}
            className="w-full py-4 bg-[#4a3fc4] hover:bg-[#5646d6] transition-colors rounded-full flex items-center justify-center"
            aria-label="Scroll for more"
          >
            <ChevronDown size={20} className="text-white" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-[#2b2a3d] hover:bg-[#332f4a] transition-colors rounded-full text-[16px] font-bold text-[#a99bff]"
            >
              No
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-4 bg-[#7c6bff] hover:bg-[#6c5ae8] transition-colors rounded-full text-[16px] font-bold text-white"
            >
              Yes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
