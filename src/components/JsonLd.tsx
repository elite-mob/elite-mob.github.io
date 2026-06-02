import { PERSON_NAME, SITE_URL, SAME_AS_LINKS, ogImageUrl, DEFAULT_OG_IMAGE_PATH } from '@/lib/site';

export type BreadcrumbJsonItem = {
  name: string;
  /** Full absolute URL */
  url: string;
};
import type { Project } from '@/data/portfolioData';

/** Person + Service (JSON-LD) on the home page */
export function JsonLdHome() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: PERSON_NAME,
        url: SITE_URL,
        image: ogImageUrl(DEFAULT_OG_IMAGE_PATH),
        jobTitle: 'Full-Stack Developer',
        description:
          'Freelance full-stack engineer specializing in web, mobile, and AI. Ships production software for startups and enterprises.',
        sameAs: [...SAME_AS_LINKS],
        knowsAbout: [
          'Web Development',
          'Mobile App Development',
          'Artificial Intelligence',
          'React',
          'React Native',
          'TypeScript',
          'Node.js',
        ],
      },
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/#service`,
        name: 'Full-Stack Software Development',
        url: SITE_URL,
        image: ogImageUrl(DEFAULT_OG_IMAGE_PATH),
        provider: { '@id': `${SITE_URL}/#person` },
        serviceType: ['Custom Software Development', 'Web Development', 'Mobile App Development', 'AI Integration'],
        areaServed: {
          '@type': 'Place',
          name: 'Worldwide',
        },
        description:
          'Freelance and lead engineering for web, mobile, and AI products. From MVPs to scaled platforms.',
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/** BreadcrumbList for project detail and similar inner pages */
export function JsonLdBreadcrumbList({ items }: { items: BreadcrumbJsonItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

type JsonLdProjectProps = {
  project: Project;
  pageUrl: string;
};

export function JsonLdProject({ project, pageUrl }: JsonLdProjectProps) {
  const image = ogImageUrl(
    typeof project.imageUrl === 'string' ? project.imageUrl : String(project.imageUrl),
  );
  const appUrl = project.link ?? pageUrl;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description: project.description.slice(0, 500),
    url: appUrl,
    image,
    applicationCategory: 'DeveloperApplication',
    author: {
      '@type': 'Person',
      name: PERSON_NAME,
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/OnlineOnly',
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
