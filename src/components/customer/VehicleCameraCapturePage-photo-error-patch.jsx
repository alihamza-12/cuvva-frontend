/**
 * PATCH for VehicleCameraCapturePage.jsx — shows the new error result
 * screen when "Take photo" processing fails, instead of always
 * succeeding silently. You said not to touch that file's existing
 * code, so this is presented separately for you to apply yourself
 * wherever it fits your judgment.
 *
 * 1. Add these two imports at the top:
 */
import { useState } from "react"; // (already imported alongside useEffect/useRef in your file)
import { ResultMessageView } from "./ResultMessagePage"; // adjust path to match your folder

/**
 * 2. Add this state near your other useState calls:
 */
const [photoError, setPhotoError] = useState(null);

/**
 * 3. Replace your handleTakePhoto with this version — it simulates a
 *    processing step and can fail, showing the error overlay instead
 *    of silently advancing. Swap the `simulateProcessingFailure()` call
 *    for your REAL upload/processing call once you have one.
 */
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

  // --- Simulated processing step ---
  // Replace this block with your real upload/validation call, e.g.:
  //   const result = await uploadVehiclePhoto(capturedPhotoDataUrl, step);
  //   if (!result.success) { setPhotoError(...); return; }
  const processingFailed = false; // <- wire this to your real check

  if (processingFailed) {
    setPhotoError({
      icon: "server-error",
      heading: "Sorry, we can't process that photo right now",
      paragraphs: [
        "Something went wrong on our end while checking your photo. This isn't something you did.",
        "Please try taking the photo again in a moment. If it keeps happening, chat to us and we'll help sort it out.",
      ],
      okLabel: "Try again",
    });
    return; // don't stop the camera or advance — let them retry
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
    navigate(`/customer/policies/photos/${config.next}`, { state: nextState });
  } else {
    navigate("/customer/policies/checkout", { state: nextState });
  }
};

/**
 * 4. Render the overlay at the very end of your component's return,
 *    right before the final closing </div>:
 */
{
  photoError && (
    <ResultMessageView
      result={photoError}
      onClose={() => setPhotoError(null)}
      onOk={() => setPhotoError(null)} // "Try again" just dismisses, camera is still live underneath
    />
  );
}
