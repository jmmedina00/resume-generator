import type { ListrTaskWrapper } from 'listr2';
import { ResumeContext, initialContext } from '../../context';
import { checkVersionAgainstSchema } from './schema';
import { validateAllResumesInContext } from '.';

jest.mock('./schema');
jest.mock('../../io/task');

describe('Resume validation', () => {
  it('should be generated for every single resume existing in the context', () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    (checkVersionAgainstSchema as jest.Mock).mockImplementation((contents) => ({
      contents,
    }));

    const context: ResumeContext = {
      ...initialContext,
      publicVersions: { en: { foo: 'bar' }, es: { bar: 'baz' } },
      focusedVersions: { en: { bar: 'baz' }, es: { foo: 'bar' } },
      privateVersions: {
        en: [{ re: 'la' }, { la: 'shi' }],
        es: [{ test: 'Testing' }],
      },
    };

    const expectedTasks = [
      {
        title: 'PUBLIC: en',
        task: { contents: { foo: 'bar' } },
      },
      {
        title: 'PUBLIC: es',
        task: { contents: { bar: 'baz' } },
      },
      {
        title: 'FOCUSED: en',
        task: { contents: { bar: 'baz' } },
      },
      {
        title: 'FOCUSED: es',
        task: { contents: { foo: 'bar' } },
      },
      {
        title: 'PRIVATE: en, 0',
        task: { contents: { re: 'la' } },
      },
      {
        title: 'PRIVATE: en, 1',
        task: { contents: { la: 'shi' } },
      },
      {
        title: 'PRIVATE: es, 0',
        task: { contents: { test: 'Testing' } },
      },
    ];

    validateAllResumesInContext(
      context,
      providedTask as ListrTaskWrapper<any, any>
    );
    expect(lister).toHaveBeenCalledWith(expectedTasks, { concurrent: true });
  });
});
