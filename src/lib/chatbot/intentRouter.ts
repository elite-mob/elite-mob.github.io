import { projects } from '@/data/portfolioData';
import type { ChatIntent } from '@/lib/chatbot/types';

export type IntentClassification = {
  intent: ChatIntent;
  confidence: 'high' | 'low';
  navigateTarget?: string;
  matchedProjectId?: string;
};

const SCHEDULE_PATTERNS = [
  /\b(book|schedule|scheduling)\b.*\b(call|meeting|time|slot)\b/i,
  /\b(book|schedule)\b.*\b(with you|with hans)\b/i,
  /\b(meet|talk|speak)\b.*\b(with you|with hans)\b/i,
  /\b(set up|setup|arrange)\b.*\b(call|meeting)\b/i,
  /\bcalendly\b/i,
  /\bhire\b.*\b(you|hans)\b/i,
  /\b(lets|let's)\s+(talk|chat|meet)\b/i,
  /\bschedule\s+a\s+(call|meeting)\b/i,
  /\bbook\s+a\s+(call|meeting)\b/i,
];

const PROJECT_PATTERNS = [
  /\b(portfolio|case stud(y|ies)|projects?)\b/i,
  /\b(what|which)\b.*\b(built|shipped|worked on)\b/i,
  /\b(skills?|tech stack|technologies)\b/i,
  /\b(experience|background|expertise)\b/i,
  /\b(mobile|web|ai)\b.*\b(apps?|projects?|work)\b/i,
  /\b(testimonial|review|client)\b/i,
  /\b(react native|node\.?js|firebase|stripe)\b/i,
  /\btell me about\b/i,
  /\bdo you (have|know)\b/i,
];

const NAVIGATE_PATTERNS: { pattern: RegExp; target: string }[] = [
  { pattern: /\b(contact|get in touch|reach out|email me)\b/i, target: '/#contact' },
  { pattern: /\b(about you|about section|who are you)\b/i, target: '/#about' },
  { pattern: /\b(work history|experience section|employment history|resume|cv)\b/i, target: '/#experience' },
  {
    pattern: /\b(work history|experience section|employment history|your resume|career history)\b/i,
    target: '/#experience',
  },
  { pattern: /\b(reviews?|testimonials?)\b/i, target: '/#reviews' },
  { pattern: /\b(skills? section|tech stack section)\b/i, target: '/#skills' },
  { pattern: /\b(portfolio section|case studies|view projects)\b/i, target: '/#portfolio' },
  { pattern: /\b(home|hero)\b/i, target: '/#home' },
  { pattern: /\b(privacy|privacy policy)\b/i, target: '/privacy' },
];

const OFF_TOPIC_PATTERNS = [
  /\b(weather|recipe|joke|poem|story about)\b/i,
  /\b(homework|essay|thesis)\b/i,
  /\b(write (me )?code|debug my|fix my bug)\b/i,
  /\b(python tutorial|javascript tutorial|learn react)\b/i,
  /\b(who is the president|election|politics)\b/i,
  /\b(crypto price|stock market|betting)\b/i,
  /\b(chatgpt|openai general)\b/i,
];

const projectTitleTokens = projects.flatMap((p) => {
  const titleWords = p.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);
  return [{ id: p.id, tokens: [p.id.toLowerCase(), p.title.toLowerCase(), ...titleWords] }];
});

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function findProjectMatch(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const { id, tokens } of projectTitleTokens) {
    if (tokens.some((t) => t.length > 4 && lower.includes(t))) return id;
    if (lower.includes(id.replace(/-/g, ' ')) || lower.includes(id)) return id;
  }
  return undefined;
}

/**
 * Classify user intent without calling OpenAI.
 * Only `project` intent should trigger the chat API.
 */
export function classifyIntent(message: string): IntentClassification {
  const trimmed = message.trim();
  if (!trimmed) {
    return { intent: 'unclear', confidence: 'low' };
  }

  if (matchesAny(trimmed, OFF_TOPIC_PATTERNS)) {
    return { intent: 'off_topic', confidence: 'high' };
  }

  if (matchesAny(trimmed, SCHEDULE_PATTERNS)) {
    return { intent: 'schedule', confidence: 'high' };
  }

  const scheduleLoose = /\b(book|schedule|meeting|call|calendly|hire)\b/i.test(trimmed);
  const projectLoose = matchesAny(trimmed, PROJECT_PATTERNS);
  const projectId = findProjectMatch(trimmed);

  for (const { pattern, target } of NAVIGATE_PATTERNS) {
    if (pattern.test(trimmed) && !projectLoose) {
      return { intent: 'navigate', confidence: 'high', navigateTarget: target };
    }
  }

  if (projectId || projectLoose) {
    return {
      intent: 'project',
      confidence: projectId || matchesAny(trimmed, PROJECT_PATTERNS) ? 'high' : 'low',
      matchedProjectId: projectId,
    };
  }

  if (scheduleLoose && !projectLoose) {
    return { intent: 'schedule', confidence: 'low' };
  }

  if (/\b(show|go to|open|take me)\b/i.test(trimmed)) {
    const nav = NAVIGATE_PATTERNS.find((n) => n.pattern.test(trimmed));
    if (nav) {
      return { intent: 'navigate', confidence: 'high', navigateTarget: nav.target };
    }
  }

  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= 2 && !scheduleLoose) {
    return { intent: 'unclear', confidence: 'low' };
  }

  return { intent: 'off_topic', confidence: 'low' };
}
