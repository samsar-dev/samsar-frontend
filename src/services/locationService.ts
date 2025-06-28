import axios from 'axios';

const API_BASE_URL = '/api/locations';

export interface City {
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

export interface NearbyCitiesResponse {
  success: boolean;
  data: {
    center: {
      lat: number;
      lng: number;
    };
    radiusKm: number;
    cities: City[];
  };
}

/**
 * Find cities within a specified radius of a given location
 * @param lat Latitude of the center point
 * @param lng Longitude of the center point
 * @param radiusKm Radius in kilometers (default: 50km)
 * @param limit Maximum number of cities to return (optional)
 * @returns Promise with nearby cities data
 */
export const findNearbyCities = async (
  lat: number,
  lng: number,
  radiusKm: number = 50,
  limit?: number
): Promise<NearbyCitiesResponse> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radiusKm: radiusKm.toString(),
    ...(limit && { limit: limit.toString() })
  });

  try {
    const response = await axios.get(`${API_BASE_URL}/nearby-cities?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error finding nearby cities:', error);
    throw error;
  }
};

/**
 * Get all available cities
 * @returns Promise with list of all cities
 */
export const getAllCities = async (): Promise<{ success: boolean; data: City[] }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cities`);
    return response.data;
  } catch (error) {
    console.error('Error getting all cities:', error);
    throw error;
  }
};

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};
