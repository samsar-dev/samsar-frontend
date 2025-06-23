import { GetServerSideProps } from 'next';
import { getServerSideSitemap } from 'next-sitemap';
import { getAllProperties } from '@/services/propertyService';
import { getAllVehicles } from '@/services/vehicleService';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://samsar.app';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Get all properties and vehicles from your API
  const properties = await getAllProperties();
  const vehicles = await getAllVehicles();

  // Generate URLs for properties
  const propertyUrls = properties.map((property: any) => ({
    loc: `${SITE_URL}/properties/${property.slug}`,
    lastmod: new Date(property.updatedAt).toISOString(),
    changefreq: 'daily',
    priority: 0.8,
  }));

  // Generate URLs for vehicles
  const vehicleUrls = vehicles.map((vehicle: any) => ({
    loc: `${SITE_URL}/vehicles/${vehicle.slug}`,
    lastmod: new Date(vehicle.updatedAt).toISOString(),
    changefreq: 'daily',
    priority: 0.8,
  }));

  // Static pages
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/about', priority: 0.9, changefreq: 'weekly' },
    { url: '/contact', priority: 0.9, changefreq: 'weekly' },
    { url: '/privacy', priority: 0.5, changefreq: 'monthly' },
    { url: '/terms', priority: 0.5, changefreq: 'monthly' },
  ];

  const staticUrls = staticPages.map((page) => ({
    loc: `${SITE_URL}${page.url}`,
    lastmod: new Date().toISOString(),
    changefreq: page.changefreq,
    priority: page.priority,
  }));

  // Combine all URLs
  const allUrls = [...staticUrls, ...propertyUrls, ...vehicleUrls];

  return getServerSideSitemap(ctx, allUrls);
};

// Default export to prevent next.js errors
export default function Sitemap() {
  return null;
}
