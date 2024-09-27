import type { Language } from '@i18n/settings';
import { techSkills, type TechSkill } from '@content/techSkills.ts';

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
