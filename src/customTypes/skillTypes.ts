import type { TechSkill } from '@collections/techSkills';
import type { SVGFileType } from './index';
import type { techSkillCategories } from '@collections/techSkillTypes.mts';

export type SkillRating = 1 | 2 | 3 | 4 | 3.5 | 0.5 | 1.5 | 2.5 | 4.5 | 5;

export type SkillCategory = (typeof techSkillCategories)[number];

export type SkillInfo = {
  title: string;
  description: (_props: Record<string, never>) => any;
  imageSrc: SVGFileType;
  imageAlt: string;
  href: string;
  rating: SkillRating;
  category: SkillCategory;
};

export type TechSkillItems = Record<TechSkill, SkillInfo>;
