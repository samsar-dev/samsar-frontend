import { findNearbyCities, getAllCities as fetchAllCities, City } from './locationService';

/**
 * Get all available cities from the backend
 * @returns Promise with list of all cities
 */
export const getAllCities = async (): Promise<City[]> => {
  try {
    const response = await fetchAllCities();
    return response.data || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    // Fallback to local cities data if API fails
    const { syrianCities } = await import('../utils/syrianCitiesEnglish');
    return syrianCities.map(city => ({
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude
    }));
  }
};

/**
 * Find cities within a specified radius of a given location
 * @param lat Latitude of the center point
 * @param lng Longitude of the center point
 * @param radiusKm Radius in kilometers
 * @returns Promise with list of nearby cities
 */
export const getNearbyCities = async (
  lat: number,
  lng: number,
  radiusKm: number = 50
): Promise<City[]> => {
  try {
    const response = await findNearbyCities(lat, lng, radiusKm);
    return response.data?.cities || [];
  } catch (error) {
    console.error('Error finding nearby cities:', error);
    // Fallback to local cities data if API fails
    const { syrianCities } = await import('../utils/syrianCitiesEnglish');
    return syrianCities
      .map(city => ({
        ...city,
        distance: calculateDistance(lat, lng, city.latitude, city.longitude)
      }))
      .filter(city => city.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }
};

/**
 * Calculate distance between two points using Haversine formula
 */
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRad = (value: number): number => (value * Math.PI) / 180;

/**
 * Get city coordinates by name
 * @param cityName Name of the city
 * @returns City coordinates or null if not found
 */
export const getCityCoordinates = async (cityName: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const cities = await getAllCities();
    const city = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    return city ? { lat: city.latitude, lng: city.longitude } : null;
  } catch (error) {
    console.error('Error getting city coordinates:', error);
    return null;
  }
};
