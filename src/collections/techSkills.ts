import type {
  SkillInfo,
  SkillRatings,
  TechSkillItems,
} from '@customTypes/skillTypes';

import type { techSkillEntries } from './techSkillTypes.mts';
import { useTranslations } from '@i18n/utils';

export type TechSkill = (typeof techSkillEntries)[number];

const skillRatings: SkillRatings = {
  accessibility: {
    rating: 3,
  },
  algolia: {
    rating: 3,
  },
  ['apollo-client']: {
    rating: 4,
  },
  astro: {
    rating: 3,
  },
  bash: {
    rating: 2,
  },
  css: { rating: 4 },
  docker: {
    rating: 3,
  },
  figma: {
    rating: 3,
  },
  gatsby: {
    rating: 3,
  },
  git: { rating: 3 },
  github: {
    rating: 3,
  },
  gitlab: {
    rating: 4,
  },
  graphql: {
    rating: 4,
  },
  ['graphql-codegen']: {
    rating: 4,
  },
  html: {
    rating: 4,
  },
  inkscape: {
    rating: 3,
  },
  javascript: {
    rating: 4,
  },
  jest: {
    rating: 3,
  },
  mantine: {
    rating: 4,
  },
  nextjs: {
    rating: 4,
  },
  playwright: {
    rating: 3,
  },
  react: {
    rating: 4.5,
  },
  ['react-native']: {
    rating: 2,
  },
  ['react-testing-library']: {
    rating: 4,
  },
  redux: {
    rating: 3,
  },
  sass: {
    rating: 4,
  },
  storybook: {
    rating: 2.5,
  },
  ['styled-components']: {
    rating: 4,
  },
  svg: { rating: 4 },
  tailwind: {
    rating: 3,
  },
  typescript: {
    rating: 4,
  },
  vite: {
    rating: 2,
  },
  vscode: {
    rating: 4,
  },
  webpack: {
    rating: 2,
  },
  wordpress: {
    rating: 3,
  },
  ['wp-graphql']: {
    rating: 4,
  },
};

const techSkillTiles: Record<
  TechSkill,
  Omit<SkillInfo, 'description' | 'rating'>
