import { ListrTask, ListrTaskWrapper } from 'listr2';
import {
  TASK_COMPLETE_BASICS,
  TASK_COMPLETE_PROJECTS,
  TASK_DEKEY_EDUCATION,
  TASK_DEKEY_WORK,
  TASK_LOCALES,
  TASK_TRANSLATE,
  getExportTasksForAllResumeVersions,
  getPublicResumeCreationTasks,
} from '.';
import {
  transformAndReplaceLocalisedField,
  transformIncompleteField,
} from './public';
import { ResumeContext, initialContext } from '../context';
import {
  addGitHubInfoToBasics,
  getProperProjects,
} from '../../resume/gen-public';
import {
  FileDescriptor,
  getExportTasksFromDescriptor,
  getPrivateVersionDescriptors,
  getPublicVersionDescriptors,
} from '../export';
import { getPrettierOptions, validateResumeWithSchema } from './config';
import { Options } from 'prettier';

jest.mock('./public');
jest.mock('./config');
jest.mock('../export');

describe('Resume index', () => {
  it('should produce public resume creation tasks', () => {
    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    (transformIncompleteField as jest.Mock).mockImplementation((field, fn) => ({
      one: field,
      two: fn,
    }));

    (transformAndReplaceLocalisedField as jest.Mock).mockImplementation(
      (field, list) => ({
        foo: field,
        bar: list,
      })
    );

    const expectedTitles = [
      TASK_COMPLETE_BASICS,
      TASK_COMPLETE_PROJECTS,
      TASK_LOCALES,
      TASK_TRANSLATE,
      TASK_DEKEY_WORK,
      TASK_DEKEY_EDUCATION,
    ];

    getPublicResumeCreationTasks(
      { ...initialContext },
      providedTask as ListrTaskWrapper<any, any>
    );

    const tasks = lister.mock.calls[0][0] as ListrTask<ResumeContext, any>[];
    const actualTitles = tasks.map<string>(({ title }) => title || '');

    expect(actualTitles).toEqual(expectedTitles);

    const basicsTask = tasks.find(
      ({ title }) => title === TASK_COMPLETE_BASICS
    )?.task;
    expect(basicsTask).toEqual({ one: 'basics', two: addGitHubInfoToBasics });

    const projectsTask = tasks.find(
      ({ title }) => title === TASK_COMPLETE_PROJECTS
    )?.task;
    expect(projectsTask).toEqual({ one: 'projects', two: getProperProjects });

    const workTask = tasks.find(({ title }) => title === TASK_DEKEY_WORK)?.task;
    expect(workTask).toEqual({ foo: 'work', bar: ['position', 'summary'] });

    const educationTask = tasks.find(
      ({ title }) => title === TASK_DEKEY_EDUCATION
    )?.task;
    expect(educationTask).toEqual({
      foo: 'education',
      bar: ['area', 'studyType'],
    });
  });

  it('should consolidate descriptors and config into list of export tasks', async () => {
    const prettierOptions: Options = { singleQuote: false, printWidth: 7 };

    const lister = jest.fn();
    const providedTask: Partial<ListrTaskWrapper<any, any>> = {
      newListr: lister,
    };

    (getPublicVersionDescriptors as jest.Mock).mockReturnValue([
      { path: 'test/public', fn: jest.fn().mockReturnValue('public') },
      { path: 'public/foo', fn: jest.fn().mockReturnValue('foo') },
    ]);
    (getPrivateVersionDescriptors as jest.Mock).mockReturnValue([
      { path: 'private/bar', fn: jest.fn().mockReturnValue('bar') },
    ]);
    (getPrettierOptions as jest.Mock).mockResolvedValue(prettierOptions);
    (getExportTasksFromDescriptor as jest.Mock).mockImplementation(
      ({ path, fn }: FileDescriptor, context: object) => ({
        path,
        content: fn({} as ResumeContext),
        ...context,
      })
    );

    const expectedTasks = [
      {
        title: 'test/public',
        task: {
          path: 'test/public',
          content: 'public',
          preprocessFn: validateResumeWithSchema,
          prettierOptions,
        },
      },
      {
        title: 'public/foo',
        task: {
          path: 'public/foo',
          content: 'foo',
          preprocessFn: validateResumeWithSchema,
          prettierOptions,
        },
      },
      {
        title: 'private/bar',
        task: {
          path: 'private/bar',
          content: 'bar',
          preprocessFn: validateResumeWithSchema,
          prettierOptions,
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
