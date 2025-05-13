import type { Listing } from "./listings";

export type FormState = Omit<
  Listing,
  "id" | "createdAt" | "updatedAt" | "userId" | "favorite"
> & {
  price: string | number;
};

export type ExtendedFormState = FormState & {
  status: ListingStatus;
  listingAction: ListingAction;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
};
