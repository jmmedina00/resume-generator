import { getNavigationBar } from '../../../resume/gen-public';
import { addAtBodyTop, addStyles } from '../../../util/render';
import {
  RenderContext,
  RenderWithTemplateContext,
  ResumeContext,
} from '../../context';
import puppeteer from 'puppeteer';

const getTheme = (themeModule: string) => 'jsonresume-theme-' + themeModule;

export const getResumeToDocumentConverter =
  (themeModule: string, resume: ResumeContext) =>
  async (ctx: RenderWithTemplateContext): Promise<void> => {
    const jsonResume = JSON.parse(ctx.contents.toString());
    const theme = require(getTheme(themeModule));

    const rendered = theme.render(jsonResume);

    const navbar = getNavigationBar(
      ctx.templateContents || '',
      resume.localised,
      ctx.activePage
    );

    const withAppendedNavbar = addAtBodyTop(rendered, navbar);
    const fullyStyled = addStyles(withAppendedNavbar, ctx.templateStyles || '');

    ctx.contents = Buffer.from(fullyStyled);
  };

export const getResumeToPdfConverter =
  (themeModule: string) =>
  async (ctx: RenderContext): Promise<void> => {
    const resume = JSON.parse(ctx.contents.toString());
    const theme = require(getTheme(themeModule));

    const rendered = theme.render(resume);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Quick hack so that it doesn't crash on GitHub Actions
    });
    const page = await browser.newPage();

    await page.setContent(rendered, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'a4', printBackground: true });
    ctx.contents = buffer;

    await browser.close();
  };
// https://github.com/rbardini/resumed/blob/master/examples/with-pdf-export/index.js
