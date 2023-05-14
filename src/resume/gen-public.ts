import { GithubUserInfo } from '../service/github';
import { PartialProfiles, getFullProfiles } from './profile';
import { ResumeProject, getResumeProject } from './project';
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
