
const CLOUDINARY_CLOUD_NAME = "qemxs20s";
const CLOUDINARY_UPLOAD_PRESET = "cuvva_profile_photos";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; 
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadToCloudinary(file) {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Please choose a JPG, PNG, or WEBP image.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image must be smaller than 5MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  let response;
  try {
    response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });
  } catch {

    throw new Error("Couldn't reach the image server. Check your connection and try again.");
  }

  if (!response.ok) {

    let message = "Upload failed. Please try again.";
    try {
      const errorBody = await response.json();
      if (errorBody?.error?.message) message = errorBody.error.message;
    } catch {

    }
    throw new Error(message);
  }

  const result = await response.json();
  if (!result?.secure_url) {
    throw new Error("Upload succeeded but no image URL was returned.");
  }

  return result.secure_url;
}
