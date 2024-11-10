import {
  getSkillSlugs,
  getAboutLightboxSlugs,
} from '@components/techSkillsMarquee/utils';
import type { Language } from './settings';
import type { defaultLang } from './settings';
import { aboutImagesInfo } from '@content/aboutImages/aboutImages';

export const englishSkillRoutes = getSkillSlugs('en');
export const danishSkillRoutes = getSkillSlugs('da');
export const englishAboutImageRoutes = getAboutLightboxSlugs('en');
export const danishAboutImageRoutes = getAboutLightboxSlugs('da');

/**
 * Define all routes in the application
 * Keys are in english
 */
export const appRoutes = {
  // keys on all localized languages (only da so far) are in english
  da: {
    //modals
    contact: 'kontakt',
    ['message-received']: 'besked-modtaget',
    ['message-error']: 'besked-fejl',
    share: 'del',
    //slugs
    work: 'arbejde',
    skills: 'kompetencer',
    about: 'om-mig',
    archive: 'arkiv',
    //slugs with modals
    ['work/contact']: 'arbejde/kontakt',
    ['work/message-received']: 'arbejde/besked-modtaget',
    ['work/message-error']: 'arbejde/besked-fejl',
    ['work/share']: 'arbejde/del',
    ['skills/contact']: 'kompetencer/kontakt',
    ['skills/message-received']: 'kompetencer/besked-modtaget',
    ['skills/message-error']: 'kompetencer/besked-fejl',
    ['skills/share']: 'kompetencer/del',
    ...danishSkillRoutes,
    ...danishAboutImageRoutes,
    ['about/contact']: 'om-mig/kontakt',
    ['about/message-received']: 'om-mig/besked-modtaget',
    ['about/message-error']: 'om-mig/besked-fejl',
    ['about/share']: 'om-mig/del',
    ['archive/contact']: 'arkiv/kontakt',
    ['archive/message-received']: 'arkiv/besked-modtaget',
    ['archive/message-error']: 'arkiv/besked-fejl',
    ['archive/share']: 'arkiv/del',
  },
  // keys are in danish (this does not scale - would have to be changed if more than 2 languages should be supported)
  en: {
    //modals
    contact: 'contact',
    ['message-received']: 'message-received',
    ['message-error']: 'message-error',
    share: 'share',
    //slugs
    work: 'work',
    skills: 'skills',
    about: 'about',
    archive: 'archive',
    //slugs with modals
    ['work/contact']: 'work/contact',
    ['work/message-received']: 'work/message-received',
    ['work/message-error']: 'work/message-error',
    ['work/share']: 'work/share',
    ['skills/contact']: 'skills/contact',
    ['skills/message-received']: 'skills/message-received',
    ['skills/message-error']: 'skills/message-error',
    ['skills/share']: 'skills/share',
    ...englishSkillRoutes,
    ...englishAboutImageRoutes,
    ['about/contact']: 'about/contact',
    ['about/message-received']: 'about/message-received',
    ['about/message-error']: 'about/message-error',
    ['about/share']: 'about/share',
    ['archive/contact']: 'archive/contact',
    ['archive/message-received']: 'archive/message-received',
    ['archive/message-error']: 'archive/message-error',
    ['archive/share']: 'archive/share',
  },
} as const;

const englishModalKeys = [
  'contact',
  'message-received',
  'message-error',
  'share',
] as const;

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

type SlugKeys = 'work' | 'skills' | 'about' | 'archive';

export type SlugTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][SlugKeys];

type SlugWithModalKeys =
  | 'work/contact'
  | 'work/message-received'
  | 'work/message-error'
  | 'work/share'
  | 'skills/contact'
  | 'skills/message-received'
  | 'skills/message-error'
  | 'skills/share'
  | 'about/contact'
  | 'about/message-received'
  | 'about/message-error'
  | 'about/share'
  | 'archive/contact'
  | 'archive/message-received'
  | 'archive/message-error'
  | 'archive/share';

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
