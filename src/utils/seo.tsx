import { NextSeo, NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';

// Inline SEO configuration
const seoConfig = {
  title: 'سمسار | سوق السيارات والعقارات الأول في سوريا',
  description: 'منصة سمسار الرائدة في بيع وشراء السيارات والعقارات في سوريا. تواصل مع أفضل الوكلاء واعثر على أفضل العروض',
  openGraph: {
    type: 'website',
    locale: 'ar_SY',
    url: 'https://samsar.app',
    site_name: 'سمسار',
    title: 'سمسار | سوق السيارات والعقارات الأول في سوريا',
    description: 'منصة سمسار الرائدة في بيع وشراء السيارات والعقارات في سوريا',
    images: [
      {
        url: 'https://samsar.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'سمسار - سوق السيارات والعقارات',
      },
    ],
  },
  twitter: {
    handle: '@samsar_sy',
    site: '@samsar_sy',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'سمسار, سيارات سوريا, عقارات سوريا, سيارات للبيع, شقق للايجار, عقارات للبيع, معارض سيارات, مكاتب عقارية, سوريا, دمشق, حلب, حمص, اللاذقية',
    },
    {
      name: 'author',
      content: 'Samsar Team',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
  ],
};

// SEO component props
interface SEOProps extends NextSeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: {
    type?: string;
    url?: string;
    title?: string;
    description?: string;
    images?: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
  };
  // Additional SEO props can be added here
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  openGraph,
  additionalMetaTags = [],
}) => {
  const { asPath } = useRouter();
  const canonicalUrl = canonical || `${seoConfig.openGraph.url}${asPath}`;

  return (
    <NextSeo
      {...seoConfig}
      title={title}
      description={description}
      canonical={canonicalUrl}
      openGraph={{
        ...seoConfig.openGraph,
        ...openGraph,
        images: openGraph?.images || seoConfig.openGraph?.images,
      }}
      additionalMetaTags={[
        ...(seoConfig.additionalMetaTags || []),
        ...additionalMetaTags,
      ]}
    />
  );
};

export const DefaultSEO = () => {
  return <NextSeo {...seoConfig} />;
};
