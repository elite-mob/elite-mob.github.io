import {
  aboutContent,
  contactCtaContent,
  footerTagline,
  heroContent,
  trustStripContent,
} from '@/data/siteContent';
import { techStackGroups, getProficiencyTier } from '@/data/skillsData';
import { testimonials } from '@/data/testimonials';
import { workExperiences } from '@/data/workHistoryData';
import { workHistoryContent } from '@/data/siteContent';
import type { Project } from '@/data/portfolioData';
import type { KnowledgeChunk } from '@/lib/chatbot/types';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function chunk(
  id: string,
  title: string,
  text: string,
  href?: string,
  extraKeywords: string[] = [],
): KnowledgeChunk {
  const keywords = [...new Set([...tokenize(title), ...tokenize(text), ...extraKeywords.map((k) => k.toLowerCase())])];
  return { id, title, text, href, keywords };
}

/** Build searchable knowledge chunks from portfolio site data (text only). */
export function buildKnowledgeChunks(projects: readonly Project[]): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [
    chunk(
      'site-hero',
      'About',
      [
        heroContent.eyebrow,
        heroContent.headline,
        heroContent.supporting,
        ...heroContent.trustBullets,
        footerTagline,
      ].join('\n'),
      '/#about',
      ['hans', 'chan', 'developer', 'full-stack'],
    ),
    chunk(
      'site-about',
      'How I work',
      [
        aboutContent.intro,
        ...aboutContent.highlights.map((h) => `${h.title}: ${h.body}`),
        ...aboutContent.principles.map((p) => `${p.title}: ${p.body}`),
      ].join('\n'),
      '/#about',
      ['nda', 'milestones', 'production'],
    ),
    chunk(
      'site-contact',
      'Contact and hiring',
      [contactCtaContent.heading, contactCtaContent.supporting, contactCtaContent.replyWindow].join('\n'),
      '/#contact',
      ['hire', 'contact', 'timeline', 'proposal'],
    ),
    chunk(
      'site-experience',
      'Work history',
      [
        workHistoryContent.supporting,
        ...workExperiences.map(
          (e) =>
            `${e.title} at ${e.company} (${e.period}): ${e.summary} ${e.achievements.join(' ')}`,
        ),
      ].join('\n'),
      '/#experience',
      ['experience', 'work history', 'employment', 'career', 'resume'],
    ),
    chunk(
      'site-trust',
      'Selected collaborations',
      [trustStripContent.eyebrow, trustStripContent.supporting, trustStripContent.collaborationNames.join(', ')].join(
        '\n',
      ),
      '/#portfolio',
      trustStripContent.collaborationNames.map((n) => n.toLowerCase()),
    ),
    chunk(
      'site-skills',
      'Skills and tech stack',
      techStackGroups
        .map((g) =>
          `${g.label}: ${g.items.map((i) => `${i.name} (${getProficiencyTier(i.level)})`).join(', ')}`,
        )
        .join('\n'),
      '/#skills',
      techStackGroups.flatMap((g) => [
        ...g.items.map((i) => i.name.toLowerCase()),
        g.label.toLowerCase(),
      ]),
    ),
    chunk(
      'site-reviews',
      'Client testimonials',
      testimonials
        .map((t) => `"${t.quote}" (${t.attribution}${t.context ? `; ${t.context}` : ''})`)
        .join('\n\n'),
      '/#reviews',
      ['testimonial', 'review', 'client', 'recommend'],
    ),
  ];

  for (const project of projects) {
    const parts = [
      project.title,
      project.description,
      `Category: ${project.category}`,
      `Technologies: ${project.technologies.join(', ')}`,
      project.role && `Role: ${project.role}`,
      project.duration && `Duration: ${project.duration}`,
      project.outcomeHighlight && `Outcome: ${project.outcomeHighlight}`,
      project.resultMetric && `Result: ${project.resultMetric}`,
      project.challenge && `Challenge: ${project.challenge}`,
      project.solution && `Solution: ${project.solution}`,
      project.features?.length && `Features: ${project.features.join('; ')}`,
    ].filter(Boolean);

    chunks.push(
      chunk(
        `project-${project.id}`,
        project.title,
        parts.join('\n'),
        `/project/${project.id}`,
        [
          project.id,
          project.category,
          ...project.technologies,
          ...tokenize(project.title),
        ],
      ),
    );
  }

  return chunks;
}
