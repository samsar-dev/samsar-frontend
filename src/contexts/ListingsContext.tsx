import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Listing } from "@/types/listings.ts";
import { listingsAPI } from "@/api/listings.api";
import { toast } from "react-toastify";

interface ListingsContextType {
  listings: Listing[];
  userListings: Listing[];
  isLoading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
  fetchUserListings: () => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  refetchListings: () => Promise<void>;
}

interface ListingsProviderProps {
  children: ReactNode;
}

const ListingsContext = createContext<ListingsContextType | null>(null);

export const ListingsProvider = ({ children }: ListingsProviderProps) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listingsAPI.getAll({});
      if (response.success) {
        setListings(response.data?.listings || []);
      } else {
        throw new Error(response.error || "Failed to fetch listings");
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      setError("Failed to fetch listings");
      setListings([]);
      toast.error("Failed to fetch listings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserListings = async () => {
    // Only attempt to fetch if user is authenticated
    if (!user?.id) {
      setUserListings([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      const response = await listingsAPI.getUserListings();

      if (response.success) {
        setUserListings(response.data?.listings || []);
      } else {
        throw new Error(response.error || "Failed to fetch user listings");
      }
    } catch (error: any) {
      // Don't show error toast for authentication errors
      if (error.message === "User not authenticated") {
        setUserListings([]);
        return;
      }

      console.error("Error fetching user listings:", error);
      setError("Failed to fetch user listings");
      setUserListings([]);
      toast.error("Failed to fetch user listings");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteListing = async (id: string) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setIsLoading(true);
      const response = await listingsAPI.delete(id);
      if (response.success) {
        toast.success("Listing deleted successfully");
        await fetchUserListings();
        await fetchListings();
      } else {
        throw new Error(response.error || "Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      setError("Failed to delete listing");
      toast.error("Failed to delete listing");
    } finally {
      setIsLoading(false);
    }
  };

  const refetchListings = async () => {
    await Promise.all([
      fetchListings(),
      user?.id ? fetchUserListings() : Promise.resolve(),
    ]);
  };

  // Fetch listings only when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserListings();
    } else {
      setUserListings([]);
    }
  }, [user?.id]);

  // Fetch all listings on mount
  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <ListingsContext.Provider
      value={{
        listings,
        userListings,
        isLoading,
        error,
        fetchListings,
        fetchUserListings,
        deleteListing,
        refetchListings,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error("useListings must be used within a ListingsProvider");
  }
  return context;
};
