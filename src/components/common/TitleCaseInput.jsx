import { useLayoutEffect, useRef } from "react";
import { toTitleCaseLive } from "../../utils/titleCase";

/*
 * A drop-in replacement for a plain <input> that forces its VALUE to Title Case
 * as the admin types ("jane doe" shows and stores as "Jane Doe").
 *
 * Sibling of UppercaseInput, which does the same job for codes that must be
 * uppercase (postcode, driving licence).
 *
 * Notes:
 *
 *  1. Only the casing changes — spaces, punctuation and therefore the length of
 *     the string stay exactly as typed, so the caret offset is preserved and
 *     the user can keep typing the second word of a name.
 *
 *  2. The caret is restored in useLayoutEffect, before the browser paints, so
 *     editing the middle of an existing value does not jump to the end.
 */
export default function TitleCaseInput({
  value = "",
  onChange,
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

    const nextValue = toTitleCaseLive(rawValue);
    caretRef.current = selectionStart;

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
