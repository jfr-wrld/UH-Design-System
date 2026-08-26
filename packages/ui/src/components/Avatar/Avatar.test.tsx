import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Avatar, AvatarGroup } from './Avatar.js';
import { initialsFrom } from './initials.js';

describe('initialsFrom', () => {
  it('takes the first and last word, skipping the patronymic', () => {
    // "bin" is the least identifying part of a Malay name, so it is not used.
    expect(initialsFrom('Ahmad bin Abdullah')).toBe('AA');
    expect(initialsFrom('Siti Nurhaliza binti Tarudin')).toBe('ST');
  });

  it('handles a single word and stray whitespace', () => {
    expect(initialsFrom('Fatimah')).toBe('FA');
    expect(initialsFrom('  Ahmad   Abdullah  ')).toBe('AA');
    expect(initialsFrom('')).toBe('');
  });
});

describe('Avatar', () => {
  it('shows the image when it loads', () => {
    render(<Avatar src="/pilgrim.jpg" alt="Ahmad bin Abdullah" />);
    const img = screen.getByRole('img', { name: 'Ahmad bin Abdullah' });
    expect(img.tagName).toBe('IMG');
  });

  it('falls back to initials when the image fails', () => {
    render(<Avatar src="/broken.jpg" name="Ahmad bin Abdullah" />);
    fireEvent.error(document.querySelector('img') as HTMLImageElement);

    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText('AA')).toBeDefined();
    // The wrapper takes over naming once the <img> is gone.
    expect(screen.getByRole('img', { name: 'Ahmad bin Abdullah' })).toBeDefined();
  });

  it('retries when the src changes', () => {
    const { rerender } = render(<Avatar src="/broken.jpg" name="Ahmad Abdullah" />);
    fireEvent.error(document.querySelector('img') as HTMLImageElement);
    expect(document.querySelector('img')).toBeNull();

    rerender(<Avatar src="/works.jpg" name="Ahmad Abdullah" />);
    expect(document.querySelector('img')).not.toBeNull();
  });

  it('falls back to initials when there is no src', () => {
    render(<Avatar name="Siti Nurhaliza" />);
    expect(screen.getByText('SN')).toBeDefined();
  });

  it('falls back to a generic icon with no name, and hides it', () => {
    const { container } = render(<Avatar />);
    // Nothing to announce, so it must not be announced.
    expect(container.querySelector('.uh-avatar')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.uh-avatar__icon')).not.toBeNull();
  });

  it('carries size and shape', () => {
    const { container } = render(<Avatar name="Ahmad Abdullah" size="xl" shape="square" />);
    const el = container.querySelector('.uh-avatar');
    expect(el?.getAttribute('data-size')).toBe('xl');
    expect(el?.getAttribute('data-shape')).toBe('square');
  });
});

describe('AvatarGroup', () => {
  it('shows every avatar when under the limit', () => {
    render(
      <AvatarGroup max={4}>
        <Avatar name="Ahmad Abdullah" />
        <Avatar name="Siti Tarudin" />
      </AvatarGroup>,
    );
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it('collapses the remainder into a counter', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="Ahmad Abdullah" />
        <Avatar name="Siti Tarudin" />
        <Avatar name="Farid Rahman" />
        <Avatar name="Nurul Aina" />
      </AvatarGroup>,
    );
    expect(screen.getByText('+2')).toBeDefined();
    expect(screen.getByRole('img', { name: '2 more' })).toBeDefined();
  });

  it('accepts a localised overflow label', () => {
    render(
      <AvatarGroup max={1} overflowLabel={(n) => `${n} lagi`}>
        <Avatar name="Ahmad Abdullah" />
        <Avatar name="Siti Tarudin" />
      </AvatarGroup>,
    );
    expect(screen.getByRole('img', { name: '1 lagi' })).toBeDefined();
  });

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <AvatarGroup max={3}>
          <Avatar name="Ahmad bin Abdullah" />
          <Avatar name="Siti Nurhaliza" />
          <Avatar />
          <Avatar name="Farid Rahman" />
        </AvatarGroup>,
      );
      await expectNoA11yViolations(container);
    });
  });
});
