import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs.js';

const ITEMS: BreadcrumbItem[] = [
  { href: '/', label: 'Home' },
  { href: '/umrah', label: 'Umrah' },
  { href: '/umrah/reguler', label: 'Umrah Reguler 9 Hari' },
];

describe('Breadcrumbs', () => {
  it('renders a labelled nav landmark holding an ordered list of links', () => {
    render(<Breadcrumbs items={ITEMS} label="Breadcrumb" />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('list').tagName).toBe('OL');
    expect(within(nav).getAllByRole('link')).toHaveLength(3);
  });

  it('links every item to its own href', () => {
    render(<Breadcrumbs items={ITEMS} label="Breadcrumb" />);
    expect(screen.getByRole('link', { name: 'Umrah' }).getAttribute('href')).toBe('/umrah');
  });

  it('marks only the last item as the current page', () => {
    render(<Breadcrumbs items={ITEMS} label="Breadcrumb" />);
    expect(
      screen.getByRole('link', { name: 'Umrah Reguler 9 Hari' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByRole('link', { name: 'Umrah' }).getAttribute('aria-current')).toBeNull();
  });

  it('renders one fewer divider than items, none of them announced', () => {
    const { container } = render(<Breadcrumbs items={ITEMS} label="Breadcrumb" />);
    const dividers = container.querySelectorAll('.uh-breadcrumbs__divider');
    expect(dividers).toHaveLength(ITEMS.length - 1);
    for (const divider of dividers) {
      expect(divider.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('defaults to a slash divider', () => {
    const { container } = render(<Breadcrumbs items={ITEMS} label="Breadcrumb" />);
    expect(container.querySelector('.uh-breadcrumbs__divider')?.textContent).toBe('/');
  });

  it('switches to a chevron divider', () => {
    const { container } = render(
      <Breadcrumbs items={ITEMS} label="Breadcrumb" dividerType="chevron" />,
    );
    expect(container.querySelector('.uh-breadcrumbs__divider svg')).not.toBeNull();
  });

  it('switches to a dot divider', () => {
    const { container } = render(
      <Breadcrumbs items={ITEMS} label="Breadcrumb" dividerType="dot" />,
    );
    expect(container.querySelector('.uh-breadcrumbs__divider')?.getAttribute('data-shape')).toBe(
      'dot',
    );
  });

  it('renders a per-item icon, hidden from assistive tech since the label already says the same thing', () => {
    render(
      <Breadcrumbs
        items={[{ href: '/', label: 'Home', icon: <svg data-testid="home-icon" /> }]}
        label="Breadcrumb"
      />,
    );
    const icon = screen.getByTestId('home-icon').closest('.uh-breadcrumbs__icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Breadcrumbs items={ITEMS} label="Breadcrumb" />);
    await expectNoA11yViolations(container);
  });
});
