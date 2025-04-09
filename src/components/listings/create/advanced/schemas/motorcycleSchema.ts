import { ListingFieldSchema } from "@/types/listings";

export const motorcycleSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "color",
    label: "listings.exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Exterior color is required" : null,
  },
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: ["new", "likeNew", "excellent", "good", "fair", "poor", "salvage"],
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Condition is required" : null,
  },
  {
    name: "mileage",
    label: "listings.mileage",
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
    name: "engineSize",
    label: "listings.engineSize",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Engine size is required" : null,
  },
  {
    name: "previousOwners",
    label: "listings.previousOwners",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return "Previous owners is required";
      if (value < 0) return "Previous owners must be 0 or greater";
      return null;
    },
  },
  {
    name: "registrationStatus",
    label: "listings.registrationStatus",
    type: "select",
    options: ["registered", "unregistered", "expired"],
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Registration status is required" : null,
  },
  {
    name: "brakeType",
    label: "listings.brakeType",
    type: "select",
    options: ["disc", "drum", "abs", "combined"],
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Brake type is required" : null,
  },
  {
    name: "fuelType",
    label: "listings.fuelType",
    type: "select",
    options: ["gasoline", "electric", "hybrid"],
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Fuel type is required" : null,
  },
  {
    name: "transmissionType",
    label: "listings.transmission",
    type: "select",
    options: ["manual", "automatic", "semi_automatic"],
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Transmission type is required" : null,
  },

  // Advanced Section
  {
    name: "startType",
    label: "listings.startType",
    type: "select",
    options: ["electric", "kickStart", "both"],
    section: "advanced",
    required: false,
  },
  {
    name: "riderAids",
    label: "listings.riderAids",
    type: "multiselect",
    options: ["abs", "tractionControl", "ridingModes", "quickshifter"],
    section: "advanced",
    required: false,
  },
  {
    name: "accessories",
    label: "listings.accessories",
    type: "multiselect",
    options: ["windscreen", "luggage", "crashBars", "heatedGrips"],
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
