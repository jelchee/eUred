import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartContainer } from './ChartContainer';

describe('ChartContainer', () => {
  it('renders title and children', () => {
    render(
      <ChartContainer title="Battery Temperature">
        <div data-testid="chart-content">Chart Here</div>
      </ChartContainer>
    );

    expect(screen.getByText('Battery Temperature')).toBeInTheDocument();
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('does not show time selector by default', () => {
    render(
      <ChartContainer title="Test">
        <div />
      </ChartContainer>
    );

    expect(screen.queryByRole('group', { name: /time range/i })).not.toBeInTheDocument();
  });

  it('shows time range buttons when showTimeSelector is true', () => {
    render(
      <ChartContainer title="Test" showTimeSelector timeRange="7d">
        <div />
      </ChartContainer>
    );

    const group = screen.getByRole('group', { name: /time range/i });
    expect(group).toBeInTheDocument();

    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('90d')).toBeInTheDocument();
  });

  it('marks active time range with aria-pressed', () => {
    render(
      <ChartContainer title="Test" showTimeSelector timeRange="30d">
        <div />
      </ChartContainer>
    );

    const btn30d = screen.getByText('30d');
    const btn7d = screen.getByText('7d');

    expect(btn30d).toHaveAttribute('aria-pressed', 'true');
    expect(btn7d).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onTimeRangeChange when a time button is clicked', () => {
    const onChange = vi.fn();
    render(
      <ChartContainer title="Test" showTimeSelector timeRange="7d" onTimeRangeChange={onChange}>
        <div />
      </ChartContainer>
    );

    fireEvent.click(screen.getByText('90d'));
    expect(onChange).toHaveBeenCalledWith('90d');
  });

  it('applies custom height to content area', () => {
    render(
      <ChartContainer title="Test" height={400}>
        <div data-testid="inner" />
      </ChartContainer>
    );

    const container = screen.getByTestId('inner').parentElement;
    expect(container).toHaveStyle({ minHeight: '400px' });
  });
});
