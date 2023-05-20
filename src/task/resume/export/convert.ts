import { RenderContext } from '../../context';

export const getResumeToDocumentConverter =
  (themeModule: string) =>
  async (ctx: RenderContext): Promise<void> => {
    const resume = JSON.parse(ctx.contents.toString());
    const theme = require('jsonresume-theme-' + themeModule);

    ctx.contents = Buffer.from(theme.render(resume));
  };
