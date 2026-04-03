/**
 * Grouped tech stack for the Skills section.
 * TODO: Add/remove tools to match what you want to be hired for (keep lists honest).
 */

export type TechCategoryId = 'frontend' | 'backend' | 'mobile' | 'aiData' | 'devops';

export type TechCategory = {
  id: TechCategoryId;
  label: string;
  items: readonly string[];
};

export const techStackGroups: readonly TechCategory[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    items: [
      'React',
      'Next.js',
      'Vue.js',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'HTML5',
      'CSS3',
      'SASS',
      'Redux',
      'Zustand',
      'Vite',
      'GraphQL (client)',
      'Responsive & a11y patterns',
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    items: [
      'Node.js',
      'Express',
      'REST APIs',
      'GraphQL',
      'PostgreSQL',
      'MongoDB',
      'Prisma',
      'Redis',
      'Firebase',
      'Stripe',
      'Authentication & sessions',
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile',
    items: [
      'React Native',
      'Flutter',
      'Swift',
      'Kotlin',
      'SwiftUI',
      'Jetpack Compose',
      'Expo',
      'iOS & Android',
      'Push notifications',
      'App Store & Play Console',
      'Offline-first & deep linking',
    ],
  },
  {
    id: 'aiData',
    label: 'AI / Data',
    items: [
      'Python',
      'OpenAI API',
      'Gemini',
      'Claude',
      'LangChain',
      'RAG & embeddings',
      'Prompt engineering',
      'Automation pipelines',
      'TensorFlow',
      'PyTorch',
      'NLP & computer vision',
      'Vector databases',
    ],
  },
  {
    id: 'devops',
    label: 'DevOps / Cloud',
    items: [
      'Docker',
      'AWS',
      'Azure',
      'Vercel',
      'CI/CD',
      'GitHub Actions',
      'Monitoring & logging',
      'Performance tuning',
      'Infrastructure as code',
      'Jest',
      'Vitest',
    ],
  },
] as const;
