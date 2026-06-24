import { useState, useMemo } from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DataTable, StatusBadge } from '@/components/shared';
import type { Column } from '@/components/shared/DataTable';
import type { Document, DocumentType, DocumentStatus, AttributeStatus } from '@/types';

export interface DocumentVaultTableProps {
  documents: Document[];
  onDocumentClick?: (doc: Document) => void;
  className?: string;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  EU_DECLARATION_OF_CONFORMITY: 'EU Declaration of Conformity',
  SAFETY_INSTRUCTIONS: 'Safety Instructions',
  TRANSPORT_HANDLING_GUIDE: 'Transport & Handling',
  RECYCLING_INSTRUCTIONS: 'Recycling Instructions',
  CARBON_FOOTPRINT_STATEMENT: 'Carbon Footprint Statement',
  SUPPLIER_DUE_DILIGENCE: 'Supplier Due Diligence',
  FACTORY_ACCEPTANCE_TEST: 'Factory Acceptance Test',
  COMMISSIONING_REPORT: 'Commissioning Report',
  SERVICE_REPORT: 'Service Report',
  FIRMWARE_RELEASE_NOTES: 'Firmware Release Notes',
};

const STATUS_OPTIONS: DocumentStatus[] = ['verified', 'draft', 'pending_verification', 'expired'];

const TYPE_OPTIONS: DocumentType[] = [
  'EU_DECLARATION_OF_CONFORMITY',
  'SAFETY_INSTRUCTIONS',
  'TRANSPORT_HANDLING_GUIDE',
  'RECYCLING_INSTRUCTIONS',
  'CARBON_FOOTPRINT_STATEMENT',
  'SUPPLIER_DUE_DILIGENCE',
  'FACTORY_ACCEPTANCE_TEST',
  'COMMISSIONING_REPORT',
  'SERVICE_REPORT',
  'FIRMWARE_RELEASE_NOTES',
];

function isExpired(doc: Document): boolean {
  if (!doc.validUntil) return false;
  return new Date(doc.validUntil) < new Date();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Maps DocumentStatus to a StatusBadge-compatible AttributeStatus.
 * 'pending_verification' maps to 'draft' (amber) as the closest semantic match.
 */
function mapDocStatusToBadge(status: DocumentStatus): AttributeStatus {
  const map: Record<DocumentStatus, AttributeStatus> = {
    verified: 'verified',
    draft: 'draft',
    pending_verification: 'draft',
    expired: 'expired',
  };
  return map[status];
}

/**
 * DocumentVaultTable — Filterable document table with expiry indicators.
 * Uses DataTable from shared with document-specific columns.
 * Highlights expired documents in red.
 *
 * Validates: Requirements FR-008
 */
export function DocumentVaultTable({
  documents,
  onDocumentClick,
  className,
}: DocumentVaultTableProps) {
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');

  const filteredDocs = useMemo(() => {
    let result = documents;
    if (typeFilter !== 'all') {
      result = result.filter((d) => d.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }
    return result;
  }, [documents, typeFilter, statusFilter]);

  const columns: Column<Document>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      accessor: 'title',
      render: (_val, row) => (
        <div className="flex items-center gap-2 max-w-[300px]">
          <FileText className="h-4 w-4 text-text-secondary shrink-0" aria-hidden="true" />
          <span className={cn('truncate', isExpired(row) && 'text-red-400')}>
            {row.title}
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      accessor: (row) => DOCUMENT_TYPE_LABELS[row.type],
      render: (_val, row) => (
        <span className="text-text-secondary text-xs">
          {DOCUMENT_TYPE_LABELS[row.type]}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: 'status',
      render: (_val, row) => (
        <StatusBadge
          status={mapDocStatusToBadge(row.status)}
          size="xs"
          showIcon
        />
      ),
    },
    {
      key: 'accessLevel',
      header: 'Access',
      sortable: true,
      accessor: (row) => row.accessLevel.replace(/_/g, ' '),
      render: (_val, row) => (
        <span className="text-text-tertiary text-xs capitalize">
          {row.accessLevel.replace(/_/g, ' ').toLowerCase()}
        </span>
      ),
    },
    {
      key: 'validUntil',
      header: 'Expiry',
      sortable: true,
      accessor: (row) => row.validUntil ?? '',
      render: (_val, row) => {
        const expired = isExpired(row);
        return (
          <div className={cn('flex items-center gap-1', expired && 'text-red-400')}>
            {expired && <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
            <span className="text-xs">{formatDate(row.validUntil)}</span>
          </div>
        );
      },
    },
    {
      key: 'uploadedAt',
      header: 'Uploaded',
      sortable: true,
      accessor: 'uploadedAt',
      render: (_val, row) => (
        <span className="text-text-tertiary text-xs">{formatDate(row.uploadedAt)}</span>
      ),
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="doc-type-filter" className="text-xs text-text-secondary">
            Type:
          </label>
          <select
            id="doc-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as DocumentType | 'all')}
            className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Types</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {DOCUMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="doc-status-filter" className="text-xs text-text-secondary">
            Status:
          </label>
          <select
            id="doc-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'all')}
            className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {filteredDocs.some(isExpired) && (
          <div className="flex items-center gap-1 text-xs text-red-400">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            <span>{filteredDocs.filter(isExpired).length} expired</span>
          </div>
        )}
      </div>

      {/* Table */}
      <DataTable
        data={filteredDocs}
        columns={columns}
        onRowClick={onDocumentClick}
        pageSize={10}
        searchable
        searchPlaceholder="Search documents..."
        emptyMessage="No documents found"
      />
    </div>
  );
}
