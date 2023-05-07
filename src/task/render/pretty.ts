import { RenderContext } from '../context';
import { format } from 'prettier';

export const prettifyContentsofContext = async (
  ctx: RenderContext
): Promise<void> => {
  const oldContents = ctx.contents;
  const options = ctx.prettierOptions;
  const newContents = format(oldContents, options);

  ctx.contents = newContents;
};