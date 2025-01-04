import type { SlugKeys, englishModalKeys } from './routes';

type SiteMapPriority = Record<
  | Exclude<SlugKeys, 'email-reply'>
  | Extract<(typeof englishModalKeys)[number], 'contact' | 'share'>,
  {
    priority: number;
    subpagePriority?: number;
  }
>;

export const sitemapPriority = {
  work: { priority: 0.9 },
  skills: { priority: 0.9, subpagePriority: 0.6 },
  about: { priority: 0.7, subpagePriority: 0.5 },
  archive: { priority: 0.3 },
  contact: { priority: 1.0 },
  share: { priority: 0.3 },
  'privacy-policy': { priority: 0.5 },
} satisfies SiteMapPriority;
