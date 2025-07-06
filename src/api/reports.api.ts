import apiClient from './apiClient';
import type { APIResponse, PaginatedData } from '@/types/api';
import type { Report, ReportCreateInput, ReportUpdateInput } from '@/types/reports';

const BASE_URL = '/reports';

interface CreateReportResponse {
  success: boolean;
  data: Report;
  status: number;
  error?: string;
}

function createErrorResponse<T>(error: any, defaultMessage: string): APIResponse<T> {
  return {
    success: false,
    error: error.response?.data?.error || defaultMessage,
    message: error.response?.data?.message || defaultMessage,
    data: null as unknown as T,
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
      return createErrorResponse<PaginatedData<Report>>(error, "Failed to fetch reports");
    }
  },

  async getReport(id: string): Promise<APIResponse<Report>> {
    try {
      const response = await apiClient.get<APIResponse<Report>>(
        `${BASE_URL}/${id}`,
      );
      return response.data;
    } catch (error: any) {
      return createErrorResponse<Report>(error, "Failed to fetch report");
    }
  },

  async createReport(input: ReportCreateInput): Promise<APIResponse<Report>> {
    try {
      const response = await apiClient.post<CreateReportResponse>(
        BASE_URL,
        {
          type: input.type,
          targetId: input.targetId,
          reason: input.reason,
          notes: input.notes || null
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create report');
      }
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error in createReport:', error);
      return createErrorResponse<Report>(
        error,
        error.response?.data?.error || error.message || 'Failed to create report'
      );
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
      return createErrorResponse<Report>(error, "Failed to update report");
    }
  },

  async deleteReport(id: string): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete<APIResponse<void>>(
        `${BASE_URL}/${id}`,
      );
      return response.data;
    } catch (error: any) {
      return createErrorResponse<void>(error, "Failed to delete report");
    }
  },
};
