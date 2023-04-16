import { readFile } from 'fs/promises';
import { GithubUserInfo, getCoreUserInfo } from '../service/github';
import { ResumeContext, initialContext } from './context';
import {
  SRC_RESUME_PATH,
  readGitHub,
  readPrivateIterations,
  readSourceResume,
} from './read';
import { parse } from 'yaml';
import { getFileContents } from '../service/gdrive';
import { EncryptedData, decryptText } from '../util/encrypt';

jest.mock('fs/promises');
jest.mock('../service/github');
jest.mock('../service/gdrive');
jest.mock('../util/encrypt');
jest.mock('yaml');

describe('Reading tasks', () => {
  it('should read GitHub user into context', async () => {
    const githubUser: GithubUserInfo = {
      user: 'juanmim',
      fullName: 'Juanmi Medina',
      profileUrl: 'this',
      avatarUrl: 'that',
    };

    const context: ResumeContext = { ...initialContext };

    (getCoreUserInfo as jest.Mock).mockResolvedValue({ ...githubUser });
    const expectedFinalContext = { ...initialContext, githubUser };

    await readGitHub(context);
    expect(context).toEqual(expectedFinalContext);
  });

  it('should read and parse source resume into respective areas', async () => {
    const parsed = {
      basics: {
        foo: '123',
        bar: '456',
      },
      languages: ['es', 'en'],
      projects: {
        todo: {
          description: 'Test',
        },
        calculator: {
          description: 'Project',
        },
      },
      skills: ['Programming', 'Testing', 'Computers'],
      work: {
        dev: {
          company: 'Foo',
        },
        consultant: {
          company: 'Bar',
        },
      },
      education: {
        highschool: {
          startDate: '2018-09-20',
        },
      },
    };

    const context: ResumeContext = { ...initialContext };

    (readFile as jest.Mock).mockResolvedValue('');
    (parse as jest.Mock).mockReturnValue(parsed);

    const expectedFinalContext = {
      ...initialContext,
      incomplete: {
        basics: {
          foo: '123',
          bar: '456',
        },
        projects: {
          todo: {
            description: 'Test',
          },
          calculator: {
            description: 'Project',
          },
        },
      },
      complete: {
        languages: ['es', 'en'],
        skills: ['Programming', 'Testing', 'Computers'],
        work: {
          dev: {
            company: 'Foo',
          },
          consultant: {
            company: 'Bar',
          },
        },
        education: {
          highschool: {
            startDate: '2018-09-20',
          },
        },
      },
    };

    await readSourceResume(context);
    expect(context).toEqual(expectedFinalContext);

    expect(readFile).toHaveBeenCalledWith(SRC_RESUME_PATH, 'utf-8');
    expect(parse).toHaveBeenCalledWith('');
  });

  it('should read and decrypt private iterations into context', async () => {
    const encrypted: EncryptedData = {
      initVector: 'foo',
      data: 'bar',
      authTag: 'baz',
    };

    const iterations = [{ foo: 'test' }, { bar: 'make' }];
    process.env['PRIVATE_FILE_ID'] = 'my-private-file-here';

    (getFileContents as jest.Mock).mockResolvedValue(encrypted);
    (decryptText as jest.Mock).mockReturnValue('');
    (parse as jest.Mock).mockReturnValue(iterations);

    const context: ResumeContext = { ...initialContext };
    const expectedFinalContext: ResumeContext = {
      ...initialContext,
      privateIterations: [{ foo: 'test' }, { bar: 'make' }],
    };

    await readPrivateIterations(context);
    expect(context).toEqual(expectedFinalContext);

    expect(parse).toHaveBeenCalledWith('');
    expect(decryptText).toHaveBeenCalledWith(encrypted);
    expect(getFileContents).toHaveBeenCalledWith('my-private-file-here');
  });
});
