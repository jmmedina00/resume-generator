import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { GithubUserInfo, getCoreUserInfo } from '../service/github';
import { PartialProfiles, getFullProfiles } from './profile';
import { ResumeProject, getResumeProject } from './project';
import { getFlattenedObjectAndLocales } from '../mapping/locale';
import { dekeyObject } from '../mapping/dekey';
import { extractKey } from '../mapping/extract';
import { LocalisedObject } from '../mapping/locale.types';
import { patchObject } from '../mapping/patch';

export const addGitHubInfoToBasics = async (
  incompleteBasics: { profiles: PartialProfiles },
  user: GithubUserInfo
) => {
  const {
    fullName: name,
    avatarUrl: image,
    user: username,
    profileUrl: url,
  } = user;
  const { profiles: partialProfiles } = incompleteBasics;
  const profiles = await getFullProfiles(partialProfiles, user);

  return {
    name,
    image,
    ...incompleteBasics,
    profiles: [
      {
        network: 'github',
        username,
        url,
      },
      ...profiles,
    ],
  };
};

export const getProperProjects = (
  keyedProjects: object,
  user: GithubUserInfo
): Promise<ResumeProject[]> =>
  Promise.all(
    Object.entries(keyedProjects as object)
      .map(([name, info]) => ({ name, ...info }))
      .map((repoProject) => getResumeProject(repoProject, user))
  );

export const getTranslated = ({ flattened, locales }: LocalisedObject) =>
  Object.fromEntries(
    Object.entries(locales).map(([code, translations]) => [
      code,
      patchObject(flattened, translations),
    ])
  );

export const getDekeyedSectionFromObject = (
  localised: LocalisedObject,
  field: string,
  defaultedSubFields: string[]
) => dekeyObject(extractKey(localised, field), defaultedSubFields);

export const makeResumes = async (path: string) => {
  // TODO transfer all this logic to proper task runner

  const resumeFile = await readFile(path, 'utf-8');
  const {
    basics: incompleteBasics,
    languages,
    projects: keyedProjects,
    skills,
    work,
    education,
  } = parse(resumeFile);

  const githubUser = await getCoreUserInfo();
  const basics = await addGitHubInfoToBasics(incompleteBasics, githubUser);
  const projects = getProperProjects(keyedProjects, githubUser);

  const localised = getFlattenedObjectAndLocales({
    basics,
    languages,
    projects,
    skills,
    work,
    education,
  });

  const translated = getTranslated(localised);

  const translatedWork = getTranslated(
    getDekeyedSectionFromObject(localised, 'work', ['position', 'summary'])
  );

  const translatedEducation = getTranslated(
    getDekeyedSectionFromObject(localised, 'education', ['area', 'studyType'])
  );

  return Object.entries(translated).map<[string, object]>(([code, object]) => [
    code,
    {
      ...object,
      work: translatedWork[code],
      education: translatedEducation[code],
    },
  ]);
};
