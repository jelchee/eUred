import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, Battery, Factory, Zap, FlaskConical, AlertTriangle, Recycle, Leaf } from 'lucide-react';
import { QRCodePanel } from '@/components/domain/QRCodePanel';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getAttributesByPassportId } from '@/data/passportAttributes';
import { assets } from '@/data/assets';
import type { PassportAttribute } from '@/types';
import type { ComplianceLevel } from '@/types/asset';

// ============================================================
// PUBLIC PASSPORT PAGE
// ============================================================
// Mobile-first layout for QR code scan flow.
// Shows ONLY PUBLIC accessLevel passport attributes.
// Validates: FR-002
// ============================================================

/**
 * Maps internal ComplianceLevel to a public-facing badge label.
 * FR-002 specifies: Draft / In Review / Verified
 */
function getPublicComplianceBadge(level: ComplianceLevel): {
  label: string;
  variant: 'draft' | 'provided' | 'verified';
} {
  switch (level) {
    case 'critical_gaps':
    case 'needs_attention':
      return { label: 'Draft', variant: 'draft' };
    case 'nearly_ready':
      return { label: 'In Review', variant: 'provided' };
    case 'passport_ready':
      return { label: 'Verified', variant: 'verified' };
    default:
      return { label: 'Draft', variant: 'draft' };
  }
}

/**
 * Masks a serial number to the format SEST-2026-****-0001
 * Takes any serial string and replaces the middle segment with ****
 */
function maskSerialNumber(serial: string): string {
  const parts = serial.split('-');
  if (parts.length >= 4) {
    // Format: PREFIX-YEAR-****-SUFFIX
    return `${parts[0]}-${parts[1]}-****-${parts[parts.length - 1]}`;
  }
  // Fallback: mask middle characters
  if (serial.length > 8) {
    return serial.slice(0, 4) + '-****-' + serial.slice(-4);
  }
  return '****';
}

/**
 * Finds the asset associated with a given passportId.
 * Handles both the full passport ID (from asset data) and short IDs (from passport attributes).
 */
function findAssetByPassportId(passportId: string) {
  // Try direct match on asset passportId
  const directMatch = assets.find((a) => a.passportId === passportId);
  if (directMatch) return directMatch;

  // Try matching short ID to asset suffix pattern
  // Short IDs: ZG-0001, UK-0002, DE-0003
  // Full IDs: BP-HR-RE-SEST-2026-0001, BP-UK-RE-SEST-2026-0002, BP-HR-RE-SEST-2026-0003
  const asset = assets.find((a) => {
    const shortId = passportId.toLowerCase();
    return a.assetId.toLowerCase().includes(shortId.replace('-', '-'));
  });
  return asset || null;
}

/**
 * Resolves a passportId (from URL) to the correct short passport ID used in the attributes data.
 * Tries multiple strategies.
 */
function resolveAttributePassportId(passportId: string): string {
  // If attributes exist for the given ID directly, use it
  const directAttrs = getAttributesByPassportId(passportId);
  if (directAttrs.length > 0) return passportId;

  // Map full asset passportId to short passport attribute ID
  const asset = findAssetByPassportId(passportId);
  if (asset) {
    // Extract short ID from assetId: ASSET-SEST-ZG-0001 -> ZG-0001
    const assetParts = asset.assetId.split('-');
    const shortId = assetParts.slice(-2).join('-'); // e.g., "ZG-0001"
    const attrs = getAttributesByPassportId(shortId);
    if (attrs.length > 0) return shortId;
  }

  return passportId;
}

interface AttributeDisplayProps {
  attribute: PassportAttribute;
}

const AttributeDisplay: React.FC<AttributeDisplayProps> = ({ attribute }) => {
  const displayValue = attribute.value !== null && attribute.value !== undefined
    ? `${attribute.value}${attribute.unit ? ` ${attribute.unit}` : ''}`
    : 'Not available';

  return (
    <div className="flex justify-between items-start py-3 border-b border-border last:border-b-0">
      <span className="text-text-secondary text-sm">{attribute.name}</span>
      <span className="text-text-primary text-sm font-medium text-right max-w-[60%]">
        {displayValue}
      </span>
    </div>
  );
};

