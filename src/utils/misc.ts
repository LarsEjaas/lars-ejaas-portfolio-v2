const validUrL =
  /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gm;

export const isExternalLink = (url: string) => {
  return url.match(validUrL) !== null;
};

/**  Capitalize the first letter of a string */
export const capitalize = (s: string | undefined) =>
  (s && s[0]?.toUpperCase() + s.slice(1)) || '';
