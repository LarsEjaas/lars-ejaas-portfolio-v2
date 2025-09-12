/**
 * To add a new tech skill, add a new key to the `techSkillEntries` array, info about route and image, etc. to the techSkillInfo object and a description component in english and danish in the content folder.
 */
export const techSkillEntries = [
  //Core Languages & Fundamentals:
  'javascript',
  'typescript',
  'html',
  'css',
  //Frontend Frameworks & Libraries:
  'react',
  'react-native',
  'nextjs',
  'astro',
  'gatsby',
  //Backend & Runtime Tools:
  'nodejs',
  //Core Development Tools:
  'git',
  'vscode',
  'github',
  'gitlab',
  //Styling & UI Libraries:
  'tailwind',
  'sass',
  'styled-components',
  'mantine',
  //Build & Automation Tools:
  'vite',
  'webpack',
  'turborepo',
  //Testing & QA Tools:
  'jest',
  'playwright',
  'react-testing-library',
  //State & Data Management:
  'redux',
  'tanstack',
  'apollo-client',
  'graphql',
  'graphql-codegen',
  //Content Management Systems:
  'wordpress',
  'wp-graphql',
  //DevOps, Deployment & CI/CD:
  'docker',
  'bash',
  //Design & Graphics:
  'figma',
  'svg',
  'inkscape',
  //UI Quality & Accessibility:
  'storybook',
  'accessibility',
  //Search Tools:
  'algolia',
] as const;

export const techSkillCategories = [
  'core_languages_and_fundamentals',
  'frontend_frameworks_and_libraries',
  'backend_and_runtime_tools',
  'core_development_tools',
  'styling_and_ui_libraries',
  'build_and_automation_tools',
  'testing_and_qa_tools',
  'state_and_data_management',
  'content_management_systems',
  'devops_deployment_and_ci_cd',
  'design_and_graphics',
  'ui_quality_and_accessibility',
  'search_tools',
] as const;
