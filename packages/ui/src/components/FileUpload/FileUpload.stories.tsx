import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { FileUpload } from './FileUpload.js';
import type { UploadFile } from './files.js';
import type { FileUploadLabels } from './labels.js';
/*
 * An asset, not an inline data URI: the stand-in's colours belong in the image
 * rather than in a story file, and the same reasoning as Avatar's swatch.
 */
import SCAN from './fixtures/scan.svg';

const MB = 1024 * 1024;

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
  maxWidth: '480px',
};

const ACCEPT = 'image/jpeg,image/png,application/pdf';

const passport: UploadFile = {
  id: 'passport',
  name: 'passport-page.jpg',
  size: 1_258_291,
  type: 'image/jpeg',
  status: 'success',
  url: SCAN,
};

const visa: UploadFile = {
  id: 'visa',
  name: 'visa-approval.pdf',
  size: 486_400,
  type: 'application/pdf',
  status: 'success',
};

const meta = {
  title: 'Components/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The drop area is a `<label>` wrapping a visually hidden file input, not a div ' +
          'dressed up as a button. That is what makes it reachable by Tab, openable with ' +
          'Enter or Space, and clickable across its whole surface, with no key handling of ' +
          'our own; the focus ring is drawn on the area through `:focus-within`.\n\n' +
          'The component checks size and format because both are given to it as props, and ' +
          'says which limit was broken and what the limit is. It does not run the upload: ' +
          '`onUpload` hands over the files that passed, and the consumer owns `value` and ' +
          'reports progress, success and failure back through it.\n\n' +
          'Sizes are shown through `Intl.NumberFormat` in binary steps, so a `maxSize` of ' +
          '`5 * 1024 * 1024` reads back as the 5 MB the developer wrote.',
      },
    },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ idle */

export const Idle: Story = {
  args: { label: 'Passport and travel documents' },
  render: (args) => (
    <Page>
      <div style={stack}>
        <FileUpload
          {...args}
          accept={ACCEPT}
          maxSize={5 * MB}
          maxFiles={4}
          multiple
          helperText="A clear photo of the details page. All four corners must be visible."
        />
      </div>
    </Page>
  ),
};

export const Dragging: Story = {
  args: { label: 'Passport and travel documents' },
  parameters: {
    docs: {
      description: {
        story:
          'A real `dragenter` is fired at the area when this story mounts, so what is on ' +
          'screen is the component’s own state rather than a class added for the ' +
          'screenshot. The border goes solid: the area has committed to the drop.',
      },
    },
  },
  render: function DraggingDemo(args) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const zone = ref.current?.querySelector('.uh-upload__drop');
      zone?.dispatchEvent(new Event('dragenter', { bubbles: true }));
    }, []);

    return (
      <Page>
        <div style={stack} ref={ref}>
          <FileUpload {...args} accept={ACCEPT} maxSize={5 * MB} multiple />
        </div>
      </Page>
    );
  },
};

/* ----------------------------------------------------------------- states */

export const Uploading: Story = {
  args: { label: 'Passport and travel documents' },
  parameters: {
    docs: {
      description: {
        story:
          'Each file carries its own progress bar. The live region counts what is in flight ' +
          'rather than reading the percentage out: a region that announced every frame would ' +
          'talk over the rest of the page for the whole upload, and the number is on the ' +
          'progress bar for anyone who asks for it.',
      },
    },
  },
  render: (args) => (
    <Page>
      <div style={stack}>
        <FileUpload
          {...args}
          accept={ACCEPT}
          multiple
          value={[
            { ...passport, status: 'uploading', progress: 68 },
            { ...visa, status: 'uploading', progress: 24 },
          ]}
        />
      </div>
    </Page>
  ),
};

