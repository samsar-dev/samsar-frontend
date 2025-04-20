import { ListingFieldSchema } from "@/types/listings";

export const vanSchema: ListingFieldSchema[] = [
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
    name: "vanType",
    label: "vanType",
    type: "select",
    options: [
      "Cargo",
      "Passenger",
      "Crew",
      "Panel",
      "Box",
      "Refrigerated",
      "Other",
    ],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Van type is required" : null),
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
    name: "cargoVolume",
    label: "cargoVolume",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null)
        return "Cargo volume is required";
      if (value < 0) return "Cargo volume must be 0 or greater";
      return null;
    },
  },
  {
    name: "payloadCapacity",
    label: "payloadCapacity",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null)
        return "Payload capacity is required";
      if (value < 0) return "Payload capacity must be 0 or greater";
      return null;
    },
  },
  {
    name: "fuelType",
    label: "fuelType",
    type: "select",
    options: ["", "diesel", "gasoline", "electric", "hybrid", "cng"],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Fuel type is required" : null),
  },
  {
    name: "transmissionType",
    label: "listings.transmissionType",
    type: "select",
    options: ["", "manual", "automatic", "automated"],
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Transmission type is required" : null,
  },
  {
    name: "previousOwners",
    label: "listings.previousOwners",
    type: "number",
    section: "advanced",
    required: false,
    validate: (value: number) =>
      value && value < 0 ? "Previous owners must be 0 or greater" : null,
  },
  {
    name: "registrationStatus",
    label: "listings.registrationStatus",
    type: "select",
    options: ["registered", "unregistered", "expired"],
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

  // Advanced Section

  {
    name: "engine",
    label: "listings.engine",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "horsepower",
    label: "listings.horsepower",
    type: "number",
    section: "advanced",
    required: false,
    validate: (value: number) =>
      value && value < 0 ? "Horsepower must be 0 or greater" : null,
  },
  {
    name: "torque",
    label: "listings.torque",
    type: "number",
    section: "advanced",
    required: false,
    validate: (value: number) =>
      value && value < 0 ? "Torque must be 0 or greater" : null,
  },
  {
    name: "roofHeight",
    label: "listings.roofHeight",
    type: "select",
    options: ["Low", "Medium", "High", "Super High"],
    section: "advanced",
    required: false,
  },
  {
    name: "loadingFeatures",
    label: "listings.loadingFeatures",
    type: "multiselect",
    options: [
      "Side Door",
      "Rear Door",
      "Lift Gate",
      "Loading Ramp",
      "Tie-downs",
      "Other",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "refrigeration",
    label: "listings.refrigeration",
    type: "select",
    options: ["yes", "no"],
    section: "advanced",
    required: false,
  },
  {
    name: "temperatureRange",
    label: "listings.temperatureRange",
    type: "text",
    section: "advanced",
    required: false,
    validate: (value: string) =>
      value && !/^-?\d+(\.\d+)?$/.test(value)
        ? "Invalid temperature format"
        : null,
  },
  {
    name: "interiorHeight",
    label: "listings.interiorHeight",
    type: "text",
    section: "advanced",
    required: false,
    validate: (value: string) =>
      value && !/^\d+(\.\d+)?$/.test(value) ? "Invalid height format" : null,
  },
  {
    name: "interiorLength",
    label: "listings.interiorLength",
    type: "text",
    section: "advanced",
    required: false,
    validate: (value: string) =>
      value && !/^\d+(\.\d+)?$/.test(value) ? "Invalid length format" : null,
  },
  {
    name: "drivingAssistance",
    label: "listings.drivingAssistance",
    type: "multiselect",
    options: [
      "Backup Camera",
      "Parking Sensors",
      "Lane Departure Warning",
      "Blind Spot Monitor",
      "Cross Traffic Alert",
      "Other",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "features",
    label: "features",
    type: "multiselect",
    options: [
      "Air Conditioning",
      "Power Steering",
      "Power Windows",
      "Power Locks",
      "Anti-lock Brakes",
      "Navigation System",
      "Bluetooth",
      "Cruise Control",
      "Other",
    ],
    section: "advanced",
    required: false,
    validate: (value: string[]) =>
      !value || value.length === 0
        ? "At least one feature is recommended"
        : null,
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
    name: "infotainment",
    label: "listings.infotainment",
    type: "checkbox",
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
    name: "safetyFeatures",
    label: "listings.safetyFeatures",
    type: "multiselect",
    options: ["abs", "laneAssist", "collisionWarning", "fireExtinguisher", "firstAidKit", "other"],
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
    name: "seatingConfiguration",
    label: "listings.seatingConfiguration",
    type: "select",
    options: ["2-seater", "5-seater", "7-seater", "9-seater", "other"],
    section: "advanced",
    required: false,
  },
  {
    name: "airConditioning",
    label: "listings.airConditioning",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "rearClimateControl",
    label: "listings.rearClimateControl",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
];
