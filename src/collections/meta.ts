import type { DynamicSlugKey } from '@i18n/routes.ts';
import {
  removeTrailingSlash,
  removeLeadingSlash,
  useTranslations,
  getEnglishTranslation,
} from '@i18n/utils';
import { defaultLang, type Language } from '@i18n/settings';
import type { MetaImage } from '@customTypes/seo';

type MetaInfo = Record<
  Exclude<DynamicSlugKey | '/', 'email-reply'>,
  {
    title: string;
    description: string;
    pinterestDescription?: string;
    image: MetaImage;
  }
>;

export const getMetaInfo = (lang: Language): MetaInfo => {
  const t = useTranslations(lang, 'navigation');
  return {
    work: {
      title: t('work'),
      description: t('work_seo_description'),
      image: {
        name: `work_${lang}`,
        alt: t('work_seo_image_alt'),
      },
    },
    skills: {
      title: t('skills'),
      description: t('skills_seo_description'),
      image: {
        name: `skills_${lang}`,
        alt: t('skills_seo_image_alt'),
      },
    },
    about: {
      title: t('about'),
      description: t('about_seo_description'),
      image: {
        name: `about_${lang}`,
        alt: t('about_seo_image_alt'),
      },
    },
    archive: {
      title: t('archive'),
      description: t('archive_seo_description'),
      image: {
        name: `archive_${lang}`,
        alt: t('archive_seo_image_alt'),
      },
    },
    ['privacy-policy']: {
      title: t('privacy_policy'),
      description: t('privacy_policy_seo_description'),
      image: {
        name: `default_${lang}`,
        alt: t('default_seo_image_alt'),
      },
    },
    ['/']: {
      title: t('home'),
      description: t('home_seo_description'),
      image: {
        name: `home_${lang}`,
        alt: t('home_seo_image_alt'),
      },
    },
  };
};

export const getMetaForPage = (path: string, lang: Language) => {
  // Get the parent slug in this route
  const parentSlug =
    path
      .split('/')
      .filter(Boolean)
      .filter((slug) => slug !== lang)[0] || '/';

  // Convert a localized path to English
  const translatedPath =
    lang === defaultLang
      ? parentSlug
      : getEnglishTranslation(lang, `${parentSlug}/`);

  const metaPaths = getMetaInfo(lang);

  const cleanPath =
    translatedPath && translatedPath !== '/'
      ? removeTrailingSlash(removeLeadingSlash(translatedPath))
      : '/';

  if (!metaPaths.hasOwnProperty(cleanPath)) {
    throw new Error(`Path ${cleanPath} is not defined in metaPaths`);
  }
  return metaPaths[cleanPath as keyof typeof metaPaths];
};
