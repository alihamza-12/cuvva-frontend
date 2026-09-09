import { useLayoutEffect, useRef } from "react";

/*
 * A drop-in replacement for a plain <input> that forces its VALUE to uppercase
 * (not just its appearance).
 *
 * The Tailwind `uppercase` class only changes how text is painted — React state
 * and the API request body keep the original lowercase characters. This
 * component transforms the value itself, so what the user sees, what is sent to
 * the server, and what is stored in MongoDB all match.
 *
 * Two behaviours worth knowing about:
 *
 *  1. `strip` mode (used for registrations) removes every character that is not
 *     A-Z or 0-9, mirroring `cleanRegistration()` in routes/vehicles.js. Typing
 *     "ab12 cde" produces "AB12CDE".
 *
 *  2. The caret is preserved. Rewriting the value on every keystroke normally
 *     throws the cursor to the end of the input, which makes editing the middle
 *     of an existing plate impossible. We record the intended caret offset
 *     during onChange and restore it in useLayoutEffect, before the browser
 *     paints, so there is no visible jump.
 */
export default function UppercaseInput({
  value = "",
  onChange,
  strip = false,
  className = "",
  ...rest
}) {
  const inputRef = useRef(null);
  const caretRef = useRef(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || caretRef.current === null) return;
    const position = Math.min(caretRef.current, input.value.length);
    // Only touch the selection while this input actually has focus, otherwise
    // we would steal the caret from whichever field the user moved on to.
    if (document.activeElement === input) {
      input.setSelectionRange(position, position);
    }
    caretRef.current = null;
  }, [value]);

  const handleChange = (event) => {
    const input = event.target;
    const rawValue = input.value;
    const selectionStart = input.selectionStart ?? rawValue.length;

    const nextValue = strip
      ? rawValue.toUpperCase().replace(/[^A-Z0-9]/g, "")
      : rawValue.toUpperCase();

    // Work out where the caret should sit once characters have been removed.
    if (strip) {
      const removedBeforeCaret =
        rawValue.slice(0, selectionStart).length -
        rawValue.slice(0, selectionStart).toUpperCase().replace(/[^A-Z0-9]/g, "")
          .length;
      caretRef.current = selectionStart - removedBeforeCaret;
    } else {
      caretRef.current = selectionStart;
    }

    if (onChange) {
      // Hand back an event-shaped object so existing `event.target.value`
      // handlers keep working unchanged.
      onChange({
        ...event,
        target: { ...input, name: input.name, value: nextValue },
        currentTarget: { ...input, name: input.name, value: nextValue },
      });
    }
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      value={value ?? ""}
      onChange={handleChange}
      className={className}
    />
  );
}
