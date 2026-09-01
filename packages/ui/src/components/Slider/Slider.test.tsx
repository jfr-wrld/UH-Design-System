import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Slider } from './Slider.js';

describe('Slider', () => {
  it('renders a single thumb by default', () => {
    render(<Slider label="Volume" defaultValue={50} />);
    expect(screen.getAllByRole('slider')).toHaveLength(1);
  });

  it('renders one thumb per entry for a range value', () => {
    render(<Slider label="Price range" defaultValue={[20, 60]} min={0} max={100} />);
    expect(screen.getAllByRole('slider')).toHaveLength(2);
  });

  it('uses the label as the accessible name', () => {
    render(<Slider label="Brightness" defaultValue={40} />);
    expect(screen.getByRole('slider', { name: 'Brightness' })).toBeDefined();
  });

  it('hides the label visually by default, without removing it from the accessibility tree', () => {
    render(<Slider label="Brightness" defaultValue={40} />);
    const label = screen.getByText('Brightness');
    expect(label.className).toContain('uh-sr-only');
  });

  it('paints the label when showLabel is set', () => {
    render(<Slider label="Brightness" defaultValue={40} showLabel />);
    const label = screen.getByText('Brightness');
    expect(label.className).toContain('uh-slider__label');
  });

  it('is uncontrolled by default and moves with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Slider label="Volume" defaultValue={50} min={0} max={100} step={1} />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(thumb.getAttribute('aria-valuenow')).toBe('51');
  });

  it('stays controlled: the displayed value only follows the value prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <Slider label="Volume" value={50} onChange={onChange} min={0} max={100} step={1} />,
    );
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(51);
    // The consumer hasn't fed the new value back in yet, so the thumb holds.
    expect(thumb.getAttribute('aria-valuenow')).toBe('50');
    rerender(<Slider label="Volume" value={51} onChange={onChange} min={0} max={100} step={1} />);
    expect(thumb.getAttribute('aria-valuenow')).toBe('51');
  });

  it('marks the slider disabled and keeps it out of tab order', () => {
    render(<Slider label="Volume" defaultValue={50} disabled />);
    const thumb = screen.getByRole('slider') as HTMLInputElement;
    expect(thumb.disabled).toBe(true);
  });

  it('renders no value text by default', () => {
    render(<Slider label="Volume" defaultValue={50} />);
    expect(screen.queryByText('50')).toBeNull();
  });

  it('prints the current value when valueDisplay is text', () => {
    render(<Slider label="Volume" defaultValue={50} valueDisplay="text" />);
    expect(screen.getByText('50')).toBeDefined();
  });

  it('prints both values of a range when valueDisplay is text', () => {
    render(
      <Slider label="Price range" defaultValue={[20, 60]} min={0} max={100} valueDisplay="text" />,
    );
    expect(screen.getByText('20 – 60')).toBeDefined();
  });

  it('renders the tooltip value display inside the control, not under the track', () => {
    render(<Slider label="Volume" defaultValue={50} valueDisplay="tooltip" />);
    const value = screen.getByText('50');
    expect(value.getAttribute('data-display')).toBe('tooltip');
  });

  it('carries a consumer className alongside its own', () => {
    render(<Slider label="Volume" defaultValue={50} className="custom" />);
    const root = document.querySelector('.uh-slider')!;
    expect(root.classList.contains('uh-slider')).toBe(true);
    expect(root.classList.contains('custom')).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Slider label="Volume" defaultValue={50} valueDisplay="text" />);
    await expectNoA11yViolations(container);
  });

  it('has no accessibility violations as a disabled range slider', async () => {
    const { container } = render(
      <Slider label="Price range" defaultValue={[20, 60]} min={0} max={100} disabled />,
    );
    await expectNoA11yViolations(container);
  });
});
