import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Stack } from './Stack.js';

describe('Stack', () => {
  it('renders its children', () => {
    render(
      <Stack>
        <p>First</p>
        <p>Second</p>
      </Stack>,
    );
    expect(screen.getByText('First')).toBeDefined();
    expect(screen.getByText('Second')).toBeDefined();
  });

  it('defaults to direction column and gap 16', () => {
    render(<Stack>Content</Stack>);
    const stack = document.querySelector('.uh-stack')!;
    expect(stack.getAttribute('data-direction')).toBe('column');
    expect(stack.getAttribute('data-gap')).toBe('16');
  });

  it('carries direction, gap, align and justify through', () => {
    render(
      <Stack direction="row" gap="8" align="center" justify="between">
        Content
      </Stack>,
    );
    const stack = document.querySelector('.uh-stack')!;
    expect(stack.getAttribute('data-direction')).toBe('row');
    expect(stack.getAttribute('data-gap')).toBe('8');
    expect(stack.getAttribute('data-align')).toBe('center');
    expect(stack.getAttribute('data-justify')).toBe('between');
  });

  it('only sets data-wrap when wrap is true', () => {
    const { rerender } = render(<Stack>Content</Stack>);
    expect(document.querySelector('.uh-stack')?.getAttribute('data-wrap')).toBeNull();

    rerender(<Stack wrap>Content</Stack>);
    expect(document.querySelector('.uh-stack')?.getAttribute('data-wrap')).toBe('true');
  });

  it('carries a consumer className alongside its own', () => {
    render(<Stack className="custom">Content</Stack>);
    const stack = document.querySelector('.uh-stack')!;
    expect(stack.classList.contains('uh-stack')).toBe(true);
    expect(stack.classList.contains('custom')).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Stack direction="row" gap="16">
        <button type="button">One</button>
        <button type="button">Two</button>
      </Stack>,
    );
    await expectNoA11yViolations(container);
  });
});
