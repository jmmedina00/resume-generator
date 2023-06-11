import { getPagesLinkFromRepo } from '../../../../../service/github/util';
import type { RenderContext } from '../../../../context';
import { setIntoContext } from '../../../../render/util';

export const getRepoLink = (target: string) => async (ctx: RenderContext) => {
  const repoName = process.env['GITHUB_REPOSITORY'] || '';
  const resumeLink = getPagesLinkFromRepo(repoName);

  setIntoContext(target)(JSON.stringify({ resumeLink }), ctx);
};
