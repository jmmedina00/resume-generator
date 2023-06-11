import { adaptPrettierFormat, appendToObjectResource } from '../render/util';
import { getLocalAssetGatheringYielder } from '../render/assets';
import {
  bufferContextResource,
  bufferContextResourceAsIs,
} from '../render/buffer';
import { makeResourceFromExistingWithFn } from '../render/transform';
import { parseMarkdown } from './transform';
import { getYielders } from './yielder';
import type { ListrTask, ListrTaskFn, ListrTaskWrapper } from 'listr2';

jest.mock('../render/util');
jest.mock('../render/assets');
jest.mock('../render/buffer');
jest.mock('../render/transform');
jest.mock('../io/task');

describe('Markdown rendering yielder', () => {
  it('should gather assets, transform them and buffer result as-is', () => {
    (getLocalAssetGatheringYielder as jest.Mock).mockImplementation(
      (assets) => (foo: any) => ({ title: 'Gather assets', task: assets })
    );
    (bufferContextResource as jest.Mock).mockImplementation(
      (withFn, from) => (foo: any) => ({
        title: 'Buffer result',
        task: { with: withFn, from },
      })
    );
    (appendToObjectResource as jest.Mock).mockImplementation((addTo, that) => ({
      addTo,
      that,
    }));
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
        title: 'Add HTML parser',
        task: {
          addTo: 'prettierOptions',
          that: { parser: 'html' },
        } as unknown as ListrTaskFn<any, any>,
      },
      {
        title: 'Parse Markdown to HTML',
        task: {
          sources: ['template', 'src'],
          to: 'rendered',
          fn: parseMarkdown,
        } as unknown as ListrTaskFn<any, any>,
      },
      {
        title: 'Prettify HTML',
        task: {
          sources: ['rendered', 'prettierOptions'],
          to: 'pretty',
          fn: adaptPrettierFormat,
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
