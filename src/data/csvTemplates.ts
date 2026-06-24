// ============================================================
// DEMO CSV TEMPLATE DATA
// ============================================================

export interface CSVColumnDefinition {
  name: string;
  label: string;
  required: boolean;
  description: string;
}

export interface ParsedCSVRow {
  asset_id: string;
  serial_number: string;
  product_family: string;
  battery_type: string;
  capacity_kwh: number;
  chemistry: string;
  manufacturing_date: string;
  manufacturing_site: string;
  location: string;
  lifecycle_status: string;
}

// Column definitions for the asset import CSV template
export const csvColumnDefinitions: CSVColumnDefinition[] = [
  {
    name: 'asset_id',
    label: 'Asset ID',
    required: true,
    description: 'Unique identifier for the battery asset (e.g. SINE-HR-ZG-001)',
  },
  {
    name: 'serial_number',
    label: 'Serial Number',
    required: true,
    description: 'Manufacturer serial number for traceability',
  },
  {
    name: 'product_family',
    label: 'Product Family',
    required: true,
    description: 'Product line or family name (e.g. Rimac Energy SineStack)',
  },
  {
    name: 'battery_type',
    label: 'Battery Type',
    required: true,
    description: 'Classification of battery type (Industrial BESS, EV Battery, etc.)',
  },
  {
    name: 'capacity_kwh',
    label: 'Capacity (kWh)',
    required: true,
    description: 'Rated energy capacity in kilowatt-hours (must be between 1 and 10000)',
  },
  {
    name: 'chemistry',
    label: 'Chemistry',
    required: true,
    description: 'Battery chemistry category (LFP, NMC, NCA, LTO, Solid-State, Na-Ion, Other)',
  },
  {
    name: 'manufacturing_date',
    label: 'Manufacturing Date',
    required: true,
    description: 'Date of manufacture in YYYY-MM-DD format',
  },
  {
    name: 'manufacturing_site',
    label: 'Manufacturing Site',
    required: true,
    description: 'Factory or production facility name',
  },
  {
    name: 'location',
    label: 'Location',
    required: false,
    description: 'Current installation or storage location',
  },
  {
    name: 'lifecycle_status',
    label: 'Lifecycle Status',
    required: false,
    description: 'Current lifecycle state (Prototype, Manufactured, Installed, Commissioned, Decommissioned)',
  },
];

// Pre-loaded demo CSV content as a raw string
export const demoCSVContent = `asset_id,serial_number,product_family,battery_type,capacity_kwh,chemistry,manufacturing_date,manufacturing_site,location,lifecycle_status
SINE-HR-ZG-001,RE-SN-2026-000145,Rimac Energy SineStack,Industrial BESS,868,LFP,2026-04-18,Rimac Campus Croatia,Zagreb Croatia,Commissioned
SINE-DE-MUN-002,RE-SN-2026-000188,Rimac Energy SineStack,Industrial BESS,1736,LFP,2026-05-02,Rimac Campus Croatia,Munich Germany,Installed
EVP-DEMO-RT-011,RT-HV-2026-000011,Rimac Technology HV Pack,EV Battery,102,NMC,2026-04-22,Rimac Campus Croatia,OEM Demo Program,Prototype`;

// Parsed version of the demo CSV data as typed objects
export const demoParsedCSVRows: ParsedCSVRow[] = [
  {
    asset_id: 'SINE-HR-ZG-001',
    serial_number: 'RE-SN-2026-000145',
    product_family: 'Rimac Energy SineStack',
    battery_type: 'Industrial BESS',
    capacity_kwh: 868,
    chemistry: 'LFP',
    manufacturing_date: '2026-04-18',
    manufacturing_site: 'Rimac Campus Croatia',
    location: 'Zagreb Croatia',
    lifecycle_status: 'Commissioned',
  },
  {
    asset_id: 'SINE-DE-MUN-002',
    serial_number: 'RE-SN-2026-000188',
    product_family: 'Rimac Energy SineStack',
    battery_type: 'Industrial BESS',
    capacity_kwh: 1736,
    chemistry: 'LFP',
    manufacturing_date: '2026-05-02',
    manufacturing_site: 'Rimac Campus Croatia',
    location: 'Munich Germany',
    lifecycle_status: 'Installed',
  },
  {
    asset_id: 'EVP-DEMO-RT-011',
    serial_number: 'RT-HV-2026-000011',
    product_family: 'Rimac Technology HV Pack',
    battery_type: 'EV Battery',
    capacity_kwh: 102,
    chemistry: 'NMC',
    manufacturing_date: '2026-04-22',
    manufacturing_site: 'Rimac Campus Croatia',
    location: 'OEM Demo Program',
    lifecycle_status: 'Prototype',
  },
];
