import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, HelpCircle, X, Check } from "lucide-react";

// Both cards use the SAME source image — only the surrounding border/
// background/badge styling differs between the "bad" and "good"
// examples (confirmed against the reference screenshot: it's one photo
// shown twice with different framing treatments, not two different
// photos). Rename/replace this single file with your own.
import exampleCarImage from "../../../public/car.jpeg";

/**
 * frontend/src/pages/customer/VehiclePhotoCapturePage.jsx
 *
 * Vehicle condition photo capture step — shown after the customer taps
 * "Yes" on StatementsConfirmationModal.jsx.
 *
 * IMAGES: only ONE example image is needed — both the "bad" and "good"
 * cards show the SAME photo, just wrapped in different border/badge
 * treatments (red continuous border vs. green corner brackets). Place
 * your file at:
 *   frontend/public/car.jpeg
 * (or update the import path above to match your actual filename).
 *
 * NOTE ON STYLING: colors/borders below use INLINE STYLES rather than
 * Tailwind arbitrary-value classes (e.g. text-[#9497a1]). This is a
 * deliberate fix — arbitrary bracket classes only work if this file's
 * path is covered by tailwind.config.js's `content` glob; if it isn't,
 * Tailwind silently drops those classes at build time and the browser
 * falls back to inherited/default colors (which is very likely why the
 * subtitle rendered blue instead of grey in your screenshot). Inline
 * styles always render correctly regardless of Tailwind's build
 * config, so this component no longer depends on that being right.
 *
 * On "Open camera", this currently just logs a placeholder — wiring up
 * an actual camera/file input and upload endpoint is a decision for you.
 */

const STEP_CONFIG = {
  front: {
    title: "Take a photo of the front of the vehicle",
    subtitle: "This shows us what condition it's in and helps us prevent fraud.",
    next: "back",
  },
  back: {
    title: "Take a photo of the back of the vehicle",
    subtitle: "This shows us what condition it's in and helps us prevent fraud.",
    next: "left",
  },
  left: {
    title: "Take a photo of the left side of the vehicle",
    subtitle: "This shows us what condition it's in and helps us prevent fraud.",
    next: "right",
  },
  right: {
    title: "Take a photo of the right side of the vehicle",
    subtitle: "This shows us what condition it's in and helps us prevent fraud.",
    next: null,
  },
};

export default function VehiclePhotoCapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { step = "front" } = useParams();

  const config = STEP_CONFIG[step] || STEP_CONFIG.front;

  const handleOpenCamera = () => {
     navigate(`/customer/policies/photos/${step}/camera`, { state: location.state });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e12", color: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <ChevronLeft size={20} color="#ffffff" />
        </button>
        <button
          type="button"
          aria-label="Help"
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <HelpCircle size={18} color="#ffffff" />
        </button>
      </div>

      {/* Example cards */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", marginTop: "-24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
          <ExampleCard variant="bad" imageSrc={exampleCarImage} />
          <ExampleCard variant="good" imageSrc={exampleCarImage} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", textAlign: "center", lineHeight: 1.3, maxWidth: 280, margin: 0 }}>
          {config.title}
        </h1>
        <p style={{ fontSize: 14, color: "#9497a1", textAlign: "center", marginTop: 12, maxWidth: 280, lineHeight: 1.5 }}>
          {config.subtitle}
        </p>
      </div>

      {/* Footer: Open camera — text only, no icon */}
      <div style={{ padding: "0 24px 40px 24px" }}>
        <button
          type="button"
          onClick={handleOpenCamera}
          style={{
            width: "100%", padding: "16px", background: "#7c6bff", border: "none",
            borderRadius: 999, cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>Open camera</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Card wrapping the supplied image with the correct border/badge
 * treatment:
 *   bad:  continuous solid red rounded border, red X badge, image inset
 *         with a small margin (so the dark card background is visible
 *         around it, not edge-to-edge).
 *   good: 4 separate green corner brackets (no full border), green
 *         check badge, image inset the same way.
 */
function ExampleCard({ variant, imageSrc }) {
  const isGood = variant === "good";
  const badgeColor = isGood ? "#2aa264" : "#e0304a";
  const borderColor = isGood ? "#34d399" : "#ff4d5e";
  const cardBg = isGood ? "#0d1a16" : "#1f1219";

  return (
    <div style={{ position: "relative", width: 124, height: 124 }}>
      <div
        style={{
          width: 124,
          height: 124,
          borderRadius: 22,
          overflow: "hidden",
          backgroundColor: cardBg,
          border: !isGood ? `3px solid ${borderColor}` : "none",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 10, // inset so the image doesn't bleed edge-to-edge
        }}
      >
        <img
          src={imageSrc}
          alt={isGood ? "Correctly framed vehicle example" : "Incorrectly framed vehicle example"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: 10,
            display: "block",
          }}
        />
      </div>

      {isGood && <CornerBrackets color={borderColor} />}

      <div
        style={{
          position: "absolute",
          bottom: -12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: badgeColor,
          boxShadow: "0 0 0 4px #0e0e12",
        }}
      >
        {isGood ? (
          <Check size={16} color="#ffffff" strokeWidth={3} />
        ) : (
          <X size={16} color="#ffffff" strokeWidth={3} />
        )}
      </div>
    </div>
  );
}

function CornerBrackets({ color }) {
  const base = {
    position: "absolute",
    width: 16,
    height: 16,
    borderStyle: "solid",
    borderColor: color,
    borderWidth: 3,
  };
  return (
    <>
      <span style={{ ...base, top: 6, left: 6, borderRight: "none", borderBottom: "none", borderTopLeftRadius: 6 }} />
      <span style={{ ...base, top: 6, right: 6, borderLeft: "none", borderBottom: "none", borderTopRightRadius: 6 }} />
      <span style={{ ...base, bottom: 6, left: 6, borderRight: "none", borderTop: "none", borderBottomLeftRadius: 6 }} />
      <span style={{ ...base, bottom: 6, right: 6, borderLeft: "none", borderTop: "none", borderBottomRightRadius: 6 }} />
    </>
  );
}
