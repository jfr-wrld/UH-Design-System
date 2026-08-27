import type { Meta, StoryObj } from '@storybook/react';

import { PriceDisplay, ItineraryTimeline } from '@umrahhaji/ui';

import { Page, Section } from './shared.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';

const meta = {
  title: 'Foundations/RTL & Bidirectional',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const LogicalProperties: Story = {
  render: () => (
    <Page>
      <Section
        title="Purpose"
        hint="The product ships in three LTR languages, but Arabic content runs through all of them and an Arabic UI locale is a switch away, not a rewrite: every stylesheet in the package is written in logical properties - inline-start, block-end, margin-inline - so direction is data, not CSS. The demo below is the real ItineraryTimeline under dir=rtl: the line, the markers and the times all change sides with no component code involved."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--uh-spacing-24)',
            maxWidth: '820px',
          }}
        >
          {(['ltr', 'rtl'] as const).map((dir) => (
            <div key={dir} dir={dir}>
              <div
                className="uh-type-web-overline"
                style={{
                  color: 'var(--uh-color-text-tertiary)',
                  marginBlockEnd: 'var(--uh-spacing-8)',
                }}
              >
                dir="{dir}"
              </div>
              <ItineraryTimeline
                locale="en-MY"
                days={[
                  {
                    dayNumber: 1,
                    date: new Date(2026, 2, 15),
                    title: 'Arrival in Madinah',
                    location: 'Madinah',
                    activities: [
                      { type: 'flight', label: 'KUL to MED, direct', time: '08:30' },
                      { type: 'ibadah', label: 'Maghrib at Masjid Nabawi' },
                    ],
                  },
                ]}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Numbers stay numbers"
        hint="Prices and times are LTR runs even inside RTL context; tabular figures and the Intl formatters already behave, because a formatted number is a single directional run."
      >
        <div dir="rtl" style={{ maxWidth: '300px' }}>
          <PriceDisplay
            amount={12500}
            originalAmount={15000}
            currency="MYR"
            locale="en-MY"
            showPerPax
          />
        </div>
      </Section>

      <Section
        title="Bidirectional content inside LTR"
        hint="The everyday case is Arabic inside Malay: a du'a in a review, a mosque name in an itinerary. Wrap the opposite-direction run in <bdi> (or dir=auto on the element) so punctuation and neighbouring numbers do not jump."
      >
        <DoDont>
          <Do title="isolate the Arabic run with <bdi>.">
            <p className="uh-type-web-body-s" style={{ margin: 0 }}>
              Selepas solat, baca{' '}
              <bdi lang="ar" className="uh-type-arabic-md">
                اللهم بارك لنا
              </bdi>{' '}
              sebanyak 3 kali.
            </p>
          </Do>
          <Dont title="drop raw Arabic mid-sentence and hope; the trailing number attaches to the wrong side.">
            <p className="uh-type-web-body-s" style={{ margin: 0 }}>
              Selepas solat, baca{' '}
              <span lang="ar" className="uh-type-arabic-md">
                اللهم بارك لنا
              </span>{' '}
              sebanyak 3 kali.
            </p>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Implementation">
        <Code>{`
/* Logical, everywhere - never left/right: */
.uh-itinerary__item { padding-inline-start: var(--uh-spacing-32); }
.uh-tracker__step + .uh-tracker__step::before { inset-inline-start: …; }

/* Mixed-direction content: */
<bdi lang="ar" className="uh-type-arabic-md">…</bdi>
        `}</Code>
      </Section>

      <A11ySection
        items={[
          'lang="ar" on every Arabic run, so screen readers switch voices; the portal layer copies lang across, like data-theme.',
          'Directional icons (chevrons, back arrows) flip via logical positioning or transform under [dir=rtl] - never by swapping glyph meaning.',
          'Keyboard order follows DOM order, which is unchanged by direction.',
        ]}
      />
    </Page>
  ),
};
