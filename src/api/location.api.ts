import api from "./apiClient";

export const locationAPI = {
  /**
   * Search for locations by query
   */
  searchLocations: async (
    query: string,
    options: {
      limit?: number;
      proximity?: [number, number];
      country?: string;
    } = {},
  ) => {
    const params = new URLSearchParams({
      q: query,
      limit: options.limit?.toString() || "5",
      ...(options.proximity && {
        proximity: `${options.proximity[0]},${options.proximity[1]}`,
      }),
      ...(options.country && { country: options.country }),
    });

    const response = await api.get(`/api/locations/search?${params}`);
    return response.data;
  },

  /**
   * Reverse geocode coordinates to get address
   */
  reverseGeocode: async (lat: number, lng: number) => {
    const response = await api.get(
      `/api/locations/reverse?lat=${lat}&lng=${lng}`,
    );
    return response.data;
  },

  /**
   * Get nearby listings based on coordinates and radius (in km)
   */
  getNearbyListings: async (
    lat: number,
    lng: number,
    radius: number,
    filters: Record<string, any> = {},
  ) => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      ...filters,
    });

    const response = await api.get(`/api/listings/nearby?${params}`);
    return response.data;
  },

  /**
   * Get distance between two points
   */
  getDistance: async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    unit: "km" | "mi" = "km",
  ) => {
    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      unit,
    });

    const response = await api.get(`/api/locations/distance?${params}`);
    return response.data;
  },
};
