import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, HelpCircle } from "lucide-react";

import policyWordingData from "../../data/policyWordingData.json";

/**
 * frontend/src/pages/customer/PolicyWordingPage.jsx
 *
 * "Policy wording (full terms)" — full real text/JSX content page,
 * built from Policywording.txt (the complete Cuvva/Wakam legal policy
 * document, ~590 lines / 43k characters). The raw .txt was parsed into
 * frontend/src/data/policyWordingData.json (a structured array of
 * sections -> content blocks) so the JSX here is just a renderer, not
 * a hand-typed copy of a huge legal document (avoids transcription
 * errors across 53 sections).
 *
 * Header matches the reference screenshots exactly: "<" back button,
 * centered "Policy wording (full terms)" title, "?" help button.
 *
 * The "Driving abroad" section (shown fully in your reference
 * screenshots) renders its repeated EN/FR/DE/IT/ES paragraphs inside
 * left-bordered "quote" blocks, matching the vertical grey bar styling
 * visible in your screenshots.
 *
 * Route suggestion: /customer/policies/documents/wording
 *
 * If you ever need to regenerate policyWordingData.json from an updated
 * Policywording.txt, the parsing script logic (heading list, sublabel
 * list, definitions-pairing, driving-abroad quote conversion) can be
 * reused — ask and I'll hand you that script too.
 */
export default function PolicyWordingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-black/5">
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
          aria-label="Help"
          className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
        >
          <HelpCircle size={18} className="text-[#1a1a1a]" />
        </button>
      </div>

      {/* Full document body */}
      <div className="px-6 py-6 max-w-2xl mx-auto space-y-10">
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
        <ul className="list-disc pl-5 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] text-[#1a1a1a] leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );

    // Left-bordered block, matching the vertical grey bar seen in the
    // reference screenshots for the repeated multi-language paragraphs
    // in "Driving abroad".
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
