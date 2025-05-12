import apiClient from "./apiClient";
import type { ComponentData, APIResponse } from "@/types/common";

// Import components with default imports for layout components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tooltip } from "@/components/ui/tooltip";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Import components with named imports for UI components
import { Button } from "@/components/ui/Button2";
import { SearchBar } from "@/components/search/SearchBar";

// Re-export all components
export {
  // Layout components
  Navbar,
  Footer,
  // UI components
  Button,
  SearchBar,
  Tooltip,
  LoadingSpinner,
};

// Component API
export class ComponentsAPI {
  private static BASE_PATH = "/components";

  static async fetchComponentData(): Promise<APIResponse<ComponentData>> {
    const response = await apiClient.get<APIResponse<ComponentData>>(
      `${this.BASE_PATH}/data`,
    );
    return response.data;
  }

  static async getComponent(id: string): Promise<APIResponse<ComponentData>> {
    const response = await apiClient.get<APIResponse<ComponentData>>(
      `${this.BASE_PATH}/${id}`,
    );
    return response.data;
  }
}

// Export a singleton instance
export const componentsAPI = {
  ...ComponentsAPI,
};
