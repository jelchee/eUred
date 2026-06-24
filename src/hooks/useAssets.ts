import { useCallback } from 'react';
import { useAppStore } from '@/store';
import type { Asset } from '@/types';

/**
 * Typed selector hook for asset management.
 * Returns all assets, the selected asset, and helper actions.
 */
export function useAssets() {
  const assets = useAppStore((s) => s.assets);
  const selectedAssetId = useAppStore((s) => s.selectedAssetId);
  const selectAsset = useAppStore((s) => s.selectAsset);

  const selectedAsset: Asset | undefined = assets.find(
    (a) => a.assetId === selectedAssetId
  );

  const getAssetById = useCallback(
    (assetId: string): Asset | undefined => {
      return assets.find((a) => a.assetId === assetId);
    },
    [assets]
  );

  return {
    assets,
    selectedAsset,
    selectAsset,
    getAssetById,
  };
}
