import { Options } from 'prettier';
import { LocalisedObject } from '../mapping/locale.types';
import { GithubUserInfo } from '../service/github';
import { ListrTaskFn } from 'listr2';

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
  focusedVersions: LocalisedVersions;
}

export interface RenderContext {
  path: string;
  resources: {
    [key: string]: string;
  };
  contents: Buffer;
}

export interface RenderWithTemplateContext extends RenderContext {
  templateContents?: string;
  templateStyles?: string;
  activePage: string;
}

export interface RedactContext {
  localState: string;
  remoteState: string;
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
  focusedVersions: {},
};
