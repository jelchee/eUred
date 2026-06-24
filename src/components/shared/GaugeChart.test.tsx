import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GaugeChart } from './GaugeChart';

describe('GaugeChart', () => {
  it('renders the numeric value', () => {
    render(<GaugeChart value={85} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(<GaugeChart value={72} label="State of Health" />);
    expect(screen.getByText('State of Health')).toBeInTheDocument();
  });

  it('shows status text for accessibility (color not only indicator)', () => {
    render(<GaugeChart value={45} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();

    const { unmount } = render(<GaugeChart value={60} />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
    unmount();
  });

  it('shows correct status for each segment range', () => {
    const { rerender } = render(<GaugeChart value={0} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();

    rerender(<GaugeChart value={50} />);
    expect(screen.getByText('Warning')).toBeInTheDocument();

    rerender(<GaugeChart value={80} />);
    expect(screen.getByText('Good')).toBeInTheDocument();

    rerender(<GaugeChart value={95} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('clamps values below 0 and above 100', () => {
    const { rerender } = render(<GaugeChart value={-10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();

    rerender(<GaugeChart value={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('has role="meter" with proper aria attributes', () => {
    render(<GaugeChart value={73} label="SoH" />);
    const meter = screen.getByRole('meter');

    expect(meter).toHaveAttribute('aria-valuenow', '73');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(meter).toHaveAttribute('aria-label', 'SoH: 73%');
  });

  it('renders SVG element', () => {
    const { container } = render(<GaugeChart value={50} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders segment arcs when showSegments is true', () => {
    const { container } = render(<GaugeChart value={50} showSegments />);
    // 4 segment backgrounds + 1 value arc = 5 path elements
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(5);
  });

  it('renders single background track when showSegments is false', () => {
    const { container } = render(<GaugeChart value={50} showSegments={false} />);
    // 1 background track + 1 value arc = 2 path elements
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(2);
  });
});
