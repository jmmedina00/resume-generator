import { LanguageCode } from 'iso-639-1';
import {
  GithubUserInfo,
  getFileFromRepo,
  getRepoDescription,
} from '../service/github';
import { marked } from 'marked';

interface Project {
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  description: { [code in LanguageCode]?: string };
  highlights?: ({ [code in LanguageCode]?: string } | string)[];
}

export interface RepoProject extends Project {
  'repo-description'?: LanguageCode;
  'page-active': boolean;
}

export interface ResumeProject extends Project {
  keywords: string[];
  url: string;
}

const getFromTokens = <F, R>(
  tokens: marked.Token[],
  wantedType: string,
  func: (f: F) => R
): R[] => (tokens.filter(({ type }) => type === wantedType) as F[]).map(func);

const getIcons = (tokens: marked.TokensList) =>
  getFromTokens<marked.Tokens.Paragraph, marked.Tokens.Image[]>(
    tokens,
    'paragraph',
    ({ tokens: parTokens }) =>
      getFromTokens<marked.Tokens.Link, marked.Tokens.Image>(
        parTokens,
        'link',
        ({ tokens }) =>
          tokens.find(({ type }) => type === 'image') as marked.Tokens.Image
      )
  )
    .filter((list) => list.length > 1)
    .sort((a, b) => -(a.length - b.length))
    .find(() => true)
    ?.map(({ href }) => (/(.+(\/))?(.+)(\..+$)/.exec(href) as any[])[3])
    .map((keyword: string) =>
      keyword
        .split('-')
        .filter((term) => term !== 'icon')
        .join('-')
    );

const getFirstTitle = (tokens: marked.TokensList) => {
  const heading = (tokens as marked.Tokens.Heading[]).find(
    ({ type, depth }) => type === 'heading' && depth === 1
  );

  return heading?.text;
};

export const getResumeProject = async (
  {
    name: repoName,
    'repo-description': languageFromRepo,
    'page-active': isGitHubPage,
    description: baseDescription,
    ...project
  }: RepoProject,
  { user }: GithubUserInfo
): Promise<ResumeProject> => {
  const description = languageFromRepo
    ? {
        ...baseDescription,
        [languageFromRepo]: await getRepoDescription(repoName),
      }
    : baseDescription;

  const readmeTokens = marked.lexer(
    await getFileFromRepo(repoName, 'README.md')
  );

  const title = getFirstTitle(readmeTokens);

  //const { user } = await getCoreUserInfo();

  return {
    ...project,
    description,
    name: title ?? repoName,
    keywords: getIcons(readmeTokens) ?? [],
    url: isGitHubPage
      ? `https://${user}.github.io/${repoName}`
      : `https://github.com/${user}/${repoName}`,
  };
};
