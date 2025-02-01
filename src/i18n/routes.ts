import { getSkillSlugs, getAboutLightboxSlugs } from './appRoutes.mts';
import type { Language } from './settings';
import type { defaultLang } from './settings';
import { aboutImagesInfo } from '@content/aboutImages/aboutImages.mts';
import { appRoutes } from './appRoutes.mts';

export const englishSkillRoutes = getSkillSlugs('en');
export const danishSkillRoutes = getSkillSlugs('da');
export const englishAboutImageRoutes = getAboutLightboxSlugs('en');
export const danishAboutImageRoutes = getAboutLightboxSlugs('da');

export const englishModalKeys = [
  'contact',
  'message-received',
  'message-error',
  'share',
] as const;

export type SlugKeys = 'work' | 'skills' | 'about' | 'archive' | 'email-reply';

/** Get all possible modal slugs in the different languages*/
export const allModalKeys = Object.values(appRoutes).flatMap((lang) =>
  Object.entries(lang)
    .filter(([key]) =>
      englishModalKeys.includes(key as (typeof englishModalKeys)[number])
    )
    .map(([, value]) => value)
);

export const allLightboxKeys = Object.values(aboutImagesInfo).flatMap(
  (info) => [info.hrefEN, info.hrefDA]
);

type ModalKeys = (typeof englishModalKeys)[number];
type DefaultLang = typeof defaultLang;
/** Language key excluding the key for the default language */
export type LanguageKey = Exclude<Language, DefaultLang>;

export type ModalTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][ModalKeys];

export type SlugTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][SlugKeys];

type SlugSubkeys = (typeof englishModalKeys)[number];

type SlugWithModalKeys = `${Exclude<SlugKeys, 'email-reply'>}/${SlugSubkeys}`;

export type SlugWithModalTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][SlugWithModalKeys];

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
