import { ListingFieldSchema } from "@/types/listings";

export const landSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: ["new", "excellent", "good", "fair", "needsWork"],
    section: "essential",
    required: true,
  },
  {
    name: "size",
    label: "listings.lotSize",
    type: "text",
    section: "essential",
    required: true,
  },
  {
    name: "zoning",
    label: "listings.zoning",
    type: "select",
    options: ["residential", "commercial", "agricultural", "industrial", "mixedUse", "other"],
    section: "essential",
    required: false,
  },
  {
    name: "utilitiesAvailable",
    label: "listings.utilitiesAvailable",
    type: "checkbox",
    section: "essential",
    required: false,
  },
  {
    name: "accessRoad",
    label: "listings.accessRoad",
    type: "select",
    options: ["paved", "gravel", "dirt", "none"],
    section: "essential",
    required: false,
  },
  {
    name: "parcelNumber",
    label: "listings.parcelNumber",
    type: "text",
    section: "essential",
    required: false,
  },

  // Advanced Section
  {
    name: "fenced",
    label: "listings.fenced",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "topography",
    label: "listings.topography",
    type: "select",
    options: ["flat", "sloped", "mixed"],
    section: "advanced",
    required: false,
  },
  {
    name: "waterFeatures",
    label: "listings.waterFeatures",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "buildable",
    label: "listings.buildable",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "environmentalRestrictions",
    label: "listings.environmentalRestrictions",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "soilType",
    label: "listings.soilType",
    type: "text",
    section: "advanced",
    required: false,
  },
];
