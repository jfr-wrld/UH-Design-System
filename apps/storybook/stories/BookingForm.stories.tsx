import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';

import {
  Button,
  CurrencyInput,
  DateRangePicker,
  FileUpload,
  Input,
  PassengerStepper,
  PhoneInput,
  SearchCombobox,
  type PassengerCounts,
  type SearchOption,
  type UploadFile,
} from '@umrahhaji/ui';

/**
 * Every field in one place, in the order a pilgrim meets them.
 *
 * This exists to be walked with the keyboard. A component can pass its own
 * tests and still strand someone between two of them: focus that never returns
 * from a popup, a Tab that lands in a portal at the far end of the document, a
 * dialog nothing can escape. Those only show up when the whole form is tabbed
 * through from the top in one go, so the whole form has to exist somewhere.
 */

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '900px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--uh-spacing-24)',
  maxWidth: '480px',
};

const AGENCIES: SearchOption[] = [
  { id: 'a1', label: 'Madinah Travel & Tours', description: 'Kuala Lumpur', group: 'Agencies' },
  { id: 'a2', label: 'Al Madinah Holidays', description: 'Johor Bahru', group: 'Agencies' },
  { id: 'd1', label: 'Madinah', description: 'Saudi Arabia', group: 'Destinations' },
];

const meta = {
  title: 'Patterns/Booking form',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The whole booking form, for walking with the keyboard alone.\n\n' +
          'Start on the address bar and press Tab. Every field should be reachable in the ' +
          'order it is read, every popup should open on Enter, close on Escape, and hand ' +
          'focus back to the control that opened it, and Tab should always keep moving ' +
          'forward. Nothing here should need a mouse, and nothing should trap.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const KeyboardWalkthrough: Story = {
  render: function Booking() {
    const [agency, setAgency] = useState('');
    const [results, setResults] = useState<SearchOption[]>([]);
    const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
      start: null,
      end: null,
    });
    const [passengers, setPassengers] = useState<PassengerCounts>({
      adults: 2,
      children: 0,
      infants: 0,
    });
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [budget, setBudget] = useState<number | null>(null);
    const [documents, setDocuments] = useState<UploadFile[]>([]);

    return (
      <div style={surface}>
        <form style={form} onSubmit={(event) => event.preventDefault()}>
          <SearchCombobox
            label="Agency or destination"
            value={agency}
            onChange={setAgency}
            onSearch={(query) =>
              setResults(
                AGENCIES.filter((option) =>
                  option.label.toLowerCase().includes(query.trim().toLowerCase()),
                ),
              )
            }
            options={results}
            recentSearches={['Makkah 12 days', 'Madinah']}
            onClearRecent={() => {}}
            debounce={0}
          />

          <DateRangePicker
            label="Travel dates"
            startDate={range.start}
            endDate={range.end}
            onChange={(start, end) => setRange({ start, end })}
            minRange={9}
            maxRange={14}
            helperText="Packages run from nine to fourteen days."
          />

          <PassengerStepper value={passengers} onChange={setPassengers} />

          <Input
            label="Full name as in passport"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <PhoneInput label="Mobile number" value={phone} onChange={setPhone} required />

          <CurrencyInput
            label="Budget per pilgrim"
            currency="MYR"
            locale="ms-MY"
            value={budget}
            onChange={setBudget}
          />

          <FileUpload
            label="Passport and travel documents"
            accept="image/jpeg,image/png,application/pdf"
            maxSize={5 * 1024 * 1024}
            multiple
            value={documents}
            onUpload={(files) =>
              setDocuments((current) => [
                ...current,
                ...files.map((file) => ({
                  id: `${file.name}-${file.size}`,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  status: 'success' as const,
                  file,
                })),
              ])
            }
            onRemove={(id) => setDocuments((current) => current.filter((f) => f.id !== id))}
          />

          <Button type="submit" variant="primary">
            Continue to payment
          </Button>
        </form>
      </div>
    );
  },
};
