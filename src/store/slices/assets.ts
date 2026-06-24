import type { StateCreator } from 'zustand';
import type { Asset } from '@/types';
import { assets as demoAssets } from '@/data/assets';

// ============================================================
// ASSET SLICE
// ============================================================

export interface AssetSlice {
  assets: Asset[];
  selectedAssetId: string | null;
  selectAsset: (assetId: string) => void;
  getAssetById: (assetId: string) => Asset | undefined;
}

export const createAssetSlice: StateCreator<AssetSlice, [['zustand/immer', never]], [], AssetSlice> = (
  set,
  get
) => ({
  assets: demoAssets,
  selectedAssetId: null,

  selectAsset: (assetId: string) => {
    set((state) => {
      state.selectedAssetId = assetId;
    });
  },

  getAssetById: (assetId: string) => {
    return get().assets.find((a) => a.assetId === assetId);
  },
});
