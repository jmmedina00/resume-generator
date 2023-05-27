import { parse } from 'yaml';
import { GithubUserInfo } from '../../../service/github';
import { ResumeContext } from '../../context';
import { Processor } from '../../io/read';

export const setGitHubUserInfo: Processor<ResumeContext, GithubUserInfo> = (
  info,
  context
) => {
  context.githubUser = info;
};

export const addResumePartsToTheirCorrectPlaces: Processor<
  ResumeContext,
  any
> = (resume, context) => {
  const { basics, languages, projects, skills, work, education } = resume;

  context.incomplete = { basics, projects };
  context.complete = { languages, skills, work, education };
};

export const parsePrivateIterations: Processor<ResumeContext, string> = (
  contents,
  context
) => {
  const iterations = parse(contents);
  context.privateIterations = iterations;
};
