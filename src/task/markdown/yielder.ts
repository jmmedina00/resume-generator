import { getFullTaskName } from '../io/task';
import type { TaskYielder } from '../render';
import {
  AssetsDeclaration,
  getLocalAssetGatheringYielder,
} from '../render/assets';
import {
  bufferContextResource,
  bufferContextResourceAsIs,
} from '../render/buffer';
import { makeResourceFromExistingWithFn } from '../render/transform';
import { adaptPrettierFormat, appendToObjectResource } from '../render/util';
import { parseMarkdown } from './transform';

const baseAssets: AssetsDeclaration = {
  template: './assets/markdown.html',
  prettierOptions: '.prettierrc',
};

export const getYielders = (path: string) => [
  getLocalAssetGatheringYielder({ ...baseAssets, src: path }),
  getParseYielder,
  bufferContextResource(bufferContextResourceAsIs, 'pretty'),
];

const getParseYielder: TaskYielder = (task) => [
  {
    title: getFullTaskName('Add HTML parser', task),
    task: appendToObjectResource('prettierOptions', { parser: 'html' }),
  },
  {
    title: getFullTaskName('Parse Markdown to HTML', task),
    task: makeResourceFromExistingWithFn(
      ['template', 'src'],
      'rendered',
      parseMarkdown
    ),
  },
  {
    title: getFullTaskName('Prettify HTML', task),
    task: makeResourceFromExistingWithFn(
      ['rendered', 'prettierOptions'],
      'pretty',
      adaptPrettierFormat
    ),
  },
];
