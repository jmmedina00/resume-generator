import { RenderContext } from '../context';
import { writeToFile } from '../io/write';

// Just calling the function yielder by itself does not work
export const writeContextToFile = async (ctx: RenderContext): Promise<void> => {
  await writeToFile(ctx.path, ({ contents }) => contents)(ctx);
};
