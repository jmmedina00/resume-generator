import { RenderContext } from '../../context';
import puppeteer from 'puppeteer';

const getTheme = (themeModule: string) => 'jsonresume-theme-' + themeModule;

export const getResumeToDocumentConverter =
  (themeModule: string) =>
  async (ctx: RenderContext): Promise<void> => {
    const resume = JSON.parse(ctx.contents.toString());
    const theme = require(getTheme(themeModule));

    ctx.contents = Buffer.from(theme.render(resume));
  };

export const getResumeToPdfConverter =
  (themeModule: string) =>
  async (ctx: RenderContext): Promise<void> => {
    const resume = JSON.parse(ctx.contents.toString());
    const theme = require(getTheme(themeModule));

    const rendered = theme.render(resume);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setContent(rendered, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'a4', printBackground: true });
    ctx.contents = buffer;

    await browser.close();
  };
// https://github.com/rbardini/resumed/blob/master/examples/with-pdf-export/index.js
