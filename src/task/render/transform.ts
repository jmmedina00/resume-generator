import type { RenderContext } from '../context';
import { setIntoContext } from './util';

export const makeResourceFromExistingWithFn =
  (
    srcKeys: string[],
    targetKey: string,
    fn: (...data: string[]) => Promise<string>
  ) =>
  async (ctx: RenderContext): Promise<void> => {
    const sources = srcKeys.map((key) => ctx.resources[key]);
    const resource = await fn(...sources);
    setIntoContext(targetKey)(resource, ctx);
  };
