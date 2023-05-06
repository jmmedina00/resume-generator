import { Listr } from 'listr2';
import { ResumeContext } from './context';
import { readGitHub, readPrivateIterations, readSourceResume } from './io/read';
import {
  transformAndReplaceLocalisedField,
  transformCompleteToLocalised,
  transformIncompleteField,
  transformLocalisedToTranslated,
} from './resume/public';
import { addGitHubInfoToBasics, getProperProjects } from '../resume/gen-public';
import { generatePrivateVersions } from './resume/private';
import { exportPrivateVersions, exportPublicVersions } from './export';

export const tasks = new Listr<ResumeContext>(
  [
    {
      title: 'Read required data',
      task: (_, task) =>
        task.newListr(
          [
            { title: 'Read GitHub', task: readGitHub },
            { title: 'Read source resume', task: readSourceResume },
            { title: 'Read private', task: readPrivateIterations },
          ],
          {
            concurrent: true,
          }
        ),
    },
    {
      title: 'Produce public resume versions',
      task: (_, task) =>
        task.newListr([
          {
            title: 'Complete basics',
            task: transformIncompleteField('basics', addGitHubInfoToBasics),
          },
          {
            title: 'Complete projects',
            task: transformIncompleteField('projects', getProperProjects),
          },
          {
            title: 'Generate locales',
            task: transformCompleteToLocalised,
          },
          {
            title: 'Generate translations',
            task: transformLocalisedToTranslated,
          },
          {
            title: 'Dekey work after the fact',
            task: transformAndReplaceLocalisedField('work', [
              'position',
              'summary',
            ]),
          },
          {
            title: 'Dekey education after the fact',
            task: transformAndReplaceLocalisedField('education', [
              'area',
              'studyType',
            ]),
          },
        ]),
    },
    {
      title: 'Produce private versions',
      task: generatePrivateVersions,
    },
    {
      title: 'Export resume versions',
      task: (_, exportTask) =>
        exportTask.newListr(
          [
            { title: 'Public versions', task: exportPublicVersions },
            { title: 'Private versions', task: exportPrivateVersions },
          ],
          { concurrent: true }
        ),
    },
  ],
  { collectErrors: 'minimal', rendererOptions: { collapseSubtasks: false } }
);
