import { readFile } from 'fs/promises';
import { parse } from 'yaml';
import { getCoreUserInfo } from './service/github';
import { getFullProfiles } from './resume/profile';
import { getResumeProject } from './resume/project';
import { getFlattenedObjectAndLocales } from './mapping/locale';
import { dekeyObject } from './mapping/dekey';
import { extractKey } from './mapping/extract';
import { LocalisedObject } from './mapping/locale.types';
import { patchObject } from './mapping/patch';

const getTranslated = ({ flattened, locales }: LocalisedObject) =>
  Object.fromEntries(
    Object.entries(locales).map(([code, translations]) => [
      code,
      patchObject(flattened, translations),
    ])
  );

export const makeResumes = async (path: string) => {
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
  const { profiles: partialProfiles } = incompleteBasics;
  const profiles = await getFullProfiles(partialProfiles);

  const basics = {
    name: githubUser.fullName,
    image: githubUser.avatarUrl,
    ...incompleteBasics,
    profiles: [
      {
        network: 'GitHub',
        username: githubUser.user,
        url: githubUser.profileUrl,
      },
      ...profiles,
    ],
  };

  const projects = await Promise.all(
    Object.entries(keyedProjects as object)
      .map(([name, info]) => ({ name, ...info }))
      .map((repoProject) => getResumeProject(repoProject))
  );

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
    dekeyObject(extractKey(localised, 'work'), ['position', 'summary'])
  );

  const translatedEducation = getTranslated(
    dekeyObject(extractKey(localised, 'education'), ['area', 'studyType'])
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