> = {
  accessibility: {
    title: 'Accessibility',
    imageSrc: 'accessibility.svg',
    imageAlt: 'Accessibility logo',
    href: 'accessibility',
  },
  algolia: {
    title: 'Algolia',
    imageSrc: 'algolia.svg',
    imageAlt: 'Algolia logo',
    href: 'algolia',
  },
  ['apollo-client']: {
    title: 'Apollo Client',
    imageSrc: 'apolloclient.svg',
    imageAlt: 'Apollo Client logo',
    href: 'apollo-client',
  },
  astro: {
    title: 'Astro',
    imageSrc: 'astro.svg',
    imageAlt: 'Astro logo',
    href: 'astro',
  },
  bash: {
    title: 'Bash',
    imageSrc: 'bash.svg',
    imageAlt: 'Bash logo',
    href: 'bash',
  },
  css: { title: 'CSS', imageSrc: 'css.svg', imageAlt: 'CSS logo', href: 'css' },
  docker: {
    title: 'Docker',
    imageSrc: 'docker.svg',
    imageAlt: 'Docker logo',
    href: 'docker',
  },
  figma: {
    title: 'Figma',
    imageSrc: 'figma.svg',
    imageAlt: 'Figma logo',
    href: 'figma',
  },
  gatsby: {
    title: 'Gatsby',
    imageSrc: 'gatsby.svg',
    imageAlt: 'Gatsby logo',
    href: 'gatsby',
  },
  git: { title: 'Git', imageSrc: 'git.svg', imageAlt: 'Git logo', href: 'git' },
  github: {
    title: 'Github',
    imageSrc: 'github.svg',
    imageAlt: 'Github logo',
    href: 'github',
  },
  gitlab: {
    title: 'Gitlab',
    imageSrc: 'gitlab.svg',
    imageAlt: 'Gitlab logo',
    href: 'gitlab',
  },
  graphql: {
    title: 'GraphQL',
    imageSrc: 'graphql.svg',
    imageAlt: 'GraphQL logo',
    href: 'graphql',
  },
  ['graphql-codegen']: {
    title: 'GraphQL Codegen',
    imageSrc: 'graphqlcodegen.svg',
    imageAlt: 'GraphQL Codegen logo',
    href: 'graphql-codegen',
  },
  html: {
    title: 'HTML',
    imageSrc: 'html.svg',
    imageAlt: 'HTML logo',
    href: 'html',
  },
  inkscape: {
    title: 'Inkscape',
    imageSrc: 'inkscape.svg',
    imageAlt: 'Inkscape logo',
    href: 'inkscape',
  },
  javascript: {
    title: 'JavaScript',
    imageSrc: 'javascript.svg',
    imageAlt: 'JavaScript logo',
    href: 'javascript',
  },
  jest: {
    title: 'Jest',
    imageSrc: 'jest.svg',
    imageAlt: 'Jest logo',
    href: 'jest',
  },
  mantine: {
    title: 'Mantine',
    imageSrc: 'mantine.svg',
    imageAlt: 'Mantine logo',
    href: 'mantine',
  },
  nextjs: {
    title: 'Next.js',
    imageSrc: 'nextjs.svg',
    imageAlt: 'Next.js logo',
    href: 'nextjs',
  },
  playwright: {
    title: 'Playwright',
    imageSrc: 'playwright.svg',
    imageAlt: 'Playwright logo',
    href: 'playwright',
  },
  react: {
    title: 'React',
    imageSrc: 'react.svg',
    imageAlt: 'React logo',
    href: 'react',
  },
  ['react-native']: {
    title: 'React Native',
    imageSrc: 'reactnative.svg',
    imageAlt: 'React Native logo',
    href: 'react-native',
  },
  ['react-testing-library']: {
    title: 'React Testing Library',
    imageSrc: 'reacttestinglibrary.svg',
    imageAlt: 'React Testing Library logo',
    href: 'react-testing-library',
  },
  redux: {
    title: 'Redux',
    imageSrc: 'redux.svg',
    imageAlt: 'Redux logo',
    href: 'redux',
  },
  sass: {
    title: 'Sass',
    imageSrc: 'sass.svg',
    imageAlt: 'Sass logo',
    href: 'sass',
  },
  storybook: {
    title: 'Storybook',
    imageSrc: 'storybook.svg',
    imageAlt: 'Storybook logo',
    href: 'storybook',
  },
  ['styled-components']: {
    title: 'Styled Components',
    imageSrc: 'styledcomponents.svg',
    imageAlt: 'Styled Components logo',
    href: 'styled-components',
  },
  svg: { title: 'SVG', imageSrc: 'svg.svg', imageAlt: 'SVG logo', href: 'svg' },
  tailwind: {
    title: 'Tailwind',
    imageSrc: 'tailwind.svg',
    imageAlt: 'Tailwind logo',
    href: 'tailwind',
  },
  typescript: {
    title: 'TypeScript',
    imageSrc: 'typescript.svg',
    imageAlt: 'TypeScript logo',
    href: 'typescript',
  },
  vite: {
    title: 'Vite',
    imageSrc: 'vite.svg',
    imageAlt: 'Vite logo',
    href: 'vite',
  },
  vscode: {
    title: 'VSCode',
    imageSrc: 'vscode.svg',
    imageAlt: 'VSCode logo',
    href: 'vscode',
  },
  webpack: {
    title: 'Webpack',
    imageSrc: 'webpack.svg',
    imageAlt: 'Webpack logo',
    href: 'webpack',
  },
  wordpress: {
    title: 'WordPress',
    imageSrc: 'wordpress.svg',
    imageAlt: 'WordPress logo',
    href: 'wordpress',
  },
  ['wp-graphql']: {
    title: 'WPGraphQL',
    imageSrc: 'wpgraphql.svg',
    imageAlt: 'WPGraphQL logo',
    href: 'wp-graphql',
  },
};
/**
 * Returns a collection of tech skills with localized descriptions for the specified language.
 * Takes the base tech skill data and enhances it with translated descriptions and skill ratings.
 *
 * @returns An object mapping tech skill identifiers to their complete information
 */
export const getTechSkills = (language: 'da' | 'en'): TechSkillItems => {
  const t = useTranslations(language, 'skillCards');
  // Helper function to create skills for a specific language
  const createLanguageSkills = () => {
    return Object.entries(techSkillTiles).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          ...value,
          description: t(key as TechSkill),
          rating: skillRatings[key as TechSkill].rating,
        },
      }),
      {} as Record<TechSkill, SkillInfo>
    );
  };

  return createLanguageSkills();
};

/** Returns an array of entries for the tech skills in the given language */
export const getTechSkillEntries = (lang: 'en' | 'da') =>
  Object.entries(getTechSkills(lang)).map(([_key, value]) => value);
