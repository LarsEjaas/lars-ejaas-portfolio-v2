import { navigation } from './translations/navigation';
import { share } from './translations/share';

export type Language = keyof typeof languages;

export const languages = {
  en: 'English',
  da: 'Dansk',
} as const;

export const defaultLang: Language = 'en';

export const translations = {
  navigation,
  share,
} as const;
