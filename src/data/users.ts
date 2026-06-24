import type { DemoUser } from '../types';

// ============================================================
// DEMO USERS — one per role
// ============================================================

export const users: DemoUser[] = [
  {
    id: 'USR-PUBLIC-01',
    name: 'Public QR User',
    email: 'public@battery-passport.demo',
    role: 'PUBLIC_VIEWER',
    organizationId: '',
  },
  {
    id: 'USR-OWNER-01',
    name: 'Maja Kovač',
    email: 'maja.kovac@adriagrid.demo',
    role: 'ASSET_OWNER',
    organizationId: 'ORG-ADRIA-GRID',
  },
  {
    id: 'USR-ENGINEER-01',
    name: 'Ivan Horvat',
    email: 'ivan.horvat@rimac-energy.demo',
    role: 'RIMAC_SERVICE_ENGINEER',
    organizationId: 'ORG-RIMAC-DEMO',
  },
  {
    id: 'USR-OPERATOR-01',
    name: 'Elena Marković',
    email: 'elena.markovic@ent-demo.local',
    role: 'ENT_PLATFORM_OPERATOR',
    organizationId: 'ORG-ENT-DEMO',
  },
  {
    id: 'USR-REGULATOR-01',
    name: 'Sofia Weber',
    email: 'sofia.weber@msa-demo.eu',
    role: 'REGULATOR',
    organizationId: 'ORG-EU-MSA-DEMO',
  },
  {
    id: 'USR-RECYCLER-01',
    name: 'Lukas Schneider',
    email: 'lukas.schneider@circularbat.demo',
    role: 'RECYCLER',
    organizationId: 'ORG-CIRCULAR-BAT',
  },
  {
    id: 'USR-ADMIN-01',
    name: 'Admin Demo',
    email: 'admin@battery-passport.demo',
    role: 'ADMIN',
    organizationId: 'ORG-ENT-DEMO',
  },
  {
    id: 'USR-OPERATOR-02',
    name: 'Tomislav Jurić',
    email: 'tomislav.juric@rimac-energy.demo',
    role: 'RIMAC_OPERATOR',
    organizationId: 'ORG-RIMAC-DEMO',
  },
  {
    id: 'USR-COMPLIANCE-01',
    name: 'Ana Babić',
    email: 'ana.babic@rimac-energy.demo',
    role: 'RIMAC_COMPLIANCE_MANAGER',
    organizationId: 'ORG-RIMAC-DEMO',
  },
  {
    id: 'USR-SERVICE-02',
    name: 'Marko Novak',
    email: 'marko.novak@rimac-energy.demo',
    role: 'RIMAC_SERVICE_USER',
    organizationId: 'ORG-RIMAC-DEMO',
  },
  {
    id: 'USR-SUPPLIER-01',
    name: 'Chen Wei',
    email: 'chen.wei@demo-cell-supplier.demo',
    role: 'SUPPLIER_USER',
    organizationId: 'ORG-SUPPLIER-A',
  },
];
