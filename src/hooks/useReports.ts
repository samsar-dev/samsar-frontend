import { useCallback, useState } from "react";
import { ReportsAPI } from "@/api/reports.api";
import type {
  Report,
  ReportStatus,
  ReportType,
  ReportReason,
  ReportCreateInput,
} from "@/types/reports";

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
    setError(null);
    try {
      const response = await ReportsAPI.getReports();
      if (response.data) {
        setReports(response.data.items || []);
      } else {
        setError(response?.error || "Failed to fetch reports");
      }
    } catch (err) {
      setError("An error occurred while fetching reports");
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(
    async (type: ReportType, targetId: string, reason: ReportReason) => {
      setLoading(true);
      setError(null);
      try {
        const reportData: ReportCreateInput = {
          type,
          targetId,
          reason,
        };
        const response = await ReportsAPI.createReport(reportData);
        if (response.data) {
          await fetchReports();
        } else {
          setError(response?.error || "Failed to create report");
        }
      } catch (err) {
        setError("An error occurred while creating report");
      } finally {
        setLoading(false);
      }
    },
    [fetchReports],
  );

  const updateReportStatus = useCallback(
    async (id: string, status: ReportStatus) => {
      setLoading(true);
      setError(null);
      try {
        const response = await ReportsAPI.updateReport(id, {
          status,
        });
        if (response.data) {
          setReports((prev) =>
            prev.map((report) =>
              report.id === id ? { ...report, status } : report,
            ),
          );
        } else {
          setError(response?.error || "Failed to update report status");
        }
      } catch (err) {
        setError("An error occurred while updating report status");
      } finally {
        setLoading(false);
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
