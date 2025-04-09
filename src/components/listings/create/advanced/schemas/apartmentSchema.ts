import { ListingFieldSchema } from "@/types/listings";

export const apartmentSchema: ListingFieldSchema[] = [
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: ["new", "excellent", "good", "fair", "needsWork"],
    section: "essential",
    required: true,
  },
  {
    name: "floor",
    label: "listings.floor",
    type: "number",
    section: "essential",
    required: true,
  },
  {
    name: "totalFloors",
    label: "listings.totalFloors",
    type: "number",
    section: "essential",
    required: true,
  },
  {
    name: "parking",
    label: "listings.parking",
    type: "select",
    options: ["garage", "underground", "street", "none"],
    section: "essential",
  },
  {
    name: "elevator",
    label: "listings.elevator",
    type: "checkbox",
    section: "features",
  },
  {
    name: "balcony",
    label: "listings.balcony",
    type: "checkbox",
    section: "features",
  },
  {
    name: "storage",
    label: "listings.storage",
    type: "checkbox",
    section: "features",
  },
  {
    name: "heating",
    label: "listings.heating",
    type: "select",
    options: ["central", "individual", "district", "none"],
    section: "features",
  },
  {
    name: "cooling",
    label: "listings.cooling",
    type: "select",
    options: ["central", "split", "window", "none"],
    section: "features",
  },
  {
    name: "buildingAmenities",
    label: "listings.buildingAmenities",
    type: "multiselect",
    options: ["gym", "pool", "sauna", "playground", "security"],
    section: "features",
  },
];
