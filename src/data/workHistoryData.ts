export type WorkExperience = {
  id: string;
  title: string;
  company: string;
  period: string;
  /** Short line for timeline summary (scannable). */
  summary: string;
  achievements: string[];
};

/**
 * Work history aligned with Bold.pro résumé (elite-mob-260202182429).
 * Keep dates and summaries in sync when the résumé changes.
 */
export const workExperiences: WorkExperience[] = [
  {
    id: 'freelance',
    title: 'Full-Stack Software Developer',
    company: 'Freelance',
    period: 'MAY 2011 - PRESENT',
    summary: 'Independent delivery across web, mobile, and backend for global clients.',
    achievements: [
      'Delivered 100+ production-ready web, mobile, and backend applications for startups and established businesses.',
      'Designed scalable system architectures, reusable components, and clean APIs across multiple industries.',
      'Worked directly with founders, designers, and product teams to turn ideas into reliable, user-focused software.',
    ],
  },
  {
    id: 'sesh',
    title: 'Senior Mobile Developer',
    company: 'Sesh Women Fitness / Contract',
    period: 'JUN 2025 - NOV 2025',
    summary: 'Major app updates, design system refresh, and monetization integrations.',
    achievements: [
      'Collaborated with a high-performing engineering team to deliver major updates across iOS and Android applications.',
      "Led a full refresh of the app's design system to improve usability, accessibility, and visual consistency.",
      'Enhanced core workout features to improve performance, scalability, and long-term maintainability.',
      'Integrated Superwall for paywall management, Stripe for subscription payments, and personalized workout algorithms based on user goals and fitness levels.',
      'Managed features from design through deployment, ensuring a smooth user experience and high-quality code.',
      'Worked closely with the design team to maintain consistent use of the design system across the application.',
    ],
  },
  {
    id: 'krackwins',
    title: 'Lead Software Developer',
    company: 'KrackWins / Contract',
    period: 'DEC 2023 - AUG 2025',
    summary: 'Full platform: web, admin, APIs, and native apps.',
    achievements: [
      'Led end-to-end development of the KrackWins platform with a high-performing engineering team.',
      'Built and shipped the full public website, admin panel, backend APIs, and iOS and Android applications.',
      'Improved system performance and reliability, contributing to a stronger user experience and revenue growth.',
    ],
  },
  {
    id: 'troutroutes',
    title: 'Full-Stack Software Developer',
    company: 'TroutRoutes / OnX / Contract',
    period: 'APR 2024 - MAY 2025',
    summary: 'Mapping-heavy web and Android work with auth and payments.',
    achievements: [
      'Worked closely with TroutRoutes and OnX engineering teams to enhance web and Android mapping applications.',
      'Upgraded MapView functionality, including map interactions, tagging, route drawing, and custom markers.',
      'Introduced a new authentication system and integrated Stripe for payments.',
      'Resolved critical bugs and optimized map-based features for performance and stability.',
    ],
  },
  {
    id: 'checksammy',
    title: 'Lead Mobile Developer',
    company: 'CheckSammy / Contract',
    period: 'JUN 2024 - JAN 2025',
    summary: 'Greenfield iOS and Android apps with backend coordination.',
    achievements: [
      'Built the entire CheckSammy mobile platform from scratch for iOS and Android.',
      'Worked closely with PrimeAI, CheckSammy product teams, and backend developers to deliver production-ready applications.',
      'Architected scalable mobile codebases and shipped fully functional apps to production.',
    ],
  },
  {
    id: 'rebound',
    title: 'Software Developer',
    company: 'Rebound Dynamics / Contract',
    period: 'FEB 2023 - MAY 2024',
    summary: 'Internal logistics and warehouse mobile tooling.',
    achievements: [
      'Built internal mobile applications used by local warehouse teams to support daily operations.',
      'Implemented features for inventory tracking, workflow efficiency, and logistics support.',
      'Collaborated with internal teams to align mobile tools with operational requirements.',
    ],
  },
  {
    id: 'elk',
    title: 'Lead Software Developer',
    company: 'ELK Products / Contract',
    period: 'OCT 2021 - JAN 2024',
    summary: 'Home and business automation apps; promoted to lead.',
    achievements: [
      'Built full-featured iOS and Android applications for home and business automation systems.',
      'Developed software supporting security cameras, Z-Wave devices, alarms, lighting, garage doors, panels, and controllers.',
      'Worked closely with an experienced internal team and was promoted to Lead Developer based on technical leadership and delivery.',
    ],
  },
  {
    id: 'hive',
    title: 'Lead Mobile Developer',
    company: 'Hive Social / Contract',
    period: 'OCT 2019 - MAY 2021',
    summary: 'Sole mobile developer; massive scale and viral growth.',
    achievements: [
      'Built the Hive Social mobile application from the ground up as the sole mobile developer.',
      'Worked directly with CEO Kassandra Pop and the design team to shape the product vision and execution.',
      'Scaled the app to 2M+ users, including a viral surge of 200K+ users in a single night.',
      'Reached top App Store rankings, temporarily surpassing Facebook during peak growth.',
    ],
  },
  {
    id: 'pod',
    title: 'Senior Software Developer',
    company: 'POD.io / Contract',
    period: 'JUN 2019 - SEP 2019',
    summary: 'Large-scale social product on iOS and Android.',
    achievements: [
      'Worked with a distributed European engineering team on a large-scale, LinkedIn-like social platform.',
      'Contributed to iOS and Android mobile applications serving millions of users.',
      'Improved app performance, reliability, and API communication under tight timelines.',
    ],
  },
  {
    id: 'intellibrush',
    title: 'Lead Software Developer',
    company: 'IntelliBrush / Contract',
    period: 'SEP 2018 - JAN 2019',
    summary: 'BLE-connected hardware apps for iOS and Android.',
    achievements: [
      'Built native iOS and Android applications for e-brush hardware using BLE communication.',
      'Implemented real-time brush handling, device connectivity, and performance-optimized rendering.',
    ],
  },
  {
    id: 'eplan',
    title: 'Software Developer',
    company: 'EPLAN P8 / Contract',
    period: 'NOV 2013 - JUN 2016',
    summary: 'AutoCAD-integrated tooling for electrical engineering.',
    achievements: [
      'Developed AutoCAD-integrated applications supporting electrical engineering workflows.',
      'Enhanced drawing tools, automation features, and system integrations in an engineering environment.',
    ],
  },
];
