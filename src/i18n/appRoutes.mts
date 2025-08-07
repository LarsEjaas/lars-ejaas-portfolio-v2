import { techSkillEntries } from '../collections/techSkillTypes.mts';
import { getLightboxSlugs } from '../collections/aboutImages/aboutImages.mts';
import { languages } from './languageDefinition.mts';

type LanguageKey = keyof typeof languages;

export const getSkillSlugs = <T extends LanguageKey>(lang: T) => {
  type key = (typeof techSkillEntries)[number];
  type SlugSkillKey = `skills/${key}`;
  type SlugSkillValue = T extends 'da' ? `kompetencer/${key}` : SlugSkillKey;
  return techSkillEntries.reduce(
    (acc, href) => ({
      ...acc,
      [`skills/${href}`]: `${lang === 'da' ? 'kompetencer' : 'skills'}/${href}`,
    }),
    {} as Record<SlugSkillKey, SlugSkillValue>
  );
};

export const getAboutLightboxSlugs = <T extends LanguageKey>(lang: T) => {
  const englishaboutImageKeys = getLightboxSlugs('en');
  const danishAboutImageKeys = getLightboxSlugs('da');
  type key = (typeof englishaboutImageKeys)[number];
  type danishKey = (typeof danishAboutImageKeys)[number];
  type SlugAboutImageValue = T extends 'da'
    ? `om-mig/${danishKey}`
    : `about/${key}`;
  return englishaboutImageKeys.reduce(
    (acc, hrefEN, index) => ({
      ...acc,
      [`about/${hrefEN}`]: `${lang === 'da' ? 'om-mig' : 'about'}/${lang === 'da' ? danishAboutImageKeys[index] : hrefEN}`,
    }),
    {} as Record<`about/${key}`, SlugAboutImageValue>
  );
};

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
    ['privacy-policy']: 'privatlivspolitik',
    ['email-reply']: 'email-svar',
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
    ['privacy-policy/contact']: 'privatlivspolitik/kontakt',
    ['privacy-policy/message-received']: 'privatlivspolitik/besked-modtaget',
    ['privacy-policy/message-error']: 'privatlivspolitik/besked-fejl',
    ['privacy-policy/share']: 'privatlivspolitik/del',
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
    ['email-reply']: 'email-reply',
    ['privacy-policy']: 'privacy-policy',
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
    ['privacy-policy/contact']: 'privacy-policy/contact',
    ['privacy-policy/message-received']: 'privacy-policy/message-received',
    ['privacy-policy/message-error']: 'privacy-policy/message-error',
    ['privacy-policy/share']: 'privacy-policy/share',
  },
} as const;
