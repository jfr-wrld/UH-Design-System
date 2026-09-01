import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type ForwardedRef,
  type KeyboardEvent,
} from 'react';

import { useControllableState } from '../../hooks/useControllableState.js';

export type OTPInputType = 'numeric' | 'alphanumeric';

export interface OTPInputProps {
  /** Names the group. Visible, and the accessible name of the box set. */
  label?: string | undefined;
  length?: number | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  /** Fired once when the last box fills. Re-arms only after the code breaks. */
  onComplete?: ((value: string) => void) | undefined;
  disabled?: boolean | undefined;
  /** Set by the consumer. This component never decides whether a code is right. */
  error?: boolean | undefined;
  errorMessage?: string | undefined;
  helperText?: string | undefined;
  autoFocus?: boolean | undefined;
  type?: OTPInputType | undefined;
  /** Accessible name of one box; override to localise. */
  boxLabel?: ((position: number, total: number) => string) | undefined;
  className?: string | undefined;
}

/*
 * What is allowed to survive typing or pasting. Case is deliberately left
 * alone for alphanumeric: upper-casing on the way in would silently break a
 * case-sensitive code, and normalising is the verifier's call, not the
 * field's.
 */
const ALLOWED: Record<OTPInputType, RegExp> = {
  numeric: /[^0-9]/g,
  alphanumeric: /[^0-9A-Za-z]/g,
};

