// API Configuration Types
export interface APIConfig {
  baseUrl: string;
  productionUrl: string;
  timeout: number;
  withCredentials: boolean;
}

// Declare module for '@' alias
// @ts-ignore
export const API_CONFIG: APIConfig;
