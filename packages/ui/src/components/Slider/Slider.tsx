import { Slider as BaseSlider } from '@base-ui/react/slider';

import { useControllableState } from '../../hooks/useControllableState.js';

export type SliderValueDisplay = 'none' | 'text' | 'tooltip';

export interface SliderProps<Value extends number | readonly number[] = number> {
  /** A single number for one thumb, or an array (`[min, max]`) for a range
      slider with one thumb per entry. Whichever shape the caller passes
      first (`value` if controlled, else `defaultValue`) fixes how many
      thumbs render - see the component doc comment for why this can't
      change after mount. */
  value?: Value | undefined;
  defaultValue?: Value | undefined;
  onChange?: ((value: Value) => void) | undefined;
  /** @default 0 */
  min?: number | undefined;
  /** @default 100 */
  max?: number | undefined;
  /** @default 1 */
  step?: number | undefined;
  disabled?: boolean | undefined;
  /** Accessible name. Required: a slider with no label says nothing on its
      own to a screen reader user. */
  label: string;
  /** Shows `label` above the track; otherwise it is still the accessible
      name, just not painted (matches ProgressBar's `showLabel`). */
  showLabel?: boolean | undefined;
  /** `'text'` prints the current value(s) under the track, always visible -
      good for a value that matters even before anyone touches the slider.
      `'tooltip'` shows the same text in a small pill above the active thumb,
      only while hovering, dragging, or focused - good when the number is
      only useful mid-interaction and would otherwise just be clutter.
      @default 'none' */
  valueDisplay?: SliderValueDisplay | undefined;
  /** Drives the printed value format. Never derived from the browser. */
  locale?: string | undefined;
  className?: string | undefined;
}

/**
 * `@base-ui/react` (a peer dependency, never bundled into this package - see
 * the `external` comment in vite.config.ts) owns every mechanic: dragging,
 * keyboard stepping, clamping, and - for a range slider - keeping the two
 * thumbs from crossing. This file only supplies the token-driven track,
 * indicator, and thumb it renders, plus a thin controllable-value wrapper so
 * the printed `valueDisplay` text stays live under both controlled and
 * uncontrolled use.
 *
 * Single vs. range is decided once, from the shape of whichever of `value`
 * or `defaultValue` is passed first, and stays fixed for the component's
 * lifetime - Base UI's own docs call this out as a server-rendering
 * requirement for multi-thumb sliders (each `Slider.Thumb` needs a stable
 * `index` before the first paint), so switching an already-mounted slider
 * from a number to an array is not supported here either.
 */
export function Slider<Value extends number | readonly number[] = number>(
  props: SliderProps<Value>,
) {
  const {
    value,
    defaultValue,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    label,
    showLabel = false,
    valueDisplay = 'none',
    locale,
    className,
  } = props;

  const resolvedDefault = (defaultValue ?? (min as unknown as Value)) as Value;
  const [current, setCurrent] = useControllableState<Value>({
    value,
    defaultValue: resolvedDefault,
    onChange,
  });

  const thumbCount = Array.isArray(current) ? current.length : 1;

  return (
    <BaseSlider.Root
      className={['uh-slider', className].filter(Boolean).join(' ')}
      value={current}
      onValueChange={(next) => setCurrent(next as Value)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      locale={locale}
    >
      {/*
       * aria-disabled, not just the data-disabled Base UI already stamps on
       * its own: axe's color-contrast check has no way to know
       * `--uh-opacity-disabled` is an intentional, documented exemption
       * (see the token's own description) without a state ARIA already
       * recognises - a bare data attribute leaves it reading the label's
       * opacity-dimmed text as a genuine contrast failure.
       */}
      <BaseSlider.Label
        className={showLabel ? 'uh-slider__label' : 'uh-sr-only'}
        aria-disabled={disabled || undefined}
      >
        {label}
      </BaseSlider.Label>

      <BaseSlider.Control className="uh-slider__control">
        <BaseSlider.Track className="uh-slider__track">
          <BaseSlider.Indicator className="uh-slider__indicator" />
          {Array.from({ length: thumbCount }, (_, index) => (
            <BaseSlider.Thumb
              key={index}
              index={thumbCount > 1 ? index : undefined}
              className="uh-slider__thumb"
            />
          ))}
        </BaseSlider.Track>
        {valueDisplay === 'tooltip' ? (
          <BaseSlider.Value className="uh-slider__value" data-display="tooltip" />
        ) : null}
      </BaseSlider.Control>

      {valueDisplay === 'text' ? (
        <BaseSlider.Value className="uh-slider__value" data-display="text" />
      ) : null}
    </BaseSlider.Root>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Slider.displayName = 'Slider';
}
