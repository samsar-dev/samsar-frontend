import { apiConfig } from "@/api/index";

class ServerStatusManager {
  private static instance: ServerStatusManager;
  private isServerOnline: boolean = true;
  private checkInProgress: boolean = false;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  private constructor() {}

  static getInstance(): ServerStatusManager {
    if (!ServerStatusManager.instance) {
      ServerStatusManager.instance = new ServerStatusManager();
    }
    return ServerStatusManager.instance;
  }

  async checkServerStatus(): Promise<boolean> {
    if (this.checkInProgress) return this.isServerOnline;

    this.checkInProgress = true;
    try {
      // Try health endpoint first
      try {
        const response = await fetch(`${apiConfig.baseURL}/health`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          this.isServerOnline = true;
          return true;
        }
      } catch (healthError) {
        console.warn("Health check failed, trying listings endpoint");
      }

      // If health check fails, try listings endpoint
      const listingsResponse = await fetch(
        `${apiConfig.baseURL}/listings?limit=1&preview=true`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      this.isServerOnline = listingsResponse.ok;
    } catch (error) {
      console.error("Server status check failed:", error);
      this.isServerOnline = false;
    } finally {
      this.checkInProgress = false;
      this.notifyListeners();
    }
    return this.isServerOnline;
  }

  subscribe(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.isServerOnline));
  }

  getStatus(): boolean {
    return this.isServerOnline;
  }
}

export const serverStatus = ServerStatusManager.getInstance();
