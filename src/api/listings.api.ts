import { apiClient } from "./apiClient";
import type {
  Listing,
  ListingsResponse,
  ListingDetails,
  TractorDetails,
} from "@/types/listings";
import type { ListingParams } from "@/types/params";
import { AxiosError } from "axios";
import {
  ListingCategory,
  Condition,
  VehicleType,
  PropertyType,
} from "@/types/enums";
import type { FormState } from "@/types/forms";
import { ACTIVE_API_URL as API_URL } from "@/config";

interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

interface FavoritesResponse {
  items: SingleListingResponse[];
  total: number;
}

interface FavoriteResponse {
  favorite: FavoriteItem;
}

// Define response types
export interface SingleListingResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  location: string;
  condition: Condition;
  listingAction: "SELL" | "RENT";
  status: "ACTIVE" | "SOLD" | "RENTED" | "EXPIRED";
  images: { url: string }[];
  details: {
    vehicles?: {
      make: string;
      model: string;
      year: string;
      [key: string]: any;
    };
    realEstate?: {
      size: string;
      bedrooms: string;
      bathrooms: string;
      [key: string]: any;
    };
  };
  createdAt: string;
  updatedAt: string;
  userId: string;
  seller?: {
    username: string;
    profilePicture: string | null;
  };
}

// Define API response types
export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

export interface ListingCreateInput extends Omit<FormState, "images"> {
  title: string;
  images: File[];
  description: string;
  location: string;
  price: number;
}

