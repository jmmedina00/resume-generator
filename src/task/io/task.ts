import { ListrTaskWrapper } from 'listr2';

type Parent = ListrTaskWrapper<any, any>;

export const getFullTaskName = (name: string, { task }: Parent): string => {
  if (!process.env['VERBOSE_TASKS'] && !process.env['CI']) return name;

  const parentTaskName = task.title || task.initialTitle;
  return [parentTaskName, name].filter((a) => !!a).join(' > ');
};
