import puppeteer from 'puppeteer';
import type { RenderContext } from '../context';
import type { TaskYielder } from '.';
import { getFullTaskName } from '../io/task';

export type Bufferer = (key: string) => (ctx: RenderContext) => Promise<void>;

export const bufferContextResource =
  (bufferer: Bufferer, key: string): TaskYielder =>
  (task) =>
    [
      {
        title: getFullTaskName('Apply bufferer', task),
        task: bufferer(key),
      },
    ];

export const bufferContextResourceAsIs: Bufferer =
  (key: string) => async (ctx: RenderContext) => {
    const contents = ctx.resources[key];
    ctx.contents = Buffer.from(contents);
  };

export const bufferContextResourceAsPdf: Bufferer =
  (key: string) => async (ctx: RenderContext) => {
    const contents = ctx.resources[key];

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Quick hack so that it doesn't crash on GitHub Actions
    });
    const page = await browser.newPage();

    await page.setContent(contents, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'a4', printBackground: true }); // PDF pusher
    ctx.contents = buffer;

    await browser.close();
  };
