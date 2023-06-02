import { ListrTaskWrapper } from 'listr2';
import { getFullTaskName } from './task';

type TaskHolder = ListrTaskWrapper<any, any>;
type TaskCarrier = Partial<TaskHolder>;
type Task = TaskHolder['task'];

describe('Task ad-hoc renaming', () => {
  it('should do nothing when environment is not set correctly', () => {
    process.env['VERBOSE_TASKS'] = '';
    process.env['CI'] = '';

    const task: Partial<Task> = {
      title: 'Test',
    };

    const tasker: TaskCarrier = {
      task: task as Task,
    };

    const name = getFullTaskName('This is my task', tasker as TaskHolder);
    expect(name).toEqual('This is my task');
  });

  it('should do nothing when parent task has no name', () => {
    process.env['VERBOSE_TASKS'] = 'true';
    process.env['CI'] = '';

    const task: Partial<Task> = {
      title: '',
      initialTitle: '',
    };

    const tasker: TaskCarrier = {
      task: task as Task,
    };

    const name = getFullTaskName('This is my task', tasker as TaskHolder);
    expect(name).toEqual('This is my task');
  });

  it('should provide parent task name + task name joined by a >', () => {
    process.env['VERBOSE_TASKS'] = 'foo';
    process.env['CI'] = '';

    const task: Partial<Task> = {
      title: 'Testing',
      initialTitle: 'This is second priority',
    };

    const tasker: TaskCarrier = {
      task: task as Task,
    };

    const name = getFullTaskName('This is my task', tasker as TaskHolder);
    expect(name).toEqual('Testing > This is my task');
  });

  it('should also be able to find title in initialTitle', () => {
    process.env['VERBOSE_TASKS'] = 'bar';
    process.env['CI'] = '';

    const task: Partial<Task> = {
      title: '',
      initialTitle: 'This is second priority',
    };

    const tasker: TaskCarrier = {
      task: task as Task,
    };

    const name = getFullTaskName('This is my task', tasker as TaskHolder);
    expect(name).toEqual('This is second priority > This is my task');
  });

  it('should also trigger when CI is set', () => {
    process.env['VERBOSE_TASKS'] = '';
    process.env['CI'] = 'true';

    const task: Partial<Task> = {
      title: 'Testing',
      initialTitle: 'This is second priority',
    };

    const tasker: TaskCarrier = {
      task: task as Task,
    };

    const name = getFullTaskName('This is my task', tasker as TaskHolder);
    expect(name).toEqual('Testing > This is my task');
  });
});
