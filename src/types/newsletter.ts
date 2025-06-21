export interface NewsletterResponse {
  success: boolean;
  message: string;
  data?: {
    sentCount: number;
    failedCount: number;
  };
}

export interface NewsletterFormData {
  subject: string;
  content: string;
  template?: string;
  isHtml?: boolean;
}
