import { forwardRef, type ForwardedRef } from 'react';
import { Check } from '@tailgrids/icons';

import { formatCount } from '../../lib/units.js';
import { StatusIcon } from '../../lib/icons.js';
import { DEFAULT_LABELS, DEFAULT_STEPS, type BookingStatusTrackerLabels } from './labels.js';

export type TrackerVariant = 'horizontal' | 'vertical';
export type StepState = 'completed' | 'current' | 'upcoming' | 'error';

export interface BookingStep {
  label: string;
  description?: string | undefined;
  /** When the step happened. Shown formatted through Intl; usually on completed steps. */
  timestamp?: Date | undefined;
  /**
   * Marks the step as needing attention wherever it sits: a failed payment is
   * the current step gone wrong, rejected documents a completed one reopened.
   */
  error?: boolean | undefined;
}

export interface BookingStatusTrackerProps {
  /** Defaults to the four-step journey; pass translated labels to localise. */
  steps?: readonly BookingStep[] | undefined;
  /** Index into `steps`. Everything before it is done, everything after is not. */
  currentStep: number;
  variant?: TrackerVariant | undefined;
  locale?: string | undefined;
  labels?: Partial<BookingStatusTrackerLabels> | undefined;
  className?: string | undefined;
}

function CheckIcon() {
  return <Check aria-hidden="true" focusable="false" />;
}

/** "15 Mar, 14:32". Cached per locale, like the date module's formatters. */
const stampCache = new Map<string, Intl.DateTimeFormat>();
function formatStamp(date: Date, locale: string): string {
  let found = stampCache.get(locale);
  if (!found) {
    found = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
    stampCache.set(locale, found);
  }
  return found.format(date);
}

function BookingStatusTrackerImpl(
  props: BookingStatusTrackerProps,
  ref: ForwardedRef<HTMLOListElement>,
) {
  const {
    steps = DEFAULT_STEPS,
    currentStep,
    variant = 'horizontal',
    locale = 'en',
    labels: labelOverrides,
    className,
  } = props;

  const labels: BookingStatusTrackerLabels = { ...DEFAULT_LABELS, ...labelOverrides };

  const stateOf = (index: number): StepState => {
    if (steps[index]?.error) return 'error';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <ol
      ref={ref}
      className={['uh-tracker', className].filter(Boolean).join(' ')}
      data-variant={variant}
      aria-label={labels.tracker}
    >
      {steps.map((step, index) => {
        const state = stateOf(index);
        return (
          <li
            key={`${step.label}-${index}`}
            className="uh-tracker__step"
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className="uh-tracker__marker" aria-hidden="true">
              {state === 'completed' ? (
                <CheckIcon />
              ) : state === 'error' ? (
                <StatusIcon variant="warning" />
              ) : (
                <span className="uh-tracker__number">{formatCount(index + 1, locale)}</span>
              )}
            </span>

            <span className="uh-tracker__body">
              <span className="uh-tracker__label">
                {step.label}
                {/* The drawn state, said in words. */}
                <span className="uh-sr-only">, {labels[state]}</span>
              </span>
              {step.description ? (
                <span className="uh-tracker__description">{step.description}</span>
              ) : null}
              {step.timestamp ? (
                <time className="uh-tracker__stamp" dateTime={step.timestamp.toISOString()}>
                  {formatStamp(step.timestamp, locale)}
                </time>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export const BookingStatusTracker = /* @__PURE__ */ forwardRef(BookingStatusTrackerImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  BookingStatusTracker.displayName = 'BookingStatusTracker';
}
