import { useCallback, useState } from "react";
import { reportsAPI } from "@/api";
import type { Report, ReportStatus, ReportType, ReportReason } from "@/types";

export interface UseReportsReturn {
  reports: Report[];
  loading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  createReport: (
    type: ReportType,
    targetId: string,
    reason: ReportReason,
  ) => Promise<void>;
  updateReportStatus: (id: string, status: ReportStatus) => Promise<void>;
}

export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getReports();
      if (response.success && response.data) {
        setReports(response.data.items);
      } else {
        setError(response.error || "Failed to fetch reports");
      }
    } catch (err) {
      setError("An error occurred while fetching reports");
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(
    async (type: ReportType, targetId: string, reason: ReportReason) => {
      try {
        const response = await reportsAPI.createReport({
          type,
          targetId,
          reason,
        });
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

  const updateReportStatus = useCallback(
    async (id: string, status: ReportStatus) => {
      try {
        const response = await reportsAPI.updateReport(id, { status });
        if (response.success) {
          await fetchReports();
        } else {
          setError(response.error || "Failed to update report status");
        }
      } catch (err) {
        setError("An error occurred while updating report status");
      }
    },
    [fetchReports],
  );

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReportStatus,
  };
}
