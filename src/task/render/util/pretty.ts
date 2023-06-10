import type { RenderContext } from '../../context';
import { Options, format } from 'prettier';

export const prettifyContentsofContext = async (
  ctx: RenderContext
): Promise<void> => {
  const oldContents = ctx.contents.toString();
  const options = ctx.prettierOptions;
  const newContents = format(oldContents, options);

  ctx.contents = Buffer.from(newContents);
};

export const adaptPrettierFormat = async (
  source: string,
  jsonOptions: string
) => {
  const options: Options = JSON.parse(jsonOptions);
  return format(source, options);
};
