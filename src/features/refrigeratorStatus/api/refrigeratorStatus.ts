import {
  Asset,
  createFrontendAssetsQuery,
  fetchAssets,
} from "@clearblade/ia-mfe-core";
import { QueryFunctionContext, useQuery } from "react-query";

export type RefrigeratorAsset = Omit<Asset["frontend"], "custom_data"> & {
  custom_data: {
    temperature: number;
    humidity: number;
    isRunning: boolean;
    doorOpen: boolean;
    motion?: boolean;
    motionCount?: number;
  };
};

export const refrigeratorStatusQueryKeys = {
  byAsset: (params: { assetId: string }) =>
    [{ scope: "refrigeratorStatus", params }] as const,
};

async function fetchRefrigeratorStatus({
  queryKey: [
    {
      params: { assetId },
    },
  ],
}: QueryFunctionContext<
  ReturnType<typeof refrigeratorStatusQueryKeys.byAsset>
>): Promise<RefrigeratorAsset> {
  const data = await fetchAssets(new AbortController(), {
    filters: {
      ids: [assetId],
    },
  });

  const asset = data.DATA[0];
  if (typeof asset === "undefined") {
    throw new Error(`No asset found with id '${assetId}'`);
  }

  return asset as unknown as RefrigeratorAsset;
}

/**
 * Represents the current status of a refrigerator asset
 */
export function useRefrigeratorStatusQuery({ assetId }: { assetId: string }) {
  return useQuery(refrigeratorStatusQueryKeys.byAsset({ assetId }), {
    queryFn: fetchRefrigeratorStatus,
    refetchOnMount: false,
  });
}
