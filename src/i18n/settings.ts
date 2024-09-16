import { navigation } from './translations/navigation';
import { share } from './translations/share';
import { home } from './translations/home';

export type Language = keyof typeof languages;

export const languages = {
  en: 'English',
  da: 'Dansk',
} as const;

export const defaultLang: Language = 'en';

export const translations = {
  navigation,
  share,
  home,
} as const;
