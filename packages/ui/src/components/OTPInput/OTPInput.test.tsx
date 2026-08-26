import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { OTPInput } from './OTPInput.js';

const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[];
const shown = () => boxes().map((box) => box.value);

describe('OTPInput', () => {
  it('renders one box per character, six by default', () => {
    render(<OTPInput />);
    expect(boxes()).toHaveLength(6);
  });

  it('honours length', () => {
    render(<OTPInput length={4} />);
    expect(boxes()).toHaveLength(4);
  });

  it('names the group and every box', () => {
    render(<OTPInput label="Verification code" length={3} />);
    expect(screen.getByRole('group', { name: 'Verification code' })).toBeDefined();
    expect(screen.getByRole('textbox', { name: 'Digit 1 of 3' })).toBeDefined();
    expect(screen.getByRole('textbox', { name: 'Digit 3 of 3' })).toBeDefined();
  });

  it('calls a box a character when the code is alphanumeric', () => {
    render(<OTPInput type="alphanumeric" length={3} />);
    expect(screen.getByRole('textbox', { name: 'Character 1 of 3' })).toBeDefined();
  });

  it('carries the attributes that let a phone autofill the code', () => {
    render(<OTPInput length={2} />);
    for (const box of boxes()) {
      expect(box.getAttribute('autocomplete')).toBe('one-time-code');
      expect(box.getAttribute('inputmode')).toBe('numeric');
    }
  });

  it('uses a text keyboard for alphanumeric codes', () => {
    render(<OTPInput type="alphanumeric" length={2} />);
    expect(boxes()[0]?.getAttribute('inputmode')).toBe('text');
  });

  /*
   * No maxLength on purpose: a cap of one character lets the browser truncate
   * an autofilled code down to its first digit before the change handler ever
   * sees it.
   */
  it('does not cap a box at one character', () => {
    render(<OTPInput length={2} />);
    expect(boxes()[0]?.hasAttribute('maxlength')).toBe(false);
  });

  describe('typing', () => {
    it('advances to the next box as each character lands', async () => {
      render(<OTPInput length={4} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('12');
      expect(shown()).toEqual(['1', '2', '', '']);
      expect(document.activeElement).toBe(boxes()[2]);
    });

    it('stays on the last box once the code is full', async () => {
      render(<OTPInput length={3} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('123');
      expect(document.activeElement).toBe(boxes()[2]);
      expect(shown()).toEqual(['1', '2', '3']);
    });

    it('replaces the character in a full last box rather than appending', async () => {
      render(<OTPInput length={3} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('1239');
      expect(shown()).toEqual(['1', '2', '9']);
    });

    it('overwrites a box that is typed into again', async () => {
      render(<OTPInput length={3} defaultValue="123" />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('9');
      expect(shown()).toEqual(['9', '2', '3']);
    });

    it('ignores letters when the code is numeric', async () => {
      render(<OTPInput length={3} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('a1');
      expect(shown()).toEqual(['1', '', '']);
    });

    it('accepts letters when the code is alphanumeric, case intact', async () => {
      render(<OTPInput type="alphanumeric" length={3} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('a9B');
      expect(shown()).toEqual(['a', '9', 'B']);
    });
  });

  describe('keyboard', () => {
    it('moves left and right with the arrow keys', async () => {
      render(<OTPInput length={4} defaultValue="1234" />);
      await userEvent.click(boxes()[2]!);
      await userEvent.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(boxes()[1]);
      await userEvent.keyboard('{ArrowRight}{ArrowRight}');
      expect(document.activeElement).toBe(boxes()[3]);
    });

    it('does not walk off either end', async () => {
      render(<OTPInput length={3} defaultValue="123" />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
      expect(document.activeElement).toBe(boxes()[0]);
      await userEvent.keyboard('{End}{ArrowRight}');
      expect(document.activeElement).toBe(boxes()[2]);
    });

    it('jumps to the ends with Home and End', async () => {
      render(<OTPInput length={5} defaultValue="12" />);
      await userEvent.click(boxes()[1]!);
      await userEvent.keyboard('{End}');
      // End is the first empty box, which is where typing would continue.
      expect(document.activeElement).toBe(boxes()[2]);
      await userEvent.keyboard('{Home}');
      expect(document.activeElement).toBe(boxes()[0]);
    });

    it('clears the character under the caret on Backspace', async () => {
      render(<OTPInput length={4} defaultValue="1234" />);
      await userEvent.click(boxes()[3]!);
      await userEvent.keyboard('{Backspace}');
      expect(shown()).toEqual(['1', '2', '3', '']);
      expect(document.activeElement).toBe(boxes()[3]);
    });

    it('steps back and deletes when the box is already empty', async () => {
      render(<OTPInput length={4} defaultValue="12" />);
      await userEvent.click(boxes()[2]!);
      await userEvent.keyboard('{Backspace}');
      expect(shown()).toEqual(['1', '', '', '']);
      expect(document.activeElement).toBe(boxes()[1]);
    });

    it('does nothing on Backspace in an empty field', async () => {
      const onChange = vi.fn();
      render(<OTPInput length={4} onChange={onChange} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('{Backspace}');
      expect(shown()).toEqual(['', '', '', '']);
      expect(onChange).not.toHaveBeenCalled();
    });

    /*
     * Deleting from the middle closes the gap rather than leaving a hole. A
     * hole cannot be expressed in the emitted string, so it could not survive
     * a round trip through a controlled `value`; closing up keeps what is on
     * screen and what the consumer holds identical at all times.
     */
    it('closes the gap when a character is removed from the middle', async () => {
      render(<OTPInput length={4} defaultValue="1234" />);
      await userEvent.click(boxes()[1]!);
      await userEvent.keyboard('{Backspace}');
      expect(shown()).toEqual(['1', '3', '4', '']);
    });

    it('deletes forward with Delete without moving', async () => {
      render(<OTPInput length={4} defaultValue="1234" />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('{Delete}');
      expect(shown()).toEqual(['2', '3', '4', '']);
      expect(document.activeElement).toBe(boxes()[0]);
    });
  });

  describe('focus', () => {
    it('sends focus to the first empty box when a later one is clicked', async () => {
      render(<OTPInput length={6} defaultValue="12" />);
      await userEvent.click(boxes()[5]!);
      expect(document.activeElement).toBe(boxes()[2]);
    });

    it('leaves focus alone on a box that is already filled', async () => {
      render(<OTPInput length={6} defaultValue="1234" />);
      await userEvent.click(boxes()[1]!);
      expect(document.activeElement).toBe(boxes()[1]);
    });

    it('focuses the first box on mount when asked', () => {
      render(<OTPInput length={4} autoFocus />);
      expect(document.activeElement).toBe(boxes()[0]);
    });

    it('does not steal focus when disabled', () => {
      render(<OTPInput length={4} autoFocus disabled />);
      expect(document.activeElement).not.toBe(boxes()[0]);
    });
  });

  describe('paste', () => {
    it('fills every box from a whole code, whichever box receives it', async () => {
      render(<OTPInput length={6} />);
      await userEvent.click(boxes()[3]!);
      await userEvent.paste('482913');
      expect(shown()).toEqual(['4', '8', '2', '9', '1', '3']);
      expect(document.activeElement).toBe(boxes()[5]);
    });

    it('strips separators and spaces out of a pasted code', async () => {
      render(<OTPInput length={6} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.paste(' 482-913 ');
      expect(shown()).toEqual(['4', '8', '2', '9', '1', '3']);
    });

    it('drops anything past the last box', async () => {
      render(<OTPInput length={4} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.paste('123456789');
      expect(shown()).toEqual(['1', '2', '3', '4']);
    });

    it('continues from the caret when the paste is only part of a code', async () => {
      render(<OTPInput length={6} defaultValue="48" />);
      await userEvent.click(boxes()[2]!);
      await userEvent.paste('2913');
      expect(shown()).toEqual(['4', '8', '2', '9', '1', '3']);
    });

    it('ignores a paste with nothing usable in it', async () => {
      const onChange = vi.fn();
      render(<OTPInput length={4} onChange={onChange} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.paste('no digits here');
      expect(shown()).toEqual(['', '', '', '']);
      expect(onChange).not.toHaveBeenCalled();
    });

    /*
     * iOS and Android hand the SMS code to the focused field as a plain value
     * change, not as a paste, so the same distribution has to happen there.
     */
    it('distributes a code that autofill drops into a single box', async () => {
      render(<OTPInput length={6} />);
      const first = boxes()[0]!;
      first.focus();
      fireEvent.change(first, { target: { value: '482913' } });
      expect(shown()).toEqual(['4', '8', '2', '9', '1', '3']);
    });
  });

  describe('value', () => {
    it('works uncontrolled from a default', () => {
      render(<OTPInput length={4} defaultValue="1234" />);
      expect(shown()).toEqual(['1', '2', '3', '4']);
    });

    it('reports the whole code on every change', async () => {
      const onChange = vi.fn();
      render(<OTPInput length={4} onChange={onChange} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('12');
      expect(onChange.mock.calls.map(([code]) => code)).toEqual(['1', '12']);
    });

    it('obeys a controlled value and does not move on its own', async () => {
      const onChange = vi.fn();
      render(<OTPInput length={4} value="12" onChange={onChange} />);
      await userEvent.click(boxes()[2]!);
      await userEvent.keyboard('3');
      expect(onChange).toHaveBeenCalledWith('123');
      expect(shown()).toEqual(['1', '2', '', '']);
    });

    it('round-trips through a controlled parent', async () => {
      function Host() {
        const [code, setCode] = useState('');
        return (
          <>
            <OTPInput length={4} value={code} onChange={setCode} />
            <output>{code}</output>
          </>
        );
      }
      render(<Host />);
      await userEvent.click(boxes()[0]!);
      await userEvent.paste('9182');
      expect(screen.getByRole('status').textContent).toBe('9182');
      expect(shown()).toEqual(['9', '1', '8', '2']);
    });

    it('cleans a value the consumer passes in', () => {
      render(<OTPInput length={4} defaultValue="1a2-3456" />);
      expect(shown()).toEqual(['1', '2', '3', '4']);
    });
  });

  describe('onComplete', () => {
    it('fires as the last box fills', async () => {
      const onComplete = vi.fn();
      render(<OTPInput length={4} onComplete={onComplete} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('123');
      expect(onComplete).not.toHaveBeenCalled();
      await userEvent.keyboard('4');
      expect(onComplete).toHaveBeenCalledExactlyOnceWith('1234');
    });

    it('fires on a pasted code too', async () => {
      const onComplete = vi.fn();
      render(<OTPInput length={4} onComplete={onComplete} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.paste('4829');
      expect(onComplete).toHaveBeenCalledExactlyOnceWith('4829');
    });

    /*
     * A code the field was born holding is the consumer's own data coming back
     * to it. Announcing it would make a screen that restores a half-finished
     * booking submit itself before the pilgrim had touched anything.
     */
    it('stays quiet about a code it was mounted with', () => {
      const onComplete = vi.fn();
      render(<OTPInput length={4} defaultValue="1234" onComplete={onComplete} />);
      expect(onComplete).not.toHaveBeenCalled();
    });

    /* Otherwise a second look at the same code would submit it twice. */
    it('does not fire twice for one code', async () => {
      const onComplete = vi.fn();
      render(<OTPInput length={4} onComplete={onComplete} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.paste('1234');
      await userEvent.click(boxes()[0]!);
      await userEvent.paste('1234');
      expect(onComplete).toHaveBeenCalledExactlyOnceWith('1234');
    });

    it('fires again once the code is broken and remade', async () => {
      const onComplete = vi.fn();
      render(<OTPInput length={4} onComplete={onComplete} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('1234');
      expect(onComplete).toHaveBeenCalledTimes(1);
      await userEvent.keyboard('{Backspace}9');
      expect(onComplete).toHaveBeenCalledTimes(2);
      expect(onComplete).toHaveBeenLastCalledWith('1239');
    });

    it('reports a different complete code as its own completion', async () => {
      const onComplete = vi.fn();
      render(<OTPInput length={4} defaultValue="1234" onComplete={onComplete} />);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('9');
      expect(onComplete).toHaveBeenCalledExactlyOnceWith('9234');
    });
  });

  describe('states', () => {
    it('marks every box invalid in the error state', () => {
      render(<OTPInput length={4} error errorMessage="That code is incorrect." />);
      for (const box of boxes()) expect(box.getAttribute('aria-invalid')).toBe('true');
    });

    it('announces the error through an alert', () => {
      render(<OTPInput length={4} error errorMessage="That code is incorrect." />);
      expect(screen.getByRole('alert').textContent).toBe('That code is incorrect.');
    });

    it('describes the group with the message, not each box', () => {
      render(<OTPInput length={4} helperText="Sent to +60 12-345 6789" />);
      const group = screen.getByRole('group');
      const described = group.getAttribute('aria-describedby');
      expect(described).toBeTruthy();
      expect(document.getElementById(described!)?.textContent).toBe('Sent to +60 12-345 6789');
      expect(boxes()[0]?.hasAttribute('aria-describedby')).toBe(false);
    });

    it('leaves helper text out of the alert role', () => {
      render(<OTPInput length={4} helperText="Sent to +60 12-345 6789" />);
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('disables every box and refuses input', async () => {
      const onChange = vi.fn();
      render(<OTPInput length={4} disabled onChange={onChange} />);
      for (const box of boxes()) expect(box.disabled).toBe(true);
      await userEvent.click(boxes()[0]!);
      await userEvent.keyboard('1');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has no violations when empty', async () => {
      const { container } = render(<OTPInput length={6} helperText="Sent to +60 12-345 6789" />);
      await expectNoA11yViolations(container);
    });

    it('has no violations in the error state', async () => {
      const { container } = render(
        <OTPInput length={6} defaultValue="482913" error errorMessage="That code is incorrect." />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no violations when disabled', async () => {
      const { container } = render(<OTPInput length={6} defaultValue="4829" disabled />);
      await expectNoA11yViolations(container);
    });
  });
});
