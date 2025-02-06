import type { StringWithTrailingSlash } from './index';

export type MetaData = {
  title: string;
  description: string;
  siteUrl: string;
  siteName: string;
  author: string;
  keywords: string[];
  rights: string;
};

export type MetaImage = {
  name: string;
  alt: string;
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
  image: MetaImage;
} & (
  | {
      type: string;
      image: MetaImage;
      article: {
        publishedTime: string;
        modifiedTime: string;
        expirationTime: string;
        section: string;
        tags: string[];
        authors: string[];
      };
    }
  | {}
);

type HttpEquiv =
  | 'content-security-policy'
  | 'content-type'
  | 'default-style'
  | 'refresh';

export type metaTag = {
  name?: string;
  content: string;
  property?: string;
  'http-equiv'?: HttpEquiv;
  media?: string;
};

export type SeoProps = {
  metaData: MetaData;
  metaTheme: MetaTheme;
  facebook: {
    appId: string;
  };
  twitter: {
    cardType: 'summary_large_image' | 'summary' | 'app' | 'player';
    site: string;
    siteId: string;
    creator: string;
    creatorId: string;
  };
  openGraph: OpenGraph;
  metaTags: metaTag[];
};
