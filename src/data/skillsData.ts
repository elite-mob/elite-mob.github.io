/**
 * Grouped tech stack for the Skills section (proficiency bars).
 * Levels are self-assessed for production work — adjust to stay accurate.
 */

export type TechCategoryId = 'frontend' | 'backend' | 'mobile' | 'aiData' | 'devops';

export type ProficiencyTier = 'Expert' | 'Advanced' | 'Proficient' | 'Capable';

export type TechSkill = {
  name: string;
  /** 0–100, shown as a filled bar when the section enters view */
  level: number;
};

export type TechCategory = {
  id: TechCategoryId;
  label: string;
  items: readonly TechSkill[];
};

export function getProficiencyTier(level: number): ProficiencyTier {
  if (level >= 90) return 'Expert';
  if (level >= 80) return 'Advanced';
  if (level >= 70) return 'Proficient';
  return 'Capable';
}

export const proficiencyLegend: readonly { tier: ProficiencyTier; range: string }[] = [
  { tier: 'Expert', range: '90–100%' },
  { tier: 'Advanced', range: '80–89%' },
  { tier: 'Proficient', range: '70–79%' },
  { tier: 'Capable', range: '60–69%' },
] as const;

export const techStackGroups: readonly TechCategory[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    items: [
      { name: 'TypeScript', level: 95 },
      { name: 'JavaScript', level: 95 },
      { name: 'React', level: 95 },
      { name: 'Next.js', level: 90 },
      { name: 'Vue.js', level: 85 },
      { name: 'Tailwind CSS', level: 92 },
      { name: 'HTML5 & CSS3', level: 96 },
      { name: 'Vite', level: 92 },
      { name: 'Redux / Zustand', level: 88 },
      { name: 'GraphQL (client)', level: 85 },
      { name: 'Responsive & a11y', level: 92 },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    items: [
      { name: 'Node.js', level: 95 },
      { name: 'Express', level: 92 },
      { name: 'REST APIs', level: 95 },
      { name: 'GraphQL', level: 88 },
      { name: 'PostgreSQL', level: 88 },
      { name: 'MongoDB', level: 85 },
      { name: 'Firebase', level: 90 },
      { name: 'Prisma', level: 85 },
      { name: 'Redis', level: 82 },
      { name: 'Stripe', level: 88 },
      { name: 'Auth & sessions', level: 90 },
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile',
    items: [
      { name: 'React Native', level: 95 },
      { name: 'Expo', level: 90 },
      { name: 'iOS & Android shipping', level: 92 },
      { name: 'Swift', level: 85 },
      { name: 'Kotlin', level: 82 },
      { name: 'Flutter', level: 80 },
      { name: 'SwiftUI', level: 80 },
      { name: 'Jetpack Compose', level: 78 },
      { name: 'Push notifications', level: 88 },
      { name: 'App Store & Play Console', level: 90 },
      { name: 'Offline-first & deep linking', level: 88 },
    ],
  },
  {
    id: 'aiData',
    label: 'AI / Data',
    items: [
      { name: 'OpenAI API', level: 90 },
      { name: 'Prompt engineering', level: 92 },
      { name: 'RAG & embeddings', level: 88 },
      { name: 'Python', level: 88 },
      { name: 'LangChain', level: 85 },
      { name: 'Claude / Gemini APIs', level: 86 },
      { name: 'Vector databases', level: 85 },
      { name: 'Automation pipelines', level: 85 },
      { name: 'NLP & computer vision', level: 80 },
      { name: 'TensorFlow', level: 75 },
      { name: 'PyTorch', level: 72 },
    ],
  },
  {
    id: 'devops',
    label: 'DevOps / Cloud',
    items: [
      { name: 'CI/CD', level: 90 },
      { name: 'GitHub Actions', level: 92 },
      { name: 'Docker', level: 88 },
      { name: 'Vercel', level: 90 },
      { name: 'AWS', level: 85 },
      { name: 'Performance tuning', level: 92 },
      { name: 'Monitoring & logging', level: 88 },
      { name: 'Vitest / Jest', level: 90 },
      { name: 'Azure', level: 78 },
      { name: 'Infrastructure as code', level: 80 },
    ],
  },
] as const;
