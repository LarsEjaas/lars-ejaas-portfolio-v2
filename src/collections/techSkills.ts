import type { SkillInfo, TechSkillItems } from '@customTypes/skillTypes';

import { techSkillEntries } from './techSkillTypes.mts';
import { useTranslations } from '@i18n/utils';

export type TechSkill = (typeof techSkillEntries)[number];

const techSkillInfo: Record<TechSkill, Omit<SkillInfo, 'description'>> = {
  accessibility: {
    title: 'Accessibility',
    imageSrc: 'accessibility.svg',
    imageAlt: 'Accessibility logo',
    href: 'accessibility',
    rating: 3,
    category: 'ui_quality_and_accessibility',
  },
  algolia: {
    title: 'Algolia',
    imageSrc: 'algolia.svg',
    imageAlt: 'Algolia logo',
    href: 'algolia',
    rating: 3,
    category: 'search_tools',
  },
  ['apollo-client']: {
    title: 'Apollo Client',
    imageSrc: 'apolloclient.svg',
    imageAlt: 'Apollo Client logo',
    href: 'apollo-client',
    rating: 4,
    category: 'state_and_data_management',
  },
  astro: {
    title: 'Astro',
    imageSrc: 'astro.svg',
    imageAlt: 'Astro logo',
    href: 'astro',
    rating: 3,
    category: 'frontend_frameworks_and_libraries',
  },
  bash: {
    title: 'Bash',
    imageSrc: 'bash.svg',
    imageAlt: 'Bash logo',
    href: 'bash',
    rating: 2,
    category: 'devops_deployment_and_ci_cd',
  },
  css: {
    title: 'CSS',
    imageSrc: 'css.svg',
    imageAlt: 'CSS logo',
    href: 'css',
    rating: 4,
    category: 'core_languages_and_fundamentals',
  },
  docker: {
    title: 'Docker',
    imageSrc: 'docker.svg',
    imageAlt: 'Docker logo',
    href: 'docker',
    rating: 3,
    category: 'devops_deployment_and_ci_cd',
  },
  figma: {
    title: 'Figma',
    imageSrc: 'figma.svg',
    imageAlt: 'Figma logo',
    href: 'figma',
    rating: 3,
    category: 'design_and_graphics',
  },
  gatsby: {
    title: 'Gatsby',
    imageSrc: 'gatsby.svg',
    imageAlt: 'Gatsby logo',
    href: 'gatsby',
    rating: 3,
    category: 'frontend_frameworks_and_libraries',
  },
  git: {
    title: 'Git',
    imageSrc: 'git.svg',
    imageAlt: 'Git logo',
    href: 'git',
    rating: 3,
    category: 'core_development_tools',
  },
  github: {
    title: 'Github',
    imageSrc: 'github.svg',
    imageAlt: 'Github logo',
    href: 'github',
    rating: 4,
    category: 'core_development_tools',
  },
  gitlab: {
    title: 'Gitlab',
    imageSrc: 'gitlab.svg',
    imageAlt: 'Gitlab logo',
    href: 'gitlab',
    rating: 4,
    category: 'core_development_tools',
  },
  graphql: {
    title: 'GraphQL',
    imageSrc: 'graphql.svg',
    imageAlt: 'GraphQL logo',
    href: 'graphql',
    rating: 4,
    category: 'state_and_data_management',
  },
  ['graphql-codegen']: {
    title: 'GraphQL Codegen',
    imageSrc: 'graphqlcodegen.svg',
    imageAlt: 'GraphQL Codegen logo',
    href: 'graphql-codegen',
    rating: 4,
    category: 'state_and_data_management',
  },
  html: {
    title: 'HTML',
    imageSrc: 'html.svg',
    imageAlt: 'HTML logo',
    href: 'html',
    rating: 4,
    category: 'core_languages_and_fundamentals',
  },
  inkscape: {
    title: 'Inkscape',
    imageSrc: 'inkscape.svg',
    imageAlt: 'Inkscape logo',
    href: 'inkscape',
    rating: 3,
    category: 'design_and_graphics',
  },
  javascript: {
    title: 'JavaScript',
    imageSrc: 'javascript.svg',
    imageAlt: 'JavaScript logo',
    href: 'javascript',
    rating: 4,
    category: 'core_languages_and_fundamentals',
  },
  jest: {
    title: 'Jest',
    imageSrc: 'jest.svg',
    imageAlt: 'Jest logo',
    href: 'jest',
    rating: 3,
    category: 'testing_and_qa_tools',
  },
  mantine: {
    title: 'Mantine',
    imageSrc: 'mantine.svg',
    imageAlt: 'Mantine logo',
    href: 'mantine',
    rating: 4,
    category: 'styling_and_ui_libraries',
  },
  nextjs: {
    title: 'Next.js',
    imageSrc: 'nextjs.svg',
    imageAlt: 'Next.js logo',
    href: 'nextjs',
    rating: 4,
    category: 'frontend_frameworks_and_libraries',
  },
  nodejs: {
    title: 'Node.js',
    imageSrc: 'nodejs.svg',
    imageAlt: 'Node.js logo',
    href: 'nodejs',
    rating: 2,
    category: 'backend_and_runtime_tools',
  },
  playwright: {
    title: 'Playwright',
    imageSrc: 'playwright.svg',
    imageAlt: 'Playwright logo',
    href: 'playwright',
    rating: 3,
    category: 'testing_and_qa_tools',
  },
  react: {
    title: 'React',
    imageSrc: 'react.svg',
    imageAlt: 'React logo',
    href: 'react',
    rating: 4.5,
    category: 'frontend_frameworks_and_libraries',
  },
  ['react-native']: {
    title: 'React Native',
    imageSrc: 'reactnative.svg',
    imageAlt: 'React Native logo',
    href: 'react-native',
    rating: 2,
    category: 'frontend_frameworks_and_libraries',
  },
  ['react-testing-library']: {
    title: 'React Testing Library',
    imageSrc: 'reacttestinglibrary.svg',
    imageAlt: 'React Testing Library logo',
    href: 'react-testing-library',
    rating: 4,
    category: 'testing_and_qa_tools',
  },
  redux: {
    title: 'Redux',
    imageSrc: 'redux.svg',
    imageAlt: 'Redux logo',
    href: 'redux',
    rating: 3,
    category: 'state_and_data_management',
  },
  sass: {
    title: 'Sass',
    imageSrc: 'sass.svg',
    imageAlt: 'Sass logo',
    href: 'sass',
    rating: 4,
    category: 'styling_and_ui_libraries',
  },
  storybook: {
    title: 'Storybook',
    imageSrc: 'storybook.svg',
    imageAlt: 'Storybook logo',
    href: 'storybook',
    rating: 2.5,
    category: 'ui_quality_and_accessibility',
  },
  ['styled-components']: {
    title: 'Styled Components',
    imageSrc: 'styledcomponents.svg',
    imageAlt: 'Styled Components logo',
    href: 'styled-components',
    rating: 4,
    category: 'styling_and_ui_libraries',
  },
  svg: {
    title: 'SVG',
    imageSrc: 'svg.svg',
    imageAlt: 'SVG logo',
    href: 'svg',
    rating: 4,
    category: 'design_and_graphics',
  },
  tailwind: {
    title: 'Tailwind',
    imageSrc: 'tailwind.svg',
    imageAlt: 'Tailwind logo',
    href: 'tailwind',
    rating: 3,
    category: 'styling_and_ui_libraries',
  },
  tanstack: {
    title: 'TanStack',
    imageSrc: 'tanstack.svg',
    imageAlt: 'TanStack logo',
    href: 'tanstack',
    rating: 3,
    category: 'state_and_data_management',
  },
  turborepo: {
    title: 'Turborepo',
    imageSrc: 'turborepo.svg',
    imageAlt: 'Turborepo logo',
    href: 'turborepo',
    rating: 2,
    category: 'build_and_automation_tools',
  },
  typescript: {
    title: 'TypeScript',
    imageSrc: 'typescript.svg',
    imageAlt: 'TypeScript logo',
    href: 'typescript',
    rating: 4,
    category: 'core_languages_and_fundamentals',
  },
  vite: {
    title: 'Vite',
    imageSrc: 'vite.svg',
    imageAlt: 'Vite logo',
    href: 'vite',
    rating: 2,
    category: 'build_and_automation_tools',
  },
  vscode: {
    title: 'VSCode',
    imageSrc: 'vscode.svg',
    imageAlt: 'VSCode logo',
    href: 'vscode',
    rating: 4,
    category: 'core_development_tools',
  },
  webpack: {
    title: 'Webpack',
    imageSrc: 'webpack.svg',
    imageAlt: 'Webpack logo',
    href: 'webpack',
    rating: 2,
    category: 'build_and_automation_tools',
  },
  wordpress: {
    title: 'WordPress',
    imageSrc: 'wordpress.svg',
    imageAlt: 'WordPress logo',
    href: 'wordpress',
    rating: 3,
    category: 'content_management_systems',
  },
  ['wp-graphql']: {
    title: 'WPGraphQL',
    imageSrc: 'wpgraphql.svg',
    imageAlt: 'WPGraphQL logo',
    href: 'wp-graphql',
    rating: 3.5,
    category: 'content_management_systems',
  },
};
/**
 * Returns a collection of tech skills with localized descriptions for the specified language.
 * Takes the base tech skill data and enhances it with translated descriptions and skill ratings.
 *
 * @returns An object mapping tech skill identifiers to their complete information
 * ordered according to the techSkillEntries array.
 */
export const getTechSkills = (language: 'da' | 'en'): TechSkillItems => {
  const t = useTranslations(language, 'skillCards');
  const t_cat = useTranslations(language, 'skills');
  // Helper function to create skills for a specific language
  const createLanguageSkills = () => {
    const skillsObject = Object.entries(techSkillInfo).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          ...value,
          description: t(key as TechSkill),
          category: t_cat(value.category),
        },
      }),
      {} as Record<TechSkill, SkillInfo>
    );

    // Sort according to techSkillEntries order
    return techSkillEntries.reduce(
      (acc, skill) => ({
        ...acc,
        [skill]: skillsObject[skill],
      }),
      {} as Record<TechSkill, SkillInfo>
    );
  };

  return createLanguageSkills();
};

/** Returns an array of entries for the tech skills in the given language */
export const getTechSkillEntries = (lang: 'en' | 'da') =>
  Object.entries(getTechSkills(lang)).map(([_key, value]) => value);
