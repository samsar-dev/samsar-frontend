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
   addToSaved: (id: string) => void;
   removeFromSaved: (id: string) => void;
   toggleSaved: (id: string) => void;
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
      [state.savedListings]
   );

   const addToSaved = useCallback((id: string): void => {
      if (!id) return;
      setState((prev) => ({
         ...prev,
         savedListings: [...prev.savedListings, id],
      }));
   }, []);

   const removeFromSaved = useCallback((id: string): void => {
      if (!id) return;
      setState((prev) => ({
         ...prev,
         savedListings: prev.savedListings.filter((savedId) => savedId !== id),
      }));
   }, []);

   const toggleSaved = useCallback(
      (id: string): void => {
         if (!id) return;
         if (isSaved(id)) {
            removeFromSaved(id);
         } else {
            addToSaved(id);
         }
      },
      [isSaved, removeFromSaved, addToSaved]
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
         const response = await listingsAPI.getSavedListings(user.id, controller.signal);
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
            throw new Error(
               response.message || "Failed to fetch saved listings"
            );
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
   }, [isAuthenticated, user?.id, refresh, clearSaved, state.lastUpdated, state.isLoading]);

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
         "useSavedListings must be used within a SavedListingsProvider"
      );
   }
   return context;
};

export default SavedListingsProvider;