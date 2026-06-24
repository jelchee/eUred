import type { DemoOrganization } from '../types';

// ============================================================
// DEMO ORGANIZATIONS
// ============================================================

export const organizations: DemoOrganization[] = [
  {
    id: 'ORG-RIMAC-DEMO',
    name: 'Rimac Energy Demo Operations',
    type: 'manufacturer',
    country: 'Croatia',
  },
  {
    id: 'ORG-ENT-DEMO',
    name: 'Ericsson Nikola Tesla Platform Ops',
    type: 'platform_operator',
    country: 'Croatia',
  },
  {
    id: 'ORG-ADRIA-GRID',
    name: 'Adria Grid Storage d.o.o.',
    type: 'asset_owner',
    country: 'Croatia',
  },
  {
    id: 'ORG-NORTHSEA-ENERGY',
    name: 'NorthSea Flex Storage Ltd.',
    type: 'asset_owner',
    country: 'United Kingdom',
  },
  {
    id: 'ORG-EU-MSA-DEMO',
    name: 'EU Market Surveillance Demo Authority',
    type: 'regulator',
    country: 'EU',
  },
  {
    id: 'ORG-CIRCULAR-BAT',
    name: 'Circular Battery Recovery GmbH',
    type: 'recycler',
    country: 'Germany',
  },
];
