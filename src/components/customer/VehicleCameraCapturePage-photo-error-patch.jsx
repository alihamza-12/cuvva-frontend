
import { useState } from "react"; 
import { ResultMessageView } from "./ResultMessagePage"; 

const [photoError, setPhotoError] = useState(null);

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

  const processingFailed = false; 

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
    navigate(`/customer/policies/photos/${config.next}`, { state: nextState });
  } else {
    navigate("/customer/policies/checkout", { state: nextState });
  }
};

{
  photoError && (
    <ResultMessageView
      result={photoError}
      onClose={() => setPhotoError(null)}
      onOk={() => setPhotoError(null)} 
    />
  );
}
