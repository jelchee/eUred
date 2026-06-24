import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Battery, Activity } from 'lucide-react';
import { KPICard } from './KPICard';

describe('KPICard', () => {
  it('renders value and label', () => {
    render(<KPICard label="Total Assets" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total Assets')).toBeInTheDocument();
  });

  it('renders string values', () => {
    render(<KPICard label="SoH" value="99.35" />);
    expect(screen.getByText('99.35')).toBeInTheDocument();
  });

  it('renders unit when provided', () => {
    render(<KPICard label="Readiness" value="67" unit="%" />);
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('applies tabular number font feature to value', () => {
    render(<KPICard label="Count" value={128} />);
    const valueEl = screen.getByText('128');
    expect(valueEl).toHaveStyle({ fontFeatureSettings: '"tnum"' });
  });

  it('renders trend indicator with up direction', () => {
    const { container } = render(
      <KPICard label="Growth" value="12" trend={{ direction: 'up', value: '+5%' }} />
    );
    expect(screen.getByText('+5%')).toBeInTheDocument();
    // ArrowUp icon should be present
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders trend indicator with down direction', () => {
    render(
      <KPICard label="Decline" value="8" trend={{ direction: 'down', value: '-3%' }} />
    );
    expect(screen.getByText('-3%')).toBeInTheDocument();
  });

  it('renders trend indicator with stable direction', () => {
    render(
      <KPICard label="Stable" value="50" trend={{ direction: 'stable', value: '0%' }} />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(
      <KPICard label="Battery" value="95" icon={Battery} />
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('applies default variant classes', () => {
    const { container } = render(<KPICard label="Test" value={1} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('card');
  });

  it('applies glass variant classes', () => {
    const { container } = render(<KPICard label="Test" value={1} variant="glass" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('glass-card');
  });

  it('applies accent variant with glow', () => {
    const { container } = render(
      <KPICard label="Test" value={1} variant="accent" accentColor="cyan" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('card');
    expect(card.className).toContain('border-accent-cyan');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <KPICard label="Test" value={1} className="my-custom-class" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('my-custom-class');
  });

  it('renders icon and trend together', () => {
    const { container } = render(
      <KPICard
        label="Activity"
        value="100"
        icon={Activity}
        trend={{ direction: 'up', value: '+10%' }}
      />
    );
    const svgs = container.querySelectorAll('svg');
    // Both the icon and the trend arrow should render
    expect(svgs.length).toBe(2);
  });
});
