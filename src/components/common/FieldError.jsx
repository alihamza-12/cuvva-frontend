/*
 * Inline, per-field validation message.
 *
 * Rendered directly under the input it belongs to so an admin can see exactly
 * which field is wrong instead of only getting a banner at the top of the form.
 * Renders nothing when there is no message, so it is safe to always mount.
 */
export default function FieldError({ message, className = "" }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={`mt-1.5 text-[10px] font-medium leading-snug text-red-400 ${className}`}
    >
      {message}
    </p>
  );
}
