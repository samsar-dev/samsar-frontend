import React, {
   createContext,
   useContext,
   useState,
   useCallback,
   useEffect,
} from "react";
import { listingsAPI } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

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

   const { user, isAuthenticated } = useAuth();

   const isSaved = useCallback(
      (id: string): boolean => {
         return state.savedListings.includes(id);
      },
      [state.savedListings]
   );

   const addToSaved = useCallback((id: string): void => {
      setState((prev) => ({
         ...prev,
         savedListings: [...prev.savedListings, id],
      }));
   }, []);

   const removeFromSaved = useCallback((id: string): void => {
      setState((prev) => ({
         ...prev,
         savedListings: prev.savedListings.filter((savedId) => savedId !== id),
      }));
   }, []);

   const toggleSaved = useCallback(
      (id: string): void => {
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

      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
         const response = await listingsAPI.getSavedListings(user.id);
         if (response.success && response.data?.items) {
            setState((prev) => ({
               ...prev,
               savedListings: response.data.items
                  .map((listing) => listing.id)
                  .filter((id): id is string => id !== undefined),
               isLoading: false,
               lastUpdated: new Date(),
            }));
         } else {
            throw new Error(
               response.message || "Failed to fetch saved listings"
            );
         }
      } catch (error) {
         setState((prev) => ({
            ...prev,
            isLoading: false,
            error:
               error instanceof Error
                  ? error.message
                  : "Failed to fetch saved listings",
         }));
         toast.error("Failed to fetch saved listings");
      }
   }, [isAuthenticated, user?.id]);

   useEffect(() => {
      if (isAuthenticated && user?.id) {
         refresh();
      } else {
         clearSaved();
      }
   }, [isAuthenticated, user?.id, refresh, clearSaved]);

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
