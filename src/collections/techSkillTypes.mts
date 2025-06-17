/**
 * To add a new tech skill, add a new key to the `techSkillEntries` array, info about route and image to the skillsObject, a rating to the `skillRatings` object and a description component in english and danish in the content folder.
 */
export const techSkillEntries = [
  //Core Languages & Fundamentals:
  'javascript',
  'typescript',
  'html',
  'css',
  //Primary Frameworks & Libraries:
  'react',
  'react-native',
  'nextjs',
  'astro',
  'gatsby',
  //Essential Development Tools:
  'git',
  'vscode',
  'github',
  'gitlab',
  //Styling & UI:
  'tailwind',
  'sass',
  'styled-components',
  'mantine',
  //Build Tools & Development:
  'vite',
  'webpack',
  'turborepo',
  //Testing:
  'jest',
  'playwright',
  'react-testing-library',
  //State Management & Data:
  'redux',
  'tanstack',
  'apollo-client',
  'graphql',
  'graphql-codegen',
  //CMS & Content:
  'wordpress',
  'wp-graphql',
  //DevOps & Deployment:
  'docker',
  'bash',
  //Design & Graphics:
  'figma',
  'svg',
  'inkscape',
  //Development Quality:
  'storybook',
  'accessibility',
  //Search & Specialized:
  'algolia',
] as const;
