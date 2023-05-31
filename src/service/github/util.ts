const VALID_GITHUB_REGEX = '[a-zA-Z0-9][a-zA-Z0-9-_]{0,38}';
const VALID_GITHUB_REPO_REGEX = new RegExp(
  '^' + VALID_GITHUB_REGEX + '/' + VALID_GITHUB_REGEX + '$'
);

export const getPagesLinkFromRepo = (repo: string): string => {
  if (!VALID_GITHUB_REPO_REGEX.test(repo)) return '';

  const [user, repoName] = repo
    .split('/')
    .map((value) => value.toLocaleLowerCase());
  return `https://${user}.github.io/${repoName}`;
};
