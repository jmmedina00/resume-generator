import { getLocalAssetGatheringYielder } from '../render/assets';
import {
  bufferContextResource,
  bufferContextResourceAsIs,
} from '../render/buffer';
import { makeResourceFromExistingWithFn } from '../render/transform';
import { parseMarkdown } from './transform';
import { KEY_RESULT_HOLDER, getYielders } from './yielder';
import type { ListrTask, ListrTaskFn, ListrTaskWrapper } from 'listr2';
import { addParserWithPrettyOptions, prettifyResource } from '../render/shared';

jest.mock('../render/assets');
jest.mock('../render/buffer');
jest.mock('../render/transform');
jest.mock('../render/shared');
jest.mock('../io/task');

describe('Markdown rendering yielder', () => {
  it('should gather assets, transform them and buffer result as-is', () => {
    (getLocalAssetGatheringYielder as jest.Mock).mockImplementation(
      (assets) => (foo: any) => ({ title: 'Gather assets', task: assets })
    );
    (addParserWithPrettyOptions as jest.Mock).mockImplementation(
      (parser: string) => (foo: any) => ({
        title: 'Parse',
        task: { with: parser },
      })
    );
    (prettifyResource as jest.Mock).mockImplementation(
      (from: string) => (foo: any) => ({
        title: 'Prettify',
        task: { from },
      })
    );
    (bufferContextResource as jest.Mock).mockImplementation(
      (withFn, from) => (foo: any) => ({
        title: 'Buffer result',
        task: { with: withFn, from },
      })
    );
    (makeResourceFromExistingWithFn as jest.Mock).mockImplementation(
      (sources, to, fn) => ({ sources, to, fn })
    );

    const expectedTasks: ListrTask<any, any>[] = [
      {
        title: 'Gather assets',
        task: {
          template: './assets/markdown.html',
          prettierOptions: '.prettierrc',
          src: './foo/bar.txt',
        } as unknown as ListrTaskFn<any, any>,
      },
      {
        title: 'Parse',
        task: {
          with: 'html',
        } as unknown as ListrTaskFn<any, any>,
      },
      {
        title: 'Parse Markdown to HTML',
        task: {
          sources: ['template', 'src'],
          to: KEY_RESULT_HOLDER,
          fn: parseMarkdown,
        } as unknown as ListrTaskFn<any, any>,
      },
      {
        title: 'Prettify',
        task: {
          from: KEY_RESULT_HOLDER,
        } as unknown as ListrTaskFn<any, any>,
      },
      {
        title: 'Buffer result',
        task: {
          with: bufferContextResourceAsIs,
          from: 'pretty',
        } as unknown as ListrTaskFn<any, any>,
      },
    ];

    const tasks = getYielders('./foo/bar.txt').flatMap((yielder) =>
      yielder({} as ListrTaskWrapper<any, any>)
    );

    expect(tasks).toEqual(expectedTasks);
  });
});
