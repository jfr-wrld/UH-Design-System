import { describe, expect, it } from 'vitest';

import { splitMatches } from './highlight.js';

const shape = (text: string, query: string) =>
  splitMatches(text, query)
    .map((part) => (part.match ? `[${part.text}]` : part.text))
    .join('');

describe('splitMatches', () => {
  it('marks the run that matched', () => {
    expect(shape('Madinah', 'madi')).toBe('[Madi]nah');
  });

  it('keeps the original casing in the marked run', () => {
    expect(splitMatches('Madinah', 'madi')[0]).toEqual({ text: 'Madi', match: true });
  });

  it('marks every occurrence, not just the first', () => {
    expect(shape('Al Haram Haramain', 'haram')).toBe('Al [Haram] [Haram]ain');
  });

  it('marks a run in the middle and keeps both sides', () => {
    expect(shape('Grand Makkah Hotel', 'makkah')).toBe('Grand [Makkah] Hotel');
  });

  it('leaves the text alone when nothing matches', () => {
    expect(shape('Jeddah', 'xyz')).toBe('Jeddah');
    expect(splitMatches('Jeddah', 'xyz')).toEqual([{ text: 'Jeddah', match: false }]);
  });

  it('leaves the text alone for an empty or blank query', () => {
    expect(splitMatches('Jeddah', '')).toEqual([{ text: 'Jeddah', match: false }]);
    expect(splitMatches('Jeddah', '   ')).toEqual([{ text: 'Jeddah', match: false }]);
  });

  /*
   * Matched by index rather than by regular expression. A query is whatever
   * was typed, and this one would be a broken pattern rather than a search.
   */
  it('treats a query with regular expression characters as plain text', () => {
    expect(shape('Jeddah (KSA)', '(ksa)')).toBe('Jeddah [(KSA)]');
    expect(shape('Cost + tax', '+')).toBe('Cost [+] tax');
  });

  it('ignores whitespace around the query', () => {
    expect(shape('Madinah', '  madi  ')).toBe('[Madi]nah');
  });

  it('marks the whole label when the query is the whole label', () => {
    expect(splitMatches('Makkah', 'makkah')).toEqual([{ text: 'Makkah', match: true }]);
  });
});
