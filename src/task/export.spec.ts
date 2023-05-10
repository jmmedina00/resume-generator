import { ListrTaskWrapper } from 'listr2';
import { RenderContext, ResumeContext, initialContext } from './context';
import {
  FileDescriptor,
  PRIVATE_DIST,
  PUBLIC_DIST,
  getExportTasksFromDescriptor,
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './export';
import { format } from 'path';
import { getFileDescriptorRenderingTasks } from './render';

jest.mock('./render');

describe('Exporting tasks', () => {
  it('should generate descriptors for all public versions', () => {
    const context: ResumeContext = {
      ...initialContext,
      publicVersions: {
        en: { foo: 'bar' },
        es: { bar: 'baz' },
      },
    };

    const expected = [
      {
        path: format({ dir: PUBLIC_DIST, base: 'en.json' }),
        contents: JSON.stringify({ foo: 'bar' }),
      },
      {
        path: format({ dir: PUBLIC_DIST, base: 'es.json' }),
        contents: JSON.stringify({ bar: 'baz' }),
      },
    ];

    const actual = getPublicVersionDescriptors(context).map(({ path, fn }) => ({
      path,
      contents: fn(context),
    }));

    expect(actual).toEqual(expected);
  });

  it('should generate descriptors for all private versions', () => {
    const context: ResumeContext = {
      ...initialContext,
      privateVersions: {
        en: [{ foo: 'bar' }, { x: 'y' }],
        es: [{ bar: 'baz' }, { y: 'z' }],
      },
    };

    const expected = [
      {
        path: format({ base: 'en-0.json', dir: PRIVATE_DIST }),
        contents: JSON.stringify({ foo: 'bar' }),
      },
      {
        path: format({ base: 'en-1.json', dir: PRIVATE_DIST }),
        contents: JSON.stringify({ x: 'y' }),
      },
      {
        path: format({ base: 'es-0.json', dir: PRIVATE_DIST }),
        contents: JSON.stringify({ bar: 'baz' }),
      },
      {
        path: format({ base: 'es-1.json', dir: PRIVATE_DIST }),
        contents: JSON.stringify({ y: 'z' }),
      },
    ];

    const actual = getPrivateVersionDescriptors(context).map(
      ({ path, fn }) => ({
        path,
        contents: fn(context),
      })
    );

    expect(actual).toEqual(expected);
  });

  it('should create writing tasks from rendering, file descriptor and provided precontext options', async () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<ResumeContext, any>> = {
      newListr: lister,
    };

    const foo = jest.fn().mockReturnValue('foobarbaz');
    const bar = jest.fn().mockResolvedValue('barbaz');

    const taskGenerator = jest.fn();
    (getFileDescriptorRenderingTasks as jest.Mock).mockReturnValue(
      taskGenerator
    );

    const descriptor: FileDescriptor = {
      path: 'qwe/foo',
      fn: foo,
    };

    const partialRenderContext: Partial<RenderContext> = {
      prettierOptions: { tabWidth: 4 },
      validateFn: bar,
    };

    const context: ResumeContext = { ...initialContext };

    (await getExportTasksFromDescriptor(descriptor, partialRenderContext))(
      { ...initialContext },
      providedTask as ListrTaskWrapper<ResumeContext, any>
    );

    const expectedRenderContext: RenderContext = {
      path: 'qwe/foo',
      contents: 'foobarbaz',
      prettierOptions: { tabWidth: 4 },
      validateFn: bar,
    };

    const actualRenderContext = (getFileDescriptorRenderingTasks as jest.Mock)
      .mock.calls[0][0];
    expect(actualRenderContext).toEqual(expectedRenderContext);
    expect(taskGenerator).toHaveBeenCalledWith(context, providedTask);
  });
});
