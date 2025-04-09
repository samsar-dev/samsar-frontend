import { ListingFieldSchema } from "@/types/listings";

export const carSchema: ListingFieldSchema[] = [
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
    name: "interiorColor",
    label: "listings.interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Interior color is required" : null,
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
    name: "warranty",
    label: "listings.warranty",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return "Warranty months is required";
      if (value < 0) return "Warranty months must be 0 or greater";
      return null;
    },
  },
  {
    name: "serviceHistory",
    label: "listings.serviceHistory",
    type: "select",
    options: ["full", "partial", "none"],
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Service history is required" : null,
  },
  {
    name: "previousOwners",
    label: "listings.previousOwners",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return "Number of previous owners is required";
      if (value < 0) return "Number of previous owners must be 0 or greater";
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
    name: "transmissionType",
    label: "listings.transmission",
    type: "select",
    options: ["automatic", "manual", "semiAutomatic", "continuouslyVariable", "dualClutch"],
    section: "essential",
    required: true,
    validate: (value: string) => !value ? "Transmission type is required" : null,
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

  // Performance Section
  {
    name: "engine",
    label: "listings.engine",
    type: "text",
    section: "performance",
    required: false,
  },
  {
    name: "horsepower",
    label: "performance.horsepower",
    type: "number",
    section: "performance",
  },
  {
    name: "torque",
    label: "performance.torque",
    type: "number",
    section: "performance",
  },
  {
    name: "drivetrain",
    label: "performance.drivetrain",
    type: "select",
    options: ["fwd", "rwd", "awd", "4wd"],
    section: "performance",
  },

  // Comfort Section
  {
    name: "seatingMaterial",
    label: "comfort.seatingMaterial",
    type: "select",
    options: ["cloth", "leather", "leatherette", "premium_leather"],
    section: "comfort",
  },
  {
    name: "seatHeating",
    label: "comfort.seatHeating",
    type: "select",
    options: ["front", "front_rear", "none"],
    section: "comfort",
  },
  {
    name: "seatVentilation",
    label: "comfort.seatVentilation",
    type: "select",
    options: ["front", "front_rear", "none"],
    section: "comfort",
  },
  {
    name: "sunroof",
    label: "comfort.sunroof",
    type: "select",
    options: ["none", "standard", "panoramic", "dual_panel"],
    section: "comfort",
  },

  // Safety Section
  {
    name: "airbags",
    label: "safety.airbags",
    type: "select",
    options: ["front", "front_side", "full_curtain"],
    section: "safety",
  },
  {
    name: "parkingSensors",
    label: "safety.parkingSensors",
    type: "select",
    options: ["front", "rear", "both", "none"],
    section: "safety",
  },
  {
    name: "backupCamera",
    label: "safety.backupCamera",
    type: "select",
    options: ["standard", "360_view", "none"],
    section: "safety",
  },
];
