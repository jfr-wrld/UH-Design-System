import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Button, type ButtonVariant } from './Button.js';

const VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'link',
  'destructive',
];

describe('Button', () => {
  it('renders a button with an accessible name', () => {
    render(<Button>Book Now</Button>);
    expect(screen.getByRole('button', { name: 'Book Now' })).toBeDefined();
  });

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Book Now</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  it('exposes variant and size as data attributes', () => {
    render(
      <Button variant="secondary" size="lg">
        Continue to Payment
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.dataset.variant).toBe('secondary');
    expect(button.dataset.size).toBe('lg');
  });

  describe('disabled', () => {
    it('uses aria-disabled and stays focusable, rather than the disabled attribute', async () => {
      render(<Button disabled>Book Now</Button>);
      const button = screen.getByRole('button');

      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.hasAttribute('disabled')).toBe(false);

      // The whole point of aria-disabled: it can still be reached and read.
      await userEvent.tab();
      expect(document.activeElement).toBe(button);
    });

    it('blocks click', async () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Book Now
        </Button>,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('blocks keyboard activation', async () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Book Now
        </Button>,
      );
      screen.getByRole('button').focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('loading', () => {
    it('announces busy state and keeps the label in the DOM for width', () => {
      render(<Button loading>Continue to Payment</Button>);
      const button = screen.getByRole('button');

      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(button.getAttribute('aria-disabled')).toBe('true');
      // Hidden with visibility, not removed - that is what holds the width.
      expect(button.textContent).toContain('Continue to Payment');
    });

    it('exposes a text alternative for the spinner', () => {
      render(
        <Button loading loadingLabel="Processing payment">
          Continue to Payment
        </Button>,
      );
      expect(screen.getByRole('button').textContent).toContain('Processing payment');
    });

    it('blocks click', async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Book Now
        </Button>,
      );
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('as="a"', () => {
    it('renders an anchor that keeps its href', () => {
      render(
        <Button as="a" href="/packages">
          View Package Details
        </Button>,
      );
      const link = screen.getByRole('link', { name: 'View Package Details' });
      expect(link.tagName).toBe('A');
      expect(link.getAttribute('href')).toBe('/packages');
    });

    it('keeps the href when disabled so it stays focusable, but blocks navigation', async () => {
      const onClick = vi.fn();
      render(
        <Button as="a" href="/packages" disabled onClick={onClick}>
          View Package Details
        </Button>,
      );
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/packages');
      expect(link.getAttribute('aria-disabled')).toBe('true');

      await userEvent.click(link);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  it('names an icon-only button from aria-label', () => {
    render(
      <Button iconOnly aria-label="Save package">
        <svg viewBox="0 0 24 24" />
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Save package' })).toBeDefined();
  });

  it('hides decorative icons from the accessibility tree', () => {
    render(<Button leftIcon={<svg viewBox="0 0 24 24" />}>Book Now</Button>);
    // The name comes from the label alone, not from the icon.
    expect(screen.getByRole('button', { name: 'Book Now' })).toBeDefined();
  });

  it('forwards a ref to the underlying element', () => {
    const ref = createRef<HTMLButtonElement & HTMLAnchorElement>();
    render(<Button ref={ref}>Book Now</Button>);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('calls onClick when active', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Book Now</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe('accessibility', () => {
    for (const variant of VARIANTS) {
      it(`has no axe violations: ${variant}`, async () => {
        const { container } = render(<Button variant={variant}>Book Now</Button>);
        await expectNoA11yViolations(container);
      });
    }

    it('has no axe violations: loading', async () => {
      const { container } = render(<Button loading>Continue to Payment</Button>);
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: icon-only', async () => {
      const { container } = render(
        <Button iconOnly aria-label="Save package">
          <svg viewBox="0 0 24 24" />
        </Button>,
      );
      await expectNoA11yViolations(container);
    });
  });
});
