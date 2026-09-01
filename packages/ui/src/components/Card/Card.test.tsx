import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Card } from './Card.js';

describe('Card', () => {
  it('renders static content with no hit area', () => {
    render(
      <Card>
        <p>Just some content.</p>
      </Card>,
    );
    expect(screen.getByText('Just some content.')).toBeDefined();
    expect(document.querySelector('.uh-card__hit-area')).toBeNull();
    expect(document.querySelector('.uh-card')?.getAttribute('data-interactive')).toBeNull();
  });

  it('defaults to variant outlined and padding md', () => {
    render(<Card>Content</Card>);
    const card = document.querySelector('.uh-card')!;
    expect(card.getAttribute('data-card-variant')).toBe('outlined');
    expect(card.getAttribute('data-padding')).toBe('md');
  });

  it('carries variant and padding through', () => {
    render(
      <Card variant="elevated" padding="lg">
        Content
      </Card>,
    );
    const card = document.querySelector('.uh-card')!;
    expect(card.getAttribute('data-card-variant')).toBe('elevated');
    expect(card.getAttribute('data-padding')).toBe('lg');
  });

  describe('as a link', () => {
    it('renders a whole-card link named by label', () => {
      render(
        <Card href="/packages/123" label="9-Day Umrah Package - Istanbul Transit">
          <p>Card content</p>
        </Card>,
      );
      const link = screen.getByRole('link', { name: '9-Day Umrah Package - Istanbul Transit' });
      expect(link.getAttribute('href')).toBe('/packages/123');
      expect(document.querySelector('.uh-card')?.getAttribute('data-interactive')).toBe('true');
    });

    it('is hoverable by default when interactive', () => {
      render(
        <Card href="/packages/123" label="Package">
          Content
        </Card>,
      );
      expect(document.querySelector('.uh-card')?.getAttribute('data-hoverable')).toBe('true');
    });

    it('can turn hoverable off explicitly', () => {
      render(
        <Card href="/packages/123" label="Package" hoverable={false}>
          Content
        </Card>,
      );
      expect(document.querySelector('.uh-card')?.getAttribute('data-hoverable')).toBeNull();
    });
  });

  describe('as a button', () => {
    it('renders a whole-card button named by label and fires onClick', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Card onClick={onClick} label="Select this agency">
          <p>Agency content</p>
        </Card>,
      );
      const button = screen.getByRole('button', { name: 'Select this agency' });
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      const onClick = vi.fn();
      render(
        <Card onClick={onClick} label="Select" disabled>
          Content
        </Card>,
      );
      const button = screen.getByRole('button', { name: 'Select' });
      expect(button).toHaveProperty('disabled', true);
    });
  });

  describe('nested independent actions', () => {
    it('a nested button with .uh-card__action still fires on its own', async () => {
      const user = userEvent.setup();
      const onCardClick = vi.fn();
      const onWishlist = vi.fn();
      render(
        <Card onClick={onCardClick} label="Package">
          <button
            type="button"
            className="uh-card__action"
            onClick={(event) => {
              event.stopPropagation();
              onWishlist();
            }}
          >
            Save
          </button>
        </Card>,
      );
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(onWishlist).toHaveBeenCalledTimes(1);
      expect(onCardClick).not.toHaveBeenCalled();
    });
  });

  describe('not disabled by default', () => {
    it('href card has no disabled concept - always clickable', () => {
      render(
        <Card href="/x" label="Go">
          Content
        </Card>,
      );
      expect(screen.getByRole('link')).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has no violations as a static card', async () => {
      render(
        <Card>
          <h3>A heading</h3>
          <p>Some body copy.</p>
        </Card>,
      );
      await expectNoA11yViolations(document.body);
    });

    it('has no violations as an interactive link card with a nested action', async () => {
      render(
        <Card href="/packages/123" label="9-Day Umrah Package - Istanbul Transit">
          <p>From RM 12,500</p>
          <button type="button" className="uh-card__action">
            Save
          </button>
        </Card>,
      );
      await expectNoA11yViolations(document.body);
    });

    it('has no violations as an interactive button card', async () => {
      render(
        <Card onClick={() => {}} label="Select this agency">
          <p>Trusted Umrah Travel</p>
        </Card>,
      );
      await expectNoA11yViolations(document.body);
    });
  });
});