function OTPInputImpl(props: OTPInputProps, ref: ForwardedRef<HTMLInputElement>) {
  const {
    label = 'Verification code',
    length = 6,
    value,
    defaultValue,
    onChange,
    onComplete,
    disabled = false,
    error = false,
    errorMessage,
    helperText,
    autoFocus = false,
    type = 'numeric',
    boxLabel,
    className,
  } = props;

  const reactId = useId();
  const labelId = `${reactId}-label`;
  const messageId = `${reactId}-message`;

  const clean = (raw: string) => raw.replace(ALLOWED[type], '').slice(0, length);

  const [code, setCode] = useControllableState<string>({
    value: value === undefined ? undefined : clean(value),
    defaultValue: clean(defaultValue ?? ''),
    onChange,
  });

  const boxes = useRef<Array<HTMLInputElement | null>>([]);
  /** The last code onComplete was told about, so a re-render cannot re-fire it. */
  const announced = useRef<string | null>(null);

  /*
   * Focus moves synchronously, in the same tick as the change that caused it,
   * which is one render too early to read `code`. A handler that consulted the
   * rendered value would still see the field as empty and send focus back to
   * the first box, so the code is mirrored here and updated the moment it is
   * committed. The effect below resyncs it afterwards, which matters in
   * controlled use: a parent is free to ignore or rewrite what it was handed,
   * and the mirror has to end up agreeing with what is actually on screen.
   */
  const live = useRef<string>(code);
  useEffect(() => {
    live.current = code;
  });

  const state = error || errorMessage ? 'error' : 'default';
  const message = errorMessage ?? helperText;
  const defaultBoxLabel = (position: number, total: number) =>
    type === 'numeric' ? `Digit ${position} of ${total}` : `Character ${position} of ${total}`;
  const nameBox = boxLabel ?? defaultBoxLabel;

  /*
   * autoFocus describes the first render, not a live instruction: a field that
   * grabbed focus again every time a parent flipped the prop would yank the
   * caret out from under someone mid-code.
   */
  const claimedFocus = useRef(false);
  useEffect(() => {
    if (claimedFocus.current) return;
    claimedFocus.current = true;
    if (autoFocus && !disabled) boxes.current[0]?.focus();
  }, [autoFocus, disabled]);

  function focusBox(index: number) {
    const target = boxes.current[Math.max(0, Math.min(index, length - 1))];
    target?.focus();
    /*
     * Selecting rather than placing a caret is what keeps a box holding one
     * character: the next keystroke replaces it, so `target.value` never
     * arrives here with two characters in it and a multi-character change can
     * be read unambiguously as autofill or paste.
     */
    target?.select();
  }

  function commit(next: string) {
    const settled = clean(next);
    live.current = settled;
    if (settled !== code) setCode(settled);

    if (settled.length < length) {
      announced.current = null;
      return settled;
    }
    if (announced.current !== settled) {
      announced.current = settled;
      onComplete?.(settled);
    }
    return settled;
  }

  /**
   * Writes a run of characters. A run at least `length` long is a whole code,
   * so it lands at the start whichever box it was dropped on; anything shorter
   * is the rest of a code and continues from where the caret is.
   */
  function fill(chars: string, from: number) {
    const held = live.current;
    const start = chars.length >= length ? 0 : Math.min(from, held.length);
    const next = commit(held.slice(0, start) + chars);
    focusBox(next.length);
  }

  function onBoxChange(index: number, raw: string) {
    const chars = raw.replace(ALLOWED[type], '');
    if (!chars) return;

    /*
     * SMS autofill on iOS and Android frequently drops the entire code into
     * whichever box is focused rather than distributing it, so a multi-
     * character change has to be treated as a fill. This is also why the boxes
     * carry no maxLength: capping them at one character would let the browser
     * truncate an autofilled code down to its first digit.
     */
    if (chars.length > 1) {
      fill(chars, index);
      return;
    }

    const held = live.current;
    const at = Math.min(index, held.length);
    commit(held.slice(0, at) + chars + held.slice(at + 1));
    focusBox(at + 1);
  }

  function onBoxKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    const held = live.current;
    switch (event.key) {
      case 'Backspace': {
        event.preventDefault();
        if (index < held.length) {
          commit(held.slice(0, index) + held.slice(index + 1));
          focusBox(index);
        } else if (held.length > 0) {
          commit(held.slice(0, held.length - 1));
          focusBox(held.length - 1);
        }
        return;
      }
      case 'Delete':
        event.preventDefault();
        if (index < held.length) commit(held.slice(0, index) + held.slice(index + 1));
        return;
      case 'ArrowLeft':
        event.preventDefault();
        focusBox(index - 1);
        return;
      case 'ArrowRight':
        event.preventDefault();
        focusBox(Math.min(index + 1, held.length));
        return;
      case 'Home':
        event.preventDefault();
        focusBox(0);
        return;
      case 'End':
        event.preventDefault();
        focusBox(held.length);
        return;
      default:
    }
  }

  function onBoxPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const chars = event.clipboardData.getData('text').replace(ALLOWED[type], '');
    if (chars) fill(chars, index);
  }

  return (
    <div
      className={['uh-otp', className].filter(Boolean).join(' ')}
      data-state={state}
      data-disabled={disabled ? 'true' : undefined}
    >
      <span className="uh-otp__label" id={labelId}>
        {label}
      </span>

      {/*
       * The description hangs off the group rather than off every box: a
       * screen reader reads a group's description once on entry, where six
       * copies of "that code is incorrect" would otherwise be read on the way
       * across the field. Urgency is carried by role="alert" instead.
       */}
      <div
        className="uh-otp__boxes"
        role="group"
        aria-labelledby={labelId}
        aria-describedby={message ? messageId : undefined}
      >
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              boxes.current[index] = element;
              if (index !== 0) return;
              if (typeof ref === 'function') ref(element);
              else if (ref) ref.current = element;
            }}
            className="uh-otp__box"
            type="text"
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            /*
             * On every box, not just the first: iOS offers the code to the
             * field that holds focus, and the pilgrim may well have tapped
             * box three.
             */
            autoComplete="one-time-code"
            autoCorrect="off"
            spellCheck={false}
            aria-label={nameBox(index + 1, length)}
            aria-invalid={state === 'error' || undefined}
            disabled={disabled}
            value={code[index] ?? ''}
            onFocus={() => {
              /*
               * A box past the end of the code cannot be typed into without
               * leaving a hole, and a hole cannot survive a round trip through
               * a controlled `value` string. Focus lands on the first empty box
               * instead, so what is on screen is always exactly `value`.
               */
              if (index > live.current.length) focusBox(live.current.length);
              else boxes.current[index]?.select();
            }}
            onChange={(event) => onBoxChange(index, event.target.value)}
            onKeyDown={(event) => onBoxKeyDown(index, event)}
            onPaste={(event) => onBoxPaste(index, event)}
          />
        ))}
      </div>

      {message ? (
        <p
          id={messageId}
          className="uh-otp__message"
          role={state === 'error' ? 'alert' : undefined}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export const OTPInput = /* @__PURE__ */ forwardRef(OTPInputImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  OTPInput.displayName = 'OTPInput';
}
