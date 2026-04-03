/**
 * Testimonials for the homepage Reviews section (`ReviewsSection`).
 *
 * Attributions use first name + last initial (e.g. Derek S.) plus role only; no company names.
 * Edit quotes/initials when clients sign off or NDAs require changes.
 */
export type Testimonial = {
  quote: string;
  /** Shown publicly: first name + last initial, then role where applicable. */
  attribution: string;
  context?: string;
  /** Two-letter avatar (typically first + last initial). */
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'Excellent work on a long-term, highly complex project. Hans is a very strong mobile developer and we highly recommend him. Thanks for a great project!',
    attribution: 'Derek S. · CIO',
    initials: 'DS',
    context: 'iOS & Android',
  },
  {
    quote:
      'Working with Hans was a great experience. He helped us launch our app on time with all the features we needed, and his expertise made a real impact. Since launch, we’ve seen a 30% increase in user engagement, which speaks for itself. We couldn’t be happier with the final product!',
    attribution: 'Louis L. · Co-Founder',
    initials: 'LL',
    context: 'Android',
  },
  {
    quote:
      'I’ve hired Hans a few times for various mobile-related projects. He is wonderful and I enjoy working with him. I would highly recommend him and will almost certainly be hiring him again.',
    attribution: 'Kevin L. · Founder',
    initials: 'KL',
    context: 'iOS & Android',
  },
  {
    quote:
      'Hans was wonderful and we hope to keep working with him for future development of our app!',
    attribution: 'Scott M. · Co-Founder & COO',
    initials: 'SM',
    context: 'iOS & Android',
  },
  {
    quote:
      'Working with Hans has been a game changer. He made our life incredibly easy! Every project was completed on time and worked perfectly the first time with surprising accuracy. His attention to detail and commitment to quality were evident throughout the entire process. He consistently met every deadline and even went above and beyond to ensure everything ran smoothly post-launch. Highly recommended!',
    attribution: 'Michael B. · President',
    initials: 'MB',
    context: 'iOS & Android',
  },
  {
    quote:
      'Hans has been maintaining my app on both Google Play and Apple Store and has been very responsive and quick to address any and all issues, including user feedback, in...',
    attribution: 'Ben K. · Founder',
    initials: 'BK',
    context: 'iOS & Android',
  },
  {
    quote:
      'I couldn’t have asked for a better partner to bring our mobile app to life. Hans took the time to really understand our needs and delivered something even better than we imagined. He was easy to communicate with, always responsive, and his expertise added value at every stage. I’d gladly work with him again.',
    attribution: 'Kate · Founder',
    initials: 'KA',
    context: 'iOS',
  },
  {
    quote:
      'Working with Hans was a very fluid and easy process - he responded quickly and clearly to my ideas and questions and worked collaboratively to help me develop a custom app...',
    attribution: 'Lindsay · Founder',
    initials: 'LI',
    context: 'iOS & Android',
  },
  {
    quote:
      'Professional, reliable, and incredibly talented, Hans exceeded all expectations. He delivered an app our users genuinely love, and the entire process felt smooth and well-managed from start to finish.',
    attribution: 'Thomas N. · Founder',
    initials: 'TN',
    context: 'iOS & Android',
  },
];
