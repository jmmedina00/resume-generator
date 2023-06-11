import type { TaskYielder } from '../../../render';
import { bufferContextResource, type Bufferer } from '../../../render/buffer';
import { getLocalAssetGatheringYielder } from '../../../render/assets';
import {
  addParserWithPrettyOptions,
  prettifyResource,
} from '../../../render/shared';

export interface YielderSummary {
  assets: any;
  prettier?: {
    parser: string;
    formatPoint: string;
  };
  bufferPoint: string;
  bufferer: Bufferer;
}

export const makeYieldersFromSummary = (
  { assets, prettier, bufferPoint, bufferer }: YielderSummary,
  additionalYielders: TaskYielder[]
): TaskYielder[] => {
  const gatherAssets = getLocalAssetGatheringYielder(assets);
  const bufferResource = bufferContextResource(bufferer, bufferPoint);

  return prettier
    ? [
        gatherAssets,
        addParserWithPrettyOptions(prettier.parser),
        ...additionalYielders,
        prettifyResource(prettier.formatPoint),
        bufferResource,
      ]
    : [gatherAssets, ...additionalYielders, bufferResource];
};
