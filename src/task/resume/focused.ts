import {
  INCLUDE_EVERYTHING,
  INCLUDE_IMPORTANT_ONLY,
  handleImportantFlags,
} from '../../mapping/generic';
import { ResumeContext } from '../context';

const mapper =
  (handling: number) =>
  ([key, value]: [string, any]) =>
    [key, handleImportantFlags(value, handling)];

export const generateFocusedVersionsAndCleanPublicOnes = async (
  ctx: ResumeContext
) => {
  const baseVersions = Object.entries(ctx.publicVersions);
  ctx.publicVersions = Object.fromEntries(
    baseVersions.map(mapper(INCLUDE_EVERYTHING))
  );
  ctx.focusedVersions = Object.fromEntries(
    baseVersions.map(mapper(INCLUDE_IMPORTANT_ONLY))
  );
};
