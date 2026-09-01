import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { TextArea } from './TextArea.js';
import type { FieldSize } from '../Field/FieldShell.js';

const SIZES: FieldSize[] = ['sm', 'md', 'lg'];

/** The eight states the field has to hold - same set Input's own matrix
    covers, so the two read as one family side by side. */
const STATES = [
  { key: 'default', label: 'Default', props: {} },
  { key: 'hover', label: 'Hover', props: {}, pseudo: 'pseudo-hover-all' },
  { key: 'focus', label: 'Focus', props: {}, pseudo: 'pseudo-focus-within-all' },
  { key: 'filled', label: 'Filled', props: { defaultValue: 'Loves long walks on the beach.' } },
  {
    key: 'disabled',
    label: 'Disabled',
    props: { disabled: true, defaultValue: 'Loves long walks on the beach.' },
  },
  {
    key: 'readonly',
    label: 'Read only',
    props: { readOnly: true, defaultValue: 'Loves long walks on the beach.' },
  },
  {
    key: 'error',
    label: 'Error',
    props: { defaultValue: 'Hi', errorMessage: 'Bio must be at least 20 characters' },
  },
  {
    key: 'success',
    label: 'Success',
    props: {
      defaultValue: 'Loves long walks on the beach.',
      successMessage: 'Bio looks great',
    },
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
  title: 'Components/TextArea',
  component: TextArea,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The multi-line sibling of Input - same FieldShell chrome (label, bordered ' +
          'control, message/counter footer), same controlled/uncontrolled wiring, so a ' +
          'form mixing the two never drifts. `rows` sets the visible height; the resize ' +
          'handle lets someone grow it further if they need to.',
      },
    },
  },
  args: { label: 'Bio' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ---------------------------------------------------------------- matrix */

function Matrix({ size, theme }: { size: FieldSize; theme: 'light' | 'dark' }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
        gap: 'var(--uh-spacing-20)',
      }}
    >
      {STATES.map((state) => (
        <div key={`${theme}-${size}-${state.key}`}>
          <Caption>{state.label}</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <TextArea
              size={size}
              label="Bio"
              placeholder="Tell us a little about yourself."
              rows={3}
              className={'pseudo' in state ? state.pseudo : undefined}
              {...state.props}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export const StateMatrix: Story = {
  render: () => (
    <Page>
      {SIZES.map((size) => (
        <section key={size} style={{ marginBottom: 'var(--uh-spacing-40)' }}>
          <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
            size = {size}
          </h3>
          <Matrix size={size} theme="light" />
        </section>
      ))}
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <Matrix size="md" theme="dark" />
    </Page>
  ),
};

export const WithCounter: Story = {
  args: {
    label: 'Message',
    placeholder: 'Add enough detail so we can respond with the right context.',
    maxLength: 280,
    helperText: 'Visible to the support team only.',
  },
  parameters: { layout: 'centered' },
};

export const Basic: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us a little about yourself.',
    helperText: 'This appears on your public profile.',
  },
  parameters: { layout: 'centered' },
};

export const WithError: Story = {
  args: {
    label: 'Bio',
    defaultValue: 'Hi',
    errorMessage: 'Bio must be at least 20 characters.',
    required: true,
  },
  parameters: { layout: 'centered' },
};

const COPY = [
  { lang: 'en', label: 'Special requests', placeholder: 'Wheelchair access, dietary needs, ...' },
  { lang: 'ms', label: 'Permintaan khas', placeholder: 'Akses kerusi roda, keperluan diet, ...' },
  {
    lang: 'id',
    label: 'Permintaan khusus',
    placeholder: 'Akses kursi roda, kebutuhan makanan khusus, ...',
  },
] as const;

export const TextExpansion: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story:
          '"Akses kursi roda, kebutuhan makanan khusus, ..." runs longer than the English ' +
          "placeholder, but the field's width is independent of it - only the label and " +
          'placeholder text wrap inside their own line.',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--uh-spacing-24)',
        width: '320px',
      }}
    >
      {COPY.map((entry) => (
        <div key={entry.lang} lang={entry.lang}>
          <TextArea label={entry.label} placeholder={entry.placeholder} rows={3} />
        </div>
      ))}
    </div>
  ),
};
