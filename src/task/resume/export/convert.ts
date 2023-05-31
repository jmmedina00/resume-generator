import { render } from 'mustache';
import { getNavigationBar } from '../../../resume/gen-public';
import { addAtBodyBottom, addAtBodyTop, addStyles } from '../../../util/render';
import {
  RenderContext,
  RenderWithTemplateContext,
  ResumeContext,
} from '../../context';
import puppeteer from 'puppeteer';
import { readFile } from 'fs/promises';
import { getPagesLinkFromRepo } from '../../../service/github/util';

const getTheme = (themeModule: string) => 'jsonresume-theme-' + themeModule;

export const getResumeToFilledTemplateConverter =
  (templatePath: string) =>
  async (ctx: RenderContext): Promise<void> => {
    const jsonResume = JSON.parse(ctx.contents.toString());

    const template = await readFile(templatePath, 'utf-8');
    const rendered = render(template, jsonResume);

    ctx.contents = Buffer.from(rendered);
  };

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
  async (ctx: RenderWithTemplateContext): Promise<void> => {
    const resume = JSON.parse(ctx.contents.toString());
    const theme = require(getTheme(themeModule));

    const rendered = theme.render(resume);

    const footerTemplate = ctx.templateContents || '';
    const repoName = process.env['GITHUB_REPOSITORY'] || '';

    const resumeLink = getPagesLinkFromRepo(repoName);
    const footer = !!resumeLink ? render(footerTemplate, { resumeLink }) : '';

    const withFooter = addAtBodyBottom(rendered, footer);
    const fullyStyled = addStyles(withFooter, ctx.templateStyles || '');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Quick hack so that it doesn't crash on GitHub Actions
    });
    const page = await browser.newPage();

    await page.setContent(fullyStyled, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'a4', printBackground: true });
    ctx.contents = buffer;

    await browser.close();
  };
// https://github.com/rbardini/resumed/blob/master/examples/with-pdf-export/index.js
