import { parse } from 'yaml';
import { GithubUserInfo } from '../../../service/github';
import { ResumeContext, initialContext } from '../../context';
import {
  addResumePartsToTheirCorrectPlaces,
  parsePrivateIterations,
  setGitHubUserInfo,
} from './processor';

jest.mock('yaml');

describe('Data to resume context processors', () => {
  it('should assign GitHub user info to githubUser', () => {
    const githubUser: GithubUserInfo = {
      user: 'juanmim',
      fullName: 'Juanmi Medina',
      profileUrl: 'that',
      avatarUrl: 'thos',
    };

    const context = { ...initialContext };
    const expectedFinalContext = { ...initialContext, githubUser };

    setGitHubUserInfo(githubUser, context);
    expect(context).toEqual(expectedFinalContext);
  });

  it('should add all resume parts to their corresponding sections', () => {
    const context: ResumeContext = { ...initialContext };

    const basics = {
      foo: '123',
      bar: '456',
    };

    const languages = ['es', 'en'];

    const projects = {
      todo: {
        description: 'Test',
      },
      calculator: {
        description: 'Project',
      },
    };

    const skills = ['Programming', 'Testing', 'Computers'];

    const work = {
      dev: {
        company: 'Foo',
      },
      consultant: {
        company: 'Bar',
      },
    };

    const education = {
      highschool: {
        startDate: '2018-09-20',
      },
    };

    const parsed = {
      basics,
      languages,
      projects,
      skills,
      work,
      education,
    };

    const expectedFinalContext = {
      ...initialContext,
      incomplete: {
        basics,
        projects,
      },
      complete: {
        languages,
        skills,
        work,
        education,
      },
    };

    addResumePartsToTheirCorrectPlaces(parsed, context);
    expect(context).toEqual(expectedFinalContext);
  });

  it('should parse private YAML file contents into private iterations', () => {
    const contents = 'foobarbaz';
    const context: ResumeContext = { ...initialContext };
    const expectedFinalContext: ResumeContext = {
      ...initialContext,
      privateIterations: ['foo', 'bar'],
    };
    (parse as jest.Mock).mockReturnValue(['foo', 'bar']);

    parsePrivateIterations(contents, context);
    expect(context).toEqual(expectedFinalContext);

    expect(parse).toHaveBeenCalledWith('foobarbaz');
  });
});
