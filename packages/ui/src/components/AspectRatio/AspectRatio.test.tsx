import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { AspectRatio } from './AspectRatio.js';

describe('AspectRatio', () => {
  it('defaults to the video ratio', () => {
    const { container } = render(<AspectRatio>content</AspectRatio>);
    expect(container.querySelector('.uh-aspect-ratio')?.getAttribute('data-ratio')).toBe('video');
  });

  it('switches to a different named preset', () => {
    const { container } = render(<AspectRatio ratio="square">content</AspectRatio>);
    expect(container.querySelector('.uh-aspect-ratio')?.getAttribute('data-ratio')).toBe('square');
  });

  it('renders every named preset', () => {
    const presets = ['square', 'video', '4/3', '3/4', '21/9', '9/16', '3/2', '2/3'] as const;
    for (const ratio of presets) {
      const { container, unmount } = render(<AspectRatio ratio={ratio}>content</AspectRatio>);
      expect(container.querySelector('.uh-aspect-ratio')?.getAttribute('data-ratio')).toBe(ratio);
      unmount();
    }
  });

  it('applies a custom numeric ratio via inline style, overriding the preset attribute', () => {
    const { container } = render(
      <AspectRatio ratio="square" customRatio={2.5}>
        content
      </AspectRatio>,
    );
    const el = container.querySelector('.uh-aspect-ratio') as HTMLDivElement;
    // The CSSOM always serialises a bare number back out with its implied
    // "/ 1" denominator - "2.5" set is "2.5 / 1" read back, in a real
    // browser too, not only here.
    expect(el.style.aspectRatio).toBe('2.5 / 1');
    // The preset attribute steps aside once a custom ratio wins, so no
    // stylesheet rule silently fights the inline style.
    expect(el.hasAttribute('data-ratio')).toBe(false);
  });

  it('preserves a caller-provided style alongside a custom ratio', () => {
    const { container } = render(
      <AspectRatio customRatio={1.5} style={{ borderRadius: '8px' }}>
        content
      </AspectRatio>,
    );
    const el = container.querySelector('.uh-aspect-ratio') as HTMLDivElement;
    expect(el.style.borderRadius).toBe('8px');
    expect(el.style.aspectRatio).toBe('1.5 / 1');
  });

  it('renders its children', () => {
    const { getByAltText } = render(
      <AspectRatio>
        <img src="/hotel.jpg" alt="Hotel exterior" />
      </AspectRatio>,
    );
    expect(getByAltText('Hotel exterior')).toBeDefined();
  });

  it('forwards native div attributes, like a caller className', () => {
    const { container } = render(<AspectRatio className="custom">content</AspectRatio>);
    const el = container.querySelector('.uh-aspect-ratio')!;
    expect(el.classList.contains('custom')).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AspectRatio>
        <img src="/hotel.jpg" alt="Hotel exterior" />
      </AspectRatio>,
    );
    await expectNoA11yViolations(container);
  });
});
