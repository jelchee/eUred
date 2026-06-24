import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  LogIn,
  ShieldCheck,
  Activity,
  GitBranch,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Compliance Tracking',
    description: 'EU Battery Regulation gap analysis with automated scoring and verification workflows.',
  },
  {
    icon: Activity,
    title: 'BMS Telemetry',
    description: 'Real-time SoC, SoH, temperature, and energy throughput monitoring from SineStack BMS.',
  },
  {
    icon: GitBranch,
    title: 'Lifecycle Traceability',
    description: 'Complete production-to-recycling timeline with auditable event history.',
  },
  {
    icon: Leaf,
    title: 'ESG Reporting',
    description: 'Carbon footprint breakdown, recycled content tracking, and due diligence summaries.',
  },
] as const;

/**
 * LandingPage — Full-screen dark hero with platform branding for
 * board-level demo presentations (ENT × Rimac Energy partnership).
 *
 * Validates: Requirements 3.2 (board-level demo)
 */
export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background-primary relative overflow-hidden">
      {/* Background gradient effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-accent-emerald/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        {/* Partnership context */}
        <div className="mb-8 text-center">
          <span className="inline-block px-4 py-1.5 text-caption text-text-secondary border border-border rounded-badge bg-background-secondary/60 backdrop-blur-sm">
            Ericsson Nikola Tesla × Rimac Energy
          </span>
        </div>

        {/* Title */}
        <h1 className="text-heading-1 sm:text-kpi-hero text-text-primary text-center max-w-3xl mb-4">
          <span className="text-gradient-cyan">Digital Battery Passport</span>{' '}
          Platform
        </h1>

        {/* Subtitle */}
        <p className="text-body sm:text-lg text-text-secondary text-center max-w-2xl mb-10">
          EU Battery Regulation compliance platform for Rimac Energy SineStack BESS
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button
            onClick={() => navigate('/public/passport/BP-HR-RE-SEST-2026-0001')}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-button font-medium text-body',
              'bg-accent-cyan text-background-primary',
              'hover:bg-accent-cyan/90 transition-default',
              'focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
            )}
          >
            <QrCode className="w-5 h-5" aria-hidden="true" />
            Scan QR Code
          </button>

          <button
            onClick={() => navigate('/login')}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-button font-medium text-body',
              'border border-border-emphasis text-text-primary bg-background-secondary/60 backdrop-blur-sm',
              'hover:bg-background-surface hover:border-accent-cyan/40 transition-default',
              'focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
            )}
          >
            <LogIn className="w-5 h-5" aria-hidden="true" />
            Demo Login
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center border-t border-border">
        <p className="text-caption text-text-tertiary">
          Demo Platform — All data is synthetic and for demonstration purposes only
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof QrCode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3 group hover:border-accent-cyan/20 transition-default">
      <div className="p-2 rounded-lg bg-accent-cyan/10 w-fit">
        <Icon
          className="w-5 h-5 text-accent-cyan"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-body font-medium text-text-primary">{title}</h3>
      <p className="text-caption text-text-secondary">{description}</p>
    </div>
  );
}
