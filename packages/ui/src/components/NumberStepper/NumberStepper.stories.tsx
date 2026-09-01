import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { NumberStepper, type NumberStepperSize } from './NumberStepper.js';
import { PassengerStepper, type PassengerCounts } from './PassengerStepper.js';

const SIZES: NumberStepperSize[] = ['sm', 'md'];

const STATES = [
  { key: 'default', label: 'Default', props: { defaultValue: 2 } },
  { key: 'at-min', label: 'At min, minus disabled', props: { defaultValue: 1 } },
  { key: 'at-max', label: 'At max, plus disabled', props: { defaultValue: 9 } },
  { key: 'hover', label: 'Hover', props: { defaultValue: 2 }, pseudo: 'pseudo-hover-all' },
  {
    key: 'focus',
    label: 'Focus',
    props: { defaultValue: 2 },
    pseudo: 'pseudo-focus-visible-all',
  },
  { key: 'disabled', label: 'Disabled', props: { defaultValue: 2, disabled: true } },
  {
    key: 'error',
    label: 'Error',
    props: { defaultValue: 9, error: true, errorMessage: 'This package seats eight' },
  },
] as const;

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/NumberStepper',
  component: NumberStepper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A text input with role="spinbutton" rather than input[type=number], which accepts ' +
          '"e", "+" and "-", reports an empty string for anything it deems invalid, and ' +
          'changes on scroll wheel. The value is tabular, so the buttons do not shift as the ' +
          'count crosses 9. Validation belongs to the consumer: this takes `error` and ' +
          '`errorMessage` and never decides anything itself.',
      },
    },
  },
  args: { label: 'Adults' },
} satisfies Meta<typeof NumberStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateMatrix: Story = {
  render: () => (
    <Page>
      {SIZES.map((size) => (
        <section key={size} style={{ marginBottom: 'var(--uh-spacing-40)' }}>
          <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
            size = {size}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
              gap: 'var(--uh-spacing-24)',
            }}
          >
            {STATES.map((state) => (
              <div key={`${size}-${state.key}`}>
                <Caption>{state.label}</Caption>
                <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
                  <NumberStepper
                    label="Adults"
                    size={size}
                    min={1}
                    max={9}
                    className={'pseudo' in state ? state.pseudo : undefined}
                    {...state.props}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </Page>
  ),
};

export const TypingAndClamping: Story = {
  render: () => {
    function Watched() {
      const [n, setN] = useState(2);
      return (
        <div style={{ display: 'grid', gap: 'var(--uh-spacing-12)', maxWidth: '20rem' }}>
          <NumberStepper
            label="Adults"
            description="Age 12 and above"
            value={n}
            onChange={setN}
            min={1}
            max={9}
          />
          <div className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
            onChange last saw: <span className="uh-type-numeric-table">{n}</span>
          </div>
        </div>
      );
    }
    return (
      <Page>
        <Watched />
        <p
          className="uh-type-web-body-s uh-measure"
          style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-24)' }}
        >
          Type <code>25</code> into the field. It stays as typed while the caret is in there,
          because clamping mid-keystroke would fight whoever is typing 2 on the way to 25. It
          settles to 9 on blur or Enter. A value already in range is emitted as it is typed.
        </p>
      </Page>
    );
  },
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
          gap: 'var(--uh-spacing-24)',
        }}
      >
        {STATES.map((state) => (
          <div key={state.key}>
            <Caption>{state.label}</Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <NumberStepper
                label="Adults"
                min={1}
                max={9}
                className={'pseudo' in state ? state.pseudo : undefined}
                {...state.props}
              />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* ------------------------------------------------------------- passengers */

export const Passengers: Story = {
  render: () => {
    function Live() {
      const [counts, setCounts] = useState<PassengerCounts>({ adults: 2, children: 1, infants: 1 });
      return (
        <div style={{ display: 'grid', gap: 'var(--uh-spacing-20)', maxWidth: '26rem' }}>
          <PassengerStepper
            value={counts}
            onChange={setCounts}
            labels={{
              adults: 'Adults',
              children: 'Children',
              infants: 'Infants',
              adultsDescription: 'Age 12 and above',
              childrenDescription: 'Age 2 to 11',
              infantsDescription: 'Under 2, on an adult’s lap',
              infantLimitReached: 'One infant per adult, so this is the most you can add.',
              infantsExceedAdults: ({ adults, infants }) =>
                `${infants} infants need ${infants} adults, and there ${adults === 1 ? 'is' : 'are'} ${adults}. Add an adult or remove an infant.`,
            }}
          />
          <div className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
            value:{' '}
            <span className="uh-type-numeric-table">
              {counts.adults} / {counts.children} / {counts.infants}
            </span>
          </div>
        </div>
      );
    }
    return (
      <Page>
        <Live />
        <p
          className="uh-type-web-body-s uh-measure"
          style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-24)' }}
        >
          Take adults down to 1 while two infants are set. Neither number changes: quietly removing
          an infant somebody had entered would be a worse outcome than an honest error, because they
          would not find out until the itinerary arrived. Whether the form may be submitted stays
          with the consumer.
        </p>
      </Page>
    );
  },
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  {
    code: 'en',
    label: 'English',
    legend: 'Pilgrims',
    adults: 'Adults',
    children: 'Children',
    infants: 'Infants',
    adultsDescription: 'Age 12 and above',
    limit: 'One infant per adult, so this is the most you can add.',
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    legend: 'Jemaah',
    adults: 'Dewasa',
    children: 'Kanak-kanak',
    infants: 'Bayi',
    adultsDescription: 'Umur 12 tahun ke atas',
    limit: 'Seorang bayi bagi setiap dewasa, jadi ini jumlah maksimum.',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    legend: 'Jemaah',
    adults: 'Dewasa',
    children: 'Anak-anak',
    infants: 'Bayi',
    adultsDescription: 'Usia 12 tahun ke atas',
    limit: 'Satu bayi untuk setiap dewasa, jadi ini jumlah maksimum.',
  },
] as const;

export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        Fixed 280px column. The control keeps its width because the value is tabular, so expansion
        lands on the label and description beside it. &ldquo;Kanak-kanak&rdquo; is the long one.
      </p>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', flexWrap: 'wrap' }}>
        {LOCALES.map((locale) => (
          <div key={locale.code} lang={locale.code} style={{ width: '280px' }}>
            <Caption>
              {locale.label} · {locale.code}
            </Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <PassengerStepper
                legend={locale.legend}
                defaultValue={{ adults: 1, children: 0, infants: 1 }}
                labels={{
                  adults: locale.adults,
                  children: locale.children,
                  infants: locale.infants,
                  adultsDescription: locale.adultsDescription,
                  infantLimitReached: locale.limit,
                  infantsExceedAdults: () => locale.limit,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for NumberStepper.mdx's
 * "Contoh Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<NumberStepper ... />` JSX instead of a render function
 * body. Kept separate from StateMatrix/Passengers above, which exist to prove
 * the whole surface works, not to be copied verbatim.
 */

export const Default: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Adults', defaultValue: 2, min: 1, max: 9 },
};

export const DisabledState: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Rooms', defaultValue: 1, min: 1, max: 5, disabled: true },
};

export const WithErrorMessage: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Adults',
    defaultValue: 9,
    min: 1,
    max: 9,
    error: true,
    errorMessage: 'This package seats eight',
  },
};
