import { readFile } from 'fs/promises';
import {
  getCoreUserInfo,
  getFileFromRepo,
  getRepoDescription,
} from '../service/github';
import { RepoProject, getResumeProject } from './project';

jest.mock('../service/github');

const basePath = './test/readme/';

describe('Project conversion', () => {
  describe('description', () => {
    (getCoreUserInfo as jest.Mock).mockResolvedValue({ user: 'username' });
    (getFileFromRepo as jest.Mock).mockResolvedValue('');

    it('should leave description map as-is when no repo-description is present', async () => {
      const project: RepoProject = {
        name: 'test',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Project',
          es: 'Proyecto',
        },
        'page-active': false,
      };

      const { description } = await getResumeProject(project);
      expect(description).toEqual({ en: 'Project', es: 'Proyecto' });
      expect(getRepoDescription).not.toHaveBeenCalled();
    });

    it('should add description from GitHub into description map when repo-description has a code', async () => {
      (getRepoDescription as jest.Mock).mockResolvedValue('Chat');

      const project: RepoProject = {
        name: 'cat',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': false,
        'repo-description': 'fr',
      };

      const { description } = await getResumeProject(project);
      expect(description).toEqual({
        en: 'Kitty',
        es: 'Gato',
        fr: 'Chat',
      });
      expect(getRepoDescription).toHaveBeenCalledWith('cat');
    });
  });

  describe('name', () => {
    (getCoreUserInfo as jest.Mock).mockResolvedValue({ user: 'username' });

    it('should get replace repo name with repo README first title', async () => {
      const file = 'with-title.md';

      (getFileFromRepo as jest.Mock).mockResolvedValue(
        await readFile(basePath + file, 'utf-8')
      );

      const project: RepoProject = {
        name: 'cat',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': false,
      };

      const { name } = await getResumeProject(project);
      expect(name).toEqual('This is the title');
      expect(getFileFromRepo).toHaveBeenCalledWith('cat', 'README.md');
    });

    it('should leave name as-is if repo README features no proper header', async () => {
      const file = 'without-title.md';

      (getFileFromRepo as jest.Mock).mockResolvedValue(
        await readFile(basePath + file, 'utf-8')
      );

      const project: RepoProject = {
        name: 'cat',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': false,
      };

      const { name } = await getResumeProject(project);
      expect(name).toEqual('cat');
      expect(getFileFromRepo).toHaveBeenCalledWith('cat', 'README.md');
    });
  });

  describe('keywords', () => {
    (getCoreUserInfo as jest.Mock).mockResolvedValue({ user: 'username' });

    it('should get keywords from README icon block', async () => {
      const file = 'icons.md';

      (getFileFromRepo as jest.Mock).mockResolvedValue(
        await readFile(basePath + file, 'utf-8')
      );

      const project: RepoProject = {
        name: 'cat',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': false,
      };

      const { keywords } = await getResumeProject(project);
      expect(keywords).toEqual(['foo', 'bar', 'baz', 'test']);
      expect(getFileFromRepo).toHaveBeenCalledWith('cat', 'README.md');
    });

    it('should strip the word "icon" out of the keywords', async () => {
      const file = 'icons-verbosey.md';

      (getFileFromRepo as jest.Mock).mockResolvedValue(
        await readFile(basePath + file, 'utf-8')
      );

      const project: RepoProject = {
        name: 'cat',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': false,
      };

      const { keywords } = await getResumeProject(project);
      expect(keywords).toEqual(['le-test', 'whatever', 'baz']);
      expect(getFileFromRepo).toHaveBeenCalledWith('cat', 'README.md');
    });

    it('should be empty when there no image collection in the README', async () => {
      const file = 'without-title.md';

      (getFileFromRepo as jest.Mock).mockResolvedValue(
        await readFile(basePath + file, 'utf-8')
      );

      const project: RepoProject = {
        name: 'cat',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': false,
      };

      const { keywords } = await getResumeProject(project);
      expect(keywords).toEqual([]);
      expect(getFileFromRepo).toHaveBeenCalledWith('cat', 'README.md');
    });

    it('should not pick single image paragraphs as significant', async () => {
      const file = 'with-title.md';

      (getFileFromRepo as jest.Mock).mockResolvedValue(
        await readFile(basePath + file, 'utf-8')
      );

      const project: RepoProject = {
        name: 'cat',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': false,
      };

      const { keywords } = await getResumeProject(project);
      expect(keywords).toEqual([]);
      expect(getFileFromRepo).toHaveBeenCalledWith('cat', 'README.md');
    });
  });

  describe('url', () => {
    it('should output URL as repo URL if page is not active', async () => {
      (getCoreUserInfo as jest.Mock).mockResolvedValue({ user: 'username' });

      const project: RepoProject = {
        name: 'dog',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': false,
      };

      const { url } = await getResumeProject(project);
      expect(url).toEqual('https://github.com/username/dog');
    });

    it('should be GitHub Pages URL if page is active', async () => {
      (getCoreUserInfo as jest.Mock).mockResolvedValue({ user: 'coder' });

      const project: RepoProject = {
        name: 'dog',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': true,
      };

      const { url } = await getResumeProject(project);
      expect(url).toEqual('https://coder.github.io/dog');
    });
  });

  describe('other parameters', () => {
    it('should be left as is in any case', async () => {
      const expected = {
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
      };

      const project: RepoProject = {
        name: 'dog',
        type: 'application',
        startDate: 'foo',
        endDate: 'bar',
        description: {
          en: 'Kitty',
          es: 'Gato',
        },
        'page-active': true,
      };

      const { type, startDate, endDate } = await getResumeProject(project);
      const actual = { type, startDate, endDate };

      expect(actual).toEqual(expected);
    });
  });
});
