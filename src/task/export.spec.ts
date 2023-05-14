import { ListrTaskWrapper } from 'listr2';
import { RenderContext, ResumeContext, initialContext } from './context';
import { getExportTasksFromDescriptor } from './export';
import { getRenderingTasks } from './render';
import { FileDescriptor, getDescribedPath } from './describe';

jest.mock('./render');
jest.mock('./describe');

describe('Exporting tasks', () => {
  it('should create writing tasks from rendering, file descriptor and provided precontext options', async () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<ResumeContext, any>> = {
      newListr: lister,
    };

    (getDescribedPath as jest.Mock).mockReturnValue('foobarbaz');
    const bar = jest.fn().mockResolvedValue('barbaz');

    const taskGenerator = jest.fn();
    (getRenderingTasks as jest.Mock).mockReturnValue(taskGenerator);

    const descriptor: FileDescriptor = {
      dir: 'foo',
      name: 'bar',
      contents: 'baz',
      wantedFormats: [],
    };

    const expectedRenderContext: RenderContext = {
      path: 'foobarbaz',
      contents: 'baz',
      prettierOptions: { tabWidth: 4 },
      preprocessFn: bar,
    };

    const partialRenderContext: Partial<RenderContext> = {
      prettierOptions: { tabWidth: 4 },
      preprocessFn: bar,
    };

    const context: ResumeContext = { ...initialContext };

    (await getExportTasksFromDescriptor(descriptor, partialRenderContext))(
      { ...initialContext },
      providedTask as ListrTaskWrapper<ResumeContext, any>
    );

    expect(getDescribedPath).toHaveBeenCalledWith(descriptor, 'json');
    expect(getRenderingTasks).toHaveBeenCalledWith(expectedRenderContext);
    expect(taskGenerator).toHaveBeenCalledWith(context, providedTask);
  });
});
