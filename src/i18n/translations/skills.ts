import type { SkillCategory } from '@customTypes/skillTypes';

const enTechSkillCategories = {
  core_languages_and_fundamentals: 'Core Languages & Fundamentals',
  frontend_frameworks_and_libraries: 'Frontend Frameworks & Libraries',
  backend_and_runtime_tools: 'Backend & Runtime Tools',
  core_development_tools: 'Core Development Tools',
  styling_and_ui_libraries: 'Styling & UI Libraries',
  build_and_automation_tools: 'Build & Automation Tools',
  testing_and_qa_tools: 'Testing & QA Tools',
  state_and_data_management: 'State & Data Management',
  content_management_systems: 'Content Management Systems',
  devops_deployment_and_ci_cd: 'DevOps, Deployment & CI/CD',
  design_and_graphics: 'Design & Graphics',
  ui_quality_and_accessibility: 'UI Quality & Accessibility',
  search_tools: 'Search Tools',
} satisfies Record<SkillCategory, string>;

const enSkills = {
  skills_title: 'Skills',
  hands_on_experience_rating: 'Hands-on Experience Rating',
  browse_my_tech_skills: 'Browse my Tech Skills',
  along_the_way:
    'Along the way I’ve touched on quite a few tools!\nThis section covers some of the software, programming languages, web development tools and frameworks I’ve used most in my work.',
  one_of_the_great:
    'One of the great things about my job is that I get to tinker with all sorts of technology on a daily basis - so chances are I’m learning something new while you’re reading this...',
  read_on_to: 'Read on to learn more about the tools behind my work.',
  go_to: 'Go to',
  go_back: 'Back',
  star: 'stars',
  stars: 'stars',
  out_of: 'out of',
  explore_the_full_skill_tree: 'Explore the Full Skill Tree',
  three_label: 'Tech Skill Tree',
  jump_to_three_view: 'Jump to three view',
  ...enTechSkillCategories,
};

export const skills = {
  en: { ...enSkills },
  da: {
    skills_title: 'Kompetencer',
    hands_on_experience_rating: 'Praktisk Erfaring',
    browse_my_tech_skills: 'Gennemse mine tekniske kompetencer',
    along_the_way:
      'Undervejs som udvikler har jeg berørt en hel del forskellige værktøjer!\nDette afsnit dækker noget af den software, de programmeringssprog, webudviklingsværktøjer og frameworks, jeg har brugt mest i mit arbejde.',
    one_of_the_great:
      'En af de gode ting ved mit job er, at jeg får lov til at rode med alle former for teknologi på daglig basis - så der er gode chancer for, at jeg er ved at lære noget nyt, mens du læser dette...',
    read_on_to: 'Læs videre for at lære mere om værktøjerne bag mit arbejde.',
    go_to: 'Gå til',
    go_back: 'Tilbage',
    star: 'stjerne',
    stars: 'stjerner',
    out_of: 'ud af',
    explore_the_full_skill_tree: 'Udforsk det fulde kompetencetræ',
    three_label: 'Kompetencetræ',
    jump_to_three_view: 'Gå til kompetencetræ',
    core_languages_and_fundamentals: 'Prog. sprog & grundl. færdigheder',
    frontend_frameworks_and_libraries: 'Frontend-frameworks & -biblioteker',
    backend_and_runtime_tools: 'Backend- & runtime-miljøer',
    core_development_tools: 'Centrale udviklingsværktøjer',
    styling_and_ui_libraries: 'Styling & UI-biblioteker',
    build_and_automation_tools: 'Build-tools & automatisering',
    testing_and_qa_tools: 'Tests & kvalitetssikring',
    state_and_data_management: 'State- & datahåndtering',
    content_management_systems: 'Content Management Systemer',
    devops_deployment_and_ci_cd: 'DevOps, implementering & CI/CD',
    design_and_graphics: 'Design & grafik',
    ui_quality_and_accessibility: 'UI-kvalitet & tilgængelighed',
    search_tools: 'Søgeværktøjer',
  },
} as const satisfies Record<'en' | 'da', typeof enSkills>;
