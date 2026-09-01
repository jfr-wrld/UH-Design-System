import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { OTPInput, type OTPInputType } from './OTPInput.js';

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

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--uh-spacing-32)',
};

const meta = {
  title: 'Components/OTPInput',
  component: OTPInput,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One box per character of a one-time code. Every box is a real input carrying ' +
          '`autocomplete="one-time-code"`, so SMS autofill on iOS and Android reaches the ' +
          'field. Autofill often drops the whole code into whichever box holds focus rather ' +
          'than distributing it, so a multi-character change is treated as a fill, and the ' +
          'boxes carry no `maxLength` that would let the browser truncate such a code to its ' +
          'first digit.\n\n' +
          'The value is a plain left-aligned string and can never contain a gap: focus on an ' +
          'empty box past the end of the code lands on the first empty box instead, and ' +
          'deleting from the middle closes up. A gap could not survive a round trip through a ' +
          'controlled `value`, so what is on screen is always exactly what the consumer holds.\n\n' +
          'Whether a code is right is the consumer’s business. This component never checks ' +
          'one; it takes `error` and `errorMessage` and shows what it is told.',
      },
    },
  },
} satisfies Meta<typeof OTPInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ base */

export const Default: Story = {
  render: () => (
    <Page>
      <OTPInput label="Verification code" helperText="Sent by SMS to +60 12-345 6789" />
    </Page>
  ),
};

export const Filled: Story = {
  render: () => (
    <Page>
      <OTPInput
        label="Verification code"
        defaultValue="482913"
        helperText="Sent by SMS to +60 12-345 6789"
      />
    </Page>
  ),
};

export const Error: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The boxes shake once when the error appears, not on every keystroke. Colour is ' +
          'never carrying this alone: the red border arrives with a message that says what ' +
          'to do next, and that message is an alert, so it is announced wherever focus is. ' +
          'Under `prefers-reduced-motion` the shake is dropped and everything else stays.',
      },
    },
  },
  render: () => (
    <Page>
      <OTPInput
        label="Verification code"
        defaultValue="482913"
        error
        errorMessage="That code is incorrect. Check the SMS and enter the last code you received."
      />
    </Page>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Page>
      <OTPInput
        label="Verification code"
        defaultValue="4829"
        disabled
        helperText="Sending a new code. This takes a moment."
      />
    </Page>
  ),
};

/* ----------------------------------------------------------------- paste */

export const Paste: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Copy any of the four codes below and paste it into the field. A run at least as ' +
          'long as the field is a whole code, so it lands at the start whichever box receives ' +
          'it; anything shorter continues from the box you are on. Spaces and dashes are ' +
          'dropped on the way in, and anything past the last box is discarded.',
      },
    },
  },
  render: function PasteDemo() {
    const [code, setCode] = useState('');
    const [completed, setCompleted] = useState<string | null>(null);

    const samples = ['482913', '482 913', '482-913', '4829134567'];

    return (
      <Page>
        <div style={stack}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
            <Caption>Copy one of these</Caption>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-12)' }}>
              {samples.map((sample) => (
                <code
                  key={sample}
                  className="uh-type-numeric-table"
                  style={{
                    background: 'var(--uh-color-bg-muted)',
                    color: 'var(--uh-color-text-primary)',
                    padding: 'var(--uh-spacing-4) var(--uh-spacing-8)',
                    borderRadius: 'var(--uh-radius-sm)',
                  }}
                >
                  {sample}
                </code>
              ))}
            </div>
          </div>

          <OTPInput
            label="Verification code"
            value={code}
            onChange={setCode}
            onComplete={setCompleted}
            helperText="Sent by SMS to +60 12-345 6789"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}>
            <Caption>What the consumer receives</Caption>
            <div className="uh-type-numeric-table">onChange: {code || '(empty)'}</div>
            <div className="uh-type-numeric-table">onComplete: {completed ?? '(not yet)'}</div>
          </div>
        </div>
      </Page>
    );
  },
};

/* ---------------------------------------------------------------- matrix */

const TYPES: Array<{ type: OTPInputType; sample: string; caption: string }> = [
  { type: 'numeric', sample: '482913', caption: 'numeric, 6 boxes' },
  { type: 'alphanumeric', sample: 'A7K2Q9', caption: 'alphanumeric, 6 boxes' },
];

