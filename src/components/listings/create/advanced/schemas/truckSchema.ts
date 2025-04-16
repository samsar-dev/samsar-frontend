import { ListingFieldSchema } from "@/types/listings";

export const truckSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "color",
    label: "exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Exterior color is required" : null),
  },
  {
    name: "condition",
    label: "condition",
    type: "select",
    options: ["new", "likeNew", "excellent", "good", "fair", "poor", "salvage"],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Condition is required" : null),
  },
  {
    name: "mileage",
    label: "mileage",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return "Mileage is required";
      if (value < 0) return "Mileage must be 0 or greater";
      return null;
    },
  },
  {
    name: "cabType",
    label: "cabType",
    type: "select",
    options: ["regular", "extended", "crew", "sleeper"],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Cab type is required" : null),
  },
  {
    name: "bedLength",
    label: "bedLength",
    type: "select",
    options: ["short", "standard", "long"],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Bed length is required" : null),
  },
  {
    name: "previousOwners",
    label: "previousOwners",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null)
        return "Previous owners is required";
      if (value < 0) return "Previous owners must be 0 or greater";
      return null;
    },
  },
  {
    name: "registrationStatus",
    label: "registrationStatus",
    type: "select",
    options: ["registered", "unregistered", "expired"],
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Registration status is required" : null,
  },
  {
    name: "payload",
    label: "payload",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return "Payload is required";
      if (value < 0) return "Payload must be greater than 0";
      return null;
    },
  },
  {
    name: "fuelType",
    label: "fuelType",
    type: "select",
    options: ["diesel", "gasoline", "electric", "hybrid"],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Fuel type is required" : null),
  },
  {
    name: "transmission",
    label: "transmission",
    type: "select",
    options: ["manual", "automatic", "automated"],
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Transmission type is required" : null,
  },

  // Advanced Section
  {
    name: "towingCapacity",
    label: "listings.towingCapacity",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "axleConfiguration",
    label: "listings.axleConfiguration",
    type: "select",
    options: ["4x2", "4x4", "6x2", "6x4", "8x4"],
    section: "advanced",
    required: false,
  },
  {
    name: "serviceHistory",
    label: "listings.serviceHistory",
    type: "select",
    options: ["full", "partial", "none"],
    section: "advanced",
    required: false,
  },
];
