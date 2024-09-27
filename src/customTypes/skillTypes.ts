import type { TechSkill } from '@content/techSkills';
import type { SVGFileType } from './index';

export type SkillRating = 1 | 2 | 3 | 4 | 3.5 | 0.5 | 1.5 | 2.5 | 4.5 | 5;

export type SkillInfo = {
  title: string;
  description: (_props: Record<string, any>) => any;
  imageSrc: SVGFileType;
  imageAlt: string;
  href: string;
  rating: SkillRating;
};

export type TechSkillItems = {
  da: Record<TechSkill, SkillInfo>;
  en: Record<TechSkill, SkillInfo>;
};

export type SkillDescriptions = Record<
  TechSkill,
  { description: (_props: Record<string, any>) => any }
>;

export type SkillRatings = Record<TechSkill, { rating: SkillRating }>;
