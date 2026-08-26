import type { ReactNode } from 'react';

export interface ChoiceFieldProps {
  /** Drives the box shape only; the semantics come from the input itself. */
  shape: 'checkbox' | 'radio';
  controlId: string;
  label: string;
  description?: string | undefined;
  descriptionId?: string | undefined;
  disabled?: boolean;
  error?: boolean;
  className?: string | undefined;
  /** The real <input>, rendered by the caller so it keeps its own ref and props. */
  input: ReactNode;
  /** Tick, dash or dot. Purely visual - the input carries the state. */
  glyph: ReactNode;
}

/**
 * The row shared by Checkbox and Radio: hit area, box, label, description.
 *
 * Both controls have the same anatomy and the same failure modes, so they share
 * one shell rather than two that drift. The input is passed in rather than
 * built here, so each component keeps its own ref, props and state handling.
 */
export function ChoiceField({
  shape,
  controlId,
  label,
  description,
  descriptionId,
  disabled = false,
  error = false,
  className,
  input,
  glyph,
}: ChoiceFieldProps) {
  return (
    <div
      className={['uh-choice', className].filter(Boolean).join(' ')}
      data-shape={shape}
      data-disabled={disabled ? 'true' : undefined}
      data-error={error ? 'true' : undefined}
    >
      <span className="uh-choice__control">
        {input}
        {/*
         * The box is decorative: it mirrors the input's state through CSS
         * sibling selectors, so assistive tech reads the input and never this.
         */}
        <span className="uh-choice__box" aria-hidden="true">
          {glyph}
        </span>
      </span>

      <span className="uh-choice__text">
        <label className="uh-choice__label" htmlFor={controlId}>
          {label}
        </label>
        {description ? (
          <span className="uh-choice__description" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );
}
