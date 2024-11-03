import type { StringWithTrailingSlash } from './index';

export type MetaData = {
  title: string;
  description: string;
  siteUrl: string;
  author: string;
  keywords: string[];
  language: 'en' | 'da';
  rights: string;
};

export type MetaTheme = {
  favicons: {
    sizes: {
      path: string;
      size: number;
      type: 'image/png' | 'image/svg+xml' | 'image/x-icon';
    }[];
  };
  themeColor: string;
  appleTouchIcon: {
    sizes: number[];
    path: StringWithTrailingSlash;
  };
  // appleStartupImage?: {
  //   media: string;
  //   path: string;
  // }[];
};

export type OpenGraph = {
  type: string;
  article: {
    publishedTime: string;
    modifiedTime: string;
    section: string;
    tags: string[];
  };
  image: string;
  imageAlt: string;
};

export type metaTag =
  | {
      name: string;
      content: string;
      property?: never;
    }
  | {
      property: string;
      content: string;
      name?: never;
    };

export type SeoProps = {
  metaData?: Partial<MetaData>;
  metaTheme?: Partial<MetaTheme>;
  facebook?: {
    appId: string;
  };
  twitter?: Partial<{
    cardType: 'summary_large_image' | 'summary' | 'app' | 'player';
    site: string;
    siteId: string;
    creator: string;
    creatorId: string;
  }>;
  openGraph?: Partial<OpenGraph>;
};
