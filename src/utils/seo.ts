/**
 * SEO utility functions for managing meta tags and structured data
 */

interface MetaTags {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
}

/**
 * Update document meta tags
 */
export function updateMetaTags(tags: MetaTags) {
  // Title
  if (tags.title) {
    document.title = tags.title;
    updateOrCreateMetaTag('og:title', tags.title);
    updateOrCreateMetaTag('twitter:title', tags.title);
  }

  // Description
  if (tags.description) {
    updateOrCreateMetaTag('description', tags.description);
    updateOrCreateMetaTag('og:description', tags.description);
    updateOrCreateMetaTag('twitter:description', tags.description);
  }

  // Keywords
  if (tags.keywords) {
    updateOrCreateMetaTag('keywords', tags.keywords);
  }

  // Author
  if (tags.author) {
    updateOrCreateMetaTag('author', tags.author);
  }

  // Image
  if (tags.image) {
    updateOrCreateMetaTag('og:image', tags.image);
    updateOrCreateMetaTag('twitter:image', tags.image);
  }

  // URL
  if (tags.url) {
    updateOrCreateMetaTag('og:url', tags.url);
    updateLinkTag('canonical', tags.url);
  }

  // Type
  if (tags.type) {
    updateOrCreateMetaTag('og:type', tags.type);
  }

  // Site Name
  if (tags.siteName) {
    updateOrCreateMetaTag('og:site_name', tags.siteName);
  }

  // Locale
  if (tags.locale) {
    updateOrCreateMetaTag('og:locale', tags.locale);
  }

  // Twitter Card
  if (tags.twitterCard) {
    updateOrCreateMetaTag('twitter:card', tags.twitterCard);
  }

  if (tags.twitterSite) {
    updateOrCreateMetaTag('twitter:site', tags.twitterSite);
  }

  if (tags.twitterCreator) {
    updateOrCreateMetaTag('twitter:creator', tags.twitterCreator);
  }
}

/**
 * Update or create a meta tag
 */
function updateOrCreateMetaTag(name: string, content: string) {
  const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
  const attribute = isProperty ? 'property' : 'name';
  
  let element = document.querySelector(
    `meta[${attribute}="${name}"]`
  ) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
}

/**
 * Update or create a link tag
 */
function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

/**
 * Add JSON-LD structured data to the page
 */
export function addStructuredData(data: object) {
  const existingScript = document.querySelector(
    'script[type="application/ld+json"]'
  );

  if (existingScript) {
    existingScript.textContent = JSON.stringify(data);
  } else {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }
}

/**
 * Generate organization structured data
 */
export function generateOrganizationSchema(org: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    description: org.description,
    contactPoint: org.contactPoint
      ? {
          '@type': 'ContactPoint',
          ...org.contactPoint,
        }
      : undefined,
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate product structured data
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  image?: string;
  sku?: string;
  brand?: string;
  offers?: {
    price: number;
    priceCurrency: string;
    availability: string;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand,
        }
      : undefined,
    offers: product.offers
      ? {
          '@type': 'Offer',
          ...product.offers,
        }
      : undefined,
  };
}
