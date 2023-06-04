import { getFlattenedObjectAndLocales } from '../../mapping/locale';
import { LocalisedObject } from '../../mapping/locale.types';
import {
  addGitHubInfoToBasics,
  getDekeyedSectionFromObject,
  getTranslated,
} from '../../resume/generation/public';
import { ResumeContext, initialContext } from '../context';
import {
  transformAndReplaceLocalisedField,
  transformCompleteToLocalised,
  transformIncompleteField,
  transformLocalisedToTranslated,
} from './public';

jest.mock('../../resume/generation/public'); // Just check types fit target functions
jest.mock('../../mapping/locale');

describe('Transforming tasks', () => {
  it('should transform incomplete field and append them to complete section', async () => {
    (addGitHubInfoToBasics as jest.Mock).mockResolvedValue({
      foo: 'test',
      bar: 'le',
    });

    const context: ResumeContext = {
      ...initialContext,
      githubUser: {
        user: 'juanmim',
        fullName: 'Juanmi Medina',
        profileUrl: 'this',
        avatarUrl: 'that',
      },
      incomplete: {
        basics: { needsHelp: true },
      },
      complete: {
        other: 'stuff',
      },
    };

    const expectedFinalContext: ResumeContext = {
      ...context,
      complete: {
        other: 'stuff',
        basics: {
          foo: 'test',
          bar: 'le',
        },
      },
    };

    const task = transformIncompleteField('basics', addGitHubInfoToBasics);
    await task(context);

    expect(context).toEqual(expectedFinalContext);
    expect(addGitHubInfoToBasics).toHaveBeenCalledWith(
      { needsHelp: true },
      {
        user: 'juanmim',
        fullName: 'Juanmi Medina',
        profileUrl: 'this',
        avatarUrl: 'that',
      }
    );
  });

  it('should consolidate complete sections into localised object', async () => {
    const context: ResumeContext = {
      ...initialContext,
      complete: {
        basics: { foo: 'bar' },
        languages: [{ name: 'English', learnedAt: 'foo' }],
        certificates: ['ai', 'blockchain'],
        projects: { calculator: { foo: 'qwe' }, display: { foo: 'asd' } },
        skills: ['coding', 'fishing'],
        work: { dev: { test: 'foo' }, consult: { test: 'bar' } },
        education: { school: { name: 'test' } },
        irrevelant: 'foo',
      },
    };

    const localised: LocalisedObject = {
      flattened: { patched: 'patched' },
      locales: { en: { patched: 'Yes' }, es: { patched: 'Sí' } },
    };

    (getFlattenedObjectAndLocales as jest.Mock).mockReturnValue(localised);

    const expectedFinalContext = {
      ...context,
      localised: { ...localised },
    };

    await transformCompleteToLocalised(context);
    expect(context).toEqual(expectedFinalContext);
    expect(getFlattenedObjectAndLocales).toHaveBeenCalledWith({
      basics: { foo: 'bar' },
      languages: [{ name: 'English', learnedAt: 'foo' }],
      certificates: ['ai', 'blockchain'],
      projects: { calculator: { foo: 'qwe' }, display: { foo: 'asd' } },
      skills: ['coding', 'fishing'],
      work: { dev: { test: 'foo' }, consult: { test: 'bar' } },
      education: { school: { name: 'test' } },
    });
  });

  it('should apply translations into public versions', async () => {
    const localised: LocalisedObject = {
      flattened: { test: 'foo' },
      locales: { en: { test: 'English' }, es: { test: 'Español' } },
    };

    const translations = {
      en: { test: 'English-a' },
      es: { test: 'Español-a' },
    };

    (getTranslated as jest.Mock).mockReturnValue(translations);

    const context: ResumeContext = {
      ...initialContext,
      localised,
    };

    const expectedFinalContext: ResumeContext = {
      ...context,
      publicVersions: { ...translations },
    };

    await transformLocalisedToTranslated(context);
    expect(context).toEqual(expectedFinalContext);
    expect(getTranslated).toHaveBeenCalledWith({ ...localised });
  });

  it('should patch public versions with dekeyed field', async () => {
    const localised: LocalisedObject = {
      flattened: { test: 'foo' },
      locales: { en: { test: 'English' }, es: { test: 'Español' } },
    };

    const translations = {
      en: { test: 'English-a' },
      es: { test: 'Español-a' },
    };

    const dekeyed: LocalisedObject = {
      flattened: { mode: 'dekeyed' },
      locales: { en: { text: 'test' }, es: { text: 'prueba' } },
    };

    const translatedField = {
      en: { foo: '123', bar: '456' },
      es: { foo: 'qwe', bar: 'asd' },
    };

    const expectedTranslations = {
      en: { test: { foo: '123', bar: '456' } },
      es: { test: { foo: 'qwe', bar: 'asd' } },
    };

    (getDekeyedSectionFromObject as jest.Mock).mockReturnValue(dekeyed);
    (getTranslated as jest.Mock).mockReturnValue(translatedField);

    const context: ResumeContext = {
      ...initialContext,
      localised,
      publicVersions: { ...translations },
    };

    const expectedFinalContext: ResumeContext = {
      ...initialContext,
      localised,
      publicVersions: { ...expectedTranslations },
    };

    const task = transformAndReplaceLocalisedField('test', ['foo', 'bar']);
    await task(context);

    expect(context).toEqual(expectedFinalContext);
    expect(getTranslated).toHaveBeenCalledWith(dekeyed);
    expect(getDekeyedSectionFromObject).toHaveBeenCalledWith(
      { ...localised },
      'test',
      ['foo', 'bar']
    );
  });
});