const STATES = [
  { caption: 'empty', props: {} },
  { caption: 'filled', props: { filled: true } },
  { caption: 'error', props: { filled: true, error: true } },
  { caption: 'disabled', props: { filled: true, disabled: true } },
] as const;

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every type against every state, plus the two lengths in use: six boxes for an SMS ' +
          'code and four for the shorter code the agency portal sends.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={stack}>
        {TYPES.map(({ type, sample, caption }) => (
          <div key={type} style={stack}>
            {STATES.map((state) => (
              <div
                key={state.caption}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}
              >
                <Caption>
                  {caption} / {state.caption}
                </Caption>
                <OTPInput
                  label="Verification code"
                  type={type}
                  {...('filled' in state.props ? { defaultValue: sample } : {})}
                  {...('error' in state.props
                    ? { error: true, errorMessage: 'That code is incorrect. Try the latest SMS.' }
                    : {})}
                  {...('disabled' in state.props ? { disabled: true } : {})}
                />
              </div>
            ))}
          </div>
        ))}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
          <Caption>numeric, 4 boxes</Caption>
          <OTPInput label="Agency access code" length={4} defaultValue="7301" />
        </div>
      </div>
    </Page>
  ),
};

/* ------------------------------------------------------------- dark mode */

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div style={stack}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
          <Caption>empty</Caption>
          <OTPInput label="Verification code" helperText="Sent by SMS to +60 12-345 6789" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
          <Caption>filled</Caption>
          <OTPInput label="Verification code" defaultValue="482913" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
          <Caption>error</Caption>
          <OTPInput
            label="Verification code"
            defaultValue="482913"
            error
            errorMessage="That code is incorrect. Check the SMS and try the latest code."
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
          <Caption>disabled</Caption>
          <OTPInput label="Verification code" defaultValue="4829" disabled />
        </div>
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for OTPInput.mdx's
 * "Contoh Penggunaan" section - args-only so the Docs Source panel shows
 * clean `<OTPInput ... />` JSX rather than a render function body.
 */

export const SmsCode: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Verification code',
    length: 6,
    helperText: 'Sent by SMS to +60 12-345 6789',
    autoFocus: true,
  },
};

export const AgencyAccessCode: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Agency access code',
    length: 4,
    type: 'alphanumeric',
    helperText: 'Provided by your travel agency',
  },
};

export const IncorrectCode: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Verification code',
    length: 6,
    defaultValue: '482913',
    error: true,
    errorMessage: 'That code is incorrect. Check the SMS and enter the last code you received.',
  },
};

/* --------------------------------------------------------- text expansion */

const COPY = [
  {
    lang: 'en',
    label: 'Verification code',
    helper: 'Sent by SMS to +60 12-345 6789',
    error: 'That code is incorrect. Check the SMS and enter the last code you received.',
  },
  {
    lang: 'ms',
    label: 'Kod pengesahan',
    helper: 'Dihantar melalui SMS ke +60 12-345 6789',
    error: 'Kod itu tidak betul. Semak SMS dan masukkan kod terakhir yang anda terima.',
  },
  {
    lang: 'id',
    label: 'Kode verifikasi',
    helper: 'Dikirim melalui SMS ke +62 812-3456-7890',
    error: 'Kode itu tidak benar. Periksa SMS dan masukkan kode terakhir yang Anda terima.',
  },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The boxes do not move: their width comes from the code, not from the copy around ' +
          'them. What grows is the label and the message, which is why both sit on their own ' +
          'lines rather than beside the field. Each column is 280px, the narrowest phone we ' +
          'support, and the six boxes give way slightly there rather than pushing a ' +
          'horizontal scrollbar onto a verification screen.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-32)' }}>
        {COPY.map((copy) => (
          <div
            key={copy.lang}
            lang={copy.lang}
            style={{
              width: '280px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--uh-spacing-24)',
            }}
          >
            <Caption>{copy.lang}</Caption>
            <OTPInput label={copy.label} helperText={copy.helper} />
            <OTPInput label={copy.label} defaultValue="482913" error errorMessage={copy.error} />
          </div>
        ))}
      </div>
    </Page>
  ),
};
