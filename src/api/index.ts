// �� src/api/index.ts

import { ACTIVE_API_URL, ACTIVE_SOCKET_URL } from "@/config";

// Export all API modules
export * from "./auth.api";
export * from "./common.api";
export * from "./components.api";
export * from "./listings.api";
export * from "./messaging.api";
export * from "./notifications.api";
export * from "./reports.api";
export * from "./search.api";
export * from "./settings.api";
export * from "./socket.api";

// Export configured API client
export { default as apiClient } from "./apiClient";

// Base API configuration
export const apiConfig = {
  baseURL: ACTIVE_API_URL,
  socketURL: ACTIVE_SOCKET_URL,
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include" as RequestCredentials,
};

// Utility function for API requests
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${ACTIVE_API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "Network response was not ok");
  }

  return response.json();
}

// Export common API utilities
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : "";
    return fetchAPI<T>(`${endpoint}${queryString}`);
  },

  post: <T>(endpoint: string, data?: any) =>
    fetchAPI<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: any) =>
    fetchAPI<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) => fetchAPI<T>(endpoint, { method: "DELETE" }),
};

// Custom search API
import { apiClient } from "./apiClient";

export const searchAPI = {
  get: (url: string) => apiClient.get(url),
  getSuggestions: (query: string) =>
    apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`),
};

// Messaging APIs
export const messagesAPI = {
  getConversations: () => apiClient.get("/messages/conversations"),
  getConversation: (id: string) =>
    apiClient.get(`/messages/conversations/${id}`),
  getMessages: (conversationId: string) =>
    apiClient.get(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, input: { content: string }) =>
    apiClient.post(`/messages/conversations/${conversationId}/messages`, input),
  createConversation: (input: {
    participantIds: string[];
    initialMessage?: string;
  }) => apiClient.post("/messages/conversations", input),
  markAsRead: (conversationId: string, messageId: string) =>
    apiClient.put(
      `/messages/conversations/${conversationId}/messages/${messageId}/read`,
    ),
  deleteMessage: (conversationId: string, messageId: string) =>
    apiClient.delete(
      `/messages/conversations/${conversationId}/messages/${messageId}`,
    ),
  deleteConversation: (conversationId: string) =>
    apiClient.delete(`/messages/conversations/${conversationId}`),
};

// Reports API
export const reportsAPI = {
  getReports: () => apiClient.get("/reports"),
  createReport: (input: { type: string; targetId: string; reason: string }) =>
    apiClient.post("/reports", input),
  updateReport: (id: string, input: { status: string }) =>
    apiClient.put(`/reports/${id}`, input),
};

// Listings API
export const listingsAPI = {
  getAll: (params?: { category?: string; page?: number; limit?: number }) =>
    apiClient.get("/listings", { params }),
  getById: (id: string) => apiClient.get(`/listings/${id}`),
  getSaved: () => apiClient.get("/listings/saved"),
  save: (id: string) => apiClient.post(`/listings/${id}/save`),
  unsave: (id: string) => apiClient.delete(`/listings/${id}/save`),
  create: (data: FormData) => apiClient.post("/listings", data),
  update: (id: string, data: FormData) =>
    apiClient.put(`/listings/${id}`, data),
  delete: (id: string) => apiClient.delete(`/listings/${id}`),
};
