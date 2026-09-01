import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { NativeSelect } from './NativeSelect.js';

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

const meta = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  args: {
    label: 'Negara',
    children: <option value="id">Indonesia</option>,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The browser's own `<select>`, styled to match this system's other fields. " +
          '`Select` (searchable, custom listbox) stays the right default for most forms; reach ' +
          "for `NativeSelect` when a list is long and unstructured enough that the platform's " +
          "own picker genuinely serves the person better - a country or city list gets the OS's " +
          'native full-screen wheel on a phone instead of an in-page panel.',
      },
    },
  },
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Page>
      <div style={{ maxWidth: '320px' }}>
        <NativeSelect {...args} placeholder="Pilih negara">
          <option value="id">Indonesia</option>
          <option value="my">Malaysia</option>
          <option value="sg">Singapura</option>
          <option value="bn">Brunei Darussalam</option>
        </NativeSelect>
      </div>
    </Page>
  ),
};

export const WithOptgroups: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`NativeSelect` renders a real `<select>`, so its children are exactly what a ' +
          '`<select>` already accepts - plain `<option>` and `<optgroup>` elements, nothing to ' +
          'translate into a data prop.',
      },
    },
  },
  render: (args) => (
    <Page>
      <div style={{ maxWidth: '320px' }}>
        <NativeSelect {...args} label="Kota keberangkatan" placeholder="Pilih kota">
          <optgroup label="Indonesia">
            <option value="cgk">Jakarta (CGK)</option>
            <option value="sub">Surabaya (SUB)</option>
            <option value="kno">Medan (KNO)</option>
          </optgroup>
          <optgroup label="Malaysia">
            <option value="kul">Kuala Lumpur (KUL)</option>
          </optgroup>
        </NativeSelect>
      </div>
    </Page>
  ),
};

export const StateMatrix: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default, required, helper text, error, success, and disabled.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '320px',
        }}
      >
        <NativeSelect label="Negara" placeholder="Pilih negara">
          <option value="id">Indonesia</option>
          <option value="my">Malaysia</option>
        </NativeSelect>
        <NativeSelect label="Negara" required placeholder="Pilih negara">
          <option value="id">Indonesia</option>
          <option value="my">Malaysia</option>
        </NativeSelect>
        <NativeSelect label="Negara" helperText="Sesuai paspor" defaultValue="id">
          <option value="id">Indonesia</option>
          <option value="my">Malaysia</option>
        </NativeSelect>
        <NativeSelect
          label="Negara"
          errorMessage="Pilih salah satu negara"
          placeholder="Pilih negara"
        >
          <option value="id">Indonesia</option>
          <option value="my">Malaysia</option>
        </NativeSelect>
        <NativeSelect label="Negara" successMessage="Negara terverifikasi" defaultValue="id">
          <option value="id">Indonesia</option>
          <option value="my">Malaysia</option>
        </NativeSelect>
        <NativeSelect label="Negara" disabled defaultValue="id">
          <option value="id">Indonesia</option>
          <option value="my">Malaysia</option>
        </NativeSelect>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: (args) => (
    <Page theme="dark">
      <div style={{ maxWidth: '320px' }}>
        <NativeSelect {...args} placeholder="Pilih negara">
          <option value="id">Indonesia</option>
          <option value="my">Malaysia</option>
          <option value="sg">Singapura</option>
        </NativeSelect>
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: 'Departure city' },
  { lang: 'ms', label: 'Bandar berlepas' },
  { lang: 'id', label: 'Kota keberangkatan' },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '"Bandar berlepas" and "Kota keberangkatan" run longer than the English label - the ' +
          'label row wraps rather than clipping if a longer label ever needs to.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '220px',
        }}
      >
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <NativeSelect label={entry.label} placeholder="...">
              <option value="cgk">Jakarta (CGK)</option>
              <option value="kul">Kuala Lumpur (KUL)</option>
            </NativeSelect>
          </div>
        ))}
      </div>
    </Page>
  ),
};