export const Success: Story = {
  args: { label: 'Passport and travel documents' },
  parameters: {
    docs: {
      description: {
        story:
          'An image gets a thumbnail; a PDF gets an icon and its name, because a thumbnail ' +
          'of a first page tells you less than the file name does. Removing a file that has ' +
          'already been stored asks first, in the row itself, so the thing being removed ' +
          'stays in view while the question is asked.',
      },
    },
  },
  render: function SuccessDemo(args) {
    const [files, setFiles] = useState<UploadFile[]>([passport, visa]);
    return (
      <Page>
        <div style={stack}>
          <FileUpload
            {...args}
            accept={ACCEPT}
            multiple
            value={files}
            onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
          />
        </div>
      </Page>
    );
  },
};

export const Errors: Story = {
  args: { label: 'Passport and travel documents' },
  parameters: {
    docs: {
      description: {
        story:
          'The two refusals are separate messages because they need different answers. Too ' +
          'big names both numbers and what to do about it; the wrong format names the ones ' +
          'that would work. Neither is a bare "invalid file".',
      },
    },
  },
  render: () => (
    <Page>
      <div style={stack}>
        <div>
          <Caption>too large</Caption>
          <FileUpload
            label="Passport and travel documents"
            accept={ACCEPT}
            maxSize={5 * MB}
            value={[
              {
                id: 'big',
                name: 'passport-scan-600dpi.pdf',
                size: 8 * MB,
                type: 'application/pdf',
                status: 'error',
                error:
                  'passport-scan-600dpi.pdf is 8 MB. Maximum file size: 5 MB. Compress it or scan at a lower quality.',
              },
            ]}
          />
        </div>
        <div>
          <Caption>unsupported format</Caption>
          <FileUpload
            label="Passport and travel documents"
            accept={ACCEPT}
            value={[
              {
                id: 'wrong',
                name: 'booking-confirmation.docx',
                size: 42_000,
                type: 'application/msword',
                status: 'error',
                error:
                  'booking-confirmation.docx is not a supported format. Accepted formats: JPEG, PNG, PDF.',
              },
            ]}
          />
        </div>
        <div>
          <Caption>the form as a whole</Caption>
          <FileUpload
            label="Passport and travel documents"
            accept={ACCEPT}
            errorMessage="Attach a passport before continuing to payment."
          />
        </div>
      </div>
    </Page>
  ),
};

export const Partial: Story = {
  args: { label: 'Passport and travel documents' },
  parameters: {
    docs: {
      description: {
        story:
          'Some through, some not. The successful files stay exactly where they are, so a ' +
          'retry is one file rather than the whole set, and the live region reports both ' +
          'numbers instead of rounding the result to "failed".',
      },
    },
  },
  render: (args) => (
    <Page>
      <div style={stack}>
        <FileUpload
          {...args}
          accept={ACCEPT}
          multiple
          value={[
            passport,
            {
              id: 'ticket',
              name: 'return-ticket.pdf',
              size: 720_000,
              type: 'application/pdf',
              status: 'error',
              error: 'The connection dropped at 40 percent. Try again.',
            },
          ]}
        />
      </div>
    </Page>
  ),
};

export const Disabled: Story = {
  args: { label: 'Passport and travel documents' },
  render: (args) => (
    <Page>
      <div style={stack}>
        <FileUpload
          {...args}
          disabled
          accept={ACCEPT}
          maxSize={5 * MB}
          value={[passport]}
          helperText="Documents are locked once the booking is confirmed."
        />
      </div>
    </Page>
  ),
};

/* ----------------------------------------------------------- interactive */

export const Interactive: Story = {
  args: { label: 'Passport and travel documents' },
  parameters: {
    docs: {
      description: {
        story:
          'Drop a file on the area or open the picker, and watch a simulated upload run. ' +
          'Try a file over 5 MB, or one that is not a JPEG, PNG or PDF, to see the two ' +
          'refusals. This is the whole contract: the component hands over what passed, and ' +
          'this story plays the part of the consumer that uploads it.',
      },
    },
  },
  render: function InteractiveDemo(args) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const timers = useRef<Array<ReturnType<typeof setInterval>>>([]);

    useEffect(() => () => timers.current.forEach(clearInterval), []);

    function upload(incoming: File[]) {
      for (const file of incoming) {
        const id = `${file.name}-${file.size}-${files.length}`;
        setFiles((current) => [
          ...current,
          {
            id,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'uploading',
            progress: 0,
            file,
          },
        ]);

        let progress = 0;
        const timer = setInterval(() => {
          progress += 20;
          setFiles((current) =>
            current.map((item) =>
              item.id === id
                ? progress >= 100
                  ? { ...item, status: 'success', progress: 100 }
                  : { ...item, progress }
                : item,
            ),
          );
          if (progress >= 100) clearInterval(timer);
        }, 400);
        timers.current.push(timer);
      }
    }

    return (
      <Page>
        <div style={stack}>
          <FileUpload
            {...args}
            accept={ACCEPT}
            maxSize={5 * MB}
            maxFiles={4}
            multiple
            value={files}
            onUpload={upload}
            onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
            helperText="Up to four documents. A clear photo of the details page."
          />
        </div>
      </Page>
    );
  },
};

