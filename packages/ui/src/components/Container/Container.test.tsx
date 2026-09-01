import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Container } from './Container.js';

describe('Container', () => {
  it('renders its children', () => {
    render(
      <Container>
        <p>Content</p>
      </Container>,
    );
    expect(screen.getByText('Content')).toBeDefined();
  });

  it('defaults to size lg and padding on', () => {
    render(<Container>Content</Container>);
    const container = document.querySelector('.uh-container')!;
    expect(container.getAttribute('data-size')).toBe('lg');
    expect(container.getAttribute('data-padding')).toBe('true');
  });

  it('carries an explicit size through', () => {
    render(<Container size="sm">Content</Container>);
    expect(document.querySelector('.uh-container')?.getAttribute('data-size')).toBe('sm');
  });

  it('can turn its own edge padding off', () => {
    render(<Container padding={false}>Content</Container>);
    expect(document.querySelector('.uh-container')?.getAttribute('data-padding')).toBe('false');
  });

  it('carries a consumer className alongside its own', () => {
    render(<Container className="custom">Content</Container>);
    const container = document.querySelector('.uh-container')!;
    expect(container.classList.contains('uh-container')).toBe(true);
    expect(container.classList.contains('custom')).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Container>
        <button type="button">Action</button>
      </Container>,
    );
    await expectNoA11yViolations(container);
  });
});
