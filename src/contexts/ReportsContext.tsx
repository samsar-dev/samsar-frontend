import React, { createContext, useState, useCallback } from "react";
import { ReportsAPI } from "@/api/reports.api";
import type {
  Report,
  ReportCreateInput,
  ReportUpdateInput,
} from "@/types/reports";

export interface ReportsContextType {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  createReport: (input: ReportCreateInput) => Promise<void>;
  updateReport: (id: string, input: ReportUpdateInput) => Promise<void>;
}

export const ReportsContext = createContext<ReportsContextType | null>(null);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await ReportsAPI.getReports();
      if (response.success && response.data) {
        setReports(response.data.items);
        setError(null);
      } else {
        setError(response.error || "Failed to fetch reports");
      }
    } catch (err) {
      setError("An error occurred while fetching reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReport = useCallback(
    async (input: ReportCreateInput) => {
      try {
        const response = await ReportsAPI.createReport(input);
        if (response.success) {
          await fetchReports();
        } else {
          setError(response.error || "Failed to create report");
        }
      } catch (err) {
        setError("An error occurred while creating report");
      }
    },
    [fetchReports],
  );

  const updateReport = useCallback(
    async (id: string, input: ReportUpdateInput) => {
      try {
        const response = await ReportsAPI.updateReport(id, input);
        if (response.success) {
          await fetchReports();
        } else {
          setError(response.error || "Failed to update report");
        }
      } catch (err) {
        setError("An error occurred while updating report");
      }
    },
    [fetchReports],
  );

  const value = {
    reports,
    isLoading,
    error,
    fetchReports,
    createReport,
    updateReport,
  };

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
};
