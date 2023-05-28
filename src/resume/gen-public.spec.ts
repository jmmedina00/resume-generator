import { dekeyObject } from '../mapping/dekey';
import { extractKey } from '../mapping/extract';
import { LocalisedObject } from '../mapping/locale.types';
import { patchObject } from '../mapping/patch';
import { GithubUserInfo } from '../service/github';
import { LanguageLink, generateFromTemplate } from '../util/render/navbar';
import {
  addGitHubInfoToBasics,
  getDekeyedSectionFromObject,
  getNavigationBar,
  getProperProjects,
  getTranslated,
} from './gen-public';
import { PartialProfiles, Profile, getFullProfiles } from './profile';
import { ResumeProject, getResumeProject } from './project';

jest.mock('../util/render/navbar');
jest.mock('../mapping/dekey');
jest.mock('../mapping/extract');
jest.mock('../mapping/patch');
jest.mock('./profile');
jest.mock('./project');

describe('Public version generation', () => {
  const gitHubUser: GithubUserInfo = {
    user: 'juanmim',
    fullName: 'Juanmi Medina',
    profileUrl: 'this',
    avatarUrl: 'that',
  };

  it('should complete basics with GitHub user info, including a full GitHub profile', async () => {
    const incompleteBasics = {
      foo: 'bar',
      baz: 'le',
    };

    const profiles: PartialProfiles = {
      foo: { username: 'juanmi' },
      bar: { username: 'juanmi' },
    };

    const generatedProfiles: Profile[] = [
      {
        network: 'Foo',
        username: 'juanmi',
        url: 'foo.com/juanmi',
      },
      {
        network: 'Foo',
        username: 'juanmi',
        url: 'foo.com/juanmi',
      },
    ];

    const expected = {
      name: 'Juanmi Medina',
      image: 'that',
      foo: 'bar',
      baz: 'le',
      profiles: [
        { network: 'github', username: 'juanmim', url: 'this' },
        ...generatedProfiles,
      ],
    };

    (getFullProfiles as jest.Mock).mockResolvedValue(generatedProfiles);

    const actual = await addGitHubInfoToBasics(
      { ...incompleteBasics, profiles },
      gitHubUser
    );
    expect(actual).toEqual(expected);
    expect(getFullProfiles).toHaveBeenCalledWith(profiles, gitHubUser);
  });

  it('should turn keyed projects into proper list with GitHub information', async () => {
    const resumeProject: ResumeProject = {
      keywords: ['test', 'foo'],
      url: '',
      name: '',
      type: '',
      startDate: '',
      endDate: '',
      description: { es: 'Test', fr: 'Tester' },
    };

    const keyedProjects = {
      foo: {
        'page-active': false,
        type: 'app',
        startDate: 'foo',
        endDate: 'bar',
        description: { es: 'Test', fr: 'Tester' },
      },
      bar: {
        'page-active': true,
        type: 'library',
        startDate: 'baz',
        endDate: 'le',
        description: { es: 'Test', fr: 'Tester' },
      },
    };

    (getResumeProject as jest.Mock).mockResolvedValue(resumeProject);
    const result: ResumeProject[] = await getProperProjects(
      keyedProjects,
      gitHubUser
    );
    expect(result.length).toEqual(2);

    expect(getResumeProject).toHaveBeenCalledWith(
      {
        'page-active': false,
        name: 'foo',
        type: 'app',
        startDate: 'foo',
        endDate: 'bar',
        description: { es: 'Test', fr: 'Tester' },
      },
      gitHubUser
    );
    expect(getResumeProject).toHaveBeenCalledWith(
      {
        'page-active': true,
        name: 'bar',
        type: 'library',
        startDate: 'baz',
        endDate: 'le',
        description: { es: 'Test', fr: 'Tester' },
      },
      gitHubUser
    );
  });

  it('should turn localised object into an object with all translated versions', () => {
    const localised: LocalisedObject = {
      flattened: { test: 'test', keywords: ['foo', 'bar'] },
      locales: {
        en: { test: 'This is a test' },
        es: { test: 'Esto es una prueba' },
      },
    };

    (patchObject as jest.Mock).mockReturnValue({ patched: true });

    const result = getTranslated(localised);
    expect(result).toEqual({ en: { patched: true }, es: { patched: true } });

    expect(patchObject).toHaveBeenCalledWith(
      {
        test: 'test',
        keywords: ['foo', 'bar'],
      },
      { test: 'This is a test' }
    );
    expect(patchObject).toHaveBeenCalledWith(
      {
        test: 'test',
        keywords: ['foo', 'bar'],
      },
      { test: 'Esto es una prueba' }
    );
  });

  it('should extract section from localised object into a new localised object', () => {
    const localised: LocalisedObject = {
      flattened: {
        test: 'test',
        keywords: ['foo', 'bar'],
        complex: {
          number: 'number',
          word: 'word',
        },
      },
      locales: {
        en: {
          test: 'This is a test',
          complex: { number: 'Little number', word: 'Little words' },
        },
        es: {
          test: 'Esto es una prueba',
          complex: { number: 'Little number', word: 'Little words' },
        },
      },
    };

    const extracted: LocalisedObject = {
      flattened: { test: 'Testing' },
      locales: {},
    };

    const dekeyed: LocalisedObject = {
      flattened: { key: 'key' },
      locales: { en: { key: 'none' } },
    };

    (dekeyObject as jest.Mock).mockReturnValue(dekeyed);
    (extractKey as jest.Mock).mockReturnValue(extracted);

    const result = getDekeyedSectionFromObject(localised, 'test', [
      'foo',
      'bar',
    ]);

    expect({ ...result }).toEqual({ ...dekeyed });
    expect(extractKey).toHaveBeenCalledWith(localised, 'test');
    expect(dekeyObject).toHaveBeenCalledWith(extracted, ['foo', 'bar']);
  });

  it('should provide navigation bar node for localised object given a code', () => {
    (generateFromTemplate as jest.Mock).mockReturnValue('Rendered');

    const template = 'This is a template';

    const object: LocalisedObject = {
      flattened: {},
      locales: { en: {}, es: {}, fr: {} },
    };

    const expectedRenderables: LanguageLink[] = [
      { code: 'en', label: 'English', selected: false },
      { code: 'es', label: 'Español', selected: true },
      { code: 'fr', label: 'Français', selected: false },
    ];

    const navbar = getNavigationBar(template, object, 'es');
    expect(navbar).toEqual('Rendered');
    expect(generateFromTemplate).toHaveBeenCalledWith(
      template,
      expectedRenderables
    );
  });
});
