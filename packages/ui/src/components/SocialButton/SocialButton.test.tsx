import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { SocialButton, type SocialProvider } from './SocialButton.js';

const PROVIDERS: SocialProvider[] = [
  'google',
  'facebook',
  'apple',
  'github',
  'x',
  'twitter',
  'linkedin',
  'discord',
  'whatsapp',
];

describe('SocialButton', () => {
  it.each(PROVIDERS)('renders a default "Continue with" label for %s', (provider) => {
    render(<SocialButton provider={provider} />);
    expect(screen.getByRole('button').textContent).toContain('Continue with');
  });

  it('renders every provider without crashing, including the hand-drawn ones', () => {
    for (const provider of PROVIDERS) {
      const { unmount } = render(<SocialButton provider={provider} />);
      expect(document.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });

  it('overrides the label when children are given', () => {
    render(<SocialButton provider="google">Sign in with Google</SocialButton>);
    expect(screen.getByRole('button').textContent).toBe('Sign in with Google');
  });

  it('is a real Button underneath: outline variant, full width by default', () => {
    render(<SocialButton provider="google" />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('data-variant')).toBe('outline');
    expect(button.getAttribute('data-full-width')).toBe('true');
  });

  it('can opt out of full width', () => {
    render(<SocialButton provider="google" fullWidth={false} />);
    expect(screen.getByRole('button').getAttribute('data-full-width')).toBeNull();
  });

  it('fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SocialButton provider="github" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables like any other Button - aria-disabled, not the native attribute', () => {
    render(<SocialButton provider="apple" disabled />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  const COLORED_PROVIDERS: SocialProvider[] = [
    'facebook',
    'twitter',
    'linkedin',
    'discord',
    'whatsapp',
  ];

  it.each(COLORED_PROVIDERS)('applies the fixed brand colour on %s while enabled', (provider) => {
    const { container } = render(<SocialButton provider={provider} />);
    const svg = container.querySelector('svg');
    expect(svg?.style.color).not.toBe('');
  });

  it.each(COLORED_PROVIDERS)(
    'drops the fixed brand colour on %s while disabled, so it dims with the button',
    (provider) => {
      const { container } = render(<SocialButton provider={provider} disabled />);
      const svg = container.querySelector('svg');
      // No inline style at all - an inline `style` would otherwise block
      // Button's own disabled `color` from cascading in via `currentColor`.
      expect(svg?.getAttribute('style')).toBeNull();
    },
  );

  it("keeps Google's four brand colours while enabled", () => {
    const { container } = render(<SocialButton provider="google" />);
    const fills = Array.from(container.querySelectorAll('svg path')).map((path) =>
      path.getAttribute('fill'),
    );
    expect(fills).toEqual(['#4285F4', '#34A853', '#FBBC05', '#EA4335']);
  });

  it("falls Google's mark back to currentColor while disabled", () => {
    const { container } = render(<SocialButton provider="google" disabled />);
    const paths = container.querySelectorAll('svg path');
    expect(paths.length).toBe(4);
    for (const path of paths) {
      expect(path.getAttribute('fill')).toBe('currentColor');
    }
  });

  it('forwards a ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<SocialButton provider="google" ref={ref} />);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SocialButton provider="github" />);
    await expectNoA11yViolations(container);
  });
});