export const PublicPassportPage: React.FC = () => {
  const { passportId } = useParams<{ passportId: string }>();
  const navigate = useNavigate();

  if (!passportId) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-heading-2 text-text-primary mb-2">Passport Not Found</h1>
          <p className="text-text-secondary">No passport ID provided in the URL.</p>
        </div>
      </div>
    );
  }

  // Resolve the passportId to the correct attribute data key
  const attributePassportId = resolveAttributePassportId(passportId);
  const allAttributes = getAttributesByPassportId(attributePassportId);
  const asset = findAssetByPassportId(passportId);

  // Filter to PUBLIC access level only
  const publicAttributes = allAttributes.filter(
    (attr) => attr.accessLevel === 'PUBLIC'
  );

  // Group by section for display
  const sectionOrder = [
    'Identity',
    'Manufacturer',
    'Technical',
    'Chemistry',
    'Safety',
    'End of Life',
    'Carbon Footprint',
  ] as const;

  const groupedAttributes = sectionOrder.reduce<
    Record<string, PassportAttribute[]>
  >((acc, section) => {
    const attrs = publicAttributes.filter((a) => a.section === section);
    if (attrs.length > 0) {
      acc[section] = attrs;
    }
    return acc;
  }, {});

  // Determine compliance badge
  const complianceLevel = asset?.complianceStatus ?? 'critical_gaps';
  const badge = getPublicComplianceBadge(complianceLevel);

  // Get key display values
  const modelAttr = publicAttributes.find((a) => a.name === 'Battery model');
  const manufacturerAttr = publicAttributes.find((a) => a.name === 'Manufacturer name');
  const capacityAttr = publicAttributes.find((a) => a.name === 'Nominal energy capacity');
  const chemistryAttr = publicAttributes.find((a) => a.name === 'Battery chemistry');

  // Masked serial number
  const maskedSerial = asset ? maskSerialNumber(asset.serialNumber) : 'SEST-2026-****-0001';

  // Handle "Request Access" CTA
  const handleRequestAccess = () => {
    navigate('/login');
  };

  // If no data found
  if (allAttributes.length === 0 && !asset) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-heading-2 text-text-primary mb-2">Passport Not Found</h1>
          <p className="text-text-secondary mb-4">
            No battery passport found for ID: <span className="font-mono">{passportId}</span>
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 rounded-button hover:bg-accent-cyan/20 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-secondary/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className="h-5 w-5 text-accent-cyan" />
            <span className="text-sm font-medium text-text-primary">EU Battery Passport</span>
          </div>
          <StatusBadge status={badge.variant} size="sm" showIcon />
        </div>
      </header>

      {/* Main content — mobile-first single column */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* QR Code Panel */}
        <QRCodePanel
          passportId={passportId}
          serialNumber={maskedSerial}
          className="mx-auto max-w-xs"
        />

        {/* Battery Identity Summary */}
        <section className="rounded-card border border-border bg-background-secondary p-5 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Factory className="h-4 w-4 text-accent-cyan" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Battery Identity
            </h2>
          </div>

          {modelAttr && (
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Model</span>
              <span className="text-text-primary font-medium text-sm">
                {String(modelAttr.value)}
              </span>
            </div>
          )}
          {manufacturerAttr && (
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Manufacturer</span>
              <span className="text-text-primary font-medium text-sm">
                {String(manufacturerAttr.value)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">Serial Number</span>
            <span className="text-text-primary font-mono text-sm">{maskedSerial}</span>
          </div>
          {capacityAttr && (
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Capacity</span>
              <span className="text-text-primary font-medium text-sm">
                {capacityAttr.value} {capacityAttr.unit}
              </span>
            </div>
          )}
          {chemistryAttr && (
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Chemistry</span>
              <span className="text-text-primary font-medium text-sm">
                {String(chemistryAttr.value)}
              </span>
            </div>
          )}
          {asset && (
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Category</span>
              <span className="text-text-primary font-medium text-sm">
                Industrial BESS
              </span>
            </div>
          )}
        </section>

        {/* Safety Section */}
        {groupedAttributes['Safety'] && (
          <section className="rounded-card border border-border bg-background-secondary p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Safety Summary
              </h2>
            </div>
            {groupedAttributes['Safety'].map((attr) => (
              <AttributeDisplay key={attr.attributeId} attribute={attr} />
            ))}
          </section>
        )}

        {/* Recycling / End of Life Section */}
        {groupedAttributes['End of Life'] && (
          <section className="rounded-card border border-border bg-background-secondary p-5">
            <div className="flex items-center gap-2 mb-4">
              <Recycle className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Recycling Instructions
              </h2>
            </div>
            {groupedAttributes['End of Life'].map((attr) => (
              <AttributeDisplay key={attr.attributeId} attribute={attr} />
            ))}
          </section>
        )}

        {/* Technical Specifications */}
        {groupedAttributes['Technical'] && (
          <section className="rounded-card border border-border bg-background-secondary p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-accent-cyan" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Technical Specification
              </h2>
            </div>
            {groupedAttributes['Technical'].map((attr) => (
              <AttributeDisplay key={attr.attributeId} attribute={attr} />
            ))}
          </section>
        )}

        {/* Chemistry */}
        {groupedAttributes['Chemistry'] && (
          <section className="rounded-card border border-border bg-background-secondary p-5">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="h-4 w-4 text-accent-cyan" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Chemistry
              </h2>
            </div>
            {groupedAttributes['Chemistry'].map((attr) => (
              <AttributeDisplay key={attr.attributeId} attribute={attr} />
            ))}
          </section>
        )}

        {/* Carbon Footprint (public summary) */}
        {groupedAttributes['Carbon Footprint'] && (
          <section className="rounded-card border border-border bg-background-secondary p-5">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                Carbon Footprint
              </h2>
            </div>
            {groupedAttributes['Carbon Footprint'].map((attr) => (
              <AttributeDisplay key={attr.attributeId} attribute={attr} />
            ))}
            <p className="text-caption text-text-tertiary mt-3 italic">
              Demo values — not externally verified.
            </p>
          </section>
        )}

        {/* Compliance Badge Section */}
        <section className="rounded-card border border-border bg-background-secondary p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-text-tertiary uppercase tracking-wider mb-1">
                Compliance Status
              </p>
              <p className="text-sm text-text-secondary">
                EU Battery Regulation readiness
              </p>
            </div>
            <StatusBadge status={badge.variant} size="md" showIcon />
          </div>
        </section>

        {/* Request Access CTA */}
        <section className="rounded-card border border-accent-cyan/20 bg-accent-cyan/5 p-5 text-center space-y-3">
          <Lock className="h-8 w-8 text-accent-cyan mx-auto" />
          <h3 className="text-text-primary font-medium">
            Need more information?
          </h3>
          <p className="text-text-secondary text-sm">
            Detailed performance data, telemetry, service history, and compliance 
            documentation are available to authorized users.
          </p>
          <button
            onClick={handleRequestAccess}
            className="w-full sm:w-auto px-6 py-3 bg-accent-cyan text-background-primary font-semibold rounded-button hover:bg-accent-cyan/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-background-primary"
          >
            Request Access
          </button>
        </section>

        {/* Demo disclaimer footer */}
        <footer className="text-center pb-8">
          <p className="text-caption text-text-tertiary">
            This is a demo battery passport. All data is synthetic.
          </p>
          <p className="text-caption text-text-tertiary mt-1">
            EU Battery Passport Platform • Ericsson Nikola Tesla × Rimac Energy
          </p>
        </footer>
      </main>
    </div>
  );
};

export default PublicPassportPage;
