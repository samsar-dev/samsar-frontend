import type { Listing } from "./listings";

export type FormState = Omit<
  Listing,
  "id" | "createdAt" | "updatedAt" | "userId" | "favorite"
> & {
  price: string | number;
};
