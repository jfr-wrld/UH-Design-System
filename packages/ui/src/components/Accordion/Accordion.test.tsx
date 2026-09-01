import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionSingleProps,
  type AccordionProps,
} from './Accordion.js';

function SingleAccordion(
  props: Partial<Omit<AccordionSingleProps, 'type'>> & Pick<AccordionProps, 'headingLevel'> = {},
) {
  return (
    <Accordion type="single" {...props}>
      <AccordionItem value="one">
        <AccordionTrigger>First question</AccordionTrigger>
        <AccordionContent>First answer.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Second question</AccordionTrigger>
        <AccordionContent>Second answer.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="three" disabled>
        <AccordionTrigger>Third question</AccordionTrigger>
        <AccordionContent>Third answer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe('Accordion', () => {
  it('renders every trigger, all closed by default', () => {
    render(<SingleAccordion />);
    for (const name of ['First question', 'Second question', 'Third question']) {
      expect(screen.getByRole('button', { name }).getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('wires aria-controls on the trigger to the content it reveals', () => {
    render(<SingleAccordion />);
    const trigger = screen.getByRole('button', { name: 'First question' });
    const controlsId = trigger.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId!)?.textContent).toBe('First answer.');
  });

  it('opens an item on click and hides the rest of its content via the hidden attribute', async () => {
    const user = userEvent.setup();
    render(<SingleAccordion />);
    await user.click(screen.getByRole('button', { name: 'First question' }));
    expect(
      screen.getByRole('button', { name: 'First question' }).getAttribute('aria-expanded'),
    ).toBe('true');
    expect(screen.getByText('First answer.').closest('[hidden]')).toBeNull();
    expect(screen.getByText('Second answer.').closest('[hidden]')).not.toBeNull();
  });

  it('single mode: opening a second item closes the first', async () => {
    const user = userEvent.setup();
    render(<SingleAccordion />);
    await user.click(screen.getByRole('button', { name: 'First question' }));
    await user.click(screen.getByRole('button', { name: 'Second question' }));
    expect(
      screen.getByRole('button', { name: 'First question' }).getAttribute('aria-expanded'),
    ).toBe('false');
    expect(
      screen.getByRole('button', { name: 'Second question' }).getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('single mode: clicking the open item closes it again (collapsible by default)', async () => {
    const user = userEvent.setup();
    render(<SingleAccordion />);
    const trigger = screen.getByRole('button', { name: 'First question' });
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('single mode: collapsible=false keeps the open item open when clicked again', async () => {
    const user = userEvent.setup();
    render(<SingleAccordion collapsible={false} />);
    const trigger = screen.getByRole('button', { name: 'First question' });
    await user.click(trigger);
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('never toggles a disabled item', async () => {
    const user = userEvent.setup();
    render(<SingleAccordion />);
    const trigger = screen.getByRole('button', { name: 'Third question' });
    expect(trigger.hasAttribute('disabled')).toBe(true);
    await user.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('seeds the open item from defaultValue', () => {
    render(<SingleAccordion defaultValue="two" />);
    expect(
      screen.getByRole('button', { name: 'Second question' }).getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('stays controlled: the open item only follows the value prop', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<SingleAccordion value="one" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Second question' }));
    expect(onValueChange).toHaveBeenCalledWith('two');
    // The consumer has not fed the new value back in yet, so it holds.
    expect(
      screen.getByRole('button', { name: 'First question' }).getAttribute('aria-expanded'),
    ).toBe('true');
    rerender(<SingleAccordion value="two" onValueChange={onValueChange} />);
    expect(
      screen.getByRole('button', { name: 'Second question' }).getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('multiple mode: opens and closes items independently', async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple">
        <AccordionItem value="one">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent>First answer.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Second</AccordionTrigger>
          <AccordionContent>Second answer.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole('button', { name: 'First' }));
    await user.click(screen.getByRole('button', { name: 'Second' }));
    expect(screen.getByRole('button', { name: 'First' }).getAttribute('aria-expanded')).toBe(
      'true',
    );
    expect(screen.getByRole('button', { name: 'Second' }).getAttribute('aria-expanded')).toBe(
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'First' }));
    expect(screen.getByRole('button', { name: 'First' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(screen.getByRole('button', { name: 'Second' }).getAttribute('aria-expanded')).toBe(
      'true',
    );
  });

  it('multiple mode: is uncontrolled by default and reports the full open array', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Accordion type="multiple" onValueChange={onValueChange}>
        <AccordionItem value="one">
          <AccordionTrigger>First</AccordionTrigger>
          <AccordionContent>First answer.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Second</AccordionTrigger>
          <AccordionContent>Second answer.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByRole('button', { name: 'First' }));
    await user.click(screen.getByRole('button', { name: 'Second' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['one', 'two']);
  });

  it('defaults every trigger heading to h3, and honours a custom headingLevel', () => {
    const { container, rerender } = render(<SingleAccordion />);
    expect(container.querySelector('h3 > button')).not.toBeNull();
    rerender(<SingleAccordion headingLevel={2} />);
    expect(container.querySelector('h2 > button')).not.toBeNull();
  });

  it('has no accessibility violations, closed or open', async () => {
    const user = userEvent.setup();
    const { container } = render(<SingleAccordion />);
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole('button', { name: 'First question' }));
    await expectNoA11yViolations(container);
  });
});
