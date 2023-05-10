import { RenderContext } from '../context';

export const validateContextContents = async (
  ctx: RenderContext
): Promise<void> => {
  const { contents, validateFn } = ctx;
  await validateFn(JSON.parse(contents));
};
