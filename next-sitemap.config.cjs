/**
 * @type {import('next-sitemap').IConfig}
 */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://samsar.app',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: ['/server-sitemap.xml', '/admin/*', '/api/*', '/_next/*', '/static/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://samsar.app'}/sitemap.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://samsar.app'}/server-sitemap.xml`,
    ],
  },
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  outDir: 'public',
  transform: async (config, path) => {
    // Customize the sitemap data for each URL
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: path === '/' ? 1.0 : config.priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    // You can add dynamic paths here if needed
    return [];
  },
};
