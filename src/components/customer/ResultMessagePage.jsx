import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, HelpCircle } from "lucide-react";

const ICONS = {
  barrier: BarrierIcon,
  "server-error": ServerErrorIcon,
  warning: WarningIcon,
};

const DEFAULT_RESULT = {
  icon: "server-error",
  heading: "Sorry, something went wrong",
  paragraphs: [
    "We couldn't process that right now. Please try again in a moment.",
    "If this keeps happening, chat to us and we'll help sort it out.",
  ],
  okLabel: "OK",
  okTo: "/customer",
};

export default function ResultMessagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state || DEFAULT_RESULT;

  const handleOk = () => {
    navigate(result.okTo || "/customer");
  };

  return (
    <ResultMessageView
      result={result}
      onClose={() => navigate(-1)}
      onOk={handleOk}
      onHelp={() => navigate("/customer/support")}
    />
  );
}

export function ResultMessageView({
  result = DEFAULT_RESULT,
  onClose,
  onOk,
  onHelp,
}) {
  const Icon = ICONS[result.icon] || ServerErrorIcon;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "#0e0e12",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={18} color="#ffffff" />
        </button>
        <button
          type="button"
          onClick={onHelp}
          aria-label="Help"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
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
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <Icon />
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {result.heading}
        </h1>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 340,
          }}
        >
          {result.paragraphs?.map((p, i) => (
            <p
              key={i}
              style={{
                fontSize: 15,
                color: "#9497a1",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 24px 40px 24px" }}>
        <button
          type="button"
          onClick={onOk || onClose}
          style={{
            width: "100%",
            padding: 16,
            background: "#7c6bff",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
            {result.okLabel || "OK"}
          </span>
        </button>
      </div>
    </div>
  );
}

export function BarrierIcon() {
  return (
    <svg width="130" height="115" viewBox="0 0 200 170" fill="none">
      
      <path d="M 110 152 L 110 162 L 150 162 L 150 152 Z" fill="#c9cbe0" />
      <path d="M 134 152 L 134 162 L 150 162 L 150 152 Z" fill="#9ea1c4" />

      <rect x="114" y="55" width="36" height="97" fill="#dfe1f0" />
      <rect x="134" y="55" width="16" height="97" fill="#a7aad0" />

      <g transform="rotate(-9 132 68)">
        <rect x="10" y="58" width="132" height="22" rx="11" fill="#f2994a" />
        <clipPath id="barrierArmClip">
          <rect x="10" y="58" width="132" height="22" rx="11" />
        </clipPath>
        <g clipPath="url(#barrierArmClip)">
          <rect
            x="10"
            y="50"
            width="16"
            height="38"
            transform="skewX(-28)"
            fill="#ffcc33"
          />
          <rect
            x="46"
            y="50"
            width="16"
            height="38"
            transform="skewX(-28)"
            fill="#ffcc33"
          />
          <rect
            x="82"
            y="50"
            width="16"
            height="38"
            transform="skewX(-28)"
            fill="#ffcc33"
          />
          <rect
            x="118"
            y="50"
            width="16"
            height="38"
            transform="skewX(-28)"
            fill="#ffcc33"
          />
        </g>
        
        <rect x="120" y="58" width="26" height="22" rx="11" fill="#f4f5fa" />
      </g>

      <rect x="104" y="14" width="56" height="44" rx="10" fill="#e6e8f5" />
      <rect x="134" y="14" width="26" height="44" rx="10" fill="#b3b6d9" />

      <path
        d="M 118 32 q6 -8 12 0"
        stroke="#15151a"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 136 32 q6 -8 12 0"
        stroke="#15151a"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function ServerErrorIcon() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
      <rect
        x="25"
        y="20"
        width="60"
        height="70"
        rx="10"
        fill="#1c1d24"
        stroke="#3a3b45"
        strokeWidth="2"
      />
      <rect x="35" y="34" width="40" height="8" rx="4" fill="#3a3b45" />
      <rect x="35" y="50" width="40" height="8" rx="4" fill="#3a3b45" />
      <circle cx="55" cy="72" r="14" fill="#ff4d5e" />
      <path
        d="M50 67 L60 77 M60 67 L50 77"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
      <path d="M55 15 L95 85 L15 85 Z" fill="#f2994a" />
      <rect x="51" y="42" width="8" height="24" rx="4" fill="#0e0e12" />
      <circle cx="55" cy="74" r="4.5" fill="#0e0e12" />
    </svg>
  );
}
