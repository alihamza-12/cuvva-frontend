import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, HelpCircle, X, Check } from "lucide-react";

import exampleCarImage from "/car.jpeg";

const STEP_CONFIG = {
  front: {
    title: "Take a photo of the front of the vehicle",
    subtitle:
      "This shows us what condition it's in and helps us prevent fraud.",
    next: "back",
  },
  back: {
    title: "Take a photo of the back of the vehicle",
    subtitle:
      "This shows us what condition it's in and helps us prevent fraud.",
    next: "left",
  },
  left: {
    title: "Take a photo of the left side of the vehicle",
    subtitle:
      "This shows us what condition it's in and helps us prevent fraud.",
    next: "right",
  },
  right: {
    title: "Take a photo of the right side of the vehicle",
    subtitle:
      "This shows us what condition it's in and helps us prevent fraud.",
    next: null,
  },
};

export default function VehiclePhotoCapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { step = "front" } = useParams();

  const config = STEP_CONFIG[step] || STEP_CONFIG.front;

  const handleOpenCamera = () => {
    navigate(`/customer/policies/photos/${step}/camera`, {
      state: location.state,
    });
  };

  return (
    <div
      style={{
        // This page is rendered inside Screen, which already adds top safe-area
        // spacing. Subtract it so the bottom action stays inside the viewport.
        minHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - 1rem)",
        background: "#0e0e12",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={20} color="#ffffff" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/customer/support")}
          aria-label="Help"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <HelpCircle size={18} color="#ffffff" />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px",
          marginTop: "-24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <ExampleCard variant="bad" imageSrc={exampleCarImage} />
          <ExampleCard variant="good" imageSrc={exampleCarImage} />
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 280,
            margin: 0,
          }}
        >
          {config.title}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#9497a1",
            textAlign: "center",
            marginTop: 12,
            maxWidth: 280,
            lineHeight: 1.5,
          }}
        >
          {config.subtitle}
        </p>
      </div>

      <div
        style={{
          padding:
            "0 24px max(32px, calc(env(safe-area-inset-bottom, 0px) + 16px)) 24px",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleOpenCamera}
          style={{
            width: "100%",
            padding: "16px",
            background: "#7c6bff",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
            Open camera
          </span>
        </button>
      </div>
    </div>
  );
}

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
          padding: 10, 
        }}
      >
        <img
          src={imageSrc}
          alt={
            isGood
              ? "Correctly framed vehicle example"
              : "Incorrectly framed vehicle example"
          }
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
      <span
        style={{
          ...base,
          top: 6,
          left: 6,
          borderRight: "none",
          borderBottom: "none",
          borderTopLeftRadius: 6,
        }}
      />
      <span
        style={{
          ...base,
          top: 6,
          right: 6,
          borderLeft: "none",
          borderBottom: "none",
          borderTopRightRadius: 6,
        }}
      />
      <span
        style={{
          ...base,
          bottom: 6,
          left: 6,
          borderRight: "none",
          borderTop: "none",
          borderBottomLeftRadius: 6,
        }}
      />
      <span
        style={{
          ...base,
          bottom: 6,
          right: 6,
          borderLeft: "none",
          borderTop: "none",
          borderBottomRightRadius: 6,
        }}
      />
    </>
  );
}
