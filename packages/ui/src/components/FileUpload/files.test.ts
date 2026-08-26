import { describe, expect, it } from 'vitest';

import { describeAccept, formatFileSize, isImage, matchesAccept } from './files.js';

const MB = 1024 * 1024;

describe('formatFileSize', () => {
  /* The specification's own example: 1258291 bytes must not reach a pilgrim. */
  it('reads a raw byte count as something human', () => {
    expect(formatFileSize(1_258_291, 'en')).toBe('1.2 MB');
  });

  it('steps through the units', () => {
    expect(formatFileSize(0, 'en')).toBe('0 byte');
    expect(formatFileSize(512, 'en')).toBe('512 byte');
    expect(formatFileSize(2048, 'en')).toBe('2 kB');
    expect(formatFileSize(5 * MB, 'en')).toBe('5 MB');
    expect(formatFileSize(3 * 1024 * MB, 'en')).toBe('3 GB');
  });

  /*
   * Binary steps, so a limit written the way developers actually write it
   * reads back as the number they wrote. A decimal reading would put "5.2 MB"
   * under a maxSize of 5 * 1024 * 1024 and make the message argue with the prop.
   */
  it('counts in binary steps', () => {
    expect(formatFileSize(5 * MB, 'en')).toBe('5 MB');
    expect(formatFileSize(5_000_000, 'en')).toBe('4.8 MB');
  });

  it('localises the number, not just the unit', () => {
    expect(formatFileSize(1_258_291, 'id')).toBe('1,2 MB');
    expect(formatFileSize(1_258_291, 'ms')).toBe('1.2 MB');
  });

  it('does not go negative', () => {
    expect(formatFileSize(-10, 'en')).toBe('0 byte');
  });
});

describe('matchesAccept', () => {
  const pdf = { name: 'passport.pdf', type: 'application/pdf' };
  const jpg = { name: 'visa.JPG', type: 'image/jpeg' };

  it('accepts everything when nothing is specified', () => {
    expect(matchesAccept(pdf)).toBe(true);
    expect(matchesAccept(pdf, '')).toBe(true);
  });

  it('matches an extension, whatever the case', () => {
    expect(matchesAccept(jpg, '.jpg')).toBe(true);
    expect(matchesAccept(pdf, '.jpg')).toBe(false);
  });

  it('matches an exact media type', () => {
    expect(matchesAccept(pdf, 'application/pdf')).toBe(true);
    expect(matchesAccept(jpg, 'application/pdf')).toBe(false);
  });

  it('matches a wildcard media type', () => {
    expect(matchesAccept(jpg, 'image/*')).toBe(true);
    expect(matchesAccept(pdf, 'image/*')).toBe(false);
  });

  it('accepts a file that matches any one of several patterns', () => {
    expect(matchesAccept(pdf, 'image/*,application/pdf')).toBe(true);
    expect(matchesAccept(jpg, 'image/*, application/pdf')).toBe(true);
  });
});

describe('describeAccept', () => {
  it('turns an accept attribute into something worth reading', () => {
    expect(describeAccept('image/jpeg,.png,application/pdf')).toBe('JPEG, PNG, PDF');
  });

  it('names a wildcard by its family', () => {
    expect(describeAccept('image/*')).toBe('IMAGE');
  });

  it('says each format once', () => {
    expect(describeAccept('.pdf,application/pdf')).toBe('PDF');
  });

  it('is empty when nothing is specified', () => {
    expect(describeAccept()).toBe('');
  });
});

describe('isImage', () => {
  it('separates pictures from documents', () => {
    expect(isImage('image/png')).toBe(true);
    expect(isImage('application/pdf')).toBe(false);
  });
});
