import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";

import policyWordingData from "../../data/policyWordingData.json";

export default function PolicyWordingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">

      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-3 border-b bg-white/95 backdrop-blur-sm border-black/5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-[#1a1a1a]" />
        </button>
        <h1 className="text-[15px] font-bold text-[#1a1a1a] text-center px-2">
          Policy wording (full terms)
        </h1>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-[#1a1a1a]" />
        </button>
      </div>

      <div className="max-w-2xl px-6 py-6 mx-auto space-y-10">
        {policyWordingData.sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-[17px] font-semibold text-[#8b93a7] mb-3">
              {section.heading}
            </h2>
            <div className="space-y-3">
              {section.content.map((block, bIdx) => (
                <ContentBlock key={bIdx} block={block} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ContentBlock({ block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[15px] text-[#1a1a1a] leading-relaxed">
          {block.text}
        </p>
      );

    case "sublabel":
      return (
        <p className="text-[15px] font-bold text-[#1a1a1a] mt-4">
          {block.text}
        </p>
      );

    case "list":
      return (
        <ul className="pl-5 space-y-2 list-disc">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] text-[#1a1a1a] leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <p className="text-[15px] text-[#1a1a1a] leading-relaxed border-l-2 border-[#d1d5db] pl-4">
          {block.text}
        </p>
      );

    case "definitions":
      return (
        <dl className="space-y-4">
          {block.pairs.map((pair, i) => (
            <div key={i}>
              <dt className="text-[15px] font-bold text-[#1a1a1a]">
                {pair.term}
              </dt>
              <dd className="text-[15px] text-[#1a1a1a] leading-relaxed mt-0.5">
                {pair.definition}
              </dd>
            </div>
          ))}
        </dl>
      );

    default:
      return null;
  }
}
