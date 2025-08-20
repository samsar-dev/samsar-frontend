import type { City } from "./locationService";
import {
  findNearbyCities,
  getAllCities as fetchAllCities,
} from "./locationService";

/**
 * Get all available cities from the backend
 * @returns Promise with list of all cities
 */
export const getAllCities = async (): Promise<City[]> => {
  try {
    const response = await fetchAllCities();
    return response.data || [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw new Error("Failed to fetch cities from backend API");
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
  radiusKm: number = 50,
): Promise<City[]> => {
  try {
    const response = await findNearbyCities(lat, lng, radiusKm);
    return response.data?.cities || [];
  } catch (error) {
    console.error("Error finding nearby cities:", error);
    throw new Error("Failed to fetch nearby cities from backend API");
  }
};


/**
 * Get city coordinates by name
 * @param cityName Name of the city
 * @returns City coordinates or null if not found
 */
export const getCityCoordinates = async (
  cityName: string,
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const cities = await getAllCities();
    const city = cities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase(),
    );
    return city ? { lat: city.latitude, lng: city.longitude } : null;
  } catch (error) {
    console.error("Error getting city coordinates:", error);
    return null;
  }
};
