import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Grid } from './Grid.js';

describe('Grid', () => {
  it('renders its children', () => {
    render(
      <Grid columns={2}>
        <p>First</p>
        <p>Second</p>
      </Grid>,
    );
    expect(screen.getByText('First')).toBeDefined();
    expect(screen.getByText('Second')).toBeDefined();
  });

  it('defaults to 1 column and gap 16', () => {
    render(<Grid>Content</Grid>);
    const grid = document.querySelector('.uh-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--uh-grid-columns')).toBe('1');
    expect(grid.getAttribute('data-gap')).toBe('16');
  });

  it('sets the column count as a CSS custom property', () => {
    render(<Grid columns={4}>Content</Grid>);
    const grid = document.querySelector('.uh-grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--uh-grid-columns')).toBe('4');
  });

  it('carries an explicit gap through', () => {
    render(<Grid gap="24">Content</Grid>);
    expect(document.querySelector('.uh-grid')?.getAttribute('data-gap')).toBe('24');
  });

  it('sets row and column gap independently of the shorthand gap', () => {
    render(
      <Grid gap="16" rowGap="8" columnGap="32">
        Content
      </Grid>,
    );
    const grid = document.querySelector('.uh-grid')!;
    expect(grid.getAttribute('data-gap')).toBe('16');
    expect(grid.getAttribute('data-row-gap')).toBe('8');
    expect(grid.getAttribute('data-column-gap')).toBe('32');
  });

  it('carries a consumer className alongside its own', () => {
    render(<Grid className="custom">Content</Grid>);
    const grid = document.querySelector('.uh-grid')!;
    expect(grid.classList.contains('uh-grid')).toBe(true);
    expect(grid.classList.contains('custom')).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Grid columns={3} gap="16">
        <button type="button">One</button>
        <button type="button">Two</button>
        <button type="button">Three</button>
      </Grid>,
    );
    await expectNoA11yViolations(container);
  });
});
