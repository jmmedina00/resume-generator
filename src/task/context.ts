import { LocalisedObject } from '../mapping/locale.types';
import { GithubUserInfo } from '../service/github';

interface LocalisedVersions {
  [key: string]: any;
}

interface LocalisedIterations {
  [key: string]: any[];
}

export interface ResumeContext {
  githubUser: GithubUserInfo;

  incomplete: any;
  complete: any;
  localised: LocalisedObject;

  privateIterations: any[];
  privateVersions: LocalisedIterations;
  publicVersions: LocalisedVersions;
}

export const initialContext: ResumeContext = {
  githubUser: {
    user: '',
    fullName: '',
    profileUrl: '',
    avatarUrl: '',
  },
  incomplete: {},
  complete: {},
  localised: { flattened: {}, locales: {} },
  privateIterations: [],
  privateVersions: {},
  publicVersions: {},
};