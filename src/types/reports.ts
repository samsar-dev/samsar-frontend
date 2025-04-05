import type { APIResponse, PaginatedData } from "./api";

export enum ReportType {
  USER = "user",
  LISTING = "listing",
  MESSAGE = "message",
  COMMENT = "comment",
}

export enum ReportStatus {
  PENDING = "pending",
  INVESTIGATING = "investigating",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export enum ReportReason {
  SPAM = "spam",
  INAPPROPRIATE = "inappropriate",
  MISLEADING = "misleading",
  OFFENSIVE = "offensive",
  HARASSMENT = "harassment",
  OTHER = "other",
}

export interface Report {
  id: string;
  type: ReportType;
  targetId: string;
  reason: ReportReason;
  status: ReportStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface ReportCreateInput {
  type: ReportType;
  targetId: string;
  reason: ReportReason;
  notes?: string;
}

export interface ReportUpdateInput {
  status?: ReportStatus;
  notes?: string;
}

// Component Props Types
export interface ReportFormProps {
  onSubmit: (data: ReportCreateInput) => Promise<void>;
  type: ReportType;
  targetId: string;
  initialData?: Partial<ReportCreateInput>;
  className?: string;
}

export interface ReportListProps {
  reports: Report[];
  onStatusChange?: (reportId: string, status: ReportStatus) => Promise<void>;
  onAssign?: (reportId: string, userId: string) => Promise<void>;
  className?: string;
}

export interface ReportDetailsProps {
  report: Report;
  onUpdate: (data: ReportUpdateInput) => Promise<void>;
  className?: string;
}

// API Response Types
export type ReportResponse = APIResponse<Report>;
export type ReportsResponse = APIResponse<PaginatedData<Report>>;

// Stats Types
export interface ReportStats {
  total: number;
  pending: number;
  investigating: number;
  resolved: number;
  dismissed: number;
  byType: {
    [key in ReportType]: number;
  };
}
