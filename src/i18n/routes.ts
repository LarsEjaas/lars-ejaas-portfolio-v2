import {
  getSkillRoutes,
  getAboutLightboxRoutes,
  type englishModalKeys,
} from './appRoutes.mts';
import type { Language } from './settings';
import type { defaultLang } from './settings';
import { appRoutes } from './appRoutes.mts';

export const englishSkillRoutes = getSkillRoutes('en');
export const danishSkillRoutes = getSkillRoutes('da');
export const englishAboutImageRoutes = getAboutLightboxRoutes('en');
export const danishAboutImageRoutes = getAboutLightboxRoutes('da');

export type DynamicSlugKey =
  | 'work'
  | 'skills'
  | 'about'
  | 'archive'
  | 'email-reply'
  | 'privacy-policy';

export type ModalKey = (typeof englishModalKeys)[number];
type DefaultLang = typeof defaultLang;

export type DanishModalKey = (typeof appRoutes)['da'][ModalKey];

/** Language key excluding the key for the default language */
export type LanguageKey = Exclude<Language, DefaultLang>;

export type ModalTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][ModalKey];

export type DynamicSlugTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][DynamicSlugKey];

type SlugSubkeys = (typeof englishModalKeys)[number];

type DynamicSlugWithModalKey =
  `${Exclude<DynamicSlugKey, 'email-reply'>}/${SlugSubkeys}`;

export type SlugWithModalTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][DynamicSlugWithModalKey];

export type ModalSlugPath<T extends string> = T extends `${infer S}/${infer M}`
  ? { slug: S; modal: M }
  : never;

export type SlugWithSkillKeys = keyof typeof englishSkillRoutes;

export type SlugWithSkillTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][SlugWithSkillKeys];

export type SkillSlugPath<T extends string> = T extends `${infer S}/${infer SK}`
  ? { slug: S; skill: SK }
  : never;

type SlugWithAboutImageKeys = keyof typeof englishAboutImageRoutes;

export type SlugWithAboutImageTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][SlugWithAboutImageKeys];

export type AboutImageSlugPath<T extends string> =
  T extends `${infer S}/${infer AI}` ? { slug: S; aboutImage: AI } : never;

export { appRoutes };
