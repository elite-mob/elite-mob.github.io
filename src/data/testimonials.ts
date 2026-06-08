/**
 * Testimonials for the homepage Reviews section (`ReviewsSection`).
 *
 * Attributions use first name + last initial (e.g. Derek S.) plus role only; no company names.
 * Quotes use he/him or they/them instead of the developer's name.
 */
export type Testimonial = {
  quote: string;
  /** Shown publicly: first name + last initial, then role where applicable. */
  attribution: string;
  context?: string;
  /** Two-letter avatar (typically first + last initial). */
  initials: string;
  /** Optional public LinkedIn profile (link + profile photo when available). */
  linkedinUrl?: string;
  /** Override auto-resolved LinkedIn photo (e.g. if sync could not fetch a public image). */
  avatarUrl?: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'Excellent work on a long-term, highly complex project. He is a very strong mobile developer and we highly recommend him. Thanks for a great project!',
    attribution: 'Derek S. · CTO',
    initials: 'DS',
    context: 'iOS & Android',
    linkedinUrl: 'https://www.linkedin.com/in/dereksudduth/',
  },
  {
    quote:
      'Working with him was a great experience. He helped us launch our app on time with all the features we needed, and his expertise made a real impact. Since launch, we’ve seen a 30% increase in user engagement, which speaks for itself. We couldn’t be happier with the final product!',
    attribution: 'Louis L. · Co-Founder/CEO',
    initials: 'LL',
    context: 'Android',
    linkedinUrl: 'https://www.linkedin.com/in/louis-long/',
  },
  {
    quote:
      'I’ve hired him a few times for various mobile-related projects. He is wonderful and I enjoy working with him. I would highly recommend him and will almost certainly be hiring him again.',
    attribution: 'Kevin L. · Project Lead',
    initials: 'KL',
    context: 'iOS & Android',
    linkedinUrl: 'https://www.linkedin.com/in/kevin-ludlow/'
  },
  {
    quote:
      'He was wonderful and we hope to keep working with him for future development of our app!',
    attribution: 'Scott L. · Director',
    initials: 'SL',
    context: 'iOS & Android',
    linkedinUrl: 'https://www.linkedin.com/in/jscottelam'
  },
  {
    quote:
      'Working with him has been a game changer. He made our life incredibly easy! Every project was completed on time and worked perfectly the first time with surprising accuracy. His attention to detail and commitment to quality were evident throughout the entire process. He consistently met every deadline and even went above and beyond to ensure everything ran smoothly post-launch. Highly recommended!',
    attribution: 'Mike B. · President',
    initials: 'MB',
    context: 'iOS & Android',
    linkedinUrl: 'https://www.linkedin.com/in/mike-burrell-9105423a/'
  },
  {
    quote:
      'They have been maintaining my app on both Google Play and Apple Store and have been very responsive and quick to address any and all issues, including user feedback, in...',
    attribution: 'William K. · Founder',
    initials: 'WK',
    context: 'iOS & Android',
    linkedinUrl: 'https://www.linkedin.com/in/william-krackomberger-7044b51b5/'
  },
  {
    quote:
      'I couldn’t have asked for a better partner to bring our app to life. He took the time to really understand our needs and delivered something even better than we imagined. He was easy to communicate with, always responsive, and his expertise added value at every stage. I’d gladly work with him again.',
    attribution: 'Zachary P. · Founder',
    initials: 'ZP',
    context: 'Web & iOS & Android',
    linkedinUrl: 'https://www.linkedin.com/in/popezachary/'
  },
  {
    quote:
      'Working with them was a very fluid and easy process. They responded quickly and clearly to my ideas and questions and worked collaboratively to help me develop a custom app...',
    attribution: 'Lindsay B. · Founder',
    initials: 'LB',
    context: 'iOS & Android',
    linkedinUrl: 'https://www.linkedin.com/in/lindsaybuck/'
  },
  {
    quote:
      'Professional, reliable, and incredibly talented. He exceeded all expectations. He delivered an app our users genuinely love, and the entire process felt smooth and well-managed from start to finish.',
    attribution: 'Jeremy F. · CTO',
    initials: 'JF',
    context: 'Web',
    linkedinUrl: 'https://www.linkedin.com/in/jeremy-freund-a4079313/'
  },
];
