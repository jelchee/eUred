import { useMemo } from 'react';
import { useAppStore } from '@/store';
import { documents as allDocuments } from '@/data/documents';
import { filterByRole } from '@/lib/permissions';
import type { Document } from '@/types';

/**
 * Typed selector hook for documents.
 * Filters documents by assetId (optional) and the current role's access level.
 */
export function useDocuments(assetId?: string) {
  const currentRole = useAppStore((s) => s.currentRole);

  const filteredByAsset: Document[] = useMemo(() => {
    if (!assetId) return allDocuments;
    return allDocuments.filter((d) => d.assetId === assetId);
  }, [assetId]);

  const { visible, restricted } = useMemo(() => {
    return filterByRole(filteredByAsset, currentRole);
  }, [filteredByAsset, currentRole]);

  const expiredCount = useMemo(() => {
    return visible.filter((d) => d.status === 'expired').length;
  }, [visible]);

  return {
    visible,
    restricted,
    expiredCount,
  };
}
