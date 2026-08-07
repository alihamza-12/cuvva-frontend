import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageCircleQuestion } from "lucide-react";
import privacyData from "../../data/privacyPolicyData.json";

/**
 * frontend/src/components/customer/PrivacyPolicyPage.jsx
 *
 * "Privacy" — opened from LegalPage.jsx's "Privacy" row. Full real
 * text content (the complete Cuvva privacy notice you pasted, ~3,800
 * words), parsed into frontend/src/data/privacyPolicyData.json (an
 * array of sections -> content blocks) rather than hand-typed here —
 * same convention already established for PolicyWordingPage.jsx /
 * policyWordingData.json, to avoid transcription errors across a
 * long legal document. This file is just the renderer.
 *
 * Visual style matches pr1.jpeg-pr9.jpeg exactly:
 *   - White background (this is the one page in the customer app
 *     that's intentionally light-themed, matching PolicyWordingPage.jsx's
 *     same white-doc-viewer pattern).
 *   - Sticky header with a translucent/blurred white background so
 *     content fades faintly through it while scrolling underneath
 *     (bg-white/95 backdrop-blur-sm, same technique as
 *     PolicyWordingPage.jsx).
 *   - Two heading weights, confirmed by pixel-sampling the reference
 *     screenshots: 3 "major" section headings ("Who we are", "Your
 *     personal data, and other information", "Your data rights") are
 *     lighter grey and slightly larger (matches PolicyWordingPage.jsx's
 *     section.heading style) — all other headings ("Device
 *     information", "Communication", etc.) are dark/bold, smaller
 *     "sublabel"-style headings, sitting directly among the body
 *     paragraphs rather than as top-level dividers.
 *   - Bottom nav (CustomerBottomNav, rendered by CustomerLayout, not
 *     here) stays visible under this page since it's nested in the
 *     same layout as every other Account/Profile sub-page.
 */
export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/customer/profile/legal", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pb-32">
      {/* Header — sticky + translucent, matches PolicyWordingPage.jsx's
          "content fades through on scroll" effect from the reference. */}
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
          Privacy
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
        {privacyData.sections.map((section, idx) => (
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

        {privacyData.version && (
          <p className="text-[13px] text-[#9497a1] pt-4 border-t border-black/5">
            {privacyData.version}
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

    default:
      return null;
  }
}
