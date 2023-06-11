import type { LocalisedObject } from '../../../../../mapping/locale.types';
import { getNavigationBar } from '../../../../../resume/generation/public';

export const getNavbarGenerator =
  (resume: LocalisedObject, activeLang: string) => async (template: string) =>
    getNavigationBar(template, resume, activeLang);
