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
