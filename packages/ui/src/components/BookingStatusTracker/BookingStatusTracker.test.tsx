import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { BookingStatusTracker } from './BookingStatusTracker.js';
import { DEFAULT_STEPS } from './labels.js';

const list = () => screen.getByRole('list', { name: 'Booking progress' });
const steps = () => within(list()).getAllByRole('listitem');

describe('BookingStatusTracker', () => {
  it('is one ordered list with the default four-step journey', () => {
    render(<BookingStatusTracker currentStep={1} />);
    expect(list().tagName).toBe('OL');
    expect(steps()).toHaveLength(4);
    expect(steps()[0]!.textContent).toContain('Booking');
    expect(steps()[3]!.textContent).toContain('Ready to Depart');
  });

  describe('states from the index', () => {
    it('splits the journey at currentStep', () => {
      render(<BookingStatusTracker currentStep={2} />);
      expect(steps().map((step) => step.getAttribute('data-state'))).toEqual([
        'completed',
        'completed',
        'current',
        'upcoming',
      ]);
    });

    it('marks only the current step with aria-current', () => {
      render(<BookingStatusTracker currentStep={2} />);
      const current = steps().filter((step) => step.getAttribute('aria-current') === 'step');
      expect(current).toHaveLength(1);
      expect(current[0]!.textContent).toContain('Documents');
    });

    it('says every state in words, not colour alone', () => {
      render(<BookingStatusTracker currentStep={1} />);
      expect(steps()[0]!.textContent).toContain('Completed');
      expect(steps()[1]!.textContent).toContain('Current step');
      expect(steps()[2]!.textContent).toContain('Not started');
    });

    /* An error can sit anywhere: a failed payment is the current step gone
       wrong, rejected documents a completed one reopened. */
    it('lets error override any position', () => {
      render(
        <BookingStatusTracker
          steps={[{ label: 'Booking' }, { label: 'Payment', error: true }, { label: 'Documents' }]}
          currentStep={1}
        />,
      );
      expect(steps()[1]!.getAttribute('data-state')).toBe('error');
      expect(steps()[1]!.textContent).toContain('Needs attention');
    });

    it('holds at every step done when currentStep runs past the end', () => {
      render(<BookingStatusTracker currentStep={99} />);
      expect(steps().every((step) => step.getAttribute('data-state') === 'completed')).toBe(true);
    });
  });

  describe('details', () => {
    it('shows a description and a timestamp when a step has them', () => {
      render(
        <BookingStatusTracker
          steps={[
            {
              label: 'Payment',
              description: 'Paid by FPX transfer.',
              timestamp: new Date(2026, 2, 15, 14, 32),
            },
            { label: 'Documents' },
          ]}
          currentStep={1}
          locale="en-MY"
        />,
      );
      expect(screen.getByText('Paid by FPX transfer.')).toBeDefined();
      const stamp = document.querySelector('time')!;
      expect(stamp.getAttribute('datetime')).toContain('2026-03-15');
      expect(stamp.textContent).toContain('15 Mar');
    });

    it('formats the stamp for the locale', () => {
      render(
        <BookingStatusTracker
          steps={[{ label: 'Pembayaran', timestamp: new Date(2026, 2, 15, 14, 32) }]}
          currentStep={0}
          locale="ms-MY"
        />,
      );
      expect(document.querySelector('time')!.textContent).toContain('Mac');
    });
  });

  describe('variants', () => {
    it('is horizontal by default and vertical on request', () => {
      const { rerender } = render(<BookingStatusTracker currentStep={0} />);
      expect(list().getAttribute('data-variant')).toBe('horizontal');
      rerender(<BookingStatusTracker currentStep={0} variant="vertical" />);
      expect(list().getAttribute('data-variant')).toBe('vertical');
    });
  });

  describe('translation', () => {
    it('takes translated steps and state words', () => {
      render(
        <BookingStatusTracker
          steps={[
            { label: 'Tempahan' },
            { label: 'Pembayaran' },
            { label: 'Dokumen' },
            { label: 'Sedia Berlepas' },
          ]}
          currentStep={1}
          labels={{ tracker: 'Status tempahan', completed: 'Selesai', current: 'Langkah semasa' }}
        />,
      );
      /* Not the steps() helper: its list query names the English tracker. */
      const translated = within(screen.getByRole('list', { name: 'Status tempahan' })).getAllByRole(
        'listitem',
      );
      expect(translated[0]!.textContent).toContain('Selesai');
      expect(translated[1]!.textContent).toContain('Langkah semasa');
    });
  });

  it('exports the default journey for extension', () => {
    expect(DEFAULT_STEPS.map((step) => step.label)).toEqual([
      'Booking',
      'Payment',
      'Documents',
      'Ready to Depart',
    ]);
  });

  describe('accessibility', () => {
    it('has no violations in either direction, error included', async () => {
      const { container, rerender } = render(
        <BookingStatusTracker
          steps={[
            { label: 'Booking', timestamp: new Date(2026, 2, 1) },
            { label: 'Payment', error: true, description: 'Card was declined. Try again.' },
            { label: 'Documents' },
            { label: 'Ready to Depart' },
          ]}
          currentStep={1}
        />,
      );
      await expectNoA11yViolations(container);
      rerender(<BookingStatusTracker currentStep={2} variant="vertical" />);
      await expectNoA11yViolations(container);
    });
  });
});
