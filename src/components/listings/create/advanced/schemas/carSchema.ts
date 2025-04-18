import { ListingFieldSchema } from "@/types/listings";
import { Condition, FuelType, TransmissionType } from "@/types/enums";

// Organized car schema for listing creation
export const carSchema: ListingFieldSchema[] = [
  // === Essential Details ===
  {
    name: "color",
    label: "listings.fields.exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Exterior color is required" : null),
  },
  {
    name: "interiorColor",
    label: "listings.fields.interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Interior color is required" : null),
  },
  {
    name: "mileage",
    label: "listings.fields.mileage",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => (value >= 0 ? null : "Mileage must be a positive number"),
  },
  {
    name: "condition",
    label: "listings.fields.condition",
    type: "select",
    options: Object.values(Condition),
    section: "essential",
    required: true,
  },
  {
    name: "transmission",
    label: "listings.fields.transmission",
    type: "select",
    options: Object.values(TransmissionType),
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "errors.transmissionRequired" : null),
  },
  {
    name: "fuelType",
    label: "listings.fields.fuelType",
    type: "select",
    options: Object.values(FuelType),
    section: "essential",
    required: true,
  },

  // === Advanced Details ===
  {
    name: "vin",
    label: "listings.fields.vin",
    type: "text",
    section: "advanced",
    required: false,
    validate: (value: string) => (value && value.length > 0 && !/^([A-HJ-NPR-Z0-9]{17})$/.test(value) ? "errors.invalidVin" : null),
  },
  {
    name: "engineNumber",
    label: "listings.fields.engineNumber",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "numberOfOwners",
    label: "listings.fields.numberOfOwners",
    type: "number",
    section: "advanced",
    required: false,
    validate: (value: number) => (value !== undefined && value < 0 ? "errors.cannotBeNegative" : null),
  },
  {
    name: "serviceHistory",
    label: "listings.fields.serviceHistory",
    type: "checkbox",
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
    name: "importStatus",
    label: "listings.fields.importStatus",
    type: "select",
    options: ["listings.fields.importStatus.local", "listings.fields.importStatus.imported"],
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
    name: "warranty",
    label: "listings.fields.warranty",
    type: "select",
    options: ["listings.fields.warranty.yes", "listings.fields.warranty.no", "listings.fields.warranty.transferable"],
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

  // === Features ===
  {
    name: "features",
    label: "listings.fields.vehicleFeatures",
    type: "featureGroup",
    section: "features",
    required: false,
    featureGroups: {
      safety: {
        label: "Safety Features",
        features: [
          { name: "blindSpotMonitor", label: "features.blindSpotMonitor", type: "toggle" },
          { name: "laneAssist", label: "features.laneAssist", type: "toggle" },
          { name: "adaptiveCruiseControl", label: "features.adaptiveCruiseControl", type: "toggle" },
        ],
      },
      cameras: {
        label: "Camera Features",
        features: [
          { name: "rearCamera", label: "features.rearCamera", type: "toggle" },
          { name: "camera360", label: "features.camera360", type: "toggle" },
          { name: "parkingSensors", label: "features.parkingSensors", type: "toggle" },
        ],
      },
      climate: {
        label: "Climate Features",
        features: [
          { name: "climateControl", label: "features.climateControl", type: "toggle" },
          { name: "heatedSeats", label: "features.heatedSeats", type: "toggle" },
          { name: "ventilatedSeats", label: "features.ventilatedSeats", type: "toggle" },
        ],
      },
      lighting: {
        label: "Lighting Features",
        features: [
          { name: "ledHeadlights", label: "features.ledHeadlights", type: "toggle" },
          { name: "adaptiveHeadlights", label: "features.adaptiveHeadlights", type: "toggle" },
          { name: "ambientLighting", label: "features.ambientLighting", type: "toggle" },
        ],
      },
      entertainment: {
        label: "Entertainment Features",
        features: [
          { name: "bluetooth", label: "features.bluetooth", type: "toggle" },
          { name: "appleCarPlay", label: "features.appleCarPlay", type: "toggle" },
          { name: "androidAuto", label: "features.androidAuto", type: "toggle" },
          { name: "premiumSound", label: "features.premiumSound", type: "toggle" },
          { name: "wirelessCharging", label: "features.wirelessCharging", type: "toggle" },
        ],
      },
      convenience: {
        label: "Convenience Features",
        features: [
          { name: "keylessEntry", label: "Keyless Entry", type: "checkbox" },
          { name: "sunroof", label: "Sunroof / Moonroof", type: "checkbox" },
          { name: "spareKey", label: "Spare Key", type: "checkbox" },
          { name: "remoteStart", label: "Remote Start", type: "checkbox" },
        ],
      },
    },
  }
];
