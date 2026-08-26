import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Spinner } from './Spinner.js';

describe('Spinner', () => {
  it('announces itself as a status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeDefined();
  });

  it('takes a custom label', () => {
    render(<Spinner label="Memuatkan pakej" />);
    expect(screen.getByRole('status', { name: 'Memuatkan pakej' })).toBeDefined();
  });

  it('goes silent when decorative', () => {
    const { container } = render(<Spinner decorative />);
    // For a spinner inside a control that already announces its busy state.
    expect(screen.queryByRole('status')).toBeNull();
    expect(container.querySelector('.uh-spinner')?.getAttribute('aria-hidden')).toBe('true');
  });

  it.each(['sm', 'md', 'lg'] as const)('carries size %s', (size) => {
    const { container } = render(<Spinner size={size} />);
    expect(container.querySelector('.uh-spinner')?.getAttribute('data-size')).toBe(size);
  });

  it.each(['inherit', 'primary', 'white'] as const)('carries colour %s', (color) => {
    const { container } = render(<Spinner color={color} />);
    expect(container.querySelector('.uh-spinner')?.getAttribute('data-color')).toBe(color);
  });

  it('keeps the artwork out of the accessibility tree', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Spinner size="sm" />
        <Spinner size="lg" color="primary" label="Loading packages" />
        <Spinner decorative />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
