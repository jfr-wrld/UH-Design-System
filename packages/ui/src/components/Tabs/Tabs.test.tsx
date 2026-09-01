import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Tabs, type TabItem } from './Tabs.js';

const ITEMS: TabItem[] = [
  { id: 'overview', label: 'Overview', content: <p>Overview content</p> },
  { id: 'itinerary', label: 'Itinerary', content: <p>Itinerary content</p> },
  { id: 'hotel', label: 'Hotel', content: <p>Hotel content</p> },
  { id: 'reviews', label: 'Reviews', content: <p>Reviews content</p> },
];

describe('Tabs', () => {
  it('selects the first item by default and renders only its panel', () => {
    render(<Tabs items={ITEMS} label="Package sections" />);
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(screen.getByText('Overview content')).toBeDefined();
    expect(screen.queryByText('Itinerary content')).toBeNull();
  });

  it('switches panels on click', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} label="Package sections" />);
    await user.click(screen.getByRole('tab', { name: 'Itinerary' }));
    expect(screen.getByRole('tab', { name: 'Itinerary' }).getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(screen.getByText('Itinerary content')).toBeDefined();
    expect(screen.queryByText('Overview content')).toBeNull();
  });

  it('only the selected tab is in the tab order', () => {
    render(<Tabs items={ITEMS} label="Package sections" />);
    expect(screen.getByRole('tab', { name: 'Overview' }).getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('tab', { name: 'Itinerary' }).getAttribute('tabindex')).toBe('-1');
  });

  it('moves and activates with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} label="Package sections" />);
    screen.getByRole('tab', { name: 'Overview' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Itinerary' }));
    expect(screen.getByRole('tab', { name: 'Itinerary' }).getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('wraps from the last tab to the first with ArrowRight', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} label="Package sections" defaultValue="reviews" />);
    screen.getByRole('tab', { name: 'Reviews' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Overview' }));
  });

  it('Home and End jump to the first and last tab', async () => {
    const user = userEvent.setup();
    render(<Tabs items={ITEMS} label="Package sections" defaultValue="itinerary" />);
    screen.getByRole('tab', { name: 'Itinerary' }).focus();
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Reviews' }));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Overview' }));
  });

  it('skips a disabled tab when navigating with the arrow keys', async () => {
    const user = userEvent.setup();
    const items: TabItem[] = [
      { id: 'a', label: 'A', content: <p>A</p> },
      { id: 'b', label: 'B', content: <p>B</p>, disabled: true },
      { id: 'c', label: 'C', content: <p>C</p> },
    ];
    render(<Tabs items={items} label="Letters" />);
    screen.getByRole('tab', { name: 'A' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'C' }));
  });

  it('round-trips through a controlling parent', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('overview');
      return (
        <Tabs
          items={ITEMS}
          label="Package sections"
          value={value}
          onChange={(id) => {
            setValue(id);
            onChange(id);
          }}
        />
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('tab', { name: 'Hotel' }));
    expect(onChange).toHaveBeenCalledWith('hotel');
    expect(screen.getByRole('tab', { name: 'Hotel' }).getAttribute('aria-selected')).toBe('true');
  });

  it('has no accessibility violations', async () => {
    render(<Tabs items={ITEMS} label="Package sections" />);
    await expectNoA11yViolations(document.body);
  });
});
