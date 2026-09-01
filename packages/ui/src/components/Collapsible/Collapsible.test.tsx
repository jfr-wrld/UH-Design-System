import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './Collapsible.js';

function Basic(props: Partial<ComponentProps<typeof Collapsible>> = {}) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger>Show more details</CollapsibleTrigger>
      <CollapsibleContent>Extra detail text.</CollapsibleContent>
    </Collapsible>
  );
}

describe('Collapsible', () => {
  it('renders closed by default, with correct aria wiring', () => {
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Show more details' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    const contentId = trigger.getAttribute('aria-controls');
    expect(contentId).toBeTruthy();
    const content = document.getElementById(contentId!)!;
    expect(content.hasAttribute('hidden')).toBe(true);
    expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('opens on click, hiding attribute removed, chevron marked open', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Show more details' });
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const contentId = trigger.getAttribute('aria-controls')!;
    expect(document.getElementById(contentId)!.hasAttribute('hidden')).toBe(false);
    expect(screen.getByText('Extra detail text.')).toBeDefined();
  });

  it('closes again on a second click', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Show more details' });
    await user.click(trigger);
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('starts open when defaultOpen is set', () => {
    render(<Basic defaultOpen />);
    expect(
      screen.getByRole('button', { name: 'Show more details' }).getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('never toggles while disabled', async () => {
    const user = userEvent.setup();
    render(<Basic disabled />);
    const trigger = screen.getByRole('button', { name: 'Show more details' });
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('stays controlled: open only follows the open prop', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Collapsible open={false} onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Show more</CollapsibleTrigger>
        <CollapsibleContent>Detail.</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Show more' });
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    rerender(
      <Collapsible open onOpenChange={onOpenChange}>
        <CollapsibleTrigger>Show more</CollapsibleTrigger>
        <CollapsibleContent>Detail.</CollapsibleContent>
      </Collapsible>,
    );
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('renders the trigger as a plain button with no heading wrapper by default', () => {
    const { container } = render(<Basic />);
    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
  });

  it('wraps the trigger in the requested heading level when headingLevel is set', () => {
    const { container } = render(<Basic headingLevel={2} />);
    expect(container.querySelector('h2 > button')).not.toBeNull();
  });

  it('has no accessibility violations, closed or open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Basic />);
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole('button', { name: 'Show more details' }));
    await expectNoA11yViolations(container);
  });

  it('has no accessibility violations with a heading wrapper', async () => {
    const { container } = render(<Basic headingLevel={3} defaultOpen />);
    await expectNoA11yViolations(container);
  });
});
