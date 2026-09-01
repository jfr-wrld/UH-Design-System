import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Separator } from './Separator.js';

describe('Separator', () => {
  it('defaults to a horizontal, real separator', () => {
    render(<Separator />);
    const el = screen.getByRole('separator');
    expect(el.getAttribute('aria-orientation')).toBe('horizontal');
    expect(el.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('switches to vertical', () => {
    render(<Separator orientation="vertical" />);
    const el = screen.getByRole('separator');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
    expect(el.getAttribute('data-orientation')).toBe('vertical');
  });

  it('drops the separator role and aria-orientation when decorative', () => {
    const { container } = render(<Separator decorative />);
    expect(screen.queryByRole('separator')).toBeNull();
    const el = container.querySelector('.uh-separator')!;
    expect(el.getAttribute('role')).toBe('none');
    expect(el.getAttribute('aria-orientation')).toBeNull();
    // Still visually oriented even when decorative.
    expect(el.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('forwards a custom className', () => {
    const { container } = render(<Separator className="custom" />);
    expect(container.querySelector('.uh-separator.custom')).not.toBeNull();
  });

  it('has no accessibility violations, real or decorative', async () => {
    const { container, rerender } = render(<Separator />);
    await expectNoA11yViolations(container);
    rerender(<Separator decorative />);
    await expectNoA11yViolations(container);
  });
});
