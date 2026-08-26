import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { AgencyCard, type AgencyCardProps } from './AgencyCard.js';

const base: AgencyCardProps = {
  name: 'Madinah Travel & Tours',
  licenseNumber: 'KPK/LN 8821',
  licenseType: 'TOB',
  verified: true,
};

const card = () => document.querySelector('.uh-agency') as HTMLElement;

/* Pinned so the years-in-operation copy does not depend on the run date. */
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 5, 1));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AgencyCard', () => {
  it('shows the name, the licence and the verified mark', () => {
    render(<AgencyCard {...base} />);
    expect(screen.getByText('Madinah Travel & Tours')).toBeDefined();
    expect(screen.getByText('KPK/LN 8821')).toBeDefined();
    expect(screen.getByText('TOB')).toBeDefined();
    expect(screen.getByText('Verified Agency')).toBeDefined();
  });

  /* The verified mark is the trust signal the card exists for: words with an
     icon, never an icon alone. */
  it('states verification in words, not only with an icon', () => {
    render(<AgencyCard {...base} />);
    const mark = screen.getByText('Verified Agency');
    expect(mark.querySelector('svg')).not.toBeNull();
  });

  it('shows no verified mark for an unverified agency', () => {
    render(<AgencyCard {...base} verified={false} />);
    expect(screen.queryByText('Verified Agency')).toBeNull();
  });

  describe('roles', () => {
    /*
     * The compact form rides inside PackageCard, whose whole surface is
     * already clickable; a nested interactive layer there would fight it. So
     * the card is a button only when it is given something to do.
     */
    it('is a plain article without a handler', () => {
      render(<AgencyCard {...base} />);
      expect(screen.getByRole('article')).toBeDefined();
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('is a button with one', async () => {
      const onClick = vi.fn();
      render(<AgencyCard {...base} onClick={onClick} />);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is operable from the keyboard', async () => {
      const onClick = vi.fn();
      render(<AgencyCard {...base} onClick={onClick} />);
      await userEvent.tab();
      await userEvent.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('variants', () => {
    it('is compact by default', () => {
      render(<AgencyCard {...base} />);
      expect(card().dataset.variant).toBe('compact');
    });

    it('keeps the profile facts out of the compact form', () => {
      render(
        <AgencyCard
          {...base}
          variant="compact"
          operatingSince={2014}
          packageCount={38}
          badges={['Top rated 2026']}
        />,
      );
      expect(screen.queryByText(/years in operation/)).toBeNull();
      expect(screen.queryByText(/packages/)).toBeNull();
      expect(screen.queryByText('Top rated 2026')).toBeNull();
    });

    it('shows them all in the full form', () => {
      render(
        <AgencyCard
          {...base}
          variant="full"
          operatingSince={2014}
          packageCount={38}
          badges={['Top rated 2026', 'Halal certified']}
        />,
      );
      expect(screen.getByText('12 years in operation')).toBeDefined();
      expect(screen.getByText('38 packages')).toBeDefined();
      expect(screen.getByText('Top rated 2026')).toBeDefined();
      expect(screen.getByText('Halal certified')).toBeDefined();
    });
  });

  describe('years in operation', () => {
    it('counts from the founding year rather than trusting a stored number', () => {
      render(<AgencyCard {...base} variant="full" operatingSince={2014} />);
      expect(screen.getByText('12 years in operation')).toBeDefined();
    });

    /* "2,014 years in operation" is what printing the mistake would say. */
    it('shows nothing when handed a count instead of a year', () => {
      render(<AgencyCard {...base} variant="full" operatingSince={12} />);
      expect(screen.queryByText(/in operation/)).toBeNull();
    });

    it('shows nothing for an agency in its first year', () => {
      render(<AgencyCard {...base} variant="full" operatingSince={2026} />);
      expect(screen.queryByText(/in operation/)).toBeNull();
    });
  });

  describe('licence', () => {
    it('prints an unknown scheme as given', () => {
      render(<AgencyCard {...base} licenseType="MOTAC" />);
      expect(screen.getByText('MOTAC')).toBeDefined();
    });

    it('works without a scheme', () => {
      render(<AgencyCard {...base} licenseType={undefined} />);
      expect(screen.getByText('License No.')).toBeDefined();
      expect(screen.getByText('KPK/LN 8821')).toBeDefined();
    });

    it('drops the whole line without a number', () => {
      render(<AgencyCard {...base} licenseNumber={undefined} />);
      expect(screen.queryByText('License No.')).toBeNull();
      expect(screen.queryByText('TOB')).toBeNull();
    });

    it('sets the number in tabular figures', () => {
      render(<AgencyCard {...base} />);
      const number = document.querySelector('.uh-agency__license-number') as HTMLElement;
      expect(number.className).toContain('license-number');
    });
  });

  describe('incomplete data', () => {
    it('renders from a name alone', () => {
      render(<AgencyCard name="Small Tours" />);
      expect(screen.getByText('Small Tours')).toBeDefined();
      expect(document.querySelector('.uh-rating')).toBeNull();
      expect(document.querySelector('.uh-agency__license')).toBeNull();
      expect(document.querySelector('.uh-agency__facts')).toBeNull();
    });

    it('shows no rating rather than a rating of zero', () => {
      render(<AgencyCard {...base} rating={undefined} reviewCount={200} />);
      expect(document.querySelector('.uh-rating')).toBeNull();
    });

    it('falls back to initials when there is no logo', () => {
      render(<AgencyCard {...base} />);
      expect(document.querySelector('.uh-avatar')).not.toBeNull();
      expect(document.querySelector('img')).toBeNull();
    });

    it('hides a package count of zero', () => {
      render(<AgencyCard {...base} variant="full" packageCount={0} />);
      expect(screen.queryByText(/packages/)).toBeNull();
    });

    it('shows an empty badge list as nothing', () => {
      render(<AgencyCard {...base} variant="full" badges={[]} />);
      expect(document.querySelector('.uh-agency__badges')).toBeNull();
    });
  });

  describe('translation', () => {
    it.each([
      ['ms', 'Agensi Disahkan', 'No. Lesen', '12 tahun beroperasi'],
      ['id', 'Agen Terverifikasi', 'No. Izin', '12 tahun beroperasi'],
    ])('takes %s wording', (_lang, verified, license, years) => {
      render(
        <AgencyCard
          {...base}
          variant="full"
          operatingSince={2014}
          labels={{
            verified,
            licenseNumber: license,
            yearsOperating: (count) => `${count} tahun beroperasi`,
          }}
        />,
      );
      expect(screen.getByText(verified)).toBeDefined();
      expect(screen.getByText(license)).toBeDefined();
      expect(screen.getByText(years)).toBeDefined();
    });
  });

  describe('accessibility', () => {
    const full: AgencyCardProps = {
      ...base,
      variant: 'full',
      rating: 4.8,
      reviewCount: 1284,
      operatingSince: 2014,
      packageCount: 38,
      badges: ['Top rated 2026'],
    };

    it('has no violations in the full form', async () => {
      const { container } = render(<AgencyCard {...full} onClick={vi.fn()} />);
      await expectNoA11yViolations(container);
    });

    it('has no violations in the compact form', async () => {
      const { container } = render(<AgencyCard {...base} rating={4.8} reviewCount={1284} />);
      await expectNoA11yViolations(container);
    });

    it('has no violations with a name alone', async () => {
      const { container } = render(<AgencyCard name="Small Tours" />);
      await expectNoA11yViolations(container);
    });
  });
});
