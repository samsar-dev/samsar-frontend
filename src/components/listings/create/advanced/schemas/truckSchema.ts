import { ListingFieldSchema } from "@/types/listings";

export const truckSchema: ListingFieldSchema[] = [
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
    name: "transmissionType",
    label: "listings.transmission",
    type: "select",
    options: ["automatic", "manual", "automated"],
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Transmission type is required" : null,
  },
  {
    name: "cabType",
    label: "listings.cabType",
    type: "select",
    options: ["regular", "extended", "crew", "sleeper"],
    section: "essential",
    required: true,
  },
  {
    name: "bedLength",
    label: "listings.bedLength",
    type: "select",
    options: ["short", "standard", "long"],
    section: "essential",
    required: true,
  },
  {
    name: "payload",
    label: "listings.payload",
    type: "number",
    section: "performance",
    required: true,
  },
  {
    name: "towingCapacity",
    label: "listings.towingCapacity",
    type: "number",
    section: "performance",
    required: true,
  },
  {
    name: "fuelType",
    label: "listings.fuelType",
    type: "select",
    options: ["diesel", "gasoline", "cng", "lpg"],
    section: "performance",
    required: true,
  },
  {
    name: "axleConfiguration",
    label: "listings.axleConfiguration",
    type: "select",
    options: ["4x2", "4x4", "6x2", "6x4", "8x4"],
    section: "performance",
  },
];
