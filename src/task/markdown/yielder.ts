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
import {
  KEY_PRETTIER_OPTIONS,
  KEY_PRETTIFIED,
  addParserWithPrettyOptions,
  prettifyResource,
} from '../render/shared';
import { makeResourceFromExistingWithFn } from '../render/transform';
import { parseMarkdown } from './transform';

const baseAssets: AssetsDeclaration = {
  template: './assets/markdown.html',
  [KEY_PRETTIER_OPTIONS]: '.prettierrc',
};

export const KEY_RESULT_HOLDER = 'rendered';

export const getYielders = (path: string) => [
  getLocalAssetGatheringYielder({ ...baseAssets, src: path }),
  addParserWithPrettyOptions('html'),
  getParseYielder,
  prettifyResource(KEY_RESULT_HOLDER),
  bufferContextResource(bufferContextResourceAsIs, KEY_PRETTIFIED),
];

const getParseYielder: TaskYielder = (task) => [
  {
    title: getFullTaskName('Parse Markdown to HTML', task),
    task: makeResourceFromExistingWithFn(
      ['template', 'src'],
      KEY_RESULT_HOLDER,
      parseMarkdown
    ),
  },
];
