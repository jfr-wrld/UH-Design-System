/** Every word the tracker can put on screen. */
export interface BookingStatusTrackerLabels {
  /** Names the whole figure: "Booking progress". */
  tracker: string;
  /**
   * The state words a screen reader hears per step. The check, the ring and
   * the warning triangle are drawn for eyes; these are the same facts in
   * words, because colour and shape are never the only signal.
   */
  completed: string;
  current: string;
  upcoming: string;
  error: string;
}

export const DEFAULT_LABELS: BookingStatusTrackerLabels = {
  tracker: 'Booking progress',
  completed: 'Completed',
  current: 'Current step',
  upcoming: 'Not started',
  error: 'Needs attention',
};

/**
 * The default journey, exported so a consumer can extend rather than retype.
 * Typed structurally (mirroring BookingStep, which lives in the component and
 * would be a circular import here) rather than `as const`: a narrowed literal
 * union would lose the optional fields and every `step.error` read would fail
 * to compile.
 */
export const DEFAULT_STEPS: ReadonlyArray<{
  label: string;
  description?: string | undefined;
  timestamp?: Date | undefined;
  error?: boolean | undefined;
}> = [
  { label: 'Booking' },
  { label: 'Payment' },
  { label: 'Documents' },
  { label: 'Ready to Depart' },
];
