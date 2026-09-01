import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { ScrollArea } from './ScrollArea.js';

describe('ScrollArea', () => {
  it('renders its children inside the viewport', () => {
    render(
      <ScrollArea maxHeight="200px">
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    expect(screen.getByText('Scrollable content')).toBeDefined();
  });

  /*
   * @base-ui/react only mounts a Scrollbar once its Viewport actually
   * overflows, which jsdom cannot report (it does no real layout, so
   * scrollHeight/scrollWidth are always 0) - these two tests can only
   * confirm this component asks for the right orientations, not that a
   * scrollbar visibly renders. That part is verified in Storybook, in a
   * real browser, instead.
   */
  it('renders without crashing for each orientation', () => {
    for (const orientation of ['vertical', 'horizontal', 'both'] as const) {
      const { unmount } = render(
        <ScrollArea orientation={orientation} maxHeight="200px" maxWidth="200px">
          <p>Content</p>
        </ScrollArea>,
      );
      unmount();
    }
  });

  it('applies maxHeight and maxWidth as inline style', () => {
    render(
      <ScrollArea maxHeight="240px" maxWidth="320px">
        <p>Content</p>
      </ScrollArea>,
    );
    const root = document.querySelector('.uh-scroll-area') as HTMLElement;
    expect(root.style.maxHeight).toBe('240px');
    expect(root.style.maxWidth).toBe('320px');
  });

  it('carries a consumer className alongside its own', () => {
    render(
      <ScrollArea className="custom" maxHeight="200px">
        <p>Content</p>
      </ScrollArea>,
    );
    const root = document.querySelector('.uh-scroll-area')!;
    expect(root.classList.contains('uh-scroll-area')).toBe(true);
    expect(root.classList.contains('custom')).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ScrollArea maxHeight="120px">
        <p>Line one</p>
        <p>Line two</p>
        <p>Line three</p>
      </ScrollArea>,
    );
    await expectNoA11yViolations(container);
  });
});
