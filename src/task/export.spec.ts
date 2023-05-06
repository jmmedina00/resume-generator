import { ListrTask, ListrTaskWrapper } from 'listr2';
import { ResumeContext, initialContext } from './context';
import {
  PRIVATE_DIST,
  PUBLIC_DIST,
  exportPrivateVersions,
  exportPublicVersions,
} from './export';
import { writeToFile } from './io/write';
import { format } from 'path';

jest.mock('./io/write');

describe('Exporting tasks', () => {
  beforeEach(() => {
    (writeToFile as jest.Mock).mockReset().mockReturnValue(jest.fn());
  });

  it('should create tasks for writing all public versions to public distribution', () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<ResumeContext, any>> = {
      newListr: lister,
    };

    const context: ResumeContext = {
      ...initialContext,
      publicVersions: {
        en: { foo: 'bar' },
        es: { bar: 'baz' },
      },
    };

    exportPublicVersions(
      context,
      providedTask as ListrTaskWrapper<ResumeContext, any>
    );

    const taskDescriptions = lister.mock.calls[0][0] as ListrTask<
      ResumeContext,
      any
    >[];

    const expectedTitles = ['Save en.json', 'Save es.json'];

    const titles = taskDescriptions.map(({ title }) => title || '');
    expect(titles).toEqual(expectedTitles);

    const expectedCalls = [
      {
        path: format({ base: 'en.json', dir: PUBLIC_DIST }),
        resultFromFn: JSON.stringify({ foo: 'bar' }),
      },
      {
        path: format({ base: 'es.json', dir: PUBLIC_DIST }),
        resultFromFn: JSON.stringify({ bar: 'baz' }),
      },
    ];

    const writeCalls = (writeToFile as jest.Mock).mock.calls.map(
      ([path, fn]) => ({ path, resultFromFn: fn(context) })
    );
    expect(writeCalls).toEqual(expectedCalls);
  });

  it('should create tasks for writing all private versions to private distribution', () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<ResumeContext, any>> = {
      newListr: lister,
    };

    const context: ResumeContext = {
      ...initialContext,
      privateVersions: {
        en: [{ foo: 'bar' }, { x: 'y' }],
        es: [{ bar: 'baz' }, { y: 'z' }],
      },
    };

    exportPrivateVersions(
      context,
      providedTask as ListrTaskWrapper<ResumeContext, any>
    );

    const taskDescriptions = lister.mock.calls[0][0] as ListrTask<
      ResumeContext,
      any
    >[];

    const expectedTitles = [
      'Save en-0.json',
      'Save en-1.json',
      'Save es-0.json',
      'Save es-1.json',
    ];
    const titles = taskDescriptions.map(({ title }) => title || '');
    expect(titles).toEqual(expectedTitles);

    const expectedCalls = [
      {
        path: format({ base: 'en-0.json', dir: PRIVATE_DIST }),
        resultFromFn: JSON.stringify({ foo: 'bar' }),
      },
      {
        path: format({ base: 'en-1.json', dir: PRIVATE_DIST }),
        resultFromFn: JSON.stringify({ x: 'y' }),
      },
      {
        path: format({ base: 'es-0.json', dir: PRIVATE_DIST }),
        resultFromFn: JSON.stringify({ bar: 'baz' }),
      },
      {
        path: format({ base: 'es-1.json', dir: PRIVATE_DIST }),
        resultFromFn: JSON.stringify({ y: 'z' }),
      },
    ];

    const writeCalls = (writeToFile as jest.Mock).mock.calls.map(
      ([path, fn]) => ({ path, resultFromFn: fn(context) })
    );
    expect(writeCalls).toEqual(expectedCalls);
  });
});
