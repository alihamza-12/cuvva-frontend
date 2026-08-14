import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, HelpCircle, Zap, ZapOff, Camera } from "lucide-react";
import { ResultMessageView } from "./ResultMessagePage";

const STEP_CONFIG = {
  front: { label: "front", next: "back" },
  back: { label: "back", next: "left" },
  left: { label: "left side", next: "right" },
  right: { label: "right side", next: null },
};

export default function VehicleCameraCapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { step = "front" } = useParams();

  const registration = location.state?.vehicle?.registration || "LR06 NCE";

  const config = STEP_CONFIG[step] || STEP_CONFIG.front;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [flashOn, setFlashOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [photoError, setPhotoError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }, 
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError(
          "Could not access the camera. Please allow camera permissions and try again.",
        );
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleFlash = async () => {

    setFlashOn((prev) => !prev);

    const track = streamRef.current?.getVideoTracks?.()[0];
    if (track && typeof track.getCapabilities === "function") {
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        try {
          await track.applyConstraints({ advanced: [{ torch: !flashOn }] });
        } catch (err) {

        }
      }
    }
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    let capturedPhotoDataUrl = null;

    if (video && canvas && video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      capturedPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    }

    const processingFailed = true; 

    if (processingFailed) {
      setPhotoError({
        icon: "barrier",
        heading: "Sorry, we can't process that photo right now",
        paragraphs: [
          "Something went wrong on our end while checking your photo. This isn't something you did.",
          "Please try taking the photo again in a moment. If it keeps happening, chat to us and we'll help sort it out.",
        ],
        okLabel: "Try again after an hour",
      });
      return; 
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());

    const nextState = {
      ...location.state,
      capturedPhotos: {
        ...(location.state?.capturedPhotos || {}),
        [step]: capturedPhotoDataUrl,
      },
    };

    if (config.next) {
      navigate(`/customer/policies/photos/${config.next}`, {
        state: nextState,
      });
    } else {
      navigate("/customer/policies/checkout", { state: nextState });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >

      <div
        style={{
          position: "relative",
          flex: 1,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {cameraError && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center",
              background: "rgba(0,0,0,0.6)",
            }}
          >
            <p style={{ color: "#ffb4b4", fontSize: 14, lineHeight: 1.5 }}>
              {cameraError}
            </p>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
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
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color="#ffffff" />
          </button>

          <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>
            Vehicle photo
          </span>

          <button
            type="button"
            onClick={() => navigate("/customer/support")}
            aria-label="Help"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <HelpCircle size={18} color="#ffffff" />
          </button>
        </div>

        <button
          type="button"
          onClick={toggleFlash}
          aria-label="Toggle flash"
          style={{
            position: "absolute",
            top: 70,
            left: "50%",
            transform: "translateX(-50%)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#7c6bff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {flashOn ? (
            <Zap size={18} color="#ffffff" fill="#ffffff" />
          ) : (
            <Zap size={18} color="#ffffff" />
          )}
        </button>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            padding: "0 16px",
          }}
        >
          <CarOutline registration={registration} />
        </div>
      </div>

      <div
        style={{
          background: "#000",
          padding: "24px 24px 32px 24px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
          textAlign: "center",
        }}
      >
        <h1
          style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: 0 }}
        >
          Take a photo of the {config.label}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#c8c9d1",
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          Centre the vehicle in the frame. If it's dark, turn your flash on.
        </p>

        <button
          type="button"
          onClick={handleTakePhoto}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "16px",
            background: "#7c6bff",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Camera size={18} color="#ffffff" />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
            Take photo
          </span>
        </button>

        <button
          onClick={() => navigate("/customer/support")}
          type="button"
          style={{
            marginTop: 18,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            color: "#7c6bff",
          }}
        >
          Frequently asked questions
        </button>
      </div>

      {/* Photo processing error overlay — shown on top of this screen
          (camera keeps running underneath) instead of navigating away,
          so the customer can dismiss and immediately retry. */}
      {photoError && (
        <ResultMessageView
          result={photoError}
          onClose={() => setPhotoError(null)}
          onOk={() => setPhotoError(null)}
          onHelp={() => navigate("/customer/support")}
        />
      )}
    </div>
  );
}

/**
 * SVG outline of a front-facing car icon, traced pixel-by-pixel off a
 * grid overlay of the reference screenshot (original image is
 * 209x188, used directly as the SVG viewBox so proportions match
 * exactly). Shape: a rounded-arch roof on angled pillars that meet the
 * body via a small outward "shoulder" step, a wide flat-sided body,
 * rounded bottom corners, two circular wheels, and the registration
 * plate centered beneath the roof/between the wheels.
 */
function CarOutline({ registration }) {
  return (
    <svg
      viewBox="0 0 240 220"
      style={{ width: "100%", maxWidth: 340 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Continuous Outer Car Framework */}
      <path
        d="
          M 75 25 
          Q 120 20 165 25 
          Q 178 27 182 52 
          L 194 82
          Q 232 84 228 102
          Q 224 114 212 114
          L 212 185
          Q 212 198 195 198
          L 180 198
          Q 178 186 168 186
          L 72 186
          Q 62 186 60 198
          L 45 198
          Q 28 198 28 185
          L 28 114
          Q 16 114 12 102
          Q 8 84 46 82
          L 58 52
          Q 62 27 75 25 
          Z
        "
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Windshield Separator Base Line */}
      <path
        d="M 44 84 L 196 84"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Circular Headlights */}
      <circle
        cx="58"
        cy="122"
        r="14"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
      />
      <circle
        cx="182"
        cy="122"
        r="14"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
      />

      {/* Centered Vehicle Registration Frame */}
      <rect
        x="68"
        y="138"
        width="104"
        height="30"
        rx="4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.5"
      />

      {/* Registration Plate Content */}
      <text
        x="120"
        y="159"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="16"
        fontWeight="800"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="0.8"
      >
        {registration}
      </text>
    </svg>
  );
}
