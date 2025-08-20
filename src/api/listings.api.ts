import { ACTIVE_API_URL as API_URL } from "@/config";
import { apiClient } from "./apiClient";
import type { ListingCategory, PropertyType } from "@/types/enums";
import type { FormState } from "@/types/forms";
import type {
  Listing,
  ListingDetails,
  ListingsResponse,
  RealEstateDetails,
  VehicleDetails,
} from "@/types/listings";
import {
  VehicleType,
  ListingAction,
  Condition,
} from "@/types/enums";
// Define custom ListingParams interface directly here to avoid import conflicts
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
  latitude?: number;
  longitude?: number;
  radius?: number;
  builtYear?: number;
  preview?: boolean;
  forceRefresh?: boolean;
}
import { AxiosError } from "axios";
import type { RequestConfig } from "./apiClient";

interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

interface FavoritesResponse {
  favorites: FavoriteItem[];
  items: SingleListingResponse[];
  total: number;
}

interface FavoriteResponse {
  favorite: FavoriteItem;
}

interface ViewCountResponse {
  message: string;
  views: number;
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
  latitude: number;
  longitude: number;
  condition: Condition;
  listingAction: "SALE" | "RENT";
  status: "ACTIVE" | "SOLD" | "RENTED" | "EXPIRED";
  images: { url: string }[];
  details: Record<string, any>; // Flat structure for details
  createdAt: string;
  updatedAt: string;
  userId: string;
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
    allowMessaging: boolean;
    privateProfile: boolean;
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
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  details: ListingDetails;
}

