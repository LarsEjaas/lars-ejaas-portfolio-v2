import type { SlugKeys } from '@i18n/routes.ts';
import { useTranslatedPath, useTranslations } from '../i18n/utils';
import type { Language } from '@i18n/settings';
import type { MetaImage } from '@customTypes/seo';

type MetaInfo = Record<
  Exclude<SlugKeys | '/', 'email-reply'>,
  {
    title: string;
    description: string;
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
  const translatePath = useTranslatedPath('en');
  const cleanPath = path.replace(/\/$/, '');
  // Convert a localized path to English
  const pathName = cleanPath ? translatePath(`${cleanPath}/`) : '/';

  const metaPaths = getMetaInfo(lang);

  if (!metaPaths.hasOwnProperty(pathName)) {
    throw new Error(`Path ${pathName} is not defined in metaPaths`);
  }
  return metaPaths[pathName as keyof typeof metaPaths];
};
