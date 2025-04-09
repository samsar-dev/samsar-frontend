import { ListingFieldSchema } from "@/types/listings";

export const motorcycleSchema: ListingFieldSchema[] = [
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
    name: "transmissionType",
    label: "listings.transmission",
    type: "select",
    options: ["manual", "automatic", "semiAutomatic"],
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Transmission type is required" : null,
  },
  {
    name: "startType",
    label: "listings.startType",
    type: "select",
    options: ["electric", "kickStart", "both"],
    section: "essential",
    required: true,
  },
  {
    name: "brakeType",
    label: "listings.brakeType",
    type: "select",
    options: ["disc", "drum", "abs", "combined"],
    section: "performance",
    required: true,
  },
  {
    name: "riderAids",
    label: "listings.riderAids",
    type: "multiselect",
    options: ["abs", "tractionControl", "ridingModes", "quickshifter"],
    section: "performance",
  },
  {
    name: "accessories",
    label: "listings.accessories",
    type: "multiselect",
    options: ["windscreen", "luggage", "crashBars", "heatedGrips"],
    section: "comfort",
  },
];
