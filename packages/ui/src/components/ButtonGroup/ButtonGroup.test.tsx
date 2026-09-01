import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Button } from '../Button/Button.js';
import { ButtonGroup } from './ButtonGroup.js';

describe('ButtonGroup', () => {
  it('renders every Button child unchanged', () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('defaults to horizontal orientation', () => {
    const { container } = render(
      <ButtonGroup>
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(container.querySelector('.uh-button-group')?.getAttribute('data-orientation')).toBe(
      'horizontal',
    );
  });

  it('switches to vertical orientation', () => {
    const { container } = render(
      <ButtonGroup orientation="vertical">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(container.querySelector('.uh-button-group')?.getAttribute('data-orientation')).toBe(
      'vertical',
    );
  });

  it('has no group role or accessible name without a label', () => {
    const { container } = render(
      <ButtonGroup>
        <Button>One</Button>
      </ButtonGroup>,
    );
    const group = container.querySelector('.uh-button-group')!;
    expect(group.getAttribute('role')).toBeNull();
    expect(group.getAttribute('aria-label')).toBeNull();
  });

  it('becomes a named group when label is given', () => {
    render(
      <ButtonGroup label="Text formatting">
        <Button>Bold</Button>
        <Button>Italic</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group', { name: 'Text formatting' })).toBeDefined();
  });

  it('keeps every child Button fully interactive - disabled, onClick still work', () => {
    render(
      <ButtonGroup>
        <Button disabled>Disabled</Button>
        <Button>Enabled</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Disabled' }).getAttribute('aria-disabled')).toBe(
      'true',
    );
  });

  it('has no accessibility violations, labelled or not', async () => {
    const { container, rerender } = render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    await expectNoA11yViolations(container);
    rerender(
      <ButtonGroup label="Actions">
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    await expectNoA11yViolations(container);
  });
});
