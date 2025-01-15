import {
  translations,
  defaultLang,
  languages,
  showDefaultLang,
  type Language,
} from './settings';
import { appRoutes, type LanguageKey } from './routes';
import { hasProperty, type StringWithTrailingSlash } from '@customTypes/index';

/**
 * Extracts the language code from a URL's pathname or returns the default language if no language code is found in the pathname.
 * @example
 * // Given URL: 'https://example.com/en/home'
 * const lang = getLangFromUrl(Astro.url);
 * console.info(lang); // 'en'
 */
export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang && lang in languages) return lang as keyof typeof languages;
  return defaultLang;
}

/**
 * Looks up a specific translation key for a specific language and returns the localized translation.
 * Furthermore validates the key against the available translation sources.
 *
 * @example
 * const lang = getLangFromUrl(Astro.url);
 * const t = useTranslations(lang, 'news');
 *
 * // and then in your template:
 *       <a href={`/${lang}/home/`}>
 *         {t('news.example')}
 *       </a>
 *   </li>
 */
type TranslationsType = typeof translations;

export function useTranslations<
  S extends keyof TranslationsType,
  L extends keyof TranslationsType[S],
>(lang: L, source: S) {
  return function t<K extends keyof TranslationsType[S][L]>(
    key: K
  ): TranslationsType[S][L][K] {
    return (
      translations[source][lang][key] ||
      translations[source][defaultLang as L][key]
    );
  };
}

export function useTranslatedPath(lang: keyof typeof languages) {
  return function translatePath(
    path: StringWithTrailingSlash,
    language: Language = lang
  ) {
    if (path === '/') {
      return !showDefaultLang && language === defaultLang
        ? '/'
        : `/${language}/`;
    }
    const pathName = removeTrailingSlash(removeLeadingSlash(path));
    const pathNameWithoutLocale = removeTrailingSlash(
      pathName.replace(`${lang}/`, '')
    );
    // If this is a translated index page, return the translated index page without trailing slash
    if (pathNameWithoutLocale === '' && lang !== defaultLang) {
      return `/${lang}/`;
    }
    const hasTranslation = hasProperty(
      pathNameWithoutLocale,
      appRoutes[language]
    );
    const translatedPath = hasTranslation
      ? `/${appRoutes[language][pathNameWithoutLocale]}/`
      : `/${pathName}/`;

    return !showDefaultLang && language === defaultLang
      ? translatedPath
      : `/${language}${translatedPath}`;
  };
}

/** Get the English appRoute when only the translated path is provided */
export const getEnglishTranslation = (
  language: LanguageKey,
  pathname: StringWithTrailingSlash,
  /** Fallback if no translation is found - defaults to "/" */
  fallback?: string | false
) => {
  const rawPath = removeLeadingSlash(removeTrailingSlash(pathname));
  const slug = rawPath.replace(`${language}/`, '');
  const [translationKey] =
    Object.entries(appRoutes[language]).find(
      ([_, routePath]) => routePath === slug
    ) || [];

  return translationKey ? `/${translationKey}/` : (fallback ?? '/');
};

/**
 * Remove leading slash from a slug or url, preserving literal type
 */
export function removeLeadingSlash<T extends string>(
  url: T
): T extends `/${infer Rest}` ? Rest : T {
  return (
    url.startsWith('/') ? url.substring(1) : url
  ) as T extends `/${infer Rest}` ? Rest : T;
}

/**
 * Remove trailing slash from a slug or url, preserving literal type
 */
export function removeTrailingSlash<T extends string>(
  url: T
): T extends `${infer Rest}/` ? Rest : T {
  return (
    url.endsWith('/') ? url.slice(0, -1) : url
  ) as T extends `${infer Rest}/` ? Rest : T;
}
