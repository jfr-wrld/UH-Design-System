import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table.js';

function BasicTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Laptop</TableCell>
          <TableCell>$999</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Mouse</TableCell>
          <TableCell>$29.99</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe('Table', () => {
  it('renders a native table with real thead/tbody/tr/th/td elements', () => {
    const { container } = render(<BasicTable />);
    expect(container.querySelector('table')).not.toBeNull();
    expect(container.querySelector('thead')).not.toBeNull();
    expect(container.querySelector('tbody')).not.toBeNull();
    expect(container.querySelectorAll('tr')).toHaveLength(3);
    expect(container.querySelectorAll('th')).toHaveLength(2);
    expect(container.querySelectorAll('td')).toHaveLength(4);
  });

  it('wraps the table in a horizontal-scroll container', () => {
    const { container } = render(<BasicTable />);
    const wrapper = container.querySelector('.uh-table__wrapper');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelector('table.uh-table')).not.toBeNull();
  });

  it('keeps the scroll wrapper in the tab order, so a keyboard user can reach it', () => {
    const { container } = render(<BasicTable />);
    expect(container.querySelector('.uh-table__wrapper')?.getAttribute('tabindex')).toBe('0');
  });

  it('defaults every header cell to scope="col"', () => {
    render(<BasicTable />);
    for (const th of screen.getAllByRole('columnheader')) {
      expect(th.getAttribute('scope')).toBe('col');
    }
  });

  it('lets a caller override scope for a row header', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableHead scope="row">Total</TableHead>
            <TableCell>$1,028.99</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole('rowheader').getAttribute('scope')).toBe('row');
  });

  it('is not full-bleed by default', () => {
    const { container } = render(<BasicTable />);
    expect(container.querySelector('table')?.getAttribute('data-full-bleed')).toBeNull();
  });

  it('marks the table full-bleed when asked', () => {
    const { container } = render(
      <Table fullBleed>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector('table')?.getAttribute('data-full-bleed')).toBe('true');
  });

  it('forwards native table attributes, like a caller className', () => {
    const { container } = render(
      <Table className="custom">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = container.querySelector('table')!;
    expect(table.classList.contains('uh-table')).toBe(true);
    expect(table.classList.contains('custom')).toBe(true);
  });

  it('names the scroll wrapper itself from aria-label, not the table inside it', () => {
    const { container } = render(
      <Table aria-label="Recent orders">
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    // The wrapper is the element that is actually focusable/scrollable, so
    // it is the one a screen-reader user tabbing to it needs a name from -
    // the <table> itself gets neither the role nor the label.
    expect(screen.getByRole('region', { name: 'Recent orders' })).toBeDefined();
    expect(container.querySelector('table')?.getAttribute('aria-label')).toBeNull();
  });

  it('names the scroll wrapper from aria-labelledby too', () => {
    render(
      <>
        <h2 id="orders-heading">Recent orders</h2>
        <Table aria-labelledby="orders-heading">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>,
    );
    expect(screen.getByRole('region', { name: 'Recent orders' })).toBeDefined();
  });

  it('leaves the scroll wrapper without a region role when no name is given', () => {
    const { container } = render(<BasicTable />);
    expect(container.querySelector('.uh-table__wrapper')?.getAttribute('role')).toBeNull();
  });

  it('forwards native cell attributes, like colSpan', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2}>Empty</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('Empty').getAttribute('colspan')).toBe('2');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<BasicTable />);
    await expectNoA11yViolations(container);
  });
});
