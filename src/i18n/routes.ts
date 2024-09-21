import type { Language } from './settings';
import type { defaultLang } from './settings';

/**
 * Define all routes in the application
 * Keys are in english
 */
export const appRoutes = {
  // keys on all localized languages (only da so far) are in english
  da: {
    //modals
    contact: 'kontakt',
    share: 'del',
    //slugs
    work: 'arbejde',
    skills: 'kompetencer',
    about: 'om-mig',
    archive: 'arkiv',
    //slugs with modals
    ['work/contact']: 'arbejde/kontakt',
    ['work/share']: 'arbejde/del',
    ['skills/contact']: 'kompetencer/kontakt',
    ['skills/share']: 'kompetencer/del',
    ['about/contact']: 'om-mig/kontakt',
    ['about/share']: 'om-mig/del',
    ['archive/contact']: 'arkiv/kontakt',
    ['archive/share']: 'arkiv/del',
  },
  // keys are in danish (this does not scale - would have to be changed if more than 2 languages should be supported)
  en: {
    //modals
    contact: 'contact',
    share: 'share',
    //slugs
    work: 'work',
    skills: 'skills',
    about: 'about',
    archive: 'archive',
    //slugs with modals
    ['work/contact']: 'work/contact',
    ['work/share']: 'work/share',
    ['skills/contact']: 'skills/contact',
    ['skills/share']: 'skills/share',
    ['about/contact']: 'about/contact',
    ['about/share']: 'about/share',
    ['archive/contact']: 'archive/contact',
    ['archive/share']: 'archive/share',
  },
} as const;

type ModalKeys = 'contact' | 'share';
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
  | 'work/share'
  | 'skills/contact'
  | 'skills/share'
  | 'about/contact'
  | 'about/share'
  | 'archive/contact'
  | 'archive/share';

export type SlugWithModalTypes<Lang extends Language> =
  (typeof appRoutes)[Lang][SlugWithModalKeys];

export type ModalSlugPath<T extends string> = T extends `${infer S}/${infer M}`
  ? { slug: S; modal: M }
  : never;
