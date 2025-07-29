import apiClient from "./apiClient";
import type { APIResponse, PaginatedData } from "@/types/api";

export interface CommonData {
  settings: {
    theme: string;
    language: string;
    notifications: boolean;
  };
  metadata: {
    version: string;
    lastUpdated: string;
  };
}

export class CommonAPI {
  private static BASE_PATH = "/common";

  static async getCommonData(): Promise<APIResponse<CommonData>> {
    const response = await apiClient.get<APIResponse<CommonData>>(
      `${this.BASE_PATH}/data`,
    );
    return response.data;
  }
}

export class PaginationAPI {
  static async getPaginatedData<T>(
    endpoint: string,
    params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    },
  ): Promise<APIResponse<PaginatedData<T>>> {
    const response = await apiClient.get<APIResponse<PaginatedData<T>>>(
      endpoint,
      {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder || "desc",
        },
      },
    );
    return response.data;
  }

  static getDefaultParams(): {
    page: number;
    limit: number;
    sortOrder: string;
  } {
    return {
      page: 1,
      limit: 10,
      sortOrder: "desc",
    };
  }

  static async getNextPage<T>(
    endpoint: string,
    currentPage: number,
    limit: number = 10,
  ): Promise<APIResponse<PaginatedData<T>>> {
    return this.getPaginatedData<T>(endpoint, {
      page: currentPage + 1,
      limit,
    });
  }

  static async getPreviousPage<T>(
    endpoint: string,
    currentPage: number,
    limit: number = 10,
  ): Promise<APIResponse<PaginatedData<T>>> {
    if (currentPage <= 1) {
      throw new Error("Already on first page");
    }
    return this.getPaginatedData<T>(endpoint, {
      page: currentPage - 1,
      limit,
    });
  }

  static calculatePaginationMeta(
    total: number,
    currentPage: number,
    limit: number,
  ) {
    return {
      currentPage,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: currentPage * limit < total,
      hasPreviousPage: currentPage > 1,
    };
  }
}

// Helper function to create paginated API endpoints
export const createPaginatedAPI = <T>(baseEndpoint: string) => ({
  getAll: async (params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<APIResponse<PaginatedData<T>>> =>
    PaginationAPI.getPaginatedData<T>(baseEndpoint, params),

  getNextPage: async (
    currentPage: number,
    limit?: number,
  ): Promise<APIResponse<PaginatedData<T>>> =>
    PaginationAPI.getNextPage<T>(baseEndpoint, currentPage, limit),

  getPreviousPage: async (
    currentPage: number,
    limit?: number,
  ): Promise<APIResponse<PaginatedData<T>>> =>
    PaginationAPI.getPreviousPage<T>(baseEndpoint, currentPage, limit),
});
