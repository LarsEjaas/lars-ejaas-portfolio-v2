import type { Language } from '@i18n/settings';
import { techSkills, type TechSkill } from '@content/techSkills.ts';
import { aboutImagesInfo } from '@content/aboutImages/aboutImages';

export const getSkillSlugs = <T extends Language>(lang: T) => {
  type key = TechSkill;
  type SlugSkillKey = `skills/${key}`;
  type SlugSkillValue = T extends 'da' ? `kompetencer/${key}` : SlugSkillKey;
  return techSkills[lang].reduce(
    (acc, { href }) => ({
      ...acc,
      [`skills/${href}`]: `${lang === 'da' ? 'kompetencer' : 'skills'}/${href}`,
    }),
    {} as Record<SlugSkillKey, SlugSkillValue>
  );
};

export const getAboutLightboxSlugs = <T extends Language>(lang: T) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const englishaboutImageKeys = aboutImagesInfo.map((image) => image.hrefEN);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const danishAboutImageKeys = aboutImagesInfo.map((image) => image.hrefDA);
  type key = (typeof englishaboutImageKeys)[number];
  type danishKey = (typeof danishAboutImageKeys)[number];
  type SlugAboutImageValue = T extends 'da'
    ? `om-mig/${danishKey}`
    : `about/${key}`;
  return aboutImagesInfo.reduce(
    (acc, { hrefDA, hrefEN }) => ({
      ...acc,
      [`about/${hrefEN}`]: `${lang === 'da' ? 'om-mig' : 'about'}/${lang === 'da' ? hrefDA : hrefEN}`,
    }),
    {} as Record<`about/${key}`, SlugAboutImageValue>
  );
};
