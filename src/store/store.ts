import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { listingEditReducer } from "./listing";
import { listingDetailsReducer } from "./listing/listingDetails.reducer";
import { filtersReducer } from "./filters/filters.reducer";

const rootReducer = combineReducers({
  listingEdit: listingEditReducer,
  listingDetails: listingDetailsReducer,
  filters: filtersReducer,
  // Add other reducers here
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload.timestamp"],
        ignoredPaths: ["items.dates"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
