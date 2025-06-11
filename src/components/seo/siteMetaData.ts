import type { SeoProps } from '@customTypes/seo';
import { validateAndGetPublicPath } from './Seo.astro';
import { useTranslations } from '@i18n/utils';
import { FACEBOOK_APP_ID } from 'astro:env/client';

/** List of favicon file names */
const FAVICON_FILE_NAMES = ['favicon_32', 'favicon_64'];

export const siteInfo = {
  name: 'Lars Ejaas Portfolio',
  author: {
    jobTitle: 'Software Developer',
    worksFor: {
      type: 'Organization',
      name: 'Frigg Tech',
    },
    skills: ['JavaScript', 'TypeScript', 'React'],
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/lars-ejaas/',
    github: 'https://github.com/larsejaas',
    bluesky: 'https://bsky.app/profile/larsejaas.bsky.social',
  },
} as const;

/** Default site metadata */
export const getDefaultSiteMetaData = async (
  lang: 'en' | 'da'
): Promise<SeoProps> => {
  const isDefaultlang = lang === 'en';
  const favicons = await Promise.all(
    FAVICON_FILE_NAMES.map(async (path) => {
      const faviconInfo = await validateAndGetPublicPath(path);
      return {
        path: faviconInfo.src,
        size: faviconInfo.width,
        type: faviconInfo.mimeType,
      };
    })
  );

  const t = useTranslations(lang, 'navigation');

  return {
    metaData: {
      siteUrl: 'https://larsejaas.com',
      siteName: 'Lars Ejaas portfolio',
      keywords: [],
      title: t('home'),
      description: t('home_seo_description'),
      author: 'Lars Ejaas',
      rights: t('rights'),
    },
    metaTheme: {
      favicons: {
        sizes: favicons.map((favicon) => ({
          path: favicon.path,
          size: favicon.size,
          type: favicon.type as 'image/png',
        })),
      },
      themeColor: '#00879d',
      appleTouchIcon: {
        sizes: [48, 72, 96, 144, 192, 256, 384, 512],
        path: '/icons/',
      },
    },
    facebook: {
      appId: FACEBOOK_APP_ID,
    },
    twitter: {
      creator: 'Lars Ejaas',
      site: 'larsejaas.com',
      cardType: 'summary_large_image',
      siteId: '',
      creatorId: '',
    },
    openGraph: {
      image: {
        name: isDefaultlang ? 'default_en' : 'default_da',
        alt: t('default_seo_image_alt'),
      },
      type: 'website',
    },
    metaTags: [],
  };
};
