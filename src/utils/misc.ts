import IconHome from '@assets/menuIcons/ejaas.png';
import IconWork from '@assets/menuIcons/work.png';
import IconSkills from '@assets/menuIcons/skillset.png';
import IconAbout from '@assets/menuIcons/about.png';
import IconContact from '@assets/menuIcons/contact.png';
import IconShare from '@assets/menuIcons/share.png';
import { generateBlurPlaceholder } from '@utils/generateBlurPlaceholder';

const validUrL =
  /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gm;

export const isExternalLink = (url: string) => {
  return url.match(validUrL) !== null;
};

/**  Capitalize the first letter of a string */
export const capitalize = (s: string | undefined) =>
  (s && s[0]?.toUpperCase() + s.slice(1)) || '';

export const menuIconPlaceholders = {
  home: await generateBlurPlaceholder(IconHome.src, 10, undefined, 0.5),
  work: await generateBlurPlaceholder(IconWork.src, 10, undefined, 0.5),
  skills: await generateBlurPlaceholder(IconSkills.src, 10, undefined, 0.5),
  about: await generateBlurPlaceholder(IconAbout.src, 10, undefined, 0.5),
  contact: await generateBlurPlaceholder(IconContact.src, 10, undefined, 0.5),
  share: await generateBlurPlaceholder(IconShare.src, 10, undefined, 0.5),
};
