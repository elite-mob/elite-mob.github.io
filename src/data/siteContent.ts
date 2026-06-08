/**
 * Homepage marketing copy and structured content.
 * Update trust bullets when you have client-approved metrics to cite publicly.
 */

export const heroContent = {
  eyebrow: 'Full-Stack Developer • Web, Mobile & AI',
  headline: 'I build scalable digital products that look sharp and perform.',
  supporting:
    'Production web and mobile, Node-backed services, and AI where it fits the product, with fast UX under load and APIs that stay maintainable as you grow.',
  primaryCta: 'View Case Studies',
  trustBullets: [
    '10+ years shipping live products: marketplaces, health, social, and device-adjacent apps',
    'Single technical owner from architecture through release, async-friendly, US/EU-overlap friendly',
    'NDAs respected; references when confidentiality allows',
  ],
} as const;

export const aboutContent = {
  intro:
    "I'm Hans Chan, with 10+ years shipping full-stack web, mobile, and AI for startups through large platforms, owning architecture to release with clear, direct communication.",
  highlights: [
    {
      title: 'End-to-end ownership',
      body: 'Discovery through launch (roadmaps, APIs, and client apps) so you get one accountable lead instead of a hand-off chain.',
    },
    {
      title: 'Built for real users',
      body: 'Performance, accessibility, and clarity under load: patterns that survive traffic spikes, store reviews, and the next developer.',
    },
    {
      title: 'Trust by default',
      body: 'Written updates, scoped proposals, and confidentiality treated as seriously as the code. NDAs are normal.',
    },
  ] as const,
  /** "How I work" (development principles, distinct from logistics). */
  principles: [
    {
      title: 'Clarity before code',
      body: 'I align on outcomes and constraints early so we build the right thing, not the busiest backlog.',
    },
    {
      title: 'Small, shippable milestones',
      body: 'Work breaks into verifiable slices: demoable progress, lower risk, faster feedback.',
    },
    {
      title: 'Production is the bar',
      body: 'Observability, edge cases, and maintainability aren’t polish; they’re part of the first release.',
    },
  ] as const,
} as const;

export const contactCtaContent = {
  heading: "Let's build something valuable.",
  supporting:
    'Send the problem, stack, and timeline, and I will reply with a concrete next step, not a generic autoresponder.',
  replyWindow: 'Typically replies within 24-48 hours on business days.',
} as const;

/** Copy for optional booking link (`VITE_SCHEDULE_MEETING_URL`). */
export const scheduleMeetingContent = {
  ctaLabel: 'Schedule a meeting',
  contactCardTitle: 'Book a call',
  contactCardSupporting: 'Pick a time that works across timezones (opens your scheduler in a new tab).',
} as const;

/**
 * Fallback when a project has neither `resultMetric` nor `outcomeHighlight` in portfolioData.
 * Prefer outcomeHighlight or resultMetric per project for stronger portfolio cards.
 */
export const caseStudyResultPlaceholder =
  'Add a client-approved KPI on this project (users, revenue, latency, uptime, or similar).';

/** Footer one-line tagline (location + role). */
export const footerTagline = 'Full-stack developer · Web, Mobile & AI';

/**
 * Homepage trust strip (below hero). Optional: swap for logo assets when approved.
 */
/** Homepage experience / work history section. */
export const workHistoryContent = {
  eyebrow: 'EXPERIENCE',
  supporting:
    'Full-stack delivery across web, mobile, and backend, from solo ownership to leading small teams on contract and product work.',
} as const;

export const trustStripContent = {
  eyebrow: 'SELECTED COLLABORATIONS',
  supporting: 'Teams and products behind shipped work.',
  collaborationNames: [
    'TroutRoutes',
    'Sesh Fitness',
    'Serve',
    'CheckSammy',
    'PrimeAI',
    'Krackwins'
  ] as const,
  footnote: 'From shipped projects.',
} as const;

/** Portfolio chatbot copy (scoped assistant, not general ChatGPT). */
export const chatbotCopy = {
  launcherLabel: 'Ask about my work',
  title: 'Portfolio assistant',
  subtitle: 'Questions about my projects, skills, and booking a call.',
  welcome:
    'Hi, I can answer questions about my portfolio and experience, or help you book a call via Calendly. What would you like to know?',
  quickActions: [
    { label: 'Book a call', message: 'I want to schedule a meeting' },
    { label: 'Skills & stack', message: 'What technologies do you work with?' },
    { label: 'AI projects', message: 'Tell me about your AI projects' },
  ] as const,
  offTopic:
    'I’m a portfolio assistant, I only cover this site’s work and booking a call. Try “What mobile apps are in the portfolio?” or “Book a meeting”.',
  unclear:
    'I can answer questions about projects and experience on this site, or help you book a call. Which do you need?',
  apiUnavailable:
    'Project Q&A is temporarily unavailable. Use the contact form or book a call link on the site.',
  scheduleUnavailable:
    'Scheduling isn’t configured here. Please use the contact form on the homepage.',
  navigatePrefix: 'Opening ',
  thinking: 'Looking that up…',
  schedule: {
    prompts: {
      start: 'Great, I’ll help you book a call. First, what’s your name?',
      name: 'Thanks! What email should we use for the invite?',
      email: 'What would you like to discuss on the call? (e.g. new app, consulting, role)',
      topic: 'What timezone are you in? (helps when picking a slot)',
      timezone: 'Almost done, pick a time on the next screen.',
      complete: (name: string, topic: string) =>
        `Thanks, ${name}. Topic: ${topic}. Open Calendly below to choose a time, your name and email will be prefilled.`,
    },
    openCalendlyLabel: 'Open Calendly to pick a time',
    skipTopic: 'skip',
    errors: {
      nameMin: 'Name must be at least 2 characters.',
      nameMax: 'Name must be less than 100 characters.',
      emailInvalid: 'Please enter a valid email address.',
      emailMax: 'Email must be less than 255 characters.',
    },
  },
} as const;
