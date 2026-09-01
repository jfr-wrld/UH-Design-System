import { useId } from 'react';

import { NumberStepper, type NumberStepperSize } from './NumberStepper.js';
import { useControllableState } from '../../hooks/useControllableState.js';

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface PassengerStepperProps {
  legend?: string;
  value?: PassengerCounts;
  defaultValue?: PassengerCounts;
  onChange?: (value: PassengerCounts) => void;
  size?: NumberStepperSize;
  disabled?: boolean;
  /** Every visible string, so the whole block can be localised in one place. */
  labels?: {
    adults: string;
    children: string;
    infants: string;
    adultsDescription?: string;
    childrenDescription?: string;
    infantsDescription?: string;
    /** Shown once infants have reached the number of adults. */
    infantLimitReached: string;
    /** Shown when infants exceed adults, which only happens by lowering adults. */
    infantsExceedAdults: (counts: PassengerCounts) => string;
  };
  className?: string | undefined;
}

const DEFAULT_LABELS: Required<
  Pick<
    NonNullable<PassengerStepperProps['labels']>,
    'adults' | 'children' | 'infants' | 'infantLimitReached' | 'infantsExceedAdults'
  >
> = {
  adults: 'Adults',
  children: 'Children',
  infants: 'Infants',
  infantLimitReached: 'One infant per adult, so this is the most you can add.',
  infantsExceedAdults: ({ adults, infants }) =>
    `${infants} infants need ${infants} adults, and there ${adults === 1 ? 'is' : 'are'} ${adults}. Add an adult or remove an infant.`,
};

/**
 * Three steppers with one rule between them: an infant travels on an adult's
 * lap, so infants may not outnumber adults.
 *
 * The rule is surfaced, never silently applied. Lowering the adult count below
 * the infant count leaves both numbers exactly as the person set them and
 * explains the conflict; quietly deleting an infant someone had entered would
 * be a worse outcome than an honest error, because they would not find out
 * until the itinerary arrived.
 *
 * Deciding whether the whole form may be submitted stays with the consumer.
 */
export function PassengerStepper({
  legend = 'Pilgrims',
  value,
  defaultValue,
  onChange,
  size = 'md',
  disabled = false,
  labels,
  className,
}: PassengerStepperProps) {
  const reactId = useId();
  const copy = { ...DEFAULT_LABELS, ...labels };

  const [counts, setCounts] = useControllableState<PassengerCounts>({
    value,
    defaultValue: defaultValue ?? { adults: 1, children: 0, infants: 0 },
    onChange,
  });

  const set = (key: keyof PassengerCounts) => (next: number) =>
    setCounts({ ...counts, [key]: next });

  const atInfantLimit = counts.infants > 0 && counts.infants === counts.adults;
  const infantsExceedAdults = counts.infants > counts.adults;

  return (
    <fieldset
      className={['uh-passengers', className].filter(Boolean).join(' ')}
      disabled={disabled}
      aria-describedby={`${reactId}-summary`}
    >
      <legend className="uh-passengers__legend">{legend}</legend>

      {/*
       * A running total, so the number that actually matters is announced when
       * any of the three changes rather than being left for the reader to add up.
       */}
      <span id={`${reactId}-summary`} className="uh-sr-only" role="status">
        {counts.adults + counts.children + counts.infants} travelling in total
      </span>

      <div className="uh-passengers__row">
        <NumberStepper
          label={copy.adults}
          {...(copy.adultsDescription ? { description: copy.adultsDescription } : {})}
          value={counts.adults}
          onChange={set('adults')}
          min={1}
          size={size}
        />
      </div>

      <div className="uh-passengers__row">
        <NumberStepper
          label={copy.children}
          {...(copy.childrenDescription ? { description: copy.childrenDescription } : {})}
          value={counts.children}
          onChange={set('children')}
          min={0}
          size={size}
        />
      </div>

      <div className="uh-passengers__row">
        <NumberStepper
          label={copy.infants}
          {...(copy.infantsDescription ? { description: copy.infantsDescription } : {})}
          value={counts.infants}
          onChange={set('infants')}
          min={0}
          /*
           * Caps the plus button and aria-valuemax. It does not retroactively
           * rewrite the value: NumberStepper only clamps on its own blur and
           * button presses, so lowering adults leaves infants where they are and
           * the error below explains why.
           */
          max={counts.adults}
          size={size}
          error={infantsExceedAdults}
          {...(infantsExceedAdults
            ? { errorMessage: copy.infantsExceedAdults(counts) }
            : atInfantLimit
              ? { helperText: copy.infantLimitReached }
              : {})}
        />
      </div>
    </fieldset>
  );
}

/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  PassengerStepper.displayName = 'PassengerStepper';
}
