import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Battery, MapPin, Building2, Filter } from 'lucide-react';
import { DataTable, StatusBadge, DemoDisclaimer } from '@/components/shared';
import type { Column } from '@/components/shared/DataTable';
import { useAssets } from '@/hooks/useAssets';
import { cn } from '@/lib/cn';
import type { Asset, ComplianceLevel, AlarmStatus, ConnectivityStatus } from '@/types';

// ============================================================
// FILTER TYPES
// ============================================================

interface Filters {
  location: string;
  owner: string;
  status: string;
  complianceMin: number;
  complianceMax: number;
}

const DEFAULT_FILTERS: Filters = {
  location: '',
  owner: '',
  status: '',
  complianceMin: 0,
  complianceMax: 100,
};

// ============================================================
// ASSET REGISTRY PAGE
// ============================================================

export function AssetRegistryPage() {
  const { assets } = useAssets();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Derive unique filter options from assets
  const filterOptions = useMemo(() => {
    const locations = [...new Set(assets.map((a) => a.location.country))];
    const owners = [...new Set(assets.map((a) => a.owner))];
    const statuses = [...new Set(assets.map((a) => a.status))];
    return { locations, owners, statuses };
  }, [assets]);

  // Apply filters
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (filters.location && asset.location.country !== filters.location) return false;
      if (filters.owner && asset.owner !== filters.owner) return false;
      if (filters.status && asset.status !== filters.status) return false;
      if (asset.complianceScorePct < filters.complianceMin) return false;
      if (asset.complianceScorePct > filters.complianceMax) return false;
      return true;
    });
  }, [assets, filters]);

  // Row click navigates to asset detail
  const handleRowClick = (asset: Asset) => {
    navigate(`/assets/${asset.assetId}`);
  };

  // Row class callback for highlighting alarmed / critical_gaps assets
  const getRowClassName = (asset: Asset): string => {
    if (asset.alarmStatus === 'critical') return 'border-l-4 border-l-red-500';
    if (asset.alarmStatus === 'warning') return 'border-l-4 border-l-amber-500';
    if (asset.complianceStatus === 'critical_gaps') return 'border-l-4 border-l-red-500/60';
    return '';
  };

  // Column definitions
  const columns: Column<Asset>[] = [
    {
      key: 'assetId',
      header: 'Asset ID',
      sortable: true,
      accessor: 'assetId',
      render: (_value, row) => (
        <span className="font-mono text-xs text-cyan-400">{row.assetId}</span>
      ),
    },
    {
      key: 'model',
      header: 'Model',
      sortable: true,
      accessor: 'model',
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      accessor: (row) => `${row.location.city}, ${row.location.country}`,
      render: (_value, row) => (
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          {row.location.city}, {row.location.country}
        </span>
      ),
    },
    {
      key: 'owner',
      header: 'Owner',
      sortable: true,
      accessor: 'owner',
      render: (_value, row) => (
        <span className="flex items-center gap-1.5 max-w-[180px] truncate">
          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="truncate">{row.owner}</span>
        </span>
      ),
    },
    {
      key: 'soc',
      header: 'SoC',
      sortable: true,
      accessor: (row) => row.latestTelemetry?.socPct ?? -1,
      render: (_value, row) => {
        const soc = row.latestTelemetry?.socPct;
        if (soc == null) return <span className="text-slate-500">—</span>;
        return <span className="font-mono tabular-nums">{soc.toFixed(1)}%</span>;
      },
    },
    {
      key: 'soh',
      header: 'SoH',
      sortable: true,
      accessor: (row) => row.latestTelemetry?.sohPct ?? -1,
      render: (_value, row) => {
        const soh = row.latestTelemetry?.sohPct;
        if (soh == null) return <span className="text-slate-500">—</span>;
        return <span className="font-mono tabular-nums">{soh.toFixed(1)}%</span>;
      },
    },
    {
      key: 'complianceScore',
      header: 'Compliance',
      sortable: true,
      accessor: 'complianceScorePct',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums text-xs">{row.complianceScorePct}%</span>
          <StatusBadge status={row.complianceStatus as ComplianceLevel} size="xs" />
        </div>
      ),
    },
    {
      key: 'alarmStatus',
      header: 'Alarms',
      sortable: true,
      accessor: 'alarmStatus',
      render: (_value, row) => (
        <StatusBadge status={row.alarmStatus as AlarmStatus} size="xs" showIcon />
      ),
    },
    {
      key: 'connectivity',
      header: 'Connectivity',
      sortable: true,
      accessor: 'connectivityStatus',
      render: (_value, row) => (
        <StatusBadge status={row.connectivityStatus as ConnectivityStatus} size="xs" showIcon />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Demo Mode disclaimer — synthetic asset data (NFR-002) */}
      <DemoDisclaimer variant="banner" />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-1 text-slate-100 flex items-center gap-2">
            <Battery className="h-6 w-6 text-cyan-400" aria-hidden="true" />
            Asset Registry
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            All BESS assets with health, compliance, and connectivity status
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
            showFilters
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
          )}
          aria-expanded={showFilters}
          aria-controls="asset-filters"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filters
        </button>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div
          id="asset-filters"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl"
        >
          {/* Location filter */}
          <div>
            <label htmlFor="filter-location" className="block text-xs text-slate-400 mb-1">
              Location
            </label>
            <select
              id="filter-location"
              value={filters.location}
              onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All locations</option>
              {filterOptions.locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Owner filter */}
          <div>
            <label htmlFor="filter-owner" className="block text-xs text-slate-400 mb-1">
              Owner
            </label>
            <select
              id="filter-owner"
              value={filters.owner}
              onChange={(e) => setFilters((f) => ({ ...f, owner: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All owners</option>
              {filterOptions.owners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="filter-status" className="block text-xs text-slate-400 mb-1">
              Status
            </label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All statuses</option>
              {filterOptions.statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Compliance score range */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Compliance Score Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={filters.complianceMin}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, complianceMin: Number(e.target.value) }))
                }
                aria-label="Minimum compliance score"
                className="w-16 px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-slate-500 text-sm">–</span>
              <input
                type="number"
                min={0}
                max={100}
                value={filters.complianceMax}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, complianceMax: Number(e.target.value) }))
                }
                aria-label="Maximum compliance score"
                className="w-16 px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Reset filters button */}
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* Asset Data Table with row highlighting */}
      <div className="asset-registry-table">
        <DataTable<Asset>
          data={filteredAssets}
          columns={columns}
          onRowClick={handleRowClick}
          pageSize={10}
          searchable
          searchPlaceholder="Search assets by ID, model, location, owner..."
          emptyMessage="No assets match the current filters"
          className="[&_tr]:transition-colors"
          rowClassName={getRowClassName}
        />
      </div>

      {/* Summary footer */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span>{filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} shown</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
          Warning alarm
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
          Critical / Compliance gaps
        </span>
      </div>
    </div>
  );
}
