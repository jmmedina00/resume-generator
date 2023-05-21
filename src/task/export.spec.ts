import { ListrTask, ListrTaskWrapper } from 'listr2';
import {
  RenderContext,
  RenderWithTemplateContext,
  ResumeContext,
  initialContext,
} from './context';
import {
  RenderContextTemplates,
  TASK_EXPORT,
  TASK_VALIDATE,
  getExportTasksFromDescriptor,
} from './export';
import { getRenderingTasks } from './render';
import { FileDescriptor, getDescribedPath } from './describe';
import { ListrTaskFn } from 'listr2';

jest.mock('./render');
jest.mock('./describe');

describe('Exporting tasks', () => {
  it('should create writing tasks from file descriptor, context templates and validation task', async () => {
    // Prepare mocks and data
    const path = 'foobarbaz';
    const contents = 'baz';

    const lister = jest.fn().mockReturnValue({ listed: true });
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    (getDescribedPath as jest.Mock).mockReturnValue('foobarbaz');
    (getRenderingTasks as jest.Mock).mockImplementation((ctx) => ctx);

    const preprocessFoo = jest.fn().mockResolvedValue('barbaz');
    const preprocessBar = jest.fn().mockResolvedValue('barbaz');
    const validateFn = jest.fn();

    const descriptor: FileDescriptor = {
      dir: 'foo',
      name: 'bar',
      contents,
    };

    const templates: RenderContextTemplates = {
      foo: {
        prettierOptions: { tabWidth: 4 },
        preprocessFn: preprocessFoo,
        templateContents: 'lalala',
      },
      bar: {
        prettierOptions: { trailingComma: 'none' },
        preprocessFn: preprocessBar,
      },
    };

    // Assert validation is there before any export

    (await getExportTasksFromDescriptor(descriptor, templates, validateFn))(
      { ...initialContext },
      providedTask as ListrTaskWrapper<ResumeContext, any>
    );

    const expectedInitialListr = [
      {
        title: TASK_VALIDATE,
        task: validateFn,
      },
      {
        title: TASK_EXPORT,
        task: expect.anything(),
      },
    ];

    expect(lister).toHaveBeenCalledWith(expectedInitialListr, {
      ctx: { contents: Buffer.from('baz') },
    });

    const actualInitialTasks = lister.mock.calls[0][0] as ListrTask<
      RenderContext,
      any
    >[];

    // Get export task and assert render generator gets called with proper generated contexts

    const exportTask = actualInitialTasks.find(
      ({ title }) => title === TASK_EXPORT
    )?.task as ListrTaskFn<RenderContext, any>;

    exportTask(
      {
        path: '',
        contents: Buffer.from(''),
        prettierOptions: {},
        preprocessFn: jest.fn(),
      },
      providedTask as ListrTaskWrapper<RenderContext, any>
    );

    const expectedExportTasks = [
      {
        title: 'foo',
        task: {
          prettierOptions: { tabWidth: 4 },
          preprocessFn: preprocessFoo,
          contents: Buffer.from('baz'),
          path,
          activePage: 'bar',
          templateContents: 'lalala',
        },
      },
      {
        title: 'bar',
        task: {
          prettierOptions: { trailingComma: 'none' },
          preprocessFn: preprocessBar,
          contents: Buffer.from('baz'),
          path,
          activePage: 'bar',
        },
      },
    ];

    expect(lister).toHaveBeenCalledWith(expectedExportTasks);
  });
});
