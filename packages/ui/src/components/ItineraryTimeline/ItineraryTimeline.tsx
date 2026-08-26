import { forwardRef, useId, useState, type ForwardedRef } from 'react';

import { Badge } from '../Badge/Badge.js';
import { formatDateShort } from '../DatePicker/date.js';
import { formatCount } from '../../lib/units.js';
import { ActivityGlyph, type ActivityKind } from './icons.js';
import { DEFAULT_LABELS, type ItineraryTimelineLabels } from './labels.js';

export type ItineraryCity = 'Makkah' | 'Madinah' | 'Jeddah' | (string & {});

export interface ItineraryActivity {
  /** Picks the icon; the label carries the meaning. */
  type: ActivityKind;
  label: string;
  /** Already formatted by the consumer: prayer times are not clock arithmetic. */
  time?: string | undefined;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: Date | undefined;
  title: string;
  activities?: readonly ItineraryActivity[] | undefined;
  location?: ItineraryCity | undefined;
}

export interface ItineraryTimelineProps {
  days: readonly ItineraryDay[];
  locale?: string | undefined;
  /** Off, every day stands open and there is nothing to press. */
  collapsible?: boolean | undefined;
  labels?: Partial<ItineraryTimelineLabels> | undefined;
  className?: string | undefined;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ItineraryTimelineImpl(props: ItineraryTimelineProps, ref: ForwardedRef<HTMLOListElement>) {
  const { days, locale = 'en', collapsible = true, labels: labelOverrides, className } = props;

  const labels: ItineraryTimelineLabels = { ...DEFAULT_LABELS, ...labelOverrides };
  const reactId = useId();

  /* Day one open, the rest folded: the first day answers "how does this
     start", which is the question most readers arrive with. */
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));

  function toggle(index: number) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <ol
      ref={ref}
      className={['uh-itinerary', className].filter(Boolean).join(' ')}
      aria-label={labels.itinerary}
    >
      {days.map((day, index) => {
        const expanded = !collapsible || open.has(index);
        const bodyId = `${reactId}-day-${index}`;
        const heading = (
          <>
            <span className="uh-itinerary__day">
              {labels.day(formatCount(day.dayNumber, locale))}
            </span>
            <span className="uh-itinerary__title">{day.title}</span>
          </>
        );

        return (
          <li key={`${day.dayNumber}-${index}`} className="uh-itinerary__item">
            <span className="uh-itinerary__marker" aria-hidden="true" />

            <div className="uh-itinerary__head">
              {collapsible ? (
                <button
                  type="button"
                  className="uh-itinerary__toggle"
                  aria-expanded={expanded}
                  aria-controls={bodyId}
                  onClick={() => toggle(index)}
                >
                  {heading}
                  <span className="uh-itinerary__chevron" data-open={expanded ? 'true' : undefined}>
                    <ChevronIcon />
                  </span>
                </button>
              ) : (
                <span className="uh-itinerary__static-head">{heading}</span>
              )}

              <span className="uh-itinerary__context">
                {day.date ? (
                  <time className="uh-itinerary__date" dateTime={day.date.toISOString()}>
                    {formatDateShort(day.date, locale)}
                  </time>
                ) : null}
                {day.location ? (
                  <Badge variant="neutral" size="sm">
                    {day.location}
                  </Badge>
                ) : null}
              </span>
            </div>

            <div id={bodyId} className="uh-itinerary__body" hidden={!expanded}>
              {day.activities && day.activities.length > 0 ? (
                <ul className="uh-itinerary__activities">
                  {day.activities.map((activity, activityIndex) => (
                    <li
                      key={`${activity.label}-${activityIndex}`}
                      className="uh-itinerary__activity"
                    >
                      <span className="uh-itinerary__activity-icon" aria-hidden="true">
                        <ActivityGlyph kind={activity.type} />
                      </span>
                      <span className="uh-itinerary__activity-label">{activity.label}</span>
                      {activity.time ? (
                        <span className="uh-itinerary__activity-time">{activity.time}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export const ItineraryTimeline = forwardRef(ItineraryTimelineImpl);
ItineraryTimeline.displayName = 'ItineraryTimeline';
