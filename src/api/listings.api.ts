import { apiClient } from "./apiClient";
import type { Listing, ListingsResponse } from "@/types/listings";
import type { ListingParams } from "@/types/params";
import { AxiosError } from "axios";
import type {
  ListingCategory,
  Condition,
  VehicleType,
  PropertyType,
} from "@/types/enums";
import type{ FormState } from "@/types/forms";
import { API_URL } from "@/config";

interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

interface FavoritesResponse {
  items: FavoriteItem[];
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

    const response = await apiClient.post("/listings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // Add timeout to prevent long-running requests
      timeout: 30000,
    });

    if (!response.data.success) {
      throw new Error(
        response.data.error?.message || "Failed to create listing"
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error creating listing:", error);
    if (error instanceof AxiosError && error.response?.status === 401) {
      throw new Error("Please log in to create a listing");
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to create listing"
    );
  }
};

export const listingsAPI = {
  async getAll(params: ListingParams): Promise<APIResponse<ListingsResponse>> {
    try {
      const queryParams = new URLSearchParams();

      // Add category filters if present
      if (params.mainCategory) {
        queryParams.append("mainCategory", params.mainCategory);
      }
      if (params.subCategory) {
        queryParams.append("subCategory", params.subCategory);
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

      const response = await fetch(`${API_URL}/listings?${queryParams}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch listings");
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          listings: data.data?.items || [],
          total: data.data?.total || 0,
          page: data.data?.page || 1,
          limit: data.data?.limit || 10,
        },
        error: undefined,
      };
    } catch (error) {
      console.error("Error fetching listings:", error);
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
        error instanceof Error ? error.message : "Failed to fetch listing"
      );
    }
  },

  // Update a listing
  async updateListing(
    id: string,
    formData: FormData
  ): Promise<APIResponse<Listing>> {
    try {
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
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating listing:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update listing"
      );
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
  async saveListing(id: string): Promise<APIResponse<Listing>> {
    try {
      const response = await fetch(`${API_URL}/listings/${id}/save`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving listing:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to save listing"
      );
    }
  },

  // Remove a listing from favorites
  async unsaveListing(id: string): Promise<APIResponse<Listing>> {
    try {
      const response = await fetch(`${API_URL}/listings/${id}/unsave`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error unsaving listing:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to unsave listing"
      );
    }
  },

  // Get listings by user
  async getUserListings(params?: ListingParams): Promise<APIResponse<Listing>> {
    try {
      const queryString = params
        ? new URLSearchParams(params as any).toString()
        : "";
      const response = await apiClient.get<APIResponse<Listing>>(
        `/listings/user${queryString ? `?${queryString}` : ""}`
      );

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      console.error("Error fetching user listings:", error);
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
  async getById(id: string): Promise<APIResponse<SingleListingResponse>> {
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

      return {
        success: true,
        data: response.data.data,
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
    formData: FormData
  ): Promise<APIResponse<SingleListingResponse>> {
    try {
      // Log the FormData contents before sending
      console.log("FormData entries being sent to API:");
      for (const pair of formData.entries()) {
        console.log(
          pair[0],
          ":",
          typeof pair[1] === "string" ? pair[1] : "File/Blob data"
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
    formData: FormData
  ): Promise<APIResponse<SingleListingResponse>> {
    try {
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
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating listing:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update listing"
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
    params?: ListingParams
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
        }
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
        error instanceof Error ? error.message : "Failed to search listings"
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
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching trending listings:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch trending listings"
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
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching listings by ids:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch listings by ids"
      );
    }
  },

  // Get listings by category
  async getListingsByCategory(
    category: ListingCategory
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
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching listings by category:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch listings by category"
      );
    }
  },

  // Get favorites
  async getFavorites(): Promise<APIResponse<FavoritesResponse>> {
    try {
      const response =
        await apiClient.get<APIResponse<FavoritesResponse>>(
          `/listings/favorites`
        );

      return {
        success: true,
        data: response.data.data,
        error: undefined,
      };
    } catch (error: any) {
      console.error("Error fetching favorites:", error);
      return {
        success: false,
        data: null,
        error:
          error.response?.data?.error?.message || "Failed to fetch favorites",
      };
    }
  },

  // Add favorite
  async addFavorite(listingId: string): Promise<APIResponse<FavoriteResponse>> {
    try {
      const response = await fetch(`${API_URL}/favorites`, {
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
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding favorite:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to add favorite"
      );
    }
  },

  // Remove favorite
  async removeFavorite(listingId: string): Promise<APIResponse<void>> {
    try {
      const response = await fetch(`${API_URL}/favorites/${listingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error removing favorite:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to remove favorite"
      );
    }
  },
};
