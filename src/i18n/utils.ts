import { translations, defaultLang, languages } from "./settings";

/**
 * Extracts the language code from a URL's pathname or returns the default language if no language code is found in the pathname.
 * @example
 * // Given URL: 'https://example.com/en/home'
 * const lang = getLangFromUrl(Astro.url);
 * console.log(lang); // 'en'
 */
export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
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
export function useTranslations(
  lang: keyof typeof languages,
  source: keyof typeof translations,
) {
  return function t(
    key: keyof (typeof translations)[typeof source][typeof defaultLang],
  ) {
    return (
      translations[source][lang][key] || translations[source][defaultLang][key]
    );
  };
}