export const createListing = async (
  formData: FormData,
): Promise<APIResponse<SingleListingResponse>> => {
  try {
    // Get and validate the details from formData
    const detailsStr = formData.get("details");
    if (!detailsStr || typeof detailsStr !== "string") {
      throw new Error("Details are required");
    }

    try {
      const details = JSON.parse(detailsStr);

      // Check if this is a vehicle listing by looking for vehicleType
      if (details.vehicleType) {
        // Validate required fields
        const requiredFields = ["vehicleType", "make", "model"];
        for (const field of requiredFields) {
          if (!details[field]) {
            throw new Error(`${field} is required for vehicle listings`);
          }
        }

        // Common numeric fields for all vehicles
        const numericFields: Record<string, number | null> = {
          year: 0,
          mileage: 0,
          previousOwners: 0,
          horsepower: null,
          torque: null,
          seatingCapacity: null,
          maxSpeed: null,
          airbags: null,
        };

        // Process numeric fields
        Object.entries(numericFields).forEach(([field, defaultValue]) => {
          if (
            details &&
            (details as Record<string, any>)[field] !== undefined
          ) {
            const parsed = parseInt(
              (details as Record<string, any>)[field].toString(),
            );
            (details as Record<string, any>)[field] = isNaN(parsed)
              ? defaultValue
              : parsed;
          }
        });

        // Common boolean fields with defaults
        const booleanFields = [
          "accidentFree",
          "customsCleared",
          "parkingSensors",
          "parkingCamera",
        ];

        booleanFields.forEach((field) => {
          details[field] = Boolean(details[field]);
        });

        // Common string fields with empty string defaults
        const stringFields = [
          "engineSize",
          "engineNumber",
          "vin",
          "warranty",
          "insuranceType",
          "registrationStatus",
          "color",
          "interiorColor",
          "fuelType",
          "transmissionType",
          "serviceHistory",
          "navigationSystem",
        ];

        stringFields.forEach((field) => {
          details[field] = details[field] || "";
        });

        // Ensure features is an array
        details.features = Array.isArray(details.features)
          ? details.features
          : [];

        // Handle specific vehicle type details
        type VehicleTypePlural = Exclude<VehicleType, 'CAR' | 'MOTORCYCLE'>;
        const vehicleTypeFields: Record<VehicleTypePlural, string[]> = {
          // Map both old and new enum values to the same field sets
          [VehicleType.CARS]: [
            "fuelEfficiency",
            "emissionClass",
            "driveType",
            "wheelSize",
            "wheelType",
          ],
      
          [VehicleType.MOTORCYCLES]: [
            "engineDisplacement",
            "startingSystem",
            "coolingSystem",
          ],
          // Only CARS and MOTORCYCLES are supported vehicle types now
        };

        // Apply vehicle type specific fields
        // Convert singular enum values to plural if needed
        const vehicleType = details.vehicleType;
        const pluralVehicleType = 
          vehicleType === 'CAR' ? 'CARS' :
          vehicleType === 'MOTORCYCLE' ? 'MOTORCYCLES' :
          vehicleType as VehicleType;
          
        const typeFields =
          vehicleTypeFields[pluralVehicleType as keyof typeof vehicleTypeFields] || [];
        typeFields.forEach((field: string) => {
          details[field] = details[field] || "";
        });
      }

      console.log("details 1:", details);

      // Update the formData with the processed details
      formData.set("details", JSON.stringify(details));

      console.log("details 2:", details);

      // Send the request
      const response = await apiClient.post("/listings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      } as RequestConfig);

      if (!response.data.success) {
        throw new Error(
          response.data.error?.message || "Failed to create listing",
        );
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create listing";
      throw new Error(errorMessage);
    }
  } catch (error) {
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

// Function to clear all caches
export const clearAllCaches = () => {
  // Clear all API caches
  cache.clear();

  // Dispatch an event to notify components that cache has been cleared
  const event = new CustomEvent("listings-cache-cleared");
  window.dispatchEvent(event);
  console.log("All listing caches cleared");
};

// Define custom ListingParams interface directly here to avoid import conflicts
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
  latitude?: number;
  longitude?: number;
  radius?: number;
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

interface ListingsAPI {
  getSavedListings(
    userId?: string,
    signal?: AbortSignal,
  ): Promise<APIResponse<any>>;
  getAll(
    params: ListingParams,
    signal?: AbortSignal,
  ): Promise<APIResponse<ListingsResponse>>;
  getVehicleListings(
    params: ListingParams,
  ): Promise<APIResponse<ListingsResponse>>;
  getRealEstateListings(
    params: ListingParams,
  ): Promise<APIResponse<ListingsResponse>>;
  getListing(id: string): Promise<APIResponse<Listing>>;
  updateListing(id: string, formData: FormData): Promise<APIResponse<Listing>>;
  increaseViewCount(id: string): Promise<APIResponse<ViewCountResponse>>;
  deleteListing(id: string): Promise<APIResponse<Listing>>;
  saveListing(listingId: string): Promise<APIResponse<Listing>>;
  addFavorite(listingId: string): Promise<APIResponse<FavoriteResponse>>;
  removeFavorite(listingId: string): Promise<APIResponse<void>>;
  getUserListings(
    params?: ListingParams,
    signal?: AbortSignal,
  ): Promise<APIResponse<UserListingsResponse>>;
  getById(id: string): Promise<APIResponse<Listing>>;
  create(formData: FormData): Promise<APIResponse<SingleListingResponse>>;
  update(
    id: string,
    formData: FormData,
  ): Promise<APIResponse<SingleListingResponse>>;
  delete(id: string): Promise<APIResponse<void>>;
  search(
    query: string,
    params?: ListingParams,
  ): Promise<APIResponse<ListingsResponse>>;
  getTrending(limit?: number): Promise<APIResponse<Listing>>;
  getListingsByIds(ids: string[]): Promise<APIResponse<Listing>>;
  getListingsByCategory(
    category: ListingCategory,
  ): Promise<APIResponse<Listing>>;
  getFavorites(userId?: string): Promise<APIResponse<FavoritesResponse>>;
  fuzzyMatch(text: string, search: string): boolean;
  getSavedListings(
    userId?: string,
    signal?: AbortSignal,
  ): Promise<APIResponse<any>>;
}

export const listingsAPI: ListingsAPI = {
  // Get saved listings with abort signal support
  async getSavedListings(
    userId?: string,
    signal?: AbortSignal,
  ): Promise<APIResponse<any>> {
    try {
      // Let the backend handle authentication via cookies
      const response = await apiClient.get(
        `/listings/save${userId ? `?userId=${userId}` : ""}`,
        {
          signal,
          withCredentials: true,
        },
      );

      // If we get a successful response but no data, return an empty array
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
        };
      }

      // If the response indicates failure, return the error
      return {
        success: false,
        data: null,
        error: response.data.error || "Failed to fetch saved listings",
      };
    } catch (error) {
      // Don't log aborted request errors
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching saved listings:", error);
      }

      // If it's not an abort error, return a proper error response
      if (error instanceof Error && error.name === "AbortError") {
        return { success: false, data: null };
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

      if (params.sortBy) {
        const sortMap: Record<string, string> = {
          newestFirst: "createdAt",
          priceHighToLow: "price",
          priceLowToHigh: "price",
          mostFavorited: "favorites",
        };
        queryParams.append("sortBy", sortMap[params.sortBy] || params.sortBy);
      }
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.minPrice)
        queryParams.append("minPrice", params.minPrice.toString());
      if (params.maxPrice)
        queryParams.append("maxPrice", params.maxPrice.toString());
      if (params.location) queryParams.append("location", params.location);

      // Add radius-based location filtering if coordinates and radius are provided
      if (params.latitude && params.longitude && params.radius) {
        queryParams.append("latitude", params.latitude.toString());
        queryParams.append("longitude", params.longitude.toString());
        queryParams.append("radius", params.radius.toString());
      }
      if (params.builtYear !== undefined && params.builtYear !== null) {
        queryParams.append("builtYear", params.builtYear.toString());
      }

      // Add preview parameter to request minimal data
      if (params.preview) {
        queryParams.append("preview", "true");
      }

      // Mark this as a public request
      queryParams.append("publicAccess", "true");

      const response = await fetch(`${API_URL}/listings?${queryParams}`, {
        method: "GET",
        signal,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Handle different response formats
      let responseData;
      if (data.data && Array.isArray(data.data)) {
        // The backend returns listings directly in the data property
        responseData = {
          listings: data.data,
          total: data.total ?? data.data.length,
          page: data.page ?? 1,
          limit: data.limit ?? 10,
          hasMore: data.hasMore ?? false,
        };
      } else if (data.data && typeof data.data === "object" && Array.isArray(data.data.items)) {
        // Handle nested structure for other potential endpoints
        responseData = {
          listings: data.data.items,
          total: data.data.total || 0,
          page: data.data.page || 1,
          limit: data.data.limit || 10,
          hasMore: data.data.hasMore || false,
        };
      } else {
        console.warn("Unexpected API response format", data);
        responseData = {
          listings: [],
          total: 0,
          page: 1,
          limit: 10,
          hasMore: false,
        };
      }

      // Extract only essential information for listing cards if preview mode is on
      if (params.preview && responseData.listings) {
        responseData.listings = responseData.listings.map((listing: any) => {
          // Keep only essential details - now using flat structure
          const essentialDetails: any = {};
          
          // If it's a vehicle listing, keep vehicle-specific fields
          if (listing.details?.vehicleType) {
            essentialDetails.vehicleType = listing.details.vehicleType;
            essentialDetails.make = listing.details.make;
            essentialDetails.model = listing.details.model;
            essentialDetails.year = listing.details.year;
            essentialDetails.mileage = listing.details.mileage;
            essentialDetails.transmissionType = listing.details.transmissionType;
            essentialDetails.fuelType = listing.details.fuelType;
            essentialDetails.color = listing.details.color;
            essentialDetails.condition = listing.details.condition;
          }
          
          // If it's a real estate listing, keep real estate-specific fields
          if (listing.details?.propertyType) {
            essentialDetails.propertyType = listing.details.propertyType;
            essentialDetails.size = listing.details.size;
            essentialDetails.bedrooms = listing.details.bedrooms;
            essentialDetails.bathrooms = listing.details.bathrooms;
            essentialDetails.yearBuilt = listing.details.yearBuilt;
            essentialDetails.condition = listing.details.condition;
          }

          // Get the listing action from the response
          const rawAction = listing.listingAction || listing.action;

          // Log the listing action for debugging
          console.log(`[API Debug] Listing ${listing.id} action:`, {
            raw: rawAction,
            type: typeof rawAction,
          });

          // Convert to proper enum value
          let listingAction = rawAction?.toUpperCase();
          if (listingAction === "RENT") {
            listingAction = ListingAction.RENT;
          } else {
            listingAction = ListingAction.SALE;
          }

          return {
            ...listing,
            latitude: listing.latitude,
            longitude: listing.longitude,
            details: essentialDetails,
            listingAction,
          };
        });
      }

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
      // Handle canceled requests gracefully
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "CanceledError")
      ) {
        return {
          success: false,
          data: null,
          error: "Request canceled",
        };
      }

      // Log other errors
      console.error("Error fetching listings:", error);

      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "Failed to fetch listings",
      };
    }
  },

  async getVehicleListings(
    params: ListingParams,
  ): Promise<APIResponse<ListingsResponse>> {
    try {
      console.log("response>>>>", params);
      const response = await apiClient.get<APIResponse<ListingsResponse>>(
        `/listings/vehicles`,
        { params, withCredentials: true },
      );
      const data = response.data;

      if (data.success && data.data) {
        if (data.data.listings && Array.isArray(data.data.listings)) {
          const responseData = {
            listings: data.data.listings,
            total: data.data.total || 0,
            page: data.data.page || 1,
            limit: data.data.limit || 10,
            hasMore: data.data.hasMore || false,
          };
          return { success: true, data: responseData };
        } else {
          console.warn("Expected items array not found in response");
          return {
            success: false,
            data: null,
            error: "Failed to fetch listings",
          };
        }
      }

      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      const errorData = err.response?.data as { message?: string };
      return {
        success: false,
        data: null,
        error: errorData?.message || err.message,
      };
    }
  },

  async getRealEstateListings(
    params: ListingParams,
  ): Promise<APIResponse<ListingsResponse>> {
    try {
      const response = await apiClient.get<ListingsResponse>(
        `/listings/real-estate`,
        { params, withCredentials: true },
      );
      return { success: true, data: response.data };
    } catch (error) {
      const err = error as AxiosError;
      const errorData = err.response?.data as { message?: string };
      return {
        success: false,
        data: null,
        error: errorData?.message || err.message,
      };
    }
  },

  // Get user listings with abort signal support
  async getUserListings(
    params?: ListingParams,
    signal?: AbortSignal,
  ): Promise<APIResponse<UserListingsResponse>> {
    try {
      // Let the backend handle authentication via cookies
      const queryString = params
        ? new URLSearchParams(params as any).toString()
        : "";

      const response = await apiClient.get(
        `/listings/user${queryString ? `?${queryString}` : ""}`,
        {
          signal,
          withCredentials: true,
        },
      );

      // Debug the response
      console.log("User listings API response:", response.data);

      // Handle different response formats
      const data = response.data;

      if (data.success && data.data) {
        // Check if the data structure is as expected
        if (data.data.listings) {
          // Response has the expected structure
          return data;
        } else if (Array.isArray(data.data)) {
          // Data is directly an array of listings
          console.log("Converting array response to expected format");
          return {
            success: true,
            data: {
              listings: data.data,
              total: data.data.length,
              page: 1,
              limit: data.data.length,
              hasMore: false,
            },
          };
        } else {
          // Unknown data structure, log it for debugging
          console.warn("Unexpected user listings data structure:", data.data);
          return {
            success: true,
            data: {
              listings: [],
              total: 0,
              page: 1,
              limit: 10,
              hasMore: false,
            },
          };
        }
      }

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

  // Get a single listing by ID
  async getListing(id: string): Promise<APIResponse<Listing>> {
    try {
      console.log("Fetching listing with ID:", id);
      const response = await apiClient.get(`/listings/public/${id}`, {
        withCredentials: true,
      });
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
      // Clear all caches before updating
      clearAllCaches();

      console.log("==== UPDATE LISTING DEBUG ====");
      console.log("Form data keys:", [...formData.keys()]);

      // Extract all the data we need from the FormData
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const price = Number(formData.get("price"));
      const category = formData.get("category") as string;
      const location = formData.get("location") as string;
      const status = formData.get("status") as string;

      // Log all form data values for debugging
      console.log("Form data values:", {
        title,
        description,
        price,
        category,
        location,
        status,
      });

      // Handle existing images - make sure it's a proper JSON string
      let existingImages: string[] = [];
      const existingImagesStr = formData.get("existingImages");
      if (existingImagesStr && typeof existingImagesStr === "string") {
        try {
          existingImages = JSON.parse(existingImagesStr);
          console.log("Parsed existingImages:", existingImages);
        } catch (e) {
          console.error("Error parsing existingImages:", e);
        }
      }

      // Handle details (vehicles or realEstate) - make sure it's a proper JSON string
      let details = {};
      const detailsStr = formData.get("details");
      if (detailsStr && typeof detailsStr === "string") {
        try {
          details = JSON.parse(detailsStr);
          console.log("Parsed details:", details);
        } catch (e) {
          console.error("Error parsing details:", e);
        }
      }

      // Check if there are new images to upload
      const newImages = Array.from(formData.getAll("images")).filter(
        (img): img is File => img instanceof File,
      );
      const hasNewImages = newImages.length > 0;
      console.log("Has new images:", hasNewImages, "Count:", newImages.length);

      try {
        console.log("🔍 [updateListing] Starting update with:", {
          title,
          description,
          price,
          category,
          location,
          status,
          existingImages,
          details,
          newImagesCount: newImages?.length,
        });

        console.log("🔍 [DEBUG] Raw input:");
        console.log("- title:", title);
        console.log("- description:", description);
        console.log("- price:", price);
        console.log("- category:", category);
        console.log("- location:", location);
        console.log("- status:", status);
        console.log("- existingImages:", existingImages);
        console.log("- details:", details);
        console.log("- newImages:", newImages);

        // Create a data object first, ensuring we preserve all details
        const formFields: {
          title: string;
          description: string;
          price: string;
          mainCategory?: string;
          category?: any;
          location: string;
          status: string;
          publicAccess: string;
          existingImages: string[];
          details?: any;
        } = {
          title,
          description,
          price: String(price),
          location,
          status,
          publicAccess: "true", // Ensure listing is public
          existingImages: existingImages || [],
        };

        // Handle category properly
        if (category) {
          try {
            // Try to parse it as JSON first (it might be a stringified object)
            const categoryObj = JSON.parse(category);
            formFields.category = categoryObj;
          } catch (e) {
            // If it's not valid JSON, use it as a string
            formFields.mainCategory = category;
          }
        }

        // Ensure we're properly handling the details object
        // We need to parse it first to make sure we have the complete object
        let detailsObj = {};
        if (typeof details === "string") {
          try {
            detailsObj = JSON.parse(details);
          } catch (e) {
            console.error("Error parsing details string:", e);
          }
        } else if (details && typeof details === "object") {
          detailsObj = details;
        }

        // Make sure we preserve all vehicle details
        console.log("🔍 [DEBUG] Detailed vehicle information:", detailsObj);
        formFields.details = detailsObj;

        console.log("🔍 [DEBUG] Structured form fields:", formFields);

        // Create a new FormData instance
        const formData = new FormData();

        // Add each field to FormData with type checking
        Object.entries(formFields).forEach(([key, value]) => {
          if (value === undefined || value === null) {
            console.log(`🔍 [DEBUG] Skipping undefined/null field: ${key}`);
            return;
          }

          if (Array.isArray(value)) {
            console.log(`🔍 [DEBUG] Processing array field: ${key}`, value);
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === "object") {
            console.log(`🔍 [DEBUG] Processing object field: ${key}`, value);
            formData.append(key, JSON.stringify(value));
          } else {
            console.log(`🔍 [DEBUG] Processing primitive field: ${key}`, value);
            formData.append(key, String(value));
          }
        });

        // Log final FormData contents
        console.log("🔍 [DEBUG] Final FormData contents:");
        for (const [key, value] of formData.entries()) {
          console.log(`- ${key}:`, value);
        }

        // Add new images if any
        if (newImages && newImages.length > 0) {
          console.log(
            "🔍 [updateListing] Adding new images:",
            newImages.length,
          );
          newImages.forEach((image, index) => {
            formData.append("images", image);
            console.log(
              `🔍 [updateListing] Added image ${index + 1}:`,
              image.name,
            );
          });
        }

        console.log("Sending FormData request", {
          title,
          description,
          price,
          category,
          location,
          status,
          existingImages,
          details,
          newImagesCount: newImages?.length || 0,
        });

        // Let the backend handle authentication via cookies
        const response = await fetch(`${API_URL}/listings/${id}`, {
          method: "PUT",
          body: formData,
          headers: {
            // Don't set Content-Type for FormData - browser will set it with boundary
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "Failed to update listing:",
            response.status,
            errorText,
          );
          throw new Error(errorText || `Failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("Successfully updated listing:", data);
        return data;
      } catch (error: any) {
        console.error("Error updating listing:", error);
        const errorMessage = error.message || "Failed to update listing";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error updating listing:", error);
      const errorMessage = error.message || "Failed to update listing";
      throw new Error(errorMessage);
    }
  },

  // View count increatement
  async increaseViewCount(id: string): Promise<APIResponse<ViewCountResponse>> {
    console.log(">>>>>>>>>>>>>>>>>>");
    const response = await fetch(`${API_URL}/listings/views/?id=${id}`, {
      method: "PUT",
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      credentials: "include",
    });

    if (!response.ok) {
      // Backend returns 400 if the viewer has already viewed this listing.
      // Treat this as a non-fatal condition so the UI flow continues smoothly.
      if (response.status === 400) {
        try {
          const data = await response.json();
          return {
            success: true,
            data: {
              message: data?.message || "You have already viewed this listing",
              views: data?.view ?? 1,
            },
          } as APIResponse<ViewCountResponse>;
        } catch {
          return {
            success: true,
            data: {
              message: "You have already viewed this listing",
              views: 1,
            },
          } as APIResponse<ViewCountResponse>;
        }
      }
      const errorText = await response.text();
      console.error(
        "Failed to increase view count:",
        response.status,
        errorText,
      );
      throw new Error(errorText || `Failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully updated view listing:", data);
    return data;
  },

  // Delete a listing
  async deleteListing(id: string): Promise<APIResponse<Listing>> {
    try {
      const response = await apiClient.delete(`/listings/${id}`, {
        withCredentials: true,
      });
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

      const response = await apiClient.post(
        `/listings/${id}/view`,
        {},
        {
          withCredentials: true,
        },
      );

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

  // Get listing by id
  async getById(id: string): Promise<APIResponse<Listing>> {
    try {
      console.log("Fetching listing with ID:", id);
      // No token required for public listing viewing
      const response = await apiClient.get<{
        success: boolean;
        data: SingleListingResponse;
        status: number;
      }>(`/listings/public/${id}`);
      console.log("Raw API response:", response);
      console.log("Response data >>>>>", response.data);

      if (!response.data.success || !response.data.data) {
        throw new Error("No data received from API");
      }

      const responseData = response.data.data;

      // Use flat details structure directly - cast to appropriate type
      const details = responseData.details as VehicleDetails | RealEstateDetails;

      // Transform the response data to match the Listing type
      const transformedData: Listing = {
        id: responseData.id,
        title: responseData.title,
        description: responseData.description,
        price: responseData.price,
        category: responseData.category,
        location: responseData.location,
        latitude: responseData.latitude,
        longitude: responseData.longitude,
        images: responseData.images.map((img) =>
          typeof img === "string" ? img : img.url,
        ),
        createdAt: responseData.createdAt,
        updatedAt: responseData.updatedAt,
        userId: responseData.userId,
        details: details,
        listingAction:
          responseData.listingAction === "SALE"
            ? ListingAction.SALE
            : ListingAction.RENT,
        seller: {
          id: responseData.userId,
          username: responseData.seller?.username || "Unknown Seller",
          profilePicture: responseData.seller?.profilePicture || null,
          allowMessaging: responseData.seller?.allowMessaging ? true : false,
          privateProfile: responseData.seller?.privateProfile || false,
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
      console.log("Sending FormData to server:");
      for (const pair of formData.entries()) {
        const [key, value] = pair;
        console.log(
          `${key}:`,
          value instanceof File ? `File: ${value.name}` : value,
        );
      }

      const response = await fetch(`${API_URL}/listings`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

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

        // Ensure all required vehicle fields are present
        if (details.vehicleType) {
      

          // Update the formData with the validated details
          formData.set("details", JSON.stringify(details));
        }
      }
      // Let the backend handle authentication via cookies
      const response = await fetch(`${API_URL}/listings/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          // Don't set Content-Type for FormData - browser will set it with boundary
          // "Content-Type": "multipart/form-data",
        },
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

  // Helper function for fuzzy string matching
  fuzzyMatch: function (text: string, search: string): boolean {
    if (!text || !search) return false;

    const textLower = text.toLowerCase();
    const searchLower = search.toLowerCase();

    // Direct match (includes partial matches)
    if (textLower.includes(searchLower)) return true;

    // Simple fuzzy matching for typos (e.g., 'hundai' matches 'hyundai')
    if (searchLower.length >= 4) {
      // Only apply fuzzy for longer search terms
      // Check for common typos or transposed letters
      const commonTypos: Record<string, string[]> = {
        hyundai: ["hundai", "hundyai", "hyundia", "hundi"],
        toyota: ["toyata", "toyoto", "toyoda"],
        mercedes: ["mercedez", "merceds", "mercedec"],
        bmw: ["bmv", "bwm"],
      };

      // Check if search term is a common typo for any known brand
      for (const [brand, typos] of Object.entries(commonTypos)) {
        if (typos.includes(searchLower) && textLower.includes(brand)) {
          return true;
        }
      }

      // Check for character transpositions (e.g., 'hyundia' -> 'hyundai')
      if (searchLower.length >= 5) {
        for (let i = 0; i < searchLower.length - 1; i++) {
          const transposed =
            searchLower.substring(0, i) +
            searchLower[i + 1] +
            searchLower[i] +
            searchLower.substring(i + 2);
          if (textLower.includes(transposed)) return true;
        }
      }

      // Check for missing/extra characters (e.g., 'hyndai' -> 'hyundai')
      if (Math.abs(searchLower.length - textLower.length) <= 1) {
        let diff = 0;
        let i = 0,
          j = 0;

        while (i < searchLower.length && j < textLower.length) {
          if (searchLower[i] !== textLower[j]) {
            diff++;
            if (diff > 1) break;
            if (searchLower.length > textLower.length) i++;
            else if (searchLower.length < textLower.length) j++;
            else {
              i++;
              j++;
            }
          } else {
            i++;
            j++;
          }
        }

        diff += searchLower.length - i + (textLower.length - j);
        if (diff <= 1) return true;
      }
    }

    return false;
  },

  // Search listings
  async search(
    query: string,
    params?: ListingParams,
  ): Promise<APIResponse<ListingsResponse>> {
    try {
      // Add debug logging for the original query

      // Create a case-insensitive version of the query for better matching
      const normalizedQuery = query.trim().toLowerCase();

      const searchParams: Record<string, string> = {
        query: normalizedQuery, // Use normalized query
        search: normalizedQuery, // Use normalized query for compatibility
      };

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null) return;

          if (typeof value === "object") {
            // Handle nested objects like category
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== undefined && nestedValue !== null) {
                searchParams[`${key}.${nestedKey}`] = nestedValue.toString();
              }
            });
          } else {
            searchParams[key] = value.toString();
          }
        });
      }

      const queryString = Object.entries(searchParams)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        )
        .join("&");

      // Call the server-side search endpoint
      const response = await fetch(
        `${API_URL}/listings/search?${queryString}`,
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
        console.error("Search API error:", errorData);
        throw new Error(errorData.error || "Failed to search listings");
      }

      let data = await response.json();

      // If data is not in expected format, restructure it
      if (data && typeof data === "object") {
        if (!data.success) {
          data = { success: true, data: data };
        }

        // Normalize the response structure regardless of API format
        if (data.data && !data.data.listings && Array.isArray(data.data)) {
          data = {
            ...data,
            data: {
              listings: data.data,
              total: data.data.length,
              page: 1,
              limit: data.data.length,
            },
          };
        }
      }

      // If no listings found, try a fallback approach
      if (
        !data.data ||
        !data.data.listings ||
        data.data.listings.length === 0
      ) {
        console.log(
          "No listings found, trying to fetch all listings and filter client-side",
        );

        // Try fetching all listings and filter on the client side as a fallback
        try {
          const allListingsResponse = await this.getAll({ limit: 100 });

          if (
            allListingsResponse.success &&
            allListingsResponse.data?.listings
          ) {
            // Filter listings by query on the client side
            const clientFilteredListings =
              allListingsResponse.data.listings.filter((listing: any) => {
                // First check if the listing matches the category and subcategory filters
                if (params?.category?.mainCategory) {
                  // If category filter is provided, check if the listing matches
                  if (
                    listing.category?.mainCategory !==
                    params.category.mainCategory
                  ) {
                    return false;
                  }

                  // If subcategory filter is provided, check if the listing matches
                  if (
                    params.category.subCategory &&
                    listing.category?.subCategory !==
                      params.category.subCategory
                  ) {
                    return false;
                  }
                }

                // If query is empty (just filtering by category), return true
                if (!normalizedQuery) return true;

                // Check each field with fuzzy matching
                const fieldsToSearch = [
                  listing.title,
                  listing.description,
                  listing.details?.vehicles?.make,
                  listing.details?.vehicles?.model,
                ];

                return fieldsToSearch.some(
                  (field) => field && this.fuzzyMatch(field, normalizedQuery),
                );
              });

            console.log(
              `Found ${clientFilteredListings.length} listings with client-side filtering`,
            );

            if (clientFilteredListings.length > 0) {
              return {
                success: true,
                data: {
                  listings: clientFilteredListings,
                  total: clientFilteredListings.length,
                  page: 1,
                  limit: clientFilteredListings.length,
                },
              };
            }
          }
        } catch (fallbackError) {
          console.error("Error in fallback search approach:", fallbackError);
        }
      }

      return data;
    } catch (error) {
      console.error("Error searching listings:", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error ? error.message : "Failed to search listings",
      };
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
      // Let the backend handle authentication via cookies
      const queryParams = new URLSearchParams();
      if (userId) queryParams.append("userId", userId);

      const requestConfig: any = {};

      // const response = await apiClient.get<APIResponse<UserListingsResponse>>(
      //   `/listings/user${queryString ? `?${queryString}` : ""}`,
      //   requestConfig,
      // );

      const response = await apiClient.get<APIResponse<FavoritesResponse>>(
        `/listings/favorites${queryParams.toString() ? `?${queryParams}` : ""}`,
        requestConfig,
      );
      console.log(response);

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
