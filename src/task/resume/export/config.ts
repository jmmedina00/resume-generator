import type { RenderContext, ResumeContext } from '../../context';
import { promisify } from 'util';
import type { TaskYielder } from '../../render';
import {
  KEY_PRETTIFIED,
  addParserWithPrettyOptions,
  applyTemplateToObjectResource,
  prettifyResource,
} from '../../render/shared';
import {
  bufferContextResource,
  bufferContextResourceAsIs,
  bufferContextResourceAsPdf,
} from '../../render/buffer';
import { getLocalAssetGatheringYielder } from '../../render/assets';
import { htmlAssets, jsonAssets, mdAssets, pdfAssets } from './assets';
import {
  KEY_WITH_THEME_APPLIED,
  applyJsonResumeThemeToResource,
} from './yielder/theme';
import { KEY_NAVBAR, getNavbarYielder } from './yielder/navbar';
import { getFullTaskName } from '../../io/task';
import { makeResourceFromExistingWithFn } from '../../render/transform';
import { addAtBodyBottom, addAtBodyTop, addStyles } from '../../../util/render';
import { KEY_FOOTER, getFooterYielders } from './yielder/footer';
import { addArrow, cleanup } from './md';

const schema = require('resume-schema');

export const THEME_HTML = 'even';
export const THEME_PDF = 'markdown';
export const PATH_MARKDOWN_TEMPLATE = './assets/resume.md';
export const PATH_NAVBAR_TEMPLATE = './assets/navbar.html';
export const PATH_FOOTER_TEMPLATE = './assets/footer.html';
export const PATH_STYLES = './assets/styles.css';
export const KEY_STYLES = 'styles';
export const KEY_BASE_HTML = 'html';
export const KEY_STYLED_HTML = 'styledHtml';
export const KEY_MARKDOWN_TEMPLATE = 'mdTemplate';

export const validateResumeWithSchema = async ({
  contents,
}: RenderContext): Promise<void> => {
  const validator = promisify(schema.validate);
  const resume = JSON.parse(contents.toString());
  await validator(resume);
}; // TODO - move to pre-render step

const turnIntoAsync =
  (func: (...foo: string[]) => string) =>
  async (...data: string[]) =>
    func(...data);

const applyNavbarYielder: TaskYielder = (task) => [
  {
    title: getFullTaskName('Apply navbar to content', task),
    task: makeResourceFromExistingWithFn(
      [KEY_WITH_THEME_APPLIED, KEY_NAVBAR],
      KEY_BASE_HTML,
      turnIntoAsync(addAtBodyTop)
    ),
  },
]; // TODO - make all of this much more generative

const applyFooterYielder: TaskYielder = (task) => [
  {
    title: getFullTaskName('Apply footer to content', task),
    task: makeResourceFromExistingWithFn(
      [KEY_WITH_THEME_APPLIED, KEY_FOOTER],
      KEY_BASE_HTML,
      turnIntoAsync(addAtBodyBottom)
    ),
  },
];

const applyStylesYielder: TaskYielder = (task) => [
  {
    title: getFullTaskName('Apply styles to content', task),
    task: makeResourceFromExistingWithFn(
      [KEY_BASE_HTML, KEY_STYLES],
      KEY_STYLED_HTML,
      turnIntoAsync(addStyles)
    ),
  },
];

export const jsonYielders = (): TaskYielder[] => [
  getLocalAssetGatheringYielder(jsonAssets),
  addParserWithPrettyOptions('json'),
  prettifyResource('src'),
  bufferContextResource(bufferContextResourceAsIs, KEY_PRETTIFIED),
];

export const htmlYielders = (
  context: ResumeContext,
  activeLang: string
): TaskYielder[] => [
  getLocalAssetGatheringYielder(htmlAssets),
  addParserWithPrettyOptions('html'),
  applyJsonResumeThemeToResource('src', THEME_HTML),

  getNavbarYielder(context, activeLang),
  applyNavbarYielder,
  applyStylesYielder,

  prettifyResource(KEY_STYLED_HTML),
  bufferContextResource(bufferContextResourceAsIs, KEY_PRETTIFIED),
];

export const pdfYielders = (): TaskYielder[] => [
  getLocalAssetGatheringYielder(pdfAssets),
  applyJsonResumeThemeToResource('src', THEME_PDF),

  ...getFooterYielders(),
  applyFooterYielder,
  applyStylesYielder,

  bufferContextResource(bufferContextResourceAsPdf, KEY_STYLED_HTML),
];

export const mdYielders = (): TaskYielder[] => [
  getLocalAssetGatheringYielder(mdAssets),
  addParserWithPrettyOptions('markdown'),

  applyTemplateToObjectResource(
    {
      template: KEY_MARKDOWN_TEMPLATE,
      json: 'src',
      target: 'md',
    },
    { addArrow, cleanup }
  ),

  prettifyResource('md'),
  bufferContextResource(bufferContextResourceAsIs, KEY_PRETTIFIED),
];
