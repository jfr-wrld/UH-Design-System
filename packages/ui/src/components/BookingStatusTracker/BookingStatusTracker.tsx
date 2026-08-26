import { forwardRef, type ForwardedRef } from 'react';

import { formatCount } from '../../lib/units.js';
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
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M5.5 12.5l4 4L18.5 8"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 4.5l8 14H4z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path
        d="M12 10v3.5M12 16v.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
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
                <WarningIcon />
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

export const BookingStatusTracker = forwardRef(BookingStatusTrackerImpl);
BookingStatusTracker.displayName = 'BookingStatusTracker';
