import { getFlattenedObjectAndLocales } from '../../mapping/locale';
import {
  getDekeyedSectionFromObject,
  getTranslated,
} from '../../resume/generation/public';
import { GithubUserInfo } from '../../service/github';
import { ResumeContext } from '../context';

export const transformIncompleteField =
  (
    field: string,
    func: (contents: any, user: GithubUserInfo) => Promise<any>
  ) =>
  async (ctx: ResumeContext): Promise<void> => {
    const incomplete = ctx.incomplete[field];
    ctx.complete[field] = await func(incomplete, ctx.githubUser);
  };

export const transformCompleteToLocalised = async (
  ctx: ResumeContext
): Promise<void> => {
  const { basics, languages, certificates, projects, skills, work, education } =
    ctx.complete;
  ctx.localised = getFlattenedObjectAndLocales({
    basics,
    languages,
    certificates,
    projects,
    skills,
    work,
    education,
  });
};

export const transformLocalisedToTranslated = async (
  ctx: ResumeContext
): Promise<void> => {
  ctx.publicVersions = getTranslated(ctx.localised);
};

export const transformAndReplaceLocalisedField =
  (field: string, defaultedSubFields: string[]) =>
  async (ctx: ResumeContext): Promise<void> => {
    const translatedField = getTranslated(
      getDekeyedSectionFromObject(ctx.localised, field, defaultedSubFields)
    );

    const patchedPublicVersions = Object.fromEntries(
      Object.entries(ctx.publicVersions).map(([code, object]) => [
        code,
        { ...object, [field]: translatedField[code] },
      ])
    );

    ctx.publicVersions = patchedPublicVersions;
  };
