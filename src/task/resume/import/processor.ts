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
  string
> = (resume, context) => {
  const { basics, languages, certificates, projects, skills, work, education } =
    parse(resume);

  context.incomplete = { basics, projects };
  context.complete = { languages, certificates, skills, work, education };
};

export const parsePrivateIterations: Processor<ResumeContext, string> = (
  contents,
  context
) => {
  const iterations = parse(contents);
  context.privateIterations = iterations;
};
