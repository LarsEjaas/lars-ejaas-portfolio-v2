import { navigation } from './translations/navigation';
import { share } from './translations/share';
import { home } from './translations/home';
import { about } from './translations/about';
import { skills } from './translations/skills';
import { work } from './translations/work';

export type Language = keyof typeof languages;

export type DanishLanguageSlug = Exclude<Language, typeof defaultLang>;

export const languages = {
  en: 'English',
  da: 'Dansk',
} as const;

export const defaultLang: Extract<Language, 'en'> = 'en';

export const translations = {
  navigation,
  share,
  home,
  about,
  skills,
  work,
} as const;

export const showDefaultLang = false;
