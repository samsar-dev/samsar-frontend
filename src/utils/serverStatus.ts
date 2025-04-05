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
      const response = await fetch(`${apiConfig.baseURL}/health`, {
        method: "GET",
        credentials: "include",
      });
      this.isServerOnline = response.ok;
    } catch (error) {
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
