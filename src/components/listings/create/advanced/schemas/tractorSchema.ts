import { ListingFieldSchema } from "@/types/listings";

export const tractorSchema: ListingFieldSchema[] = [
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
    name: "interiorColor",
    label: "interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Interior color is required" : null),
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
    name: "horsepower",
    label: "horsepower",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null)
        return "Horsepower is required";
      if (value < 0) return "Horsepower must be 0 or greater";
      return null;
    },
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
    options: ["registered", "notRegistered", "other"],
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Registration status is required" : null,
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
    options: ["manual", "automatic", "hydrostatic"],
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Transmission type is required" : null,
  },

  // Advanced Section
  {
    name: "torque",
    label: "torque",
    type: "number",
    section: "advanced",
    required: false,
    validate: (value: number) => {
      if (value === undefined || value === null) return null;
      if (value < 0) return "Torque must be 0 or greater";
      return null;
    },
  },
  {
    name: "engine",
    label: "engine",
    type: "text",
    section: "advanced",
    required: false,
    validate: (value: string) => (!value ? null : null),
  },
  {
    name: "attachments",
    label: "attachments",
    type: "multiselect",
    options: ["Front Loader", "Backhoe", "Plow", "Mower", "Sprayer", "Other"],
    section: "advanced",
    required: false,
  },
  {
    name: "serviceHistory",
    label: "serviceHistory",
    type: "select",
    options: ["complete", "partial", "unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "fuelTankCapacity",
    label: "fuelTankCapacity",
    type: "number",
    section: "advanced",
    required: false,
    validate: (value: number) => {
      if (value === undefined || value === null) return null;
      if (value < 0) return "Fuel tank capacity must be 0 or greater";
      return null;
    },
  },
  {
    name: "tires",
    label: "tires",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "features",
    label: "features",
    type: "multiselect",
    options: [
      "CAB",
      "Air Conditioning",
      "Power Steering",
      "Power Windows",
      "Power Locks",
      "Navigation System",
      "Bluetooth",
      "Other",
    ],
    section: "advanced",
    required: false,
  },
];
