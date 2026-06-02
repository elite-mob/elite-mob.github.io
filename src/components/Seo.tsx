import { Helmet } from 'react-helmet-async';
import {
  SITE_URL,
  SITE_BRAND,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  absoluteUrl,
  ogImageUrl,
} from '@/lib/site';

type SeoProps = {
  title?: string;
  description?: string;
  /** Path or full URL for og:image / twitter:image */
  image?: string;
  /** Alt text for social preview images (accessibility + some platforms) */
  imageAlt?: string;
  /** Canonical path (e.g. `/project/web-1`) or full URL */
  canonicalPath?: string;
  /** noindex for rare pages */
  noindex?: boolean;
};

export function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image,
  imageAlt = 'Full-stack developer portfolio preview',
  canonicalPath,
  noindex = false,
}: SeoProps) {
  const ogImage = image ? ogImageUrl(image) : absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  const canonical = canonicalPath
    ? canonicalPath.startsWith('http')
      ? canonicalPath
      : absoluteUrl(canonicalPath)
    : SITE_URL;

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description.slice(0, 320)} />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_BRAND} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description.slice(0, 300)} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={imageAlt.slice(0, 200)} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description.slice(0, 200)} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={imageAlt.slice(0, 200)} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
