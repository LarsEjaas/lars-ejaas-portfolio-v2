import exclude from './excludeFromSitemap.json';
import { routes } from './sitemap-routes.mjs';

/**
 * @typedef {import('@i18n/settings').Language} Language
 * @typedef {import('@i18n/settings').defaultLang} defaultLang
 * @typedef {import('@astrojs/sitemap').SitemapItem} SitemapItem
 */

/**
 * @typedef {Object} DuplicatePattern
 * @property {string} slug - The slug that appears at the end of URLs (e.g., 'contact').
 *   Should be defined in the default language.
 * @property {Record<Exclude<Language, typeof defaultLang>, string>} variations - Variations.
 *   e.g., { da: 'kontakt' } for language variations.
 */

/**
 * Checks if a URL should be included in the sitemap based on duplicate patterns.
 * Only includes the root-level version of duplicate pages.
 *
 * @param {string} url - The full URL to check.
 * @returns {boolean} true if the URL should be included, false if it should be excluded.
 */
function shouldIncludeUrl(url) {
  const currentUrl = new URL(url);

  // Remove trailing slashes and convert to lowercase for consistent matching
  const rawPathname = currentUrl.pathname.endsWith('/')
    ? currentUrl.pathname.slice(0, -1)
    : currentUrl.pathname;
  const cleanPathname = rawPathname.trim().toLowerCase();

  // Check if the URL matches any excluded paths
  for (const path of exclude.excludedPaths) {
    const pathWithNoTrailingSlash = path.endsWith('/')
      ? path.slice(0, -1)
      : path;
    const cleanPath = pathWithNoTrailingSlash.startsWith('/')
      ? pathWithNoTrailingSlash.slice(1)
      : pathWithNoTrailingSlash;
    const pathToCompare = cleanPathname.startsWith('/')
      ? cleanPathname.slice(1)
      : cleanPathname;

    if (cleanPath === pathToCompare) {
      return false;
    }
  }

  const slugArray = cleanPathname.split('/').filter(Boolean);

  // Check each pattern and its variations
  for (const pattern of exclude.rootOnlyPatterns) {
    // The URL matches against an internationalized rootOnlyPattern at the root level
    const patternVariationsMatch = Object.entries(pattern.variations).some(
      ([lang, variation]) => {
        return (
          slugArray.length === 2 &&
          slugArray[0] === lang &&
          slugArray[1] === variation
        );
      }
    );

    const isRootLevelMatch =
      (slugArray.length === 1 && pattern.slug === slugArray[0]) ||
      patternVariationsMatch;

    if (isRootLevelMatch) {
      // Only include if it's at root level (e.g., /contact, not /about/contact)
      return true;
    }
  }

  // Exclude any URLs that match a pattern at a deeper level
  for (const pattern of exclude.rootOnlyPatterns) {
    // Check if the URL matches against a pattern at a deeper level
    const patternVariationsMatch =
      Object.entries(pattern.variations).some(([lang, variation]) => {
        return (
          slugArray[0] === lang && slugArray[slugArray.length - 1] === variation
        );
      }) || pattern.slug === slugArray[slugArray.length - 1];

    if (patternVariationsMatch) {
      return false;
    }
  }

  // If no patterns match, include the URL
  return true;
}

/**
 * Creates a filter function for Astro's sitemap configuration.
 * Combines duplicate checking with any other exclusion patterns.
 *
 * @param {string} url - The URL to check.
 * @param {((url: string) => boolean)} [additionalFilter] - Optional additional filter function to chain.
 * @returns {boolean} Whether the URL should be included in the sitemap.
 * @example
 * integrations: [
 *   sitemap({
 *     filter: createSitemapFilter
 *   })
 * //or
 * integrations: [
 *   sitemap({
 *     filter: (page) => createSitemapFilter(page, additionalFilter)
 *   })
 * ]
 */
export const createSitemapFilter = (url, additionalFilter = undefined) => {
  // First check if it passes the duplicate pattern rules
  const passedDuplicateCheck = shouldIncludeUrl(url);

  // If there's an additional filter, apply it as well
  if (
    passedDuplicateCheck &&
    additionalFilter &&
    typeof additionalFilter === 'function'
  ) {
    return additionalFilter(url);
  }

  return passedDuplicateCheck;
};

/**
 * Adds additional properties to each sitemap item before the sitemap is generated.
 *
 * @param {SitemapItem} item - The URL to check.
 * //or
 * integrations: [
 *   sitemap({
 *     filter: (page) => createSitemapFilter(page, additionalFilter)
 *   })
 * ]
 */
export const serializeSitemap = (item) => {
  const getChangeFreq = (url) => {
    return 'monthly';
  };

  const getLastMod = (url) => {
    const currentUrl = new URL(url);
    const pathname = currentUrl.pathname;
    return new Date().toISOString();
  };

  const getPriority = (url) => {
    const currentUrl = new URL(url);
    const pathname = currentUrl.pathname;
    if (pathname === '/' || pathname === '/da') return 1.0;
    if (url.includes('/blog/')) return 0.8;
    return 0.5;
  };

  const addAlternates = (item) => {
    const currentUrl = new URL(item.url);
    const pathnameRaw = currentUrl.pathname;
    const pathWithNoTrailingSlash = pathnameRaw.endsWith('/')
      ? pathnameRaw.slice(0, -1)
      : pathnameRaw;
    const pathName = pathWithNoTrailingSlash.startsWith('/')
      ? pathWithNoTrailingSlash.slice(1)
      : pathWithNoTrailingSlash;
    const origin = currentUrl.origin;

    if (!pathName) return item;

    const routeMatch = Object.entries(routes).find(
      ([routePath, _route]) => routePath === pathName
    );

    if (routeMatch) {
      // override the url with the routeMatch to get the compplete URL including the origin
      routeMatch[0] = item.url;
      const [_path, links] = routeMatch;
      const alternates = links.alternates?.map((alt) => ({
        ...alt,
        url: `${origin}/${alt.url}/`,
      }));
      if (alternates) {
        item.links = [...alternates];
      }
    }
    return item;
  };

  item.changefreq = getChangeFreq(item.url);
  item.lastmod = getLastMod(item.url);
  item.priority = getPriority(item.url);

  const itemWithAlternates = addAlternates(item);

  return itemWithAlternates;
};
