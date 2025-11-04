import { useEffect } from 'react';

import { APP_NAME, APP_DESCRIPTION } from '@/config/constants';
import { updateMetaTags, addStructuredData } from '@/utils/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

/**
 * SEO head component for managing meta tags and structured data
 */
export function SEOHead({
  title,
  description = APP_DESCRIPTION,
  keywords,
  image,
  url,
  type = 'website',
  structuredData,
}: SEOHeadProps) {
  useEffect(() => {
    // Update meta tags
    updateMetaTags({
      title: title ? `${title} | ${APP_NAME}` : APP_NAME,
      description,
      keywords,
      image,
      url: url || window.location.href,
      type,
      siteName: APP_NAME,
      locale: 'en_US',
      twitterCard: 'summary_large_image',
    });

    // Add structured data if provided
    if (structuredData) {
      addStructuredData(structuredData);
    }
  }, [title, description, keywords, image, url, type, structuredData]);

  return null;
}
