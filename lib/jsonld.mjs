// Schema.org JSON-LD for the `json-ld` page metadata, which EDS renders as
// <script type="application/ld+json"> in the served HTML.
const SITE = 'https://attribution.now';

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: 'attribution.now',
  url: `${SITE}/`,
  logo: `${SITE}/icons/favicon.svg`,
  sameAs: ['https://github.com/keepthebyte/attribution-now'],
};

/** Homepage: the site name Google shows in results, and who publishes it. */
export function website() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: 'attribution.now',
        url: `${SITE}/`,
        publisher: { '@id': ORGANIZATION['@id'] },
      },
    ],
  });
}

/** Guides and lab pages. Dates only where data backs them, so they never go stale. */
export function article({
  path, headline, description, dateModified,
}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: `${SITE}${path}`,
    mainEntityOfPage: `${SITE}${path}`,
    image: `${SITE}/default-meta-image.png`,
    ...(dateModified && { dateModified }),
    author: ORGANIZATION,
    publisher: ORGANIZATION,
  });
}
