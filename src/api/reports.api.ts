import apiClient from "./apiClient";
import type {
  APIResponse,
  Report,
  ReportCreateInput,
  ReportUpdateInput,
  PaginatedData,
} from "@/types";

const BASE_URL = "/reports";

function handleApiError(error: any, defaultMessage: string): APIResponse<any> {
  return {
    success: false,
    error: error.response?.data?.error || defaultMessage,
    data: null,
    status: error.response?.status || 500,
  };
}

export const ReportsAPI = {
  async getReports(params?: {
    page?: number;
    limit?: number;
    type?: Report["type"];
    status?: Report["status"];
  }): Promise<APIResponse<PaginatedData<Report>>> {
    try {
      const response = await apiClient.get<APIResponse<PaginatedData<Report>>>(
        BASE_URL,
        { params },
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to fetch reports");
    }
  },

  async getReport(id: string): Promise<APIResponse<Report>> {
    try {
      const response = await apiClient.get<APIResponse<Report>>(
        `${BASE_URL}/${id}`,
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to fetch report");
    }
  },

  async createReport(input: ReportCreateInput): Promise<APIResponse<Report>> {
    try {
      const response = await apiClient.post<APIResponse<Report>>(
        BASE_URL,
        input,
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to create report");
    }
  },

  async updateReport(
    id: string,
    input: ReportUpdateInput,
  ): Promise<APIResponse<Report>> {
    try {
      const response = await apiClient.patch<APIResponse<Report>>(
        `${BASE_URL}/${id}`,
        input,
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to update report");
    }
  },

  async deleteReport(id: string): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete<APIResponse<void>>(
        `${BASE_URL}/${id}`,
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to delete report");
    }
  },
};