/* ------------------------------------------------------------- dark mode */

export const DarkMode: Story = {
  args: { label: 'Passport and travel documents' },
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div style={stack}>
        <div>
          <Caption>idle</Caption>
          <FileUpload
            label="Passport and travel documents"
            accept={ACCEPT}
            maxSize={5 * MB}
            multiple
          />
        </div>
        <div>
          <Caption>uploading</Caption>
          <FileUpload
            label="Passport and travel documents"
            multiple
            value={[{ ...passport, status: 'uploading', progress: 68 }]}
          />
        </div>
        <div>
          <Caption>partial</Caption>
          <FileUpload
            label="Passport and travel documents"
            multiple
            value={[
              passport,
              {
                ...visa,
                status: 'error',
                error: 'The connection dropped at 40 percent. Try again.',
              },
            ]}
          />
        </div>
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- text expansion */

const MS: Partial<FileUploadLabels> = {
  prompt: 'Seret fail ke sini atau layari',
  maxSize: (size) => `Saiz fail maksimum: ${size}`,
  formats: (list) => `Format yang diterima: ${list}`,
  remove: (name) => `Buang ${name}`,
  confirmRemove: (name) => `Buang ${name}?`,
  confirm: 'Buang',
  keep: 'Simpan',
  uploadedStatus: (count) => `${count} fail dimuat naik.`,
};

const ID: Partial<FileUploadLabels> = {
  prompt: 'Seret berkas ke sini atau telusuri',
  maxSize: (size) => `Ukuran berkas maksimum: ${size}`,
  formats: (list) => `Format yang didukung: ${list}`,
  remove: (name) => `Hapus ${name}`,
  confirmRemove: (name) => `Hapus ${name}?`,
  confirm: 'Hapus',
  keep: 'Simpan',
  uploadedStatus: (count) => `${count} berkas diunggah.`,
};

export const TextExpansion: Story = {
  args: { label: 'Passport and travel documents' },
  parameters: {
    docs: {
      description: {
        story:
          'The prompt and the two constraint lines are the strings that grow, and all three ' +
          'sit on their own lines in a centred column, so a longer translation makes the ' +
          'area taller rather than pushing anything sideways. The file rows are the tighter ' +
          'test: the name truncates and the remove control keeps its 44px, so the row holds ' +
          'at 280px in every language.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-32)' }}>
        <div lang="en" style={{ width: '280px' }}>
          <Caption>en</Caption>
          <FileUpload
            label="Passport and travel documents"
            accept={ACCEPT}
            maxSize={5 * MB}
            value={[passport]}
          />
        </div>
        <div lang="ms" style={{ width: '280px' }}>
          <Caption>ms</Caption>
          <FileUpload
            label="Pasport dan dokumen perjalanan"
            locale="ms"
            accept={ACCEPT}
            maxSize={5 * MB}
            labels={MS}
            value={[passport]}
          />
        </div>
        <div lang="id" style={{ width: '280px' }}>
          <Caption>id</Caption>
          <FileUpload
            label="Paspor dan dokumen perjalanan"
            locale="id"
            accept={ACCEPT}
            maxSize={5 * MB}
            labels={ID}
            value={[passport]}
          />
        </div>
      </div>
    </Page>
  ),
};
