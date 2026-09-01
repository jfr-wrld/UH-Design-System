import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion.js';

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
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A stack of expand/collapse panels - one open at a time by default ' +
          '(`type="single"`), or any number at once (`type="multiple"`). No dependency ' +
          "behind it: open state is plain context, the same way `Command`'s grouped list " +
          'shares its own state without one.',
      },
    },
  },
  args: { type: 'single' },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const FAQ = [
  {
    value: 'refund',
    question: 'Apakah paket bisa dibatalkan dan uang kembali?',
    answer:
      'Bisa, mengikuti kebijakan pembatalan yang berlaku untuk paket yang dipilih - lihat ' +
      'rincian jadwal pengembalian dana di halaman detail paket sebelum memesan.',
  },
  {
    value: 'visa',
    question: 'Apakah visa Umrah sudah termasuk dalam harga paket?',
    answer:
      'Sudah. Pengurusan visa Umrah termasuk dalam setiap paket yang tercantum di platform ' +
      'ini, tanpa biaya tambahan terpisah.',
  },
  {
    value: 'room',
    question: 'Bisakah saya memilih tipe kamar hotel?',
    answer:
      'Bisa - setiap paket menampilkan pilihan tipe kamar (double, triple, quad) dengan ' +
      'selisih harga masing-masing sebelum konfirmasi pemesanan.',
  },
];

function FaqAccordion() {
  return (
    <Accordion type="single" defaultValue="visa">
      {FAQ.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export const Playground: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '640px' }}>
        <FaqAccordion />
      </div>
    </Page>
  ),
};

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every state at once: single-mode default-open, multiple-mode with two items ' +
          'open together, a disabled item, and `collapsible={false}` pinning the open item.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-32)',
          maxWidth: '640px',
        }}
      >
        <section>
          <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-8)' }}>
            type=&quot;single&quot;
          </p>
          <Accordion type="single" defaultValue="one">
            <AccordionItem value="one">
              <AccordionTrigger>First item, open by default</AccordionTrigger>
              <AccordionContent>Only one item stays open at a time.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="two">
              <AccordionTrigger>Second item</AccordionTrigger>
              <AccordionContent>Opening this one closes the first.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="three" disabled>
              <AccordionTrigger>Third item, disabled</AccordionTrigger>
              <AccordionContent>Never reachable while disabled.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-8)' }}>
            type=&quot;single&quot; collapsible={'{false}'}
          </p>
          <Accordion type="single" defaultValue="pinned" collapsible={false}>
            <AccordionItem value="pinned">
              <AccordionTrigger>Cannot be closed by clicking again</AccordionTrigger>
              <AccordionContent>
                Only opening a different item moves the open state away from this one.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="other">
              <AccordionTrigger>Another item</AccordionTrigger>
              <AccordionContent>Opening this one still works normally.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <section>
          <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-8)' }}>
            type=&quot;multiple&quot;
          </p>
          <Accordion type="multiple" defaultValue={['one', 'two']}>
            <AccordionItem value="one">
              {/* Distinct from the `type="single"` section's own "First item,
                  open by default" above - both panels are open at once on
                  this page, and `AccordionContent`'s `role="region"` makes
                  each one a landmark, so two open regions sharing a name
                  would fail axe's landmark-unique check. */}
              <AccordionTrigger>First item, also open by default</AccordionTrigger>
              <AccordionContent>Any number of items can be open together.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="two">
              <AccordionTrigger>Second item, also open by default</AccordionTrigger>
              <AccordionContent>Toggled independently of the first.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="three">
              <AccordionTrigger>Third item, closed</AccordionTrigger>
              <AccordionContent>Opening this adds to the open set.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '640px' }}>
        <FaqAccordion />
      </div>
    </Page>
  ),
};

const COPY = [
  {
    lang: 'en',
    question: 'Can I change my departure date after booking?',
    answer: 'Yes, subject to availability and the reschedule policy of the chosen package.',
  },
  {
    lang: 'ms',
    question: 'Bolehkah saya menukar tarikh berlepas selepas menempah?',
    answer:
      'Boleh, tertakluk kepada ketersediaan dan polisi penjadualan semula pakej yang dipilih.',
  },
  {
    lang: 'id',
    question: 'Apakah tanggal keberangkatan bisa diubah setelah memesan?',
    answer: 'Bisa, mengikuti ketersediaan dan kebijakan penjadwalan ulang dari paket yang dipilih.',
  },
];

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The Indonesian question runs noticeably longer than the English one - the trigger ' +
          'wraps onto a second line rather than truncating, and the chevron stays aligned to ' +
          'the first line via `align-items: center` on the flex row, not the whole button.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-24)',
          maxWidth: '480px',
        }}
      >
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <Accordion type="single" defaultValue="q">
              <AccordionItem value="q">
                <AccordionTrigger>{entry.question}</AccordionTrigger>
                <AccordionContent>{entry.answer}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </Page>
  ),
};
