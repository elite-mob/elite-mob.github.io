/**
 * Homepage marketing copy and structured content.
 * TODO: Revisit metrics in trust bullets when you have figures you can cite publicly.
 */

export const heroContent = {
  eyebrow: 'Full-Stack Engineer • Web, Mobile & AI',
  headline: 'I build scalable digital products that look sharp and perform.',
  supporting:
    'Production web and mobile, Node-backed services, and AI where it fits the product, with fast UX under load and APIs that stay maintainable as you grow.',
  primaryCta: 'View Case Studies',
  trustBullets: [
    '10+ years shipping live products: marketplaces, health, social, and device-adjacent apps',
    'Based in China; single technical owner from architecture through release, async-friendly, US/EU-overlap friendly',
    'NDAs respected; references when confidentiality allows',
  ],
} as const;

export const aboutContent = {
  intro:
    "I'm Hans Chan, based in China, with 10+ years shipping full-stack web, mobile, and AI for startups through large platforms, owning architecture to release with clear, direct communication.",
  highlights: [
    {
      title: 'End-to-end ownership',
      body: 'Discovery through launch (roadmaps, APIs, and client apps) so you get one accountable lead instead of a hand-off chain.',
    },
    {
      title: 'Built for real users',
      body: 'Performance, accessibility, and clarity under load: patterns that survive traffic spikes, store reviews, and the next engineer.',
    },
    {
      title: 'Trust by default',
      body: 'Written updates, scoped proposals, and confidentiality treated as seriously as the code. NDAs are normal.',
    },
  ] as const,
  /** "How I work" (engineering principles, distinct from logistics). */
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

/**
 * Fallback when a project has neither `resultMetric` nor `outcomeHighlight` in portfolioData.
 * TODO: Prefer filling outcomeHighlight or resultMetric per project for ship-quality cards.
 */
export const caseStudyResultPlaceholder =
  'Add a client-approved KPI on this project (users, revenue, latency, uptime, or similar).';

/** Footer one-line tagline (location + role). */
export const footerTagline = 'Full-stack engineer · China';

/**
 * Homepage trust strip (below hero). Optional: swap for logo assets when approved.
 */
export const trustStripContent = {
  eyebrow: 'SELECTED COLLABORATIONS',
  supporting: 'A sample of teams and products behind shipped work.',
  collaborationNames: [
    'OnX',
    'TroutRoutes',
    'Sesh Fitness',
    'Serve',
    'CheckSammy',
    'PrimeAI',
    'KHDev',
  ] as const,
  footnote: 'From shipped projects.',
} as const;
