import type { CamelCaseString } from '@customTypes/index';

const validUrL =
  /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gm;

export const isExternalLink = (url: string) => {
  return url.match(validUrL) !== null;
};

/**  Capitalize the first letter of a string */
export const capitalize = (s: string | undefined) =>
  (s && s[0]?.toUpperCase() + s.slice(1)) || '';

const KEBAB_REGEX = /\p{Lu}/gu;

/**
 * Transforms a string into kebab-case
 */
export const kebabCaseString = (str: string) => {
  const result = str.replace(KEBAB_REGEX, (match) => `-${match.toLowerCase()}`);
  if (result.startsWith('-')) {
    return result.slice(1);
  }
  return result;
};

/**
 * Transforms a kebab-case string into camelCase
 */
export const camelCaseString = <T extends string>(str: T): CamelCaseString<T> =>
  str.replace(/-([a-z])/g, (_, char) =>
    char.toUpperCase()
  ) as CamelCaseString<T>;

/**
 * Normalizes a style prop value into a CSS string.
 *
 * Accepts either a plain CSS string or a `CSSProperties` object and returns
 * a consistent string representation suitable for use in an HTML `style` attribute.
 *
 * @param style - A CSS string or `CSSProperties` object to normalize
 * @returns A CSS string, or `undefined` if no valid style was provided
 *
 * @example
 * getStyleString('color: red; font-size: 12px')
 * // → 'color: red; font-size: 12px'
 *
 * @example
 * getStyleString({ color: 'red', fontSize: 12 })
 * // → 'color: red; font-size: 12'
 */
export const getStyleString = (
  style: astroHTML.JSX.HTMLAttributes['style']
): string | undefined => {
  if (typeof style === 'string') return style;
  if (typeof style === 'object' && style !== null) {
    return Object.entries(style)
      .map(
        ([key, value]) =>
          `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`
      )
      .join(' ');
  }
  return undefined;
};

/**
 * Parses a CSS string into a camelCase keyed object.
 *
 * Note: Astro has no built-in equivalent — this is needed to merge
 * string-based styles with object-based styles before stringifying.
 *
 * @param css - A CSS string, e.g. `'color: red; font-size: 12px;'`
 * @returns A camelCase keyed object, e.g. `{ color: 'red', fontSize: '12px' }`
 *
 * @example
 * parseCssString('color: red; font-size: 12px;')
 * // → { color: 'red', fontSize: '12px' }
 *
 * @example
 * parseCssString('background-color: #fff; border-radius: 4px;')
 * // → { backgroundColor: '#fff', borderRadius: '4px' }
 */
export const parseCssString = (css: string): Record<string, string> =>
  Object.fromEntries(
    css
      .split(';')
      .map((rule) => rule.trim())
      .filter(Boolean)
      .map((rule) => {
        const [key, ...values] = rule.split(':');
        return [
          key?.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase()),
          values.join(':').trim(),
        ];
      })
      .filter(([key]) => !!key)
  );
