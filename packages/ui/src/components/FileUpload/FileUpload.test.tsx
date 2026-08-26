import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { FileUpload } from './FileUpload.js';
import type { UploadFile } from './files.js';

const MB = 1024 * 1024;

/** jsdom builds a File from its content, so the size is stubbed instead. */
function makeFile(name: string, type: string, size = 1024): File {
  const file = new File(['stub'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

const input = () => screen.getByLabelText(/Drag files here/) as HTMLInputElement;
const dropZone = () => document.querySelector('.uh-upload__drop') as HTMLElement;
const rows = () => screen.queryAllByRole('listitem');
const root = () => document.querySelector('.uh-upload') as HTMLElement;
/* The drop zone states the same limit, so a refusal is looked for in the list. */
const list = () => within(screen.getByRole('list'));

function drop(files: File[]) {
  fireEvent.drop(dropZone(), { dataTransfer: { files, types: ['Files'] } });
}

const uploaded = (over: Partial<UploadFile> = {}): UploadFile => ({
  id: 'f1',
  name: 'passport.pdf',
  size: 2 * MB,
  type: 'application/pdf',
  status: 'success',
  ...over,
});

describe('FileUpload', () => {
  it('names the control with the field label and the prompt', () => {
    render(<FileUpload label="Passport and travel documents" />);
    expect(
      screen.getByLabelText('Passport and travel documents Drag files here or browse'),
    ).toBeDefined();
  });

  it('is a real file input, so the keyboard reaches it with no help from us', async () => {
    render(<FileUpload label="Passport" />);
    await userEvent.tab();
    expect(document.activeElement).toBe(input());
    expect(input().type).toBe('file');
  });

  it('states the accepted formats and the size limit', () => {
    render(
      <FileUpload label="Passport" accept="image/jpeg,.png,application/pdf" maxSize={5 * MB} />,
    );
    expect(screen.getByText('Accepted formats: JPEG, PNG, PDF')).toBeDefined();
    expect(screen.getByText('Maximum file size: 5 MB')).toBeDefined();
  });

  it('passes accept and multiple through to the input', () => {
    render(<FileUpload label="Passport" accept="application/pdf" multiple />);
    expect(input().accept).toBe('application/pdf');
    expect(input().multiple).toBe(true);
  });

  describe('receiving files', () => {
    it('accepts a file chosen through the picker', async () => {
      const onUpload = vi.fn();
      render(<FileUpload label="Passport" onUpload={onUpload} />);
      const file = makeFile('passport.pdf', 'application/pdf');
      await userEvent.upload(input(), file);
      expect(onUpload).toHaveBeenCalledTimes(1);
      expect(onUpload.mock.calls[0]![0][0].name).toBe('passport.pdf');
    });

    it('accepts a file dropped on the area', () => {
      const onUpload = vi.fn();
      render(<FileUpload label="Passport" onUpload={onUpload} />);
      drop([makeFile('visa.pdf', 'application/pdf')]);
      expect(onUpload.mock.calls[0]![0][0].name).toBe('visa.pdf');
    });

    it('marks the area while a file is over it, and stops when it leaves', () => {
      render(<FileUpload label="Passport" />);
      fireEvent.dragEnter(dropZone(), { dataTransfer: { types: ['Files'] } });
      expect(dropZone().dataset.dragging).toBe('true');
      expect(root().dataset.state).toBe('dragging');
      fireEvent.dragLeave(dropZone(), { dataTransfer: { types: ['Files'] } });
      expect(dropZone().dataset.dragging).toBeUndefined();
    });

    /* Dragging across the icon fires dragleave on the area; a plain boolean
       would flicker the whole way across. */
    it('stays marked while the pointer crosses a child', () => {
      render(<FileUpload label="Passport" />);
      fireEvent.dragEnter(dropZone(), { dataTransfer: { types: ['Files'] } });
      fireEvent.dragEnter(screen.getByText('Drag files here or browse'), {
        dataTransfer: { types: ['Files'] },
      });
      fireEvent.dragLeave(dropZone(), { dataTransfer: { types: ['Files'] } });
      expect(dropZone().dataset.dragging).toBe('true');
    });

    it('clears the marking when the file is dropped', () => {
      render(<FileUpload label="Passport" />);
      fireEvent.dragEnter(dropZone(), { dataTransfer: { types: ['Files'] } });
      drop([makeFile('visa.pdf', 'application/pdf')]);
      expect(dropZone().dataset.dragging).toBeUndefined();
    });

    it('takes only the first file when multiple is off', () => {
      const onUpload = vi.fn();
      render(<FileUpload label="Passport" onUpload={onUpload} />);
      drop([makeFile('a.pdf', 'application/pdf'), makeFile('b.pdf', 'application/pdf')]);
      expect(onUpload.mock.calls[0]![0]).toHaveLength(1);
    });

    it('takes them all when multiple is on', () => {
      const onUpload = vi.fn();
      render(<FileUpload label="Passport" multiple onUpload={onUpload} />);
      drop([makeFile('a.pdf', 'application/pdf'), makeFile('b.pdf', 'application/pdf')]);
      expect(onUpload.mock.calls[0]![0]).toHaveLength(2);
    });

    it('ignores everything while disabled', () => {
      const onUpload = vi.fn();
      render(<FileUpload label="Passport" disabled onUpload={onUpload} />);
      drop([makeFile('a.pdf', 'application/pdf')]);
      expect(onUpload).not.toHaveBeenCalled();
      expect(input().disabled).toBe(true);
    });
  });

  describe('refusing files', () => {
    it('names the limit when a file is too big', () => {
      const onUpload = vi.fn();
      render(<FileUpload label="Passport" maxSize={5 * MB} onUpload={onUpload} />);
      drop([makeFile('scan.pdf', 'application/pdf', 8 * MB)]);
      expect(onUpload).not.toHaveBeenCalled();
      const message = list().getByText(/Maximum file size: 5 MB/);
      /* Both numbers, so the pilgrim knows how far over it is. */
      expect(message.textContent).toContain('8 MB');
      expect(message.textContent).toContain('scan.pdf');
    });

    it('names the accepted formats when the type is wrong', () => {
      const onUpload = vi.fn();
      render(
        <FileUpload label="Passport" accept="image/jpeg,application/pdf" onUpload={onUpload} />,
      );
      drop([
        makeFile(
          'booking.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ]);
      expect(onUpload).not.toHaveBeenCalled();
      expect(screen.getByText(/Accepted formats: JPEG, PDF\./)).toBeDefined();
    });

    it('keeps the two refusals apart', () => {
      render(<FileUpload label="Passport" multiple accept="application/pdf" maxSize={5 * MB} />);
      drop([makeFile('big.pdf', 'application/pdf', 9 * MB), makeFile('wrong.png', 'image/png')]);
      expect(list().getByText(/Maximum file size/)).toBeDefined();
      expect(list().getByText(/not a supported format/)).toBeDefined();
    });

    it('refuses what will not fit under maxFiles and uploads the rest', () => {
      const onUpload = vi.fn();
      render(
        <FileUpload
          label="Passport"
          multiple
          maxFiles={2}
          value={[uploaded()]}
          onUpload={onUpload}
        />,
      );
      drop([makeFile('a.pdf', 'application/pdf'), makeFile('b.pdf', 'application/pdf')]);
      expect(onUpload.mock.calls[0]![0]).toHaveLength(1);
      expect(screen.getByText(/2 files at most/)).toBeDefined();
    });

    it('lets a refusal be dismissed', async () => {
      render(<FileUpload label="Passport" maxSize={MB} />);
      drop([makeFile('big.pdf', 'application/pdf', 9 * MB)]);
      expect(list().getByText(/Maximum file size/)).toBeDefined();
      await userEvent.click(screen.getByRole('button', { name: 'Remove big.pdf' }));
      expect(screen.queryByRole('list')).toBeNull();
    });

    it('uploads the good ones from a mixed drop', () => {
      const onUpload = vi.fn();
      render(<FileUpload label="Passport" multiple maxSize={5 * MB} onUpload={onUpload} />);
      drop([
        makeFile('good.pdf', 'application/pdf', MB),
        makeFile('big.pdf', 'application/pdf', 9 * MB),
      ]);
      expect(onUpload.mock.calls[0]![0]).toHaveLength(1);
      expect(onUpload.mock.calls[0]![0][0].name).toBe('good.pdf');
    });
  });

  describe('the file list', () => {
    it('shows the size in something readable, not a byte count', () => {
      render(<FileUpload label="Passport" value={[uploaded({ size: 1_258_291 })]} />);
      expect(screen.getByText('1.2 MB')).toBeDefined();
      expect(screen.queryByText('1258291')).toBeNull();
    });

    it('shows a thumbnail for an image and an icon for a document', () => {
      render(
        <FileUpload
          label="Passport"
          multiple
          value={[
            uploaded({ id: 'a', name: 'visa.jpg', type: 'image/jpeg', url: 'blob:visa' }),
            uploaded({ id: 'b', name: 'passport.pdf', type: 'application/pdf' }),
          ]}
        />,
      );
      expect(rows()[0]!.querySelector('.uh-upload__thumb')).not.toBeNull();
      expect(rows()[1]!.querySelector('.uh-upload__thumb')).toBeNull();
      expect(rows()[1]!.querySelector('.uh-upload__doc')).not.toBeNull();
    });

    it('reports progress on a bar of its own', () => {
      render(
        <FileUpload label="Passport" value={[uploaded({ status: 'uploading', progress: 42 })]} />,
      );
      const bar = screen.getByRole('progressbar', { name: 'Uploading passport.pdf' });
      expect(bar.getAttribute('aria-valuenow')).toBe('42');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
    });

    /* An upload with no measurable progress reports no value rather than a
       misleading zero. */
    it('leaves the value off when progress is unknown', () => {
      render(<FileUpload label="Passport" value={[uploaded({ status: 'uploading' })]} />);
      expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
    });

    it('shows the failure the consumer reported, as written', () => {
      render(
        <FileUpload
          label="Passport"
          value={[uploaded({ status: 'error', error: 'The connection dropped. Try again.' })]}
        />,
      );
      expect(screen.getByText('The connection dropped. Try again.')).toBeDefined();
    });
  });

  describe('removing', () => {
    it('asks before removing a file that finished uploading', async () => {
      const onRemove = vi.fn();
      render(<FileUpload label="Passport" value={[uploaded()]} onRemove={onRemove} />);
      await userEvent.click(screen.getByRole('button', { name: 'Remove passport.pdf' }));
      expect(onRemove).not.toHaveBeenCalled();
      expect(screen.getByText('Remove passport.pdf?')).toBeDefined();

      await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
      expect(onRemove).toHaveBeenCalledWith('f1');
    });

    it('lets the question be waved away', async () => {
      const onRemove = vi.fn();
      render(<FileUpload label="Passport" value={[uploaded()]} onRemove={onRemove} />);
      await userEvent.click(screen.getByRole('button', { name: 'Remove passport.pdf' }));
      await userEvent.click(screen.getByRole('button', { name: 'Keep' }));
      expect(onRemove).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Remove passport.pdf' })).toBeDefined();
    });

    /* Nothing has been stored yet, so there is nothing to ask about. */
    it('removes an upload in flight without asking', async () => {
      const onRemove = vi.fn();
      render(
        <FileUpload
          label="Passport"
          value={[uploaded({ status: 'uploading', progress: 10 })]}
          onRemove={onRemove}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Remove passport.pdf' }));
      expect(onRemove).toHaveBeenCalledWith('f1');
    });

    it('removes a failed upload without asking', async () => {
      const onRemove = vi.fn();
      render(
        <FileUpload
          label="Passport"
          value={[uploaded({ status: 'error', error: 'Upload failed.' })]}
          onRemove={onRemove}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Remove passport.pdf' }));
      expect(onRemove).toHaveBeenCalledWith('f1');
    });
  });

  describe('states', () => {
    const two: UploadFile[] = [
      uploaded({ id: 'a', name: 'passport.pdf' }),
      uploaded({ id: 'b', name: 'visa.pdf', status: 'error', error: 'Upload failed.' }),
    ];

    it('is idle with nothing attached', () => {
      render(<FileUpload label="Passport" />);
      expect(root().dataset.state).toBe('idle');
    });

    it('is uploading while anything is in flight', () => {
      render(
        <FileUpload
          label="Passport"
          multiple
          value={[...two, uploaded({ id: 'c', status: 'uploading', progress: 5 })]}
        />,
      );
      expect(root().dataset.state).toBe('uploading');
    });

    it('is partial when some worked and some did not', () => {
      render(<FileUpload label="Passport" multiple value={two} />);
      expect(root().dataset.state).toBe('partial');
    });

    it('is success when everything worked', () => {
      render(<FileUpload label="Passport" value={[uploaded()]} />);
      expect(root().dataset.state).toBe('success');
    });

    it('is error when nothing did', () => {
      render(
        <FileUpload label="Passport" value={[uploaded({ status: 'error', error: 'Failed.' })]} />,
      );
      expect(root().dataset.state).toBe('error');
    });

    /* A locally refused file counts towards the failures too, otherwise a drop
       that was entirely refused would still read as a success. */
    it('counts a refusal towards the failures', () => {
      render(<FileUpload label="Passport" multiple maxSize={MB} value={[uploaded()]} />);
      drop([makeFile('big.pdf', 'application/pdf', 9 * MB)]);
      expect(root().dataset.state).toBe('partial');
    });
  });

  describe('the live region', () => {
    const status = () => screen.getByRole('status');

    it('says nothing when there is nothing to say', () => {
      render(<FileUpload label="Passport" />);
      expect(status().textContent).toBe('');
    });

    /* A count, not a percentage: a region that read out every frame of the
       progress bar would talk over the rest of the page for the whole upload. */
    it('counts what is in flight rather than reading out the percentage', () => {
      render(
        <FileUpload
          label="Passport"
          multiple
          value={[
            uploaded({ id: 'a', status: 'uploading', progress: 20 }),
            uploaded({ id: 'b', status: 'uploading', progress: 80 }),
          ]}
        />,
      );
      expect(status().textContent).toBe('Uploading 2 files.');
    });

    it('reports the finished count', () => {
      render(<FileUpload label="Passport" value={[uploaded()]} />);
      expect(status().textContent).toBe('1 file uploaded.');
    });

    it('reports a partial result as both numbers', () => {
      render(
        <FileUpload
          label="Passport"
          multiple
          value={[uploaded({ id: 'a' }), uploaded({ id: 'b', status: 'error', error: 'Failed.' })]}
        />,
      );
      expect(status().textContent).toBe('1 uploaded, 1 failed.');
    });
  });

  describe('translation', () => {
    it('takes every string it can show', () => {
      render(
        <FileUpload
          label="Pasport dan dokumen perjalanan"
          locale="ms"
          maxSize={5 * MB}
          labels={{
            prompt: 'Seret fail ke sini atau layari',
            maxSize: (size) => `Saiz fail maksimum: ${size}`,
          }}
        />,
      );
      expect(screen.getByText('Seret fail ke sini atau layari')).toBeDefined();
      expect(screen.getByText('Saiz fail maksimum: 5 MB')).toBeDefined();
    });
  });

  describe('messages', () => {
    it('describes the control with the helper text', () => {
      render(<FileUpload label="Passport" helperText="A clear photo of the details page." />);
      const described = input().getAttribute('aria-describedby');
      expect(described).toContain('-message');
      expect(screen.getByText('A clear photo of the details page.')).toBeDefined();
    });

    it('announces an error the consumer supplied', () => {
      render(<FileUpload label="Passport" errorMessage="Attach a passport before continuing." />);
      expect(screen.getByRole('alert').textContent).toBe('Attach a passport before continuing.');
      expect(input().getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('has no violations when idle', async () => {
      const { container } = render(
        <FileUpload
          label="Passport and travel documents"
          accept="image/jpeg,.png,application/pdf"
          maxSize={5 * MB}
          helperText="A clear photo of the details page."
        />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no violations with a mixed list showing', async () => {
      const { container } = render(
        <FileUpload
          label="Passport and travel documents"
          multiple
          value={[
            uploaded({ id: 'a', name: 'passport.pdf' }),
            uploaded({
              id: 'b',
              name: 'visa.jpg',
              type: 'image/jpeg',
              status: 'uploading',
              progress: 60,
            }),
            uploaded({
              id: 'c',
              name: 'ticket.pdf',
              status: 'error',
              error: 'Upload failed. Try again.',
            }),
          ]}
        />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no violations while a removal is being confirmed', async () => {
      const { container } = render(<FileUpload label="Passport" value={[uploaded()]} />);
      await userEvent.click(screen.getByRole('button', { name: 'Remove passport.pdf' }));
      await expectNoA11yViolations(container);
    });
  });

  it('keeps the rows in a list', () => {
    render(
      <FileUpload
        label="Passport"
        multiple
        value={[uploaded({ id: 'a' }), uploaded({ id: 'b' })]}
      />,
    );
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
  });
});
