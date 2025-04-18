import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { listingsAPI } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { Listing } from "@/types/listings";

interface SavedListingsState {
  savedListings: string[];
  savingIds: string[]; // ids currently being saved/unsaved
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
    setState(prev => ({ ...prev, savingIds: [...prev.savingIds, id] }));
    try {
      await listingsAPI.save(id);
      setState((prev) => ({
        ...prev,
        savedListings: [...prev.savedListings, id],
        savingIds: prev.savingIds.filter((savingId) => savingId !== id),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        savingIds: prev.savingIds.filter((savingId) => savingId !== id),
      }));
      // Optionally show a toast or error
    }
  }, []);

  const removeFromSaved = useCallback(async (id: string): Promise<void> => {
    if (!id) return;
    setState(prev => ({ ...prev, savingIds: [...prev.savingIds, id] }));
    try {
      await listingsAPI.unsave(id);
      setState((prev) => ({
        ...prev,
        savedListings: prev.savedListings.filter((savedId) => savedId !== id),
        savingIds: prev.savingIds.filter((savingId) => savingId !== id),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        savingIds: prev.savingIds.filter((savingId) => savingId !== id),
      }));
      // Optionally show a toast or error
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
      const response = await listingsAPI.getAll(
        user.id,
        controller.signal,
      );
      if (response.success && response.data?.items) {
        setState((prev) => ({
          ...prev,
          savedListings: response.data.items
            .map((listing: { id?: string }) => listing.id)
            .filter((id: string | undefined): id is string => id !== undefined),
          isLoading: false,
          lastUpdated: new Date(),
        }));
      } else {
        throw new Error(response.message || "Failed to fetch saved listings");
      }
    } catch (error: unknown) {
      // Don't update state if the request was aborted
      if (error instanceof Error && error.name === "AbortError") return;

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch saved listings",
      }));
      toast.error("Failed to fetch saved listings");
    } finally {
      isRefreshing.current = false;
      abortControllerRef.current = null;
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    // Only fetch if we're authenticated and haven't yet fetched
    if (isAuthenticated && user?.id && !state.lastUpdated && !state.isLoading) {
      refresh();
    } else if (!isAuthenticated) {
      clearSaved();
    }

    // Cleanup when the component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    isAuthenticated,
    user?.id,
    refresh,
    clearSaved,
    state.lastUpdated,
    state.isLoading,
  ]);

  const value: SavedListingsContextType = {
    ...state,
    isSaved,
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