export const createListing = async (formData: FormData) => {
  try {
    // Log the form data for debugging
    console.log("FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, typeof value === "string" ? value : "File object");
    }

    // Get the details from formData and parse them
    const detailsStr = formData.get("details");
    if (detailsStr && typeof detailsStr === "string") {
      const details = JSON.parse(detailsStr);

      // If this is a tractor, ensure all required fields are present
      if (details.vehicles?.vehicleType === VehicleType.TRACTOR) {
        const tractorDetails = details.vehicles as TractorDetails;

        // Ensure required tractor fields
        tractorDetails.horsepower = parseInt(
          tractorDetails.horsepower?.toString() || "0",
        );
        tractorDetails.attachments = tractorDetails.attachments || [];
        tractorDetails.fuelTankCapacity =
          tractorDetails.fuelTankCapacity || "0";
        tractorDetails.tires = tractorDetails.tires || "";

        // Update the formData with the validated tractor details
        formData.set(
          "details",
          JSON.stringify({
            ...details,
            vehicles: tractorDetails,
          }),
        );
      }
    }

    const response = await apiClient.post("/listings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || "Failed to create listing",
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error creating listing:", error);
    if (error instanceof AxiosError && error.response?.status === 401) {
      throw new Error("Please log in to create a listing");
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to create listing",
    );
  }
};

interface UserListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Improve cache implementation
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Update ListingParams interface
interface ListingParams {
  year?: number;
  category?: {
    mainCategory: ListingCategory;
    subCategory?: VehicleType | PropertyType;
  };
  vehicleDetails?: {
    make?: string;
    model?: string;
  };
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  page?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  builtYear?: number;
  preview?: boolean;
  forceRefresh?: boolean;
}

const getCacheKey = (params: ListingParams, customKey?: string) => {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

  return customKey || JSON.stringify(sortedParams);
};

const getFromCache = (key: string) => {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

const setInCache = (key: string, data: any) => {
  // Limit cache size to prevent memory issues
  if (cache.size > 100) {
    const oldestKey = Array.from(cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp,
    )[0][0];
    cache.delete(oldestKey);
  }

  cache.set(key, { data, timestamp: Date.now() });
};

export const listingsAPI = {
  async getAll(
    params: ListingParams,
    signal?: AbortSignal,
  ): Promise<APIResponse<ListingsResponse>> {
    const cacheKey = getCacheKey(params);
    const cached = getFromCache(cacheKey);

    // Return cached data if available and not forcing refresh
    if (cached && !params.forceRefresh) {
      return { success: true, data: cached };
    }

    try {
      const queryParams = new URLSearchParams();

      // Add category filters if present
      if (params.category?.mainCategory) {
        queryParams.append("mainCategory", params.category.mainCategory);
      }
      if (params.category?.subCategory) {
        queryParams.append("subCategory", params.category.subCategory);
      }

      // Add year filter if present
      if (params.year !== undefined && params.year !== null) {
        queryParams.append("year", params.year.toString());
      }

      // Add vehicle details if present
      if (params.vehicleDetails?.make) {
        queryParams.append("make", params.vehicleDetails.make);
      }
      if (params.vehicleDetails?.model) {
        queryParams.append("model", params.vehicleDetails.model);
      }

      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.minPrice)
        queryParams.append("minPrice", params.minPrice.toString());
      if (params.maxPrice)
        queryParams.append("maxPrice", params.maxPrice.toString());
      if (params.location) queryParams.append("location", params.location);
      if (params.builtYear !== undefined && params.builtYear !== null) {
        queryParams.append("builtYear", params.builtYear.toString());
      }

      const response = await fetch(`${API_URL}/listings?${queryParams}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        signal, // Pass abort signal to fetch
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch listings");
        } catch (e) {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Invalid response from server");
      }

      // Make sure data contains the necessary fields
      const responseData = {
        listings: data.data?.items || data.data?.listings || [],
        total: data.data?.total || 0,
        page: data.data?.page || 1,
        limit: data.data?.limit || 10,
      };

      // Only cache successful responses
      if (data.success) {
        setInCache(cacheKey, responseData);
      }

      return {
        success: true,
        data: responseData,
        error: undefined,
      };
    } catch (error: unknown) {
      // Don't log aborted request errors
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching listings:", error);
      }

      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "Failed to fetch listings",
      };
    }
  },

  // Get a single listing by ID
  async getListing(id: string): Promise<APIResponse<Listing>> {
    try {
      const response = await apiClient.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listing:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch listing",
      );
    }
  },

  // Update a listing
  async updateListing(
    id: string,
    formData: FormData,
  ): Promise<APIResponse<Listing>> {
    try {
      // Get the details from formData
      const details = formData.get("details");
      let parsedDetails;

      try {
        parsedDetails = details ? JSON.parse(details as string) : {};
      } catch (e) {
        console.error("Error parsing details:", e);
        parsedDetails = {};
      }

      // Extract vehicle details if they exist
      const vehicleDetails = parsedDetails.vehicles;
      if (vehicleDetails) {
        // Remove fields that are not in the Prisma schema
        delete vehicleDetails.engineSize;

        // Ensure numeric fields are properly converted
        const numericFields = ["year", "mileage", "warranty", "previousOwners"];
        numericFields.forEach((field) => {
          if (field in vehicleDetails) {
            vehicleDetails[field] = Number(vehicleDetails[field]);
          }
        });

        // Update the formData with cleaned vehicle details
        formData.set(
          "details",
          JSON.stringify({
            ...parsedDetails,
            vehicles: vehicleDetails,
          }),
        );
      }

      const response = await apiClient.put(`/listings/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to update listing");
      }

      return response.data;
    } catch (error: any) {
      console.error("Error updating listing:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update listing";
      throw new Error(errorMessage);
    }
  },

  // Delete a listing
  async deleteListing(id: string): Promise<APIResponse<Listing>> {
    try {
      const response = await apiClient.delete(`/listings/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to delete listing");
      }
      return response.data;
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete listing";
      throw new Error(errorMsg);
    }
  },

  // Save a listing as favorite
  async saveListing(listingId: string): Promise<APIResponse<Listing>> {
    try {
      // Ensure listingId is a string
      const id = String(listingId);

      const response = await apiClient.post(`/listings/saved/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to save listing");
      }
      return response.data;
    } catch (error) {
      console.error("Error saving listing:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to save listing",
      );
    }
  },

  // Get favorites with abort signal support
  async getSavedListings(
    userId?: string,
    signal?: AbortSignal,
  ): Promise<APIResponse<any>> {
    const cacheKey = `saved-listings-${userId || "current"}`;
    const cached = getFromCache(cacheKey);
    if (cached) return { success: true, data: cached };

    try {
      const response = await apiClient.get("/listings/saved", { signal });

      if (response.data.success && response.data.data) {
        setInCache(cacheKey, response.data.data);
      }

      return response.data;
    } catch (error) {
      // Don't log aborted request errors
      if (error.name !== "AbortError") {
        console.error("Error fetching saved listings:", error);
      }

      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch saved listings",
      };
    }
  },

  // Add favorite
  async addFavorite(listingId: string): Promise<APIResponse<FavoriteResponse>> {
    try {
      const response = await fetch(`${API_URL}/listings/saved`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to add favorite",
      );
    }
  },

  // Remove favorite
  async removeFavorite(listingId: string): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete<APIResponse<void>>(
        `/listings/saved/${listingId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to remove favorite",
      );
    }
  },

  // Get user listings with abort signal support
  async getUserListings(
    params?: ListingParams,
    signal?: AbortSignal,
  ): Promise<APIResponse<UserListingsResponse>> {
    try {
      const queryString = params
        ? new URLSearchParams(params as any).toString()
        : "";

      const requestConfig = signal ? { signal } : {};

      const response = await apiClient.get<APIResponse<UserListingsResponse>>(
        `/listings/user${queryString ? `?${queryString}` : ""}`,
        requestConfig,
      );

      return response.data;
    } catch (error: any) {
      // Don't log aborted request errors
      if (error.name !== "AbortError") {
        console.error("Error fetching user listings:", error);
      }

      return {
        success: false,
        data: null,
        error:
          error.response?.data?.error?.message ||
          "Failed to fetch user listings",
      };
    }
  },

  // Get listing by id
  async getById(id: string): Promise<APIResponse<Listing>> {
    try {
      console.log("Fetching listing with ID:", id);
      const response = await apiClient.get<{
        success: boolean;
        data: SingleListingResponse;
        status: number;
      }>(`/listings/${id}`);
      console.log("Raw API response:", response);
      console.log("Response data:", response.data);

      if (!response.data.success || !response.data.data) {
        throw new Error("No data received from API");
      }

      const responseData = response.data.data;

      // Transform vehicle details if present with all fields
      const details: ListingDetails = {
        vehicles: responseData.details.vehicles
          ? {
              vehicleType: responseData.category.subCategory as VehicleType,
              make: responseData.details.vehicles.make,
              model: responseData.details.vehicles.model,
              year: responseData.details.vehicles.year,
              // Essential fields
              mileage: responseData.details.vehicles.mileage || "0",
              fuelType: responseData.details.vehicles.fuelType || "gasoline",
              transmission:
                responseData.details.vehicles.transmission || "automatic",
              // Appearance fields
              color: responseData.details.vehicles.color || "#000000",
              interiorColor:
                responseData.details.vehicles.interiorColor || "#000000",
              condition: responseData.details.vehicles.condition || "good",
              // Technical fields
              brakeType:
                responseData.details.vehicles.brakeType || "Not provided",
              engineSize:
                responseData.details.vehicles.engineSize || "Not provided",
              engine: responseData.details.vehicles.engine || "Not provided",
              warranty:
                responseData.details.vehicles.warranty?.toString() || "0",
              serviceHistory:
                responseData.details.vehicles.serviceHistory || "none",
              previousOwners: responseData.details.vehicles.previousOwners || 0,
              registrationStatus:
                responseData.details.vehicles.registrationStatus ||
                "unregistered",
              features: responseData.details.vehicles.features || [],
            }
          : undefined,
        realEstate: responseData.details.realEstate
          ? {
              propertyType: responseData.category.subCategory as PropertyType,
              size: responseData.details.realEstate.size,
              yearBuilt: responseData.details.realEstate.yearBuilt,
              bedrooms: responseData.details.realEstate.bedrooms,
              bathrooms: responseData.details.realEstate.bathrooms,
              condition: responseData.details.realEstate.condition,
              features: responseData.details.realEstate.features || [],
            }
          : undefined,
      };

      // Transform the response data to match the Listing type
      const transformedData: Listing = {
        id: responseData.id,
        title: responseData.title,
        description: responseData.description,
        price: responseData.price,
        category: responseData.category,
        location: responseData.location,
        images: responseData.images.map((img) =>
          typeof img === "string" ? img : img.url,
        ),
        createdAt: responseData.createdAt,
        updatedAt: responseData.updatedAt,
        userId: responseData.userId,
        details: details,
        listingAction: responseData.listingAction === "SELL" ? "SELL" : "RENT",
        seller: {
          id: responseData.userId,
          username: responseData.seller?.username || "Unknown Seller",
          profilePicture: responseData.seller?.profilePicture || null,
        },
      };

      return {
        success: true,
        data: transformedData,
        error: undefined,
      };
    } catch (error: any) {
      console.error("Error fetching listing:", error);
      console.error("Error response:", error.response?.data);
      return {
        success: false,
        data: null,
        error:
          error.response?.data?.error?.message || "Failed to fetch listing",
      };
    }
  },

  // Create new listing
  async create(
    formData: FormData,
  ): Promise<APIResponse<SingleListingResponse>> {
    try {
      // Log the FormData contents before sending
      console.log("FormData entries being sent to API:");
      for (const pair of formData.entries()) {
        console.log(
          pair[0],
          ":",
          typeof pair[1] === "string" ? pair[1] : "File/Blob data",
        );
      }

      const response = await fetch(`${API_URL}/listings`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      console.log("Raw API Response:", data);

      if (!response.ok) {
        console.error("Server error details:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });
        return {
          success: false,
          data: null,
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data,
        error: undefined,
      };
    } catch (error) {
      console.error("Error creating listing:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "Failed to create listing",
      };
    }
  },

  // Update listing
  async update(
    id: string,
    formData: FormData,
  ): Promise<APIResponse<SingleListingResponse>> {
    try {
      // Get the details from formData and parse them
      const detailsStr = formData.get("details");
      if (detailsStr && typeof detailsStr === "string") {
        const details = JSON.parse(detailsStr);

        // If this is a tractor, ensure all required fields are present
        if (details.vehicles?.vehicleType === VehicleType.TRACTOR) {
          const tractorDetails = details.vehicles as TractorDetails;

          // Ensure required tractor fields
          tractorDetails.horsepower = parseInt(
            tractorDetails.horsepower?.toString() || "0",
          );
          tractorDetails.attachments = tractorDetails.attachments || [];
          tractorDetails.fuelTankCapacity =
            tractorDetails.fuelTankCapacity || "0";
          tractorDetails.tires = tractorDetails.tires || "";

          // Update the formData with the validated tractor details
          formData.set(
            "details",
            JSON.stringify({
              ...details,
              vehicles: tractorDetails,
            }),
          );
        }
      }

      const response = await fetch(`${API_URL}/listings/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating listing:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update listing",
      );
    }
  },

  // Delete listing
  async delete(id: string): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete(`/listings/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to delete listing");
      }
      return response.data;
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to delete listing";
      throw new Error(errorMsg);
    }
  },

  // Search listings
  async search(
    query: string,
    params?: ListingParams,
  ): Promise<APIResponse<ListingsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("query", query);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(
        `${API_URL}/listings/search?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search listings");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error searching listings:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to search listings",
      );
    }
  },

  // Get trending listings
  async getTrending(limit: number = 4): Promise<APIResponse<Listing>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("limit", limit.toString());

      const response = await fetch(
        `${API_URL}/listings/trending?${queryParams}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching trending listings:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch trending listings",
      );
    }
  },

  // Get listings by ids
  async getListingsByIds(ids: string[]): Promise<APIResponse<Listing>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("ids", ids.join(","));

      const response = await fetch(
        `${API_URL}/listings/by-ids?${queryParams}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching listings by ids:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch listings by ids",
      );
    }
  },

  // Get listings by category
  async getListingsByCategory(
    category: ListingCategory,
  ): Promise<APIResponse<Listing>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("category", category);

      const response = await fetch(
        `${API_URL}/listings/by-category?${queryParams}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching listings by category:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch listings by category",
      );
    }
  },

  // Get user's favorite listings
  async getFavorites(userId?: string): Promise<APIResponse<FavoritesResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (userId) queryParams.append("userId", userId);

      const response = await apiClient.get<APIResponse<FavoritesResponse>>(
        `/listings/favorites${queryParams.toString() ? `?${queryParams}` : ""}`,
      );

      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return {
          success: false,
          data: null,
          error: "Please log in to view favorites",
        };
      }

      console.error("Error fetching favorite listings:", error);
      return {
        success: false,
        data: null,
        error:
          error?.response?.data?.error || "Failed to fetch favorite listings",
      };
    }
  },
};
