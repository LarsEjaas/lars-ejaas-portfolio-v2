import { navigation } from './translations/navigation';

export type Language = keyof typeof languages;

export const languages = {
  en: 'English',
  da: 'Dansk',
};

export const defaultLang = 'en';

export const translations = {
  navigation,
};
