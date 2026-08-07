import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircleQuestion } from "lucide-react";
import fonData from "../../data/fonData.json";

/**
 * frontend/src/components/customer/FonPage.jsx
 *
 * "FON" (Fair Obtaining Notice) — opened from LegalPage.jsx's "FON"
 * row. Full real text content (the FON copy you pasted, ~320 words),
 * parsed into frontend/src/data/fonData.json (an array of sections ->
 * content blocks) rather than hand-typed here — same convention as
 * PrivacyPolicyPage.jsx / privacyPolicyData.json and TermsPage.jsx /
 * termsData.json. This file is just the renderer, and is
 * visually/structurally IDENTICAL to those two pages (same white
 * background, same sticky fading header, same two-heading-weight
 * system, same muted grey-blue inline email-link styling), matching
 * your 3 reference screenshots which show FON using the exact same
 * layout.
 *
 * Heading weights, confirmed against your screenshots:
 *   - "Fair obtaining notice" (the page's intro title, right under
 *     the sticky header) is the smaller dark/bold "sublabel" style —
 *     matches Terms' "Why you should read these" treatment.
 *   - "How we'll use your data" and "How your data will be processed"
 *     are the lighter-grey "major" headings with a horizontal divider
 *     above them (confirmed by pixel-sampling "How your data will be
 *     processed" at ~136 brightness, matching Privacy/Terms' major
 *     heading grey) — a NEW content-block type ("divider") was added
 *     just for FON's major headings, since neither Privacy nor Terms
 *     had a rule line above their major headings, but every FON major
 *     heading in your screenshots does.
 *   - "Insurance underwriting & anti-fraud purposes" is a plain bold
 *     sub-label sitting directly among the body paragraphs under "How
 *     we'll use your data" (new "sublabel" content-block type, same
 *     concept as PolicyWordingPage.jsx's existing "sublabel" block
 *     type, just not used yet by Privacy/Terms since neither of them
 *     needed a third heading level).
 *   - The "Give your driving licence number...", "Carrying out
 *     searches...", "Searches may be carried out..." items render as
 *     PLAIN PARAGRAPHS in your screenshots, not bullet points — kept
 *     as "p" blocks rather than a "list" block to match exactly.
 */
export default function FonPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/legal", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pb-32">
      {/* Header — sticky + translucent, same fade-through-scroll
          effect as PrivacyPolicyPage.jsx / TermsPage.jsx. */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-3 border-b bg-white/95 backdrop-blur-sm border-black/5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
        >
          <ChevronLeft size={20} className="text-[#1a1a1a]" />
        </button>
        <h1 className="text-[15px] font-bold text-[#1a1a1a] text-center px-2">
          FON
        </h1>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
        >
          <MessageCircleQuestion size={18} className="text-[#1a1a1a]" />
        </button>
      </div>

      {/* Full document body */}
      <div className="max-w-2xl px-6 py-6 mx-auto space-y-6">
        {fonData.sections.map((section, idx) => (
          <section key={idx}>
            {section.isMajor && idx > 0 && (
              <div className="mb-4 border-t border-black/10" />
            )}
            {section.heading && (
              <h2
                className={
                  section.isMajor
                    ? "text-[17px] font-semibold text-[#8b93a7] mb-3"
                    : "text-[16px] font-bold text-[#1a1a1a] mb-2"
                }
              >
                {section.heading}
              </h2>
            )}
            <div className="space-y-3">
              {section.content.map((block, bIdx) => (
                <ContentBlock key={bIdx} block={block} />
              ))}
            </div>
          </section>
        ))}

        {fonData.version && (
          <p className="text-[13px] text-[#9497a1] pt-4 border-t border-black/5">
            {fonData.version}
          </p>
        )}
      </div>
    </div>
  );
}

function ContentBlock({ block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[15px] text-[#1a1a1a] leading-relaxed">
          {renderWithEmailLinks(block.text)}
        </p>
      );

    case "sublabel":
      return (
        <p className="text-[15px] font-bold text-[#1a1a1a] mt-2">
          {block.text}
        </p>
      );

    case "list":
      return (
        <ul className="pl-5 space-y-2 list-disc">
          {block.items.map((item, i) => (
            <li key={i} className="text-[15px] text-[#1a1a1a] leading-relaxed">
              {renderWithEmailLinks(item)}
            </li>
          ))}
        </ul>
      );

    default:
      return null;
  }
}

/**
 * Same inline email-link styling as TermsPage.jsx — splits text on
 * email addresses and renders them in the muted grey-blue link color
 * confirmed by pixel-sampling the reference screenshots (e.g.
 * "privacy@cuvva.com", "dpo@aphaia.co.uk"), leaving surrounding text
 * as normal black body copy.
 */
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function renderWithEmailLinks(text) {
  const parts = text.split(new RegExp(`(${EMAIL_PATTERN.source})`, "g"));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    EMAIL_PATTERN.test(part) ? (
      <span key={i} className="text-[#9497a1]">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
