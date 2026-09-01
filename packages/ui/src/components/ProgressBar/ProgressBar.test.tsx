import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { ProgressBar } from './ProgressBar.js';

const track = () => screen.getByRole('progressbar');

describe('ProgressBar', () => {
  it('names itself via aria-label when the label is not shown visibly', () => {
    render(<ProgressBar label="Uploading passport.pdf" value={40} />);
    expect(screen.getByRole('progressbar', { name: 'Uploading passport.pdf' })).toBeDefined();
    expect(screen.queryByText('Uploading passport.pdf')).toBeNull();
  });

  it('shows the label visibly and names itself via aria-labelledby', () => {
    render(<ProgressBar label="Uploading passport.pdf" value={40} showLabel />);
    expect(screen.getByText('Uploading passport.pdf')).toBeDefined();
    expect(screen.getByRole('progressbar', { name: 'Uploading passport.pdf' })).toBeDefined();
  });

  it('reports value, min and max for a determinate bar', () => {
    render(<ProgressBar label="Step" value={3} max={5} />);
    const bar = track();
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('5');
    expect(bar.getAttribute('aria-valuenow')).toBe('3');
    expect(bar.getAttribute('aria-valuetext')).toBe('60%');
  });

  it('clamps value into [0, max]', () => {
    const { rerender } = render(<ProgressBar label="Step" value={-10} max={5} />);
    expect(track().getAttribute('aria-valuenow')).toBe('0');
    rerender(<ProgressBar label="Step" value={99} max={5} />);
    expect(track().getAttribute('aria-valuenow')).toBe('5');
  });

  it('sets the fill width from the raw fraction, not the formatted percent string', () => {
    render(<ProgressBar label="Step" value={1} max={3} />);
    const fill = document.querySelector('.uh-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe(`${(1 / 3) * 100}%`);
  });

  it('shows a formatted percentage next to the label when asked', () => {
    render(<ProgressBar label="Upload" value={1} max={4} showLabel showValue />);
    expect(screen.getByText('25%')).toBeDefined();
  });

  it('formats the percentage through the given locale', () => {
    render(<ProgressBar label="Muat naik" value={1} max={4} showLabel showValue locale="ar" />);
    /* Arabic-Indic digits and sign placement differ from the Latin default -
       proof the value actually goes through Intl and not a hand-built string. */
    const value = document.querySelector('.uh-progress__value')!;
    expect(value.textContent).not.toBe('25%');
  });

  describe('indeterminate', () => {
    it('omits aria-valuenow and aria-valuetext entirely', () => {
      render(<ProgressBar label="Processing payment" indeterminate />);
      const bar = track();
      expect(bar.hasAttribute('aria-valuenow')).toBe(false);
      expect(bar.hasAttribute('aria-valuetext')).toBe(false);
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
    });

    it('does not show a percentage even if showValue is set', () => {
      render(<ProgressBar label="Processing payment" indeterminate showLabel showValue />);
      expect(document.querySelector('.uh-progress__value')).toBeNull();
    });

    it('marks the track for the CSS-driven stripe', () => {
      render(<ProgressBar label="Processing payment" indeterminate />);
      expect(track().getAttribute('data-indeterminate')).toBe('true');
    });
  });

  describe('variants', () => {
    it.each(['default', 'success', 'error'] as const)('carries %s through', (variant) => {
      render(<ProgressBar label="Step" value={1} variant={variant} />);
      expect(document.querySelector('.uh-progress')?.getAttribute('data-variant')).toBe(variant);
    });
  });

  describe('accessibility', () => {
    it('has no violations, determinate with a visible label and value', async () => {
      render(<ProgressBar label="Uploading passport.pdf" value={62} showLabel showValue />);
      await expectNoA11yViolations(document.body);
    });

    it('has no violations, indeterminate', async () => {
      render(<ProgressBar label="Processing payment" indeterminate />);
      await expectNoA11yViolations(document.body);
    });
  });
});
