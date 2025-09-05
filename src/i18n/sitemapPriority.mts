import type { DynamicSlugKey, StaticSlugKey } from './routes';
import type { englishModalKeys } from './appRoutes.mts';

type SiteMapPriority = Record<
  | Exclude<DynamicSlugKey, 'email-reply'>
  | Extract<(typeof englishModalKeys)[number], 'contact' | 'share'>
  | StaticSlugKey,
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
  'developer-tips': { priority: 0.9 },
} satisfies SiteMapPriority;
