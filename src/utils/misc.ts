const validUrL =
  /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gm;

export const isExternalLink = (url: string) => {
  return url.match(validUrL) !== null;
};

/**  Capitalize the first letter of a string */
export const capitalize = (s: string | undefined) =>
  (s && s[0]?.toUpperCase() + s.slice(1)) || '';

/**
 * Formats a date with ordinal suffix for English, standard format for other languages
 * @param timestamp - ISO timestamp string - e.g. "2023-10-01T12:00:00Z"
 * @param lang - Language code ("en" | "da" | string)
 * @returns Formatted date string or undefined if no timestamp
 */
export function formatDate(
  timestamp: string | undefined,
  lang: 'en' | 'da' | string
): string | undefined {
  if (!timestamp) return undefined;

  const date = new Date(timestamp);

  if (lang === 'en') {
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();

    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  }

  // For all other languages (including Danish), use standard format
  return date.toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
