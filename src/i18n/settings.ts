import { navigation } from './translations/navigation';
import { share } from './translations/share';
import { home } from './translations/home';
import { about } from './translations/about';
import { skills } from './translations/skills';
import { work } from './translations/work';
import { archive } from './translations/archive';
import { contact } from './translations/contact';
import { emailReply } from './translations/emailReply';
import { languages } from './languageDefinition.mts';
import { privacyPolicy } from './translations/privacyPolicy';

export type Language = keyof typeof languages;

export type DanishLanguageSlug = Exclude<Language, typeof defaultLang>;

export const defaultLang: Extract<Language, 'en'> = 'en';

export const translations = {
  navigation,
  share,
  home,
  about,
  skills,
  work,
  archive,
  contact,
  emailReply,
  privacyPolicy,
} as const;

export const showDefaultLang = false;

export { languages };
