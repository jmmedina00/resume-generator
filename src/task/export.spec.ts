import { ListrTask, ListrTaskWrapper } from 'listr2';
import { ResumeContext, initialContext } from './context';
import {
  FileDescriptor,
  PRIVATE_DIST,
  PUBLIC_DIST,
  getExportTasksFromDescriptors,
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './export';
import { writeToFile } from './io/write';
import { format } from 'path';

jest.mock('./io/write');

describe('Exporting tasks', () => {
  beforeEach(() => {
    (writeToFile as jest.Mock).mockReset().mockReturnValue(jest.fn());
  });

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

  it('should create writing tasks according to descriptors provided', () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<ResumeContext, any>> = {
      newListr: lister,
    };

    const foo = jest.fn();
    const bar = jest.fn();
    const baz = jest.fn();

    const descriptors: FileDescriptor[] = [
      {
        path: 'qwe/foo',
        fn: foo,
      },
      {
        path: 'asd/zxc/bar',
        fn: bar,
      },
      {
        path: 'iopbaz',
        fn: baz,
      },
    ];

    const expectedTitles = ['Save qwe/foo', 'Save asd/zxc/bar', 'Save iopbaz'];

    getExportTasksFromDescriptors(descriptors)(
      { ...initialContext },
      providedTask as ListrTaskWrapper<ResumeContext, any>
    );

    const taskDescriptions = lister.mock.calls[0][0] as ListrTask<
      ResumeContext,
      any
    >[];

    const titles = taskDescriptions.map(({ title }) => title || '');
    expect(titles).toEqual(expectedTitles);

    const expectedCalls = [
      ['qwe/foo', foo],
      ['asd/zxc/bar', bar],
      ['iopbaz', baz],
    ];

    expect((writeToFile as jest.Mock).mock.calls).toEqual(expectedCalls);
  });
});
