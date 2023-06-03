import { ListrTask, ListrTaskWrapper } from 'listr2';
import { Options } from 'prettier';
import {
  getFocusedVersionDescriptors,
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from './descriptor';
import {
  getHtmlRender,
  getJsonRender,
  getMarkdownRender,
  getPdfRender,
  getPrettierOptions,
  validateResumeWithSchema,
} from './config';
import {
  RenderContextTemplates,
  getExportTasksFromDescriptor,
} from '../../export';
import { FileDescriptor } from '../../describe';
import { getExportTasksForAllResumeVersions } from '.';
import { ResumeContext, initialContext } from '../../context';

jest.mock('./descriptor');
jest.mock('./config');
jest.mock('../../export');
jest.mock('../../io/task');

describe('Resume export index', () => {
  it('should consolidate descriptors and config into list of export tasks', async () => {
    const prettierOptions: Options = { singleQuote: false, printWidth: 7 };

    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    (getJsonRender as jest.Mock).mockImplementation(async (options) => ({
      options,
      render: 'json',
    }));
    (getHtmlRender as jest.Mock).mockImplementation(async (options, ctx) => ({
      options,
      ctx,
      render: 'html',
    }));
    (getMarkdownRender as jest.Mock).mockImplementation(async (options) => ({
      options,
      render: 'markdown',
    }));
    (getPdfRender as jest.Mock).mockResolvedValue({ render: 'pdf' });
    (getPrettierOptions as jest.Mock).mockResolvedValue(prettierOptions);

    (getPublicVersionDescriptors as jest.Mock).mockReturnValue([
      {
        dir: 'public',
        name: 'foo',
        subversion: 'le',
        contents: 'bar',
      },
      {
        dir: 'publica',
        name: 'bar',
        contents: 'baz',
      },
    ]);
    (getFocusedVersionDescriptors as jest.Mock).mockReturnValue([
      {
        dir: 'public/foo',
        name: 'focus',
        contents: 'bar',
      },
      {
        dir: 'publica/bar',
        name: 'focused',
        contents: 'baz',
      },
    ]);
    (getPrivateVersionDescriptors as jest.Mock).mockReturnValue([
      {
        dir: 'private',
        name: 'foo',
        contents: 'bar',
      },
    ]);

    (getExportTasksFromDescriptor as jest.Mock).mockImplementation(
      (
        descriptor: FileDescriptor,
        templates: RenderContextTemplates,
        validateFn: Function
      ) => ({
        templates,
        validateFn,
        ...descriptor,
      })
    );

    const expectedPublicTemplates = {
      json: {
        options: prettierOptions,
        render: 'json',
      },
      html: {
        options: prettierOptions,
        ctx: { ...initialContext },
        render: 'html',
      },
      md: {
        options: prettierOptions,
        render: 'markdown',
      },
      pdf: {
        render: 'pdf',
      },
    };

    const expectedFocusedTemplates = {
      json: {
        options: prettierOptions,
        render: 'json',
      },
      md: {
        options: prettierOptions,
        render: 'markdown',
      },
    };

    const expectedTasks = [
      {
        title: 'PUBLIC - version: foo, sub: le',
        task: {
          validateFn: validateResumeWithSchema,
          templates: {
            ...expectedPublicTemplates,
          },
          dir: 'public',
          name: 'foo',
          subversion: 'le',
          contents: 'bar',
        },
      },
      {
        title: 'PUBLIC - version: bar',
        task: {
          validateFn: validateResumeWithSchema,
          templates: {
            ...expectedPublicTemplates,
          },
          dir: 'publica',
          name: 'bar',
          contents: 'baz',
        },
      },
      {
        title: 'FOCUSED - version: foo',
        task: {
          validateFn: validateResumeWithSchema,
          templates: {
            ...expectedFocusedTemplates,
          },
          dir: 'public/foo',
          name: 'focus',
          contents: 'bar',
        },
      },
      {
        title: 'FOCUSED - version: bar',
        task: {
          validateFn: validateResumeWithSchema,
          templates: {
            ...expectedFocusedTemplates,
          },
          dir: 'publica/bar',
          name: 'focused',
          contents: 'baz',
        },
      },
      {
        title: 'PRIVATE - version: foo',
        task: {
          validateFn: validateResumeWithSchema,
          templates: {
            json: {
              options: prettierOptions,
              render: 'json',
            },
            pdf: {
              render: 'pdf',
            },
          },
          dir: 'private',
          name: 'foo',
          contents: 'bar',
        },
      },
    ];

    await getExportTasksForAllResumeVersions(
      { ...initialContext },
      providedTask as ListrTaskWrapper<any, any>
    );

    const actualTasks = lister.mock.calls[0][0] as ListrTask<
      ResumeContext,
      any
    >[];
    expect(actualTasks).toEqual(expectedTasks);
  });
});
