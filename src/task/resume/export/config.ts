import { Options, resolveConfig } from 'prettier';
import { RenderContext, ResumeContext } from '../../context';
import { promisify } from 'util';
import { RenderContextTemplates } from '../../export';
import { readFile } from 'fs/promises';
import {
  getResumeToDocumentConverter,
  getResumeToFilledTemplateConverter,
  getResumeToPdfConverter,
} from './convert';

const schema = require('resume-schema');

export const THEME_HTML = 'even';
export const THEME_PDF = 'spartacus';
export const PATH_MARKDOWN_TEMPLATE = './assets/resume.md';
export const PATH_NAVBAR_TEMPLATE = './assets/navbar.html';
export const PATH_NAVBAR_STYLES = './assets/styles.css';

export const getPrettierOptions = async (): Promise<Options> =>
  (await resolveConfig('.prettierrc')) || {};

export const validateResumeWithSchema = async ({
  contents,
}: RenderContext): Promise<void> => {
  const validator = promisify(schema.validate);
  const resume = JSON.parse(contents.toString());
  await validator(resume);
};

export const getJsonRender = async (
  prettierOptions: Options
): Promise<RenderContextTemplates[string]> => ({
  prettierOptions,
  preprocessFn: async () => {},
});

export const getPdfRender = async (): Promise<
  RenderContextTemplates[string]
> => ({
  prettierOptions: null as unknown as Options,
  preprocessFn: getResumeToPdfConverter(THEME_PDF),
});

export const getMarkdownRender = async (
  prettierOptions: Options
): Promise<RenderContextTemplates[string]> => ({
  prettierOptions: {
    ...prettierOptions,
    parser: 'markdown',
  },
  preprocessFn: getResumeToFilledTemplateConverter(PATH_MARKDOWN_TEMPLATE),
});

export const getHtmlRender = async (
  prettierOptions: Options,
  context: ResumeContext
): Promise<RenderContextTemplates[string]> => {
  const templateContents = await readFile(PATH_NAVBAR_TEMPLATE, 'utf-8');
  const templateStyles = await readFile(PATH_NAVBAR_STYLES, 'utf-8');

  return {
    templateContents,
    templateStyles,
    prettierOptions: { ...prettierOptions, parser: 'html' },
    preprocessFn: getResumeToDocumentConverter(THEME_HTML, context),
  };
};
