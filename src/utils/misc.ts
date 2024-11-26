import type { IconImage } from '../customTypes';

const validUrL =
  /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gm;

export const isExternalLink = (url: string) => {
  return url.match(validUrL) !== null;
};

/**  Capitalize the first letter of a string */
export const capitalize = (s: string | undefined) =>
  (s && s[0]?.toUpperCase() + s.slice(1)) || '';

export const iconColors: Record<IconImage, string> = {
  about: '#e57237',
  alert: '#0391b1',
  contact: '#00a0ab',
  ejaas: '#35d2cf',
  share: '#007d91',
  skillset: '#a11c75',
  work: '#0eb484',
  archive: '#058caa',
};
