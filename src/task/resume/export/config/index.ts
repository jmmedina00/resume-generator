import type { ResumeContext } from '../../../context';
import type { TaskYielder } from '../../../render';
import {
  KEY_PRETTIFIED,
  applyTemplateToObjectResource,
} from '../../../render/shared';
import {
  bufferContextResourceAsIs,
  bufferContextResourceAsPdf,
} from '../../../render/buffer';
import { htmlAssets, jsonAssets, mdAssets, pdfAssets } from '../assets';
import {
  KEY_WITH_THEME_APPLIED,
  applyJsonResumeThemeToResource,
} from '../yielder/theme';
import { KEY_NAVBAR, getNavbarYielder } from '../yielder/navbar';
import {
  addAtBodyBottom,
  addAtBodyTop,
  addStyles,
} from '../../../../util/render';
import { KEY_FOOTER, getFooterYielders } from '../yielder/footer';
import { addArrow, cleanup } from '../md';
import { makeYieldersFromSummary } from './summary';
import { makeResourceApplier } from './resource';

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

const applyNavbarYielder: TaskYielder = makeResourceApplier({
  title: 'Apply navbar to content',
  sourceKeys: [KEY_WITH_THEME_APPLIED, KEY_NAVBAR],
  targetKey: KEY_BASE_HTML,
  syncFn: addAtBodyTop,
});

const applyFooterYielder: TaskYielder = makeResourceApplier({
  title: 'Apply footer to content',
  sourceKeys: [KEY_WITH_THEME_APPLIED, KEY_FOOTER],
  targetKey: KEY_BASE_HTML,
  syncFn: addAtBodyBottom,
});

const applyStylesYielder: TaskYielder = makeResourceApplier({
  title: 'Apply styles to content',
  sourceKeys: [KEY_BASE_HTML, KEY_STYLES],
  targetKey: KEY_STYLED_HTML,
  syncFn: addStyles,
});

export const jsonYielders = (): TaskYielder[] =>
  makeYieldersFromSummary(
    {
      assets: jsonAssets,
      prettier: { parser: 'json', formatPoint: 'src' },
      bufferer: bufferContextResourceAsIs,
      bufferPoint: KEY_PRETTIFIED,
    },
    []
  );

export const htmlYielders = (
  context: ResumeContext,
  activeLang: string
): TaskYielder[] =>
  makeYieldersFromSummary(
    {
      assets: htmlAssets,
      prettier: { parser: 'html', formatPoint: KEY_STYLED_HTML },
      bufferPoint: KEY_PRETTIFIED,
      bufferer: bufferContextResourceAsIs,
    },
    [
      applyJsonResumeThemeToResource('src', THEME_HTML),
      getNavbarYielder(context, activeLang),
      applyNavbarYielder,
      applyStylesYielder,
    ]
  );

export const pdfYielders = (): TaskYielder[] =>
  makeYieldersFromSummary(
    {
      assets: pdfAssets,
      bufferPoint: KEY_STYLED_HTML,
      bufferer: bufferContextResourceAsPdf,
    },
    [
      applyJsonResumeThemeToResource('src', THEME_PDF),
      ...getFooterYielders(),
      applyFooterYielder,
      applyStylesYielder,
    ]
  );

export const mdYielders = (): TaskYielder[] =>
  makeYieldersFromSummary(
    {
      assets: mdAssets,
      prettier: { parser: 'markdown', formatPoint: 'md' },
      bufferer: bufferContextResourceAsIs,
      bufferPoint: KEY_PRETTIFIED,
    },
    [
      applyTemplateToObjectResource(
        {
          template: KEY_MARKDOWN_TEMPLATE,
          json: 'src',
          target: 'md',
        },
        { addArrow, cleanup }
      ),
    ]
  );
