import { getPagesLinkFromRepo } from './util';

describe('GitHub utilities', () => {
  describe('Repo name to GitHub Pages', () => {
    it.each([
      ['juanmi/repo', 'https://juanmi.github.io/repo'],
      ['bo-78b/johnson', 'https://bo-78b.github.io/johnson'],
      ['Alici_a/pRogram', 'https://alici_a.github.io/program'],
    ])(
      'should convert repo name %s to GitHub Pages link %s',
      (repo, expected) => {
        const actual = getPagesLinkFromRepo(repo);
        expect(actual).toEqual(expected);
      }
    );
  });

  describe('Bad repo name to GitHub Pages', () => {
    it('should provide no GitHub Pages link when repo name is empty', () => {
      const actual = getPagesLinkFromRepo('');
      expect(actual).toEqual('');
    });

    it.each([
      'whatisthis',
      'çñç&/&%$%$((',
      '-what/dis',
      'what/-dis',
      'Учиться/Семья',
      "'donotquote'",
    ])(
      'should provide no GitHub Pages link when repo name is not valid such as %s',
      (bogus) => {
        const actual = getPagesLinkFromRepo(bogus);
        expect(actual).toEqual('');
      }
    );
  });
});
