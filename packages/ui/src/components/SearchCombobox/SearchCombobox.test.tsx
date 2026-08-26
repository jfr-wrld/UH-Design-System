import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { SearchCombobox, type SearchOption } from './SearchCombobox.js';

const OPTIONS: SearchOption[] = [
  { id: 'a1', label: 'Madinah Travel', description: 'Kuala Lumpur', group: 'Agencies' },
  { id: 'a2', label: 'Al Madinah Tours', description: 'Johor Bahru', group: 'Agencies' },
  { id: 'd1', label: 'Madinah', description: 'Saudi Arabia', group: 'Destinations' },
];

const RECENT = ['Makkah', 'Jeddah', 'Madinah'];

const box = () => screen.getByRole('combobox') as HTMLInputElement;
const listbox = () => screen.getByRole('listbox');
const options = () => screen.queryAllByRole('option');
const root = () => document.querySelector('.uh-search') as HTMLElement;
const activeOption = () =>
  options().find((o) => o.id === box().getAttribute('aria-activedescendant'));

function stubViewport(mobile: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: mobile,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('SearchCombobox', () => {
  it('is a combobox that says what it controls', async () => {
    render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
    expect(box().getAttribute('aria-expanded')).toBe('false');
    expect(box().getAttribute('aria-autocomplete')).toBe('list');

    /*
     * A combobox names its popup, but only while there is a popup to name.
     * Pointing aria-controls at an id that is not in the document sends
     * assistive technology looking for something that does not exist.
     */
    expect(box().hasAttribute('aria-controls')).toBe(false);

    await userEvent.type(box(), 'mad');
    expect(document.getElementById(box().getAttribute('aria-controls')!)).toBe(listbox());
  });

  it('is named by its label', () => {
    render(<SearchCombobox label="Search agencies" debounce={0} />);
    expect(screen.getByRole('combobox', { name: 'Search agencies' })).toBeDefined();
  });

  describe('debounce', () => {
    /*
     * Typing here is fireEvent, not userEvent. userEvent schedules its own work
     * on timers, and handing it a faked clock as well makes the two wait on
     * each other. The debounce hangs off the change event, so dispatching that
     * directly tests exactly the thing under test and nothing else.
     */
    const type = (text: string) => fireEvent.change(box(), { target: { value: text } });
    /* act, because the timer callback is what clears the typing state, and
       React batches that update like any other. */
    const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('waits for the typing to settle before searching', () => {
      const onSearch = vi.fn();
      render(<SearchCombobox label="Search" onSearch={onSearch} />);
      type('mad');
      expect(onSearch).not.toHaveBeenCalled();

      advance(300);
      expect(onSearch).toHaveBeenCalledExactlyOnceWith('mad');
    });

    it('collapses a burst of keystrokes into one search', () => {
      const onSearch = vi.fn();
      render(<SearchCombobox label="Search" onSearch={onSearch} debounce={200} />);
      for (const text of ['m', 'ma', 'mad', 'madi']) {
        type(text);
        advance(50);
      }
      expect(onSearch).not.toHaveBeenCalled();
      advance(200);
      expect(onSearch).toHaveBeenCalledExactlyOnceWith('madi');
    });

    it('honours a custom delay', () => {
      const onSearch = vi.fn();
      render(<SearchCombobox label="Search" onSearch={onSearch} debounce={800} />);
      type('mad');
      advance(500);
      expect(onSearch).not.toHaveBeenCalled();
      advance(300);
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it('is in the typing state until the delay is up', () => {
      render(<SearchCombobox label="Search" onSearch={vi.fn()} />);
      type('mad');
      expect(root().dataset.state).toBe('typing');
      advance(300);
      expect(root().dataset.state).not.toBe('typing');
    });

    /* Nothing to search for, and no request worth making. */
    it('does not search when the field is emptied', () => {
      const onSearch = vi.fn();
      render(<SearchCombobox label="Search" onSearch={onSearch} />);
      type('m');
      type('');
      advance(600);
      expect(onSearch).not.toHaveBeenCalled();
      expect(root().dataset.state).not.toBe('typing');
    });

    it('does not fire a search scheduled before the component went away', () => {
      const onSearch = vi.fn();
      const { unmount } = render(<SearchCombobox label="Search" onSearch={onSearch} />);
      type('mad');
      unmount();
      advance(600);
      expect(onSearch).not.toHaveBeenCalled();
    });

    it('searches on the keystroke when the delay is zero', () => {
      const onSearch = vi.fn();
      render(<SearchCombobox label="Search" onSearch={onSearch} debounce={0} />);
      type('ma');
      expect(onSearch).toHaveBeenLastCalledWith('ma');
      expect(root().dataset.state).not.toBe('typing');
    });
  });

  describe('recent searches', () => {
    it('shows them when the field is focused and empty', async () => {
      render(<SearchCombobox label="Search" debounce={0} recentSearches={RECENT} />);
      await userEvent.click(box());
      expect(options().map((o) => o.textContent)).toEqual(RECENT);
      expect(screen.getByRole('group', { name: 'Recent searches' })).toBeDefined();
    });

    /* The list is full, but nothing has been searched for yet. */
    it('is the focused state, not the results state', async () => {
      render(<SearchCombobox label="Search" debounce={0} recentSearches={RECENT} />);
      await userEvent.click(box());
      expect(options()).toHaveLength(3);
      expect(root().dataset.state).toBe('focused');
    });

    it('does not open a popup when there are none', async () => {
      render(<SearchCombobox label="Search" debounce={0} />);
      await userEvent.click(box());
      expect(options()).toHaveLength(0);
      expect(root().dataset.state).toBe('focused');
    });

    it('gives way to results once something is typed', async () => {
      render(
        <SearchCombobox label="Search" debounce={0} recentSearches={RECENT} options={OPTIONS} />,
      );
      await userEvent.click(box());
      await userEvent.type(box(), 'mad');
      expect(options().map((o) => o.textContent)).toHaveLength(3);
      expect(screen.queryByRole('group', { name: 'Recent searches' })).toBeNull();
    });

    it('runs a recent search at once rather than waiting out the delay', async () => {
      const onSearch = vi.fn();
      render(<SearchCombobox label="Search" recentSearches={RECENT} onSearch={onSearch} />);
      await userEvent.click(box());
      await userEvent.click(screen.getByRole('option', { name: 'Jeddah' }));
      expect(box().value).toBe('Jeddah');
      expect(onSearch).toHaveBeenCalledExactlyOnceWith('Jeddah');
    });

    it('clears them all on request', async () => {
      const onClearRecent = vi.fn();
      render(
        <SearchCombobox
          label="Search"
          debounce={0}
          recentSearches={RECENT}
          onClearRecent={onClearRecent}
        />,
      );
      await userEvent.click(box());
      await userEvent.click(screen.getByRole('button', { name: 'Clear recent searches' }));
      expect(onClearRecent).toHaveBeenCalledTimes(1);
    });

    it('offers no clear control when the consumer cannot handle it', async () => {
      render(<SearchCombobox label="Search" debounce={0} recentSearches={RECENT} />);
      await userEvent.click(box());
      expect(screen.queryByRole('button', { name: 'Clear recent searches' })).toBeNull();
    });

    /*
     * The popup is portalled to the end of the document, so plain Tab order
     * would reach its button long after everything else on the page.
     */
    it('hands Tab straight to the clear control and back again', async () => {
      render(
        <SearchCombobox
          label="Search"
          debounce={0}
          recentSearches={RECENT}
          onClearRecent={vi.fn()}
        />,
      );
      await userEvent.click(box());
      await userEvent.tab();
      const clear = screen.getByRole('button', { name: 'Clear recent searches' });
      expect(document.activeElement).toBe(clear);

      /* Tab again closes and returns, so the next Tab leaves normally. */
      await userEvent.tab();
      expect(document.activeElement).toBe(box());
      expect(box().getAttribute('aria-expanded')).toBe('false');
    });
  });

  /*
   * Shift+Tab out of the clear button is seen by no key handler here. The
   * popup is portalled to the end of the document, so backwards from it is
   * the field itself, which is still part of the combobox: focus comes home
   * and the popup rightly stays open.
   */
  it('brings focus home on Shift+Tab out of the clear control', async () => {
    render(
      <SearchCombobox
        label="Search"
        debounce={0}
        recentSearches={RECENT}
        onClearRecent={vi.fn()}
      />,
    );
    await userEvent.click(box());
    await userEvent.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Clear recent searches' }),
    );
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(box());
    expect(box().getAttribute('aria-expanded')).toBe('true');
  });

  /* Focus landing anywhere that is not the combobox closes the popup. */
  it('closes when focus leaves the combobox altogether', async () => {
    render(
      <div>
        <button type="button">Before</button>
        <SearchCombobox label="Search" debounce={0} recentSearches={RECENT} />
      </div>,
    );
    await userEvent.click(box());
    expect(box().getAttribute('aria-expanded')).toBe('true');
    screen.getByRole('button', { name: 'Before' }).focus();
    await waitFor(() => expect(box().getAttribute('aria-expanded')).toBe('false'));
  });

  describe('results', () => {
    it('marks the part of the label that matched', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await userEvent.type(box(), 'madinah');
      const marks = screen.getAllByText('Madinah', { selector: 'mark' });
      expect(marks.length).toBeGreaterThan(0);
    });

    it('keeps the label readable around the mark', async () => {
      render(
        <SearchCombobox
          label="Search"
          debounce={0}
          options={[{ id: 'x', label: 'Al Madinah Tours' }]}
        />,
      );
      await userEvent.type(box(), 'madinah');
      expect(options()[0]!.textContent).toBe('Al Madinah Tours');
    });

    it('puts options under their headings', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await userEvent.type(box(), 'mad');
      expect(
        within(screen.getByRole('group', { name: 'Agencies' })).getAllByRole('option'),
      ).toHaveLength(2);
      expect(
        within(screen.getByRole('group', { name: 'Destinations' })).getAllByRole('option'),
      ).toHaveLength(1);
    });

    it('leaves ungrouped options loose in the list', async () => {
      render(
        <SearchCombobox label="Search" debounce={0} options={[{ id: 'x', label: 'Madinah' }]} />,
      );
      await userEvent.type(box(), 'mad');
      expect(screen.queryAllByRole('group')).toHaveLength(0);
      expect(options()).toHaveLength(1);
    });

    it('shows the second line when there is one', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await userEvent.type(box(), 'mad');
      expect(screen.getByText('Kuala Lumpur')).toBeDefined();
    });

    it('reports the count without showing it twice', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await userEvent.type(box(), 'mad');
      expect(screen.getByRole('status').textContent).toBe('3 results');
    });
  });

  describe('states', () => {
    it('is idle before anything happens', () => {
      render(<SearchCombobox label="Search" debounce={0} />);
      expect(root().dataset.state).toBe('idle');
    });

    it('is loading while the consumer says so', async () => {
      render(<SearchCombobox label="Search" debounce={0} loading />);
      await userEvent.type(box(), 'mad');
      expect(root().dataset.state).toBe('loading');
      expect(screen.getByRole('status').textContent).toContain('Searching');
      expect(listbox().getAttribute('aria-busy')).toBe('true');
    });

    it('is empty when the search came back with nothing', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={[]} />);
      await userEvent.type(box(), 'zzz');
      expect(root().dataset.state).toBe('empty');
    });

    /* Not "No results": the message says what was searched for and what to do. */
    it('names the query in the empty message', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={[]} />);
      await userEvent.type(box(), 'Kota Bharu');
      expect(screen.getByRole('status').textContent).toBe(
        "No packages found for 'Kota Bharu'. Try a different keyword.",
      );
    });

    it.each([
      ['ms', (q: string) => `Tiada pakej dijumpai untuk '${q}'. Cuba kata kunci lain.`],
      ['id', (q: string) => `Paket tidak ditemukan untuk '${q}'. Coba kata kunci lain.`],
    ])('takes a translated empty message (%s)', async (_lang, message) => {
      render(<SearchCombobox label="Search" debounce={0} options={[]} emptyMessage={message} />);
      await userEvent.type(box(), 'Kota Bharu');
      expect(screen.getByRole('status').textContent).toBe(message('Kota Bharu'));
    });

    it('takes a plain string empty message too', async () => {
      render(
        <SearchCombobox label="Search" debounce={0} options={[]} emptyMessage="Nothing yet." />,
      );
      await userEvent.type(box(), 'zzz');
      expect(screen.getByRole('status').textContent).toBe('Nothing yet.');
    });

    it('shows a failed search as an alert instead of results', async () => {
      render(
        <SearchCombobox
          label="Search"
          debounce={0}
          options={OPTIONS}
          errorMessage="Search is unavailable. Try again in a moment."
        />,
      );
      await userEvent.type(box(), 'mad');
      expect(root().dataset.state).toBe('error');
      expect(box().getAttribute('aria-invalid')).toBe('true');
      const alerts = screen.getAllByRole('alert').map((a) => a.textContent);
      expect(alerts).toContain('Search is unavailable. Try again in a moment.');
    });

    it('does not open at all when disabled', async () => {
      render(<SearchCombobox label="Search" debounce={0} disabled recentSearches={RECENT} />);
      expect(box().disabled).toBe(true);
      await userEvent.click(box());
      expect(box().getAttribute('aria-expanded')).toBe('false');
      expect(root().dataset.state).toBe('disabled');
    });
  });

  describe('keyboard', () => {
    const open = async () => {
      await userEvent.click(box());
      await userEvent.type(box(), 'mad');
    };

    it('walks the list with the arrows through aria-activedescendant', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await open();
      expect(box().hasAttribute('aria-activedescendant')).toBe(false);

      await userEvent.keyboard('{ArrowDown}');
      expect(activeOption()!.textContent).toContain('Madinah Travel');
      await userEvent.keyboard('{ArrowDown}');
      expect(activeOption()!.textContent).toContain('Al Madinah Tours');
      await userEvent.keyboard('{ArrowUp}');
      expect(activeOption()!.textContent).toContain('Madinah Travel');
    });

    it('never moves focus off the field', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await open();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      expect(document.activeElement).toBe(box());
    });

    it('wraps at both ends', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await open();
      await userEvent.keyboard('{ArrowUp}');
      expect(activeOption()!.textContent).toContain('Madinah');
      expect(options().indexOf(activeOption()!)).toBe(2);
      await userEvent.keyboard('{ArrowDown}');
      expect(options().indexOf(activeOption()!)).toBe(0);
    });

    it('jumps to the ends with Home and End', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await open();
      await userEvent.keyboard('{End}');
      expect(options().indexOf(activeOption()!)).toBe(2);
      await userEvent.keyboard('{Home}');
      expect(options().indexOf(activeOption()!)).toBe(0);
    });

    it('marks the active option for everyone, not only aria', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await open();
      await userEvent.keyboard('{ArrowDown}');
      expect(activeOption()!.getAttribute('aria-selected')).toBe('true');
      expect(activeOption()!.dataset.active).toBe('true');
    });

    it('chooses the active option with Enter', async () => {
      const onSelect = vi.fn();
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} onSelect={onSelect} />);
      await open();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      expect(onSelect).toHaveBeenCalledExactlyOnceWith(OPTIONS[1]);
      expect(box().value).toBe('Al Madinah Tours');
      expect(box().getAttribute('aria-expanded')).toBe('false');
    });

    it('does nothing on Enter with no active option', async () => {
      const onSelect = vi.fn();
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} onSelect={onSelect} />);
      await open();
      await userEvent.keyboard('{Enter}');
      expect(onSelect).not.toHaveBeenCalled();
      expect(box().getAttribute('aria-expanded')).toBe('true');
    });

    it('closes on Escape and keeps what was typed', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await open();
      await userEvent.keyboard('{Escape}');
      expect(box().getAttribute('aria-expanded')).toBe('false');
      expect(box().value).toBe('mad');
      expect(document.activeElement).toBe(box());
    });

    it('empties the field on a second Escape', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await open();
      await userEvent.keyboard('{Escape}{Escape}');
      expect(box().value).toBe('');
    });

    it('reopens with the arrow keys', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await open();
      await userEvent.keyboard('{Escape}{ArrowDown}');
      expect(box().getAttribute('aria-expanded')).toBe('true');
    });

    it('closes on Tab when there is nothing in the popup to reach', async () => {
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} />);
      await open();
      await userEvent.tab();
      expect(box().getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).not.toBe(box());
    });

    it('chooses on click too', async () => {
      const onSelect = vi.fn();
      render(<SearchCombobox label="Search" debounce={0} options={OPTIONS} onSelect={onSelect} />);
      await open();
      await userEvent.click(screen.getByRole('option', { name: /Madinah\s*Saudi Arabia/ }));
      expect(onSelect).toHaveBeenCalledExactlyOnceWith(OPTIONS[2]);
    });
  });

  describe('the query', () => {
    it('works uncontrolled', async () => {
      render(<SearchCombobox label="Search" debounce={0} defaultValue="jeddah" />);
      expect(box().value).toBe('jeddah');
    });

    it('obeys a controlled value and does not move on its own', async () => {
      const onChange = vi.fn();
      render(<SearchCombobox label="Search" debounce={0} value="jeddah" onChange={onChange} />);
      await userEvent.type(box(), 'x');
      expect(onChange).toHaveBeenCalledWith('jeddahx');
      expect(box().value).toBe('jeddah');
    });

    it('round-trips through a controlled parent', async () => {
      function Host() {
        const [query, setQuery] = useState('');
        return <SearchCombobox label="Search" debounce={0} value={query} onChange={setQuery} />;
      }
      render(<Host />);
      await userEvent.type(box(), 'madinah');
      expect(box().value).toBe('madinah');
    });

    it('offers a clear control once there is something to clear', async () => {
      render(<SearchCombobox label="Search" debounce={0} />);
      expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
      await userEvent.type(box(), 'mad');
      await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
      expect(box().value).toBe('');
      expect(document.activeElement).toBe(box());
    });
  });

  describe('the popup', () => {
    it('is portalled out to the body, past any clipping ancestor', async () => {
      render(
        <div style={{ overflow: 'hidden', height: '40px' }}>
          <SearchCombobox label="Search" debounce={0} options={OPTIONS} />
        </div>,
      );
      await userEvent.type(box(), 'mad');
      expect(listbox().closest('.uh-search__layer')?.parentElement).toBe(document.body);
    });

    it('closes when the pointer goes elsewhere', async () => {
      render(
        <div>
          <SearchCombobox label="Search" debounce={0} options={OPTIONS} />
          <button type="button">Somewhere else</button>
        </div>,
      );
      await userEvent.type(box(), 'mad');
      await userEvent.click(screen.getByRole('button', { name: 'Somewhere else' }));
      expect(box().getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('mobile', () => {
    it('opens a full-screen overlay instead of a dropdown', async () => {
      stubViewport(true);
      render(<SearchCombobox label="Search" debounce={0} recentSearches={RECENT} />);
      const trigger = screen.getByRole('button', { name: /Search/ });
      await userEvent.click(trigger);
      const panel = screen.getByRole('dialog', { name: 'Search' });
      expect(panel.getAttribute('aria-modal')).toBe('true');
      /* The real combobox lives in the overlay, so there is still exactly one. */
      expect(within(panel).getByRole('combobox')).toBeDefined();
      expect(screen.getAllByRole('combobox')).toHaveLength(1);
    });

    it('shows the query on the inline trigger while it is closed', () => {
      stubViewport(true);
      render(<SearchCombobox label="Search" debounce={0} defaultValue="Madinah" />);
      expect(screen.getByRole('button', { name: 'Search Madinah' })).toBeDefined();
      expect(screen.queryByRole('combobox')).toBeNull();
    });

    it('closes on Cancel and puts focus back on the trigger', async () => {
      stubViewport(true);
      render(<SearchCombobox label="Search" debounce={0} recentSearches={RECENT} />);
      const trigger = screen.getByRole('button', { name: /Search/ });
      await userEvent.click(trigger);
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('is a plain dropdown on anything wider', async () => {
      stubViewport(false);
      render(<SearchCombobox label="Search" debounce={0} recentSearches={RECENT} />);
      await userEvent.click(box());
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has no violations closed', async () => {
      const { container } = render(
        <SearchCombobox
          label="Search agencies and destinations"
          debounce={0}
          helperText="Try a city or an agency name."
        />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no violations showing recent searches', async () => {
      render(
        <SearchCombobox
          label="Search agencies and destinations"
          debounce={0}
          recentSearches={RECENT}
          onClearRecent={vi.fn()}
        />,
      );
      await userEvent.click(box());
      await expectNoA11yViolations(document.body);
    });

    it('has no violations showing grouped results', async () => {
      render(
        <SearchCombobox label="Search agencies and destinations" debounce={0} options={OPTIONS} />,
      );
      await userEvent.type(box(), 'mad');
      await userEvent.keyboard('{ArrowDown}');
      await expectNoA11yViolations(document.body);
    });

    it('has no violations in the empty state', async () => {
      render(<SearchCombobox label="Search agencies and destinations" debounce={0} options={[]} />);
      await userEvent.type(box(), 'zzz');
      await expectNoA11yViolations(document.body);
    });
  });
});
