import { getPagesLinkFromRepo } from '../../../../../service/github/util';
import type { RenderContext } from '../../../../context';
import { setIntoContext } from '../../../../render/util';
import { getRepoLink } from './transform';

jest.mock('../../../../../service/github/util');
jest.mock('../../../../render/util');

describe('Footer applying', () => {
  it('should add repo link to context resources inside a JSON', async () => {
    process.env['GITHUB_REPOSITORY'] = 'myrepo';
    (getPagesLinkFromRepo as jest.Mock).mockReturnValue('foo');

    const runner = jest.fn();
    (setIntoContext as jest.Mock).mockReturnValue(runner);

    const context: RenderContext = {
      path: '',
      resources: {},
      contents: Buffer.of(),
      prettierOptions: {},
      preprocessFn: jest.fn(),
    };

    const task = getRepoLink('repohere');
    await task(context);

    expect(getPagesLinkFromRepo).toHaveBeenCalledWith('myrepo');
    expect(setIntoContext).toHaveBeenCalledWith('repohere');
    expect(runner).toHaveBeenCalledWith(
      JSON.stringify({ resumeLink: 'foo' }),
      context
    );
  });
});
