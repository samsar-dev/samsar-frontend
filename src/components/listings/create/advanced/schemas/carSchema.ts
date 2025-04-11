import { ListingFieldSchema } from "@/types/listings";
import { Condition, FuelType, TransmissionType } from "@/types/enums";

export const carSchema: ListingFieldSchema[] = [
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
    name: "mileage",
    label: "listings.mileage",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => value >= 0 ? null : "Mileage must be a positive number"
  },
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: Object.values(Condition),
    section: "essential",
    required: true
  },
  {
    name: "transmission",
    label: "listings.transmission",
    type: "select",
    options: Object.values(TransmissionType),
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "errors.transmissionRequired" : null)
  },
  {
    name: "fuelType",
    label: "listings.fuelType",
    type: "select",
    options: Object.values(FuelType),
    section: "essential",
    required: true
  },

  // Entertainment & Tech features
  {
    name: "bluetooth",
    label: "features.bluetooth",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "entertainment"
  },
  {
    name: "appleCarPlay",
    label: "features.appleCarPlay",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "entertainment"
  },
  {
    name: "androidAuto",
    label: "features.androidAuto",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "entertainment"
  },
  {
    name: "premiumSound",
    label: "features.premiumSound",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "entertainment"
  },
  {
    name: "wirelessCharging",
    label: "features.wirelessCharging",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "entertainment"
  },

  // Lighting features
  {
    name: "ledHeadlights",
    label: "features.ledHeadlights",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "lighting"
  },
  {
    name: "adaptiveHeadlights",
    label: "features.adaptiveHeadlights",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "lighting"
  },
  {
    name: "ambientLighting",
    label: "features.ambientLighting",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "lighting"
  },

  // Camera & Safety features
  {
    name: "rearCamera",
    label: "features.rearCamera",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "cameras"
  },
  {
    name: "camera360",
    label: "features.camera360",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "cameras"
  },
  {
    name: "parkingSensors",
    label: "features.parkingSensors",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "cameras"
  },
  {
    name: "blindSpotMonitor",
    label: "features.blindSpotMonitor",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "safety"
  },
  {
    name: "laneAssist",
    label: "features.laneAssist",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "safety"
  },
  {
    name: "adaptiveCruiseControl",
    label: "features.adaptiveCruiseControl",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "safety"
  },

  // Climate features
  {
    name: "climateControl",
    label: "features.climateControl",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "climate"
  },
  {
    name: "heatedSeats",
    label: "features.heatedSeats",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "climate"
  },
  {
    name: "ventilatedSeats",
    label: "features.ventilatedSeats",
    type: "toggle",
    section: "advanced",
    required: false,
    featureCategory: "climate"
  }
];