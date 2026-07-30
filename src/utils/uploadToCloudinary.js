/**
 * frontend/src/utils/uploadToCloudinary.js
 *
 * Direct-from-browser upload to Cloudinary using an UNSIGNED upload
 * preset — the browser talks straight to Cloudinary's API, never to
 * our own backend, for the actual image bytes. Our backend only ever
 * sees the resulting URL string afterwards (via PATCH /customers/me).
 *
 * Cloud name + upload preset used here are both PUBLIC, safe-to-expose
 * values (this is exactly what unsigned presets are for) — there is
 * no API secret anywhere in this file, and there must never be one in
 * frontend code.
 *
 *   Cloud name:     qemxs20s
 *   Upload preset:  cuvva_profile_photos  (Signing mode: Unsigned,
 *                   Asset folder: profile-photos)
 *
 * If you ever rotate/rename the preset or move to a different
 * Cloudinary account, this is the ONLY file that needs updating.
 */
const CLOUDINARY_CLOUD_NAME = "qemxs20s";
const CLOUDINARY_UPLOAD_PRESET = "cuvva_profile_photos";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Matches the backend's PATCH /customers/me validation exactly
// (profilePhotoUrl must start with this) — keep these two checks in
// sync if either side ever changes.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Uploads a single image File to Cloudinary and resolves with the
 * permanent HTTPS URL (Cloudinary's `secure_url`), or throws an Error
 * with a user-friendly message on failure.
 *
 * @param {File} file - the File object selected via <input type="file">
 * @returns {Promise<string>} the secure_url of the uploaded image
 */
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
    // Network failure (offline, DNS, etc.) — fetch() itself threw.
    throw new Error("Couldn't reach the image server. Check your connection and try again.");
  }

  if (!response.ok) {
    // Cloudinary returns { error: { message } } on failure.
    let message = "Upload failed. Please try again.";
    try {
      const errorBody = await response.json();
      if (errorBody?.error?.message) message = errorBody.error.message;
    } catch {
      // response wasn't JSON — keep the generic message above.
    }
    throw new Error(message);
  }

  const result = await response.json();
  if (!result?.secure_url) {
    throw new Error("Upload succeeded but no image URL was returned.");
  }

  return result.secure_url;
}
