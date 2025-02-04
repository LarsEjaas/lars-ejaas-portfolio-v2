import type { SeoProps } from '@customTypes/seo';
import { validateAndGetPublicPath } from './Seo.astro';

const FACEBOOK_APP_ID = import.meta.env.FACEBOOK_APP_ID;
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

  return {
    metaData: {
      siteUrl: 'https://larsejaas.com',
      siteName: 'Lars Ejaas portfolio',
      keywords: [],
      title: isDefaultlang
        ? 'Passionate About Web Development with Attention to Details'
        : 'Passioneret omkring webudvikling med fokus på detaljen',
      description: isDefaultlang
        ? '👨🏻‍💻 Frontend developer from Denmark. Passionate about web design and web development. Check out my portfolio and get an overview of my development skills.'
        : '👨🏻‍💻 Frontend-udvikler fra Aarhus. Brænder for hjemmesidedesign og webudvikling. Få et overblik over mine kompetencer og udviklingsmetoder jeg har erfaring med.',
      author: 'Lars Ejaas',
      rights: isDefaultlang
        ? 'All rights reserved Lars Ejaas. Please contact me directly to get my consent before using any content from this page.'
        : 'Alle rettigheder forbeholdes Lars Ejaas. Kontakt mig direkte for at få mit samtykke, inden du bruger indhold fra denne side.',
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
        name: isDefaultlang ? 'home_en' : 'home_da',
        alt: isDefaultlang
          ? 'Screenshot of larsejaas.com homepage on a laptop, with Lars Ejaas’s profile picture and signature below alongside "frontend developer" text, set against a turquoise background.'
          : 'Screenshot af larsejaas.com index-side afbilledet på en laptop, med Lars Ejaas’ profilbillede og signatur nedenunder sammen med teksten "frontend udvikler", på turkis baggrund',
      },
      type: 'website',
    },
    metaTags: [],
  };
};
