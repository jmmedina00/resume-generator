import { ListrTask, ListrTaskWrapper } from 'listr2';
import {
  TASK_COMPLETE_BASICS,
  TASK_COMPLETE_PROJECTS,
  TASK_DEKEY_EDUCATION,
  TASK_DEKEY_WORK,
  TASK_LOCALES,
  TASK_TRANSLATE,
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

jest.mock('./public');
jest.mock('../io/task');

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
});
