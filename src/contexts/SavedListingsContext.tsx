import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { listingsAPI } from "@/api/listings.api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Utility functions for localStorage hydration
const LOCAL_STORAGE_KEY = "savedListings";

function loadSavedListingsFromStorage(): string[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSavedListingsToStorage(list: string[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

interface SavedListingsState {
  savedListings: string[];
  savingIds: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface SavedListingsContextType {
  savedListings: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isSaved: (id: string) => boolean;
  isSaving: (id: string) => boolean;
  addToSaved: (id: string) => Promise<void>;
  removeFromSaved: (id: string) => Promise<void>;
  toggleSaved: (id: string) => Promise<void>;
  clearSaved: () => void;
  refresh: () => Promise<void>;
}

const SavedListingsContext = createContext<
  SavedListingsContextType | undefined
>(undefined);

interface SavedListingsProviderProps {
  children: React.ReactNode;
}

export const SavedListingsProvider: React.FC<SavedListingsProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<SavedListingsState>({
    savedListings: [],
    savingIds: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Hydrate savedListings from local storage on mount for instant UI
  useEffect(() => {
    const saved = loadSavedListingsFromStorage();
    setState((prev) => ({
      ...prev,
      savedListings: saved,
    }));
  }, []);

  // Sync savedListings to local storage whenever it changes
  useEffect(() => {
    saveSavedListingsToStorage(state.savedListings);
  }, [state.savedListings]);

  // Use a ref to track if a refresh is in progress
  const isRefreshing = useRef(false);
  // Use a ref to store the abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  const { user, isAuthenticated } = useAuth();

  const isSaved = useCallback(
    (id: string): boolean => {
      if (!id) return false;
      return state.savedListings.includes(id);
    },
    [state.savedListings],
  );

  const isSaving = useCallback(
    (id: string): boolean => {
      if (!id) return false;
      return state.savingIds.includes(id);
    },
    [state.savingIds],
  );

  const addToSaved = useCallback(async (id: string): Promise<void> => {
    if (!id) return;

    // Optimistically update UI
    setState((prev) => ({
      ...prev,
      savingIds: [...prev.savingIds, id],
      savedListings: [...prev.savedListings, id], // Add immediately for optimistic update
    }));

    try {
      await listingsAPI.saveListing(id);
      // On success, just remove from savingIds since we already added to savedListings
      setState((prev) => ({
        ...prev,
        savingIds: prev.savingIds.filter((savingId) => savingId !== id),
        lastUpdated: new Date(), // Update timestamp
      }));
    } catch (error) {
      // On error, revert both changes
      setState((prev) => ({
        ...prev,
        savedListings: prev.savedListings.filter((savedId) => savedId !== id),
        savingIds: prev.savingIds.filter((savingId) => savingId !== id),
      }));
      toast.error("Failed to save listing");
    }
  }, []);

  const removeFromSaved = useCallback(async (id: string): Promise<void> => {
    if (!id) return;

    // Optimistically update UI
    setState((prev) => ({
      ...prev,
      savingIds: [...prev.savingIds, id],
      savedListings: prev.savedListings.filter((savedId) => savedId !== id), // Remove immediately
    }));

    try {
      await listingsAPI.removeFavorite(id);
      // On success, just remove from savingIds since we already removed from savedListings
      setState((prev) => ({
        ...prev,
        savingIds: prev.savingIds.filter((savingId) => savingId !== id),
        lastUpdated: new Date(), // Update timestamp
      }));
    } catch (error) {
      // On error, revert both changes
      setState((prev) => ({
        ...prev,
        savedListings: [...prev.savedListings, id], // Add back to saved
        savingIds: prev.savingIds.filter((savingId) => savingId !== id),
      }));
      toast.error("Failed to remove from saved");
    }
  }, []);

  const toggleSaved = useCallback(
    async (id: string): Promise<void> => {
      if (!id) return;
      if (isSaved(id)) {
        await removeFromSaved(id);
      } else {
        await addToSaved(id);
      }
    },
    [isSaved, removeFromSaved, addToSaved],
  );

  const clearSaved = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      savedListings: [],
      lastUpdated: null,
    }));
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user?.id) return;

    // If already refreshing, don't start another refresh
    if (isRefreshing.current) return;

    // Cancel any in-progress request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isRefreshing.current = true;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await listingsAPI.getSavedListings(
        user.id,
        controller.signal,
      );

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          savedListings: Array.isArray(response.data)
            ? response.data
                .map((listing: { id?: string }) => listing.id)
                .filter(
                  (id: string | undefined): id is string => id !== undefined,
                )
            : [],
          isLoading: false,
          lastUpdated: new Date(),
          error: null, // Clear any previous errors
        }));
      } else {
        // Only throw if we have an actual error
        if (response.error) {
          throw new Error(response.error);
        }
        // If no error but also no success, set empty state
        setState((prev) => ({
          ...prev,
          savedListings: [],
          isLoading: false,
          lastUpdated: new Date(),
          error: null,
        }));
      }
    } catch (error: unknown) {
      // Don't update state if the request was aborted
      if (error instanceof Error && error.name === "AbortError") return;

      // Only show error toast for non-abort errors
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch saved listings";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Only show toast for network errors or unexpected errors
      if (
        !(error instanceof Error) ||
        !error.message.includes("No saved listings found")
      ) {
        toast.error(errorMessage);
      }
    } finally {
      isRefreshing.current = false;
      abortControllerRef.current = null;
    }
  }, [isAuthenticated, user?.id]);

  const fetchListings = useCallback(async () => {
    await refresh();
  }, [refresh]);

  useEffect(() => {
    fetchListings();

    // Set up periodic refresh
    // const refreshInterval = setInterval(() => {
    //   if (!isRefreshing.current) {
    //     fetchListings();
    //   }
    // }, 30000); // Refresh every 30 seconds

    // return () => {
    //   clearInterval(refreshInterval);
    //   if (abortControllerRef.current) {
    //     abortControllerRef.current.abort();
    //   }
    // };
  }, [fetchListings]);

  // Sync with localStorage
  useEffect(() => {
    if (state.lastUpdated && state.savedListings.length > 0) {
      localStorage.setItem(
        "savedListings",
        JSON.stringify({
          listings: state.savedListings,
          timestamp: state.lastUpdated.getTime(),
        }),
      );
    }
  }, [state.savedListings, state.lastUpdated]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("savedListings");
    if (saved) {
      try {
        const { listings, timestamp } = JSON.parse(saved);
        const lastUpdated = new Date(timestamp);

        // Only use cached data if it's less than 1 hour old
        if (Date.now() - lastUpdated.getTime() < 3600000) {
          setState((prev) => ({
            ...prev,
            savedListings: listings,
            lastUpdated,
          }));
        }
      } catch (error) {
        console.error("Error loading saved listings from cache:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Only fetch if we're authenticated and haven't yet fetched
    if (isAuthenticated && user?.id && !state.lastUpdated && !state.isLoading) {
      refresh();
    } else if (!isAuthenticated) {
      clearSaved();
    }
  }, [isAuthenticated, user?.id, refresh, clearSaved]);

  const value: SavedListingsContextType = {
    ...state,
    isSaved,
    isSaving,
    addToSaved,
    removeFromSaved,
    toggleSaved,
    clearSaved,
    refresh,
  };

  return (
    <SavedListingsContext.Provider value={value}>
      {children}
    </SavedListingsContext.Provider>
  );
};

export const useSavedListings = (): SavedListingsContextType => {
  const context = useContext(SavedListingsContext);
  if (!context) {
    throw new Error(
      "useSavedListings must be used within a SavedListingsProvider",
    );
  }
  return context;
};

export default SavedListingsProvider;
