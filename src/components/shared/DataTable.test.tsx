import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTable, Column } from './DataTable';

interface TestRow {
  id: number;
  name: string;
  status: string;
}

const testData: TestRow[] = [
  { id: 1, name: 'Alpha', status: 'Active' },
  { id: 2, name: 'Beta', status: 'Inactive' },
  { id: 3, name: 'Gamma', status: 'Active' },
  { id: 4, name: 'Delta', status: 'Pending' },
  { id: 5, name: 'Epsilon', status: 'Active' },
];

const columns: Column<TestRow>[] = [
  { key: 'id', header: 'ID', accessor: 'id', sortable: true },
  { key: 'name', header: 'Name', accessor: 'name', sortable: true },
  { key: 'status', header: 'Status', accessor: 'status' },
];

describe('DataTable', () => {
  it('renders table with correct headers and data', () => {
    render(<DataTable data={testData} columns={columns} />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('uses semantic HTML with th scope="col"', () => {
    render(<DataTable data={testData} columns={columns} />);
    const headers = screen.getAllByRole('columnheader');
    // Only sortable columns get the role
    headers.forEach((th) => {
      expect(th).toHaveAttribute('scope', 'col');
    });
  });

  it('sorts data ascending then descending on header click', () => {
    render(<DataTable data={testData} columns={columns} />);

    const nameHeader = screen.getByText('Name');
    // Click once - ascending
    fireEvent.click(nameHeader);
    const cells = screen.getAllByRole('cell');
    // First row should be Alpha (ascending by name)
    const nameCells = cells.filter((_, i) => i % 3 === 1);
    expect(nameCells[0]).toHaveTextContent('Alpha');
    expect(nameCells[4]).toHaveTextContent('Gamma');

    // Click again - descending
    fireEvent.click(nameHeader);
    const cellsAfter = screen.getAllByRole('cell');
    const nameCellsAfter = cellsAfter.filter((_, i) => i % 3 === 1);
    expect(nameCellsAfter[0]).toHaveTextContent('Gamma');

    // Click third time - no sort
    fireEvent.click(nameHeader);
    const cellsReset = screen.getAllByRole('cell');
    const nameCellsReset = cellsReset.filter((_, i) => i % 3 === 1);
    expect(nameCellsReset[0]).toHaveTextContent('Alpha');
  });

  it('paginates data based on pageSize', () => {
    render(<DataTable data={testData} columns={columns} pageSize={2} />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Gamma')).not.toBeInTheDocument();

    // Navigate to next page
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('Delta')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(
      <DataTable data={[]} columns={columns} emptyMessage="Nothing here" />
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('filters data when searchable', () => {
    render(<DataTable data={testData} columns={columns} searchable />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'gamma' } });

    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    const onClick = vi.fn();
    render(<DataTable data={testData} columns={columns} onRowClick={onClick} />);

    fireEvent.click(screen.getByText('Alpha'));
    expect(onClick).toHaveBeenCalledWith(testData[0]);
  });

  it('supports keyboard activation of rows via Enter', () => {
    const onClick = vi.fn();
    render(<DataTable data={testData} columns={columns} onRowClick={onClick} />);

    const row = screen.getByText('Beta').closest('tr')!;
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(testData[1]);
  });

  it('supports keyboard activation of rows via Space', () => {
    const onClick = vi.fn();
    render(<DataTable data={testData} columns={columns} onRowClick={onClick} />);

    const row = screen.getByText('Gamma').closest('tr')!;
    fireEvent.keyDown(row, { key: ' ' });
    expect(onClick).toHaveBeenCalledWith(testData[2]);
  });

  it('renders custom cell content via render prop', () => {
    const columnsWithRender: Column<TestRow>[] = [
      ...columns.slice(0, 2),
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        render: (value) => <span data-testid="badge">{String(value)}</span>,
      },
    ];

    render(<DataTable data={testData} columns={columnsWithRender} />);
    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0]).toHaveTextContent('Active');
  });

  it('disables previous button on first page and next on last page', () => {
    render(<DataTable data={testData} columns={columns} pageSize={2} />);

    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).not.toBeDisabled();

    // Go to last page
    fireEvent.click(screen.getByLabelText('Next page'));
    fireEvent.click(screen.getByLabelText('Next page'));

    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });
});
