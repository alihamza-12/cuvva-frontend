import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircleQuestion } from "lucide-react";
import termsData from "../../data/termsData.json";

/**
 * frontend/src/components/customer/TermsPage.jsx
 *
 * "Terms" — opened from LegalPage.jsx's "Terms" row. Full real text
 * content (the complete Cuvva terms and conditions you pasted, ~6,300
 * words, 29 numbered clauses), parsed into
 * frontend/src/data/termsData.json (an array of sections -> content
 * blocks) rather than hand-typed here — same convention as
 * PrivacyPolicyPage.jsx / privacyPolicyData.json and
 * PolicyWordingPage.jsx / policyWordingData.json, to avoid
 * transcription errors across a long legal document. This file is
 * just the renderer, and is visually/structurally IDENTICAL to
 * PrivacyPolicyPage.jsx (same white background, same sticky fading
 * header, same two-heading-weight system) — matching your screenshot
 * of the Terms page, which uses the exact same layout as Privacy.
 *
 * Heading weights: "Why you should read these" and each of the 29
 * numbered clauses ("1. General", "2. Our insurance products and
 * services", etc.) are the lighter-grey "major" heading style —
 * confirmed by pixel-sampling your reference screenshot ("1. General"
 * measured at ~130 brightness, matching Privacy's major-heading grey).
 * The two sub-headings under clause 17 ("Premium financing via
 * PremFina", "Buy Now, Pay Later (\"BNPL\")") are the smaller dark/bold
 * "sublabel" style, since they're subsections of clause 17 rather
 * than top-level numbered clauses.
 */
export default function TermsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/legal", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pb-32">
      {/* Header — sticky + translucent, same fade-through-scroll
          effect as PrivacyPolicyPage.jsx / PolicyWordingPage.jsx. */}
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
          Terms
        </h1>
        <button
          type="button"
          onClick={() => console.log("Help tapped — not wired up yet.")}
          aria-label="Help"
          className="w-9 h-9 rounded-full bg-[#f2f2f2] flex items-center justify-center"
        >
          <MessageCircleQuestion size={18} className="text-[#1a1a1a]" />
        </button>
      </div>

      {/* Full document body */}
      <div className="max-w-2xl px-6 py-6 mx-auto space-y-6">
        {termsData.sections.map((section, idx) => (
          <section key={idx}>
            {section.heading && (
              <h2
                className={
                  section.isMajor
                    ? "text-[17px] font-semibold text-[#8b93a7] mb-3 mt-4"
                    : "text-[16px] font-bold text-[#1a1a1a] mb-2 mt-5"
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

        {termsData.version && (
          <p className="text-[13px] text-[#9497a1] pt-4 border-t border-black/5">
            {termsData.version}
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
 * Splits paragraph/list-item text on email addresses and renders them
 * in the muted grey-blue link color confirmed by pixel-sampling your
 * reference screenshot (e.g. "support@cuvva.com" inside "Why you
 * should read these"), while the surrounding text stays normal black
 * body copy. Plain string rendering otherwise — this only kicks in
 * when an email actually appears in the text.
 */
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

function renderWithEmailLinks(text) {
  // Split on a capturing group so the emails themselves are kept as
  // their own array entries — a NEW RegExp per call avoids the
  // stateful `lastIndex` bug that comes from reusing one `g`-flagged
  // regex object across both .split() and a separate .test() check.
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
