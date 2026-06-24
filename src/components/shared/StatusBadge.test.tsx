import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders text label for attribute status', () => {
    render(<StatusBadge status="missing" />);
    expect(screen.getByText('Missing')).toBeInTheDocument();
  });

  it('renders text label for compliance level', () => {
    render(<StatusBadge status="passport_ready" />);
    expect(screen.getByText('Passport Ready')).toBeInTheDocument();
  });

  it('renders text label for connectivity status', () => {
    render(<StatusBadge status="online" />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders text label for alarm status', () => {
    render(<StatusBadge status="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    render(<StatusBadge status="verified" />);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('aria-label', 'Verified');
  });

  it('always shows text label (NFR-006: never rely on color alone)', () => {
    const { container } = render(<StatusBadge status="draft" />);
    const textSpan = container.querySelector('span > span');
    expect(textSpan).toHaveTextContent('Draft');
  });

  it('renders icon when showIcon is true', () => {
    const { container } = render(<StatusBadge status="warning" showIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not render icon when showIcon is false (default)', () => {
    const { container } = render(<StatusBadge status="warning" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('applies size classes for xs', () => {
    const { container } = render(<StatusBadge status="draft" size="xs" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-[0.625rem]');
  });

  it('applies size classes for sm (default)', () => {
    const { container } = render(<StatusBadge status="draft" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-xs');
  });

  it('applies size classes for md', () => {
    const { container } = render(<StatusBadge status="draft" size="md" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-sm');
  });

  it('applies custom className', () => {
    const { container } = render(<StatusBadge status="online" className="my-custom-class" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('my-custom-class');
  });

  it('renders all attribute statuses correctly', () => {
    const statuses = ['missing', 'draft', 'provided', 'verified', 'expired', 'not_applicable'] as const;
    const labels = ['Missing', 'Draft', 'Provided', 'Verified', 'Expired', 'N/A'];

    statuses.forEach((status, i) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(labels[i])).toBeInTheDocument();
      unmount();
    });
  });

  it('renders all compliance levels correctly', () => {
    const statuses = ['critical_gaps', 'needs_attention', 'nearly_ready', 'passport_ready'] as const;
    const labels = ['Critical Gaps', 'Needs Attention', 'Nearly Ready', 'Passport Ready'];

    statuses.forEach((status, i) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(labels[i])).toBeInTheDocument();
      unmount();
    });
  });
});
