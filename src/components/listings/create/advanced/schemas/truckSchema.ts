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
    name: "vin",
    label: "listings.fields.vin",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "engineNumber",
    label: "listings.fields.engineNumber",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "registrationExpiry",
    label: "listings.fields.registrationExpiry",
    type: "date",
    section: "advanced",
    required: false,
  },
  {
    name: "insuranceType",
    label: "listings.fields.insuranceType",
    type: "select",
    options: ["listings.fields.insuranceType.comprehensive", "listings.fields.insuranceType.thirdParty", "listings.fields.insuranceType.none"],
    section: "advanced",
    required: false,
  },
  {
    name: "upholsteryMaterial",
    label: "listings.fields.upholsteryMaterial",
    type: "select",
    options: ["listings.fields.upholsteryMaterial.leather", "listings.fields.upholsteryMaterial.fabric", "listings.fields.upholsteryMaterial.other"],
    section: "advanced",
    required: false,
  },
  {
    name: "tireCondition",
    label: "listings.fields.tireCondition",
    type: "select",
    options: ["listings.fields.tireCondition.new", "listings.fields.tireCondition.good", "listings.fields.tireCondition.worn"],
    section: "advanced",
    required: false,
  },
  {
    name: "importStatus",
    label: "listings.fields.importStatus",
    type: "select",
    options: ["listings.fields.importStatus.local", "listings.fields.importStatus.imported"],
    section: "advanced",
    required: false,
  },
  {
    name: "accidentFree",
    label: "listings.fields.accidentFree",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "previousOwners",
    label: "listings.fields.numberOfOwners",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "warranty",
    label: "listings.fields.warranty",
    type: "text",
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
  {
    name: "emissions",
    label: "listings.emissions",
    type: "select",
    options: ["Euro 6", "Euro 5", "Euro 4", "Euro 3", "Other", "Unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "navigation",
    label: "listings.navigation",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "infotainment",
    label: "listings.infotainment",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "safetyFeatures",
    label: "listings.safetyFeatures",
    type: "multiselect",
    options: ["abs", "laneAssist", "collisionWarning", "fireExtinguisher", "firstAidKit", "other"],
    section: "advanced",
    required: false,
  },
  {
    name: "suspensionType",
    label: "listings.suspensionType",
    type: "select",
    options: ["air", "leaf", "coil", "torsion", "other"],
    section: "advanced",
    required: false,
  },
  {
    name: "warranty",
    label: "listings.warranty",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "gps",
    label: "listings.gps",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "lighting",
    label: "listings.lighting",
    type: "multiselect",
    options: ["LED", "halogen", "workLights", "beacon", "strobe", "other"],
    section: "advanced",
    required: false,
  },
  {
    name: "seatConfiguration",
    label: "listings.seatConfiguration",
    type: "select",
    options: ["standard", "bench", "bucket", "other"],
    section: "advanced",
    required: false,
  },
];
