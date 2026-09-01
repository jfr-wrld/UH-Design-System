import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Pagination } from './Pagination.js';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onChange={() => {}} label="Search results" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for zero pages', () => {
    const { container } = render(
      <Pagination page={1} pageCount={0} onChange={() => {}} label="Search results" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('marks the current page with aria-current and disables the edge nav buttons', () => {
    render(<Pagination page={1} pageCount={3} onChange={() => {}} label="Search results" />);
    expect(
      screen.getByRole('button', { name: 'Page 1, current page' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveProperty('disabled', false);
  });

  it('calls onChange with the clicked page', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination page={1} pageCount={5} onChange={onChange} label="Search results" />);
    await user.click(screen.getByRole('button', { name: 'Go to page 3' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('advances and retreats a page at a time from Next/Previous', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination page={3} pageCount={5} onChange={onChange} label="Search results" />);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it('collapses a long run behind an ellipsis, always keeping page 1 and the last page', () => {
    render(<Pagination page={10} pageCount={20} onChange={() => {}} label="Search results" />);
    expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Go to page 20' })).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Go to page 15' })).toBeNull();
    expect(document.querySelectorAll('.uh-pagination__ellipsis').length).toBe(2);
  });

  it('round-trips through a controlling parent', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [page, setPage] = useState(1);
      return <Pagination page={page} pageCount={5} onChange={setPage} label="Search results" />;
    }
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));
    expect(
      screen.getByRole('button', { name: 'Page 2, current page' }).getAttribute('aria-current'),
    ).toBe('page');
  });

  it('has no accessibility violations', async () => {
    render(<Pagination page={4} pageCount={20} onChange={() => {}} label="Search results" />);
    await expectNoA11yViolations(document.body);
  });
});
