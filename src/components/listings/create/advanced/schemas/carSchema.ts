import { ListingFieldSchema, SelectOption } from "@/types/listings";
import { Condition, FuelType, TransmissionType } from "@/types/enums";

// Car Listing Schema
export const carSchema: ListingFieldSchema[] = [
  // ================= ESSENTIAL DETAILS =================
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
    options: Object.values(Condition).map((value) => ({
      value,
      label: `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`,
    })),
    section: "essential",
    required: true,
  },
  {
    name: "transmissionType",
    label: "listings.fields.transmissionType",
    type: "select",
    options: Object.values(TransmissionType).map((value) => ({
      value,
      label: `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`,
    })),
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "errors.transmissionRequired" : null),
  },
  {
    name: "fuelType",
    label: "listings.fields.fuelType",
    type: "select",
    options: Object.values(FuelType).map((value) => ({
      value,
      label: `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`,
    })),
    section: "essential",
    required: true,
  },

  // ================= ADVANCED DETAILS =================
  {
    name: "vin",
    label: "listings.fields.vin",
    type: "text",
    section: "advanced",
    required: false,
    validate: (value: string) =>
      value && value.length > 0 && !/^([A-HJ-NPR-Z0-9]{17})$/.test(value)
        ? "errors.invalidVin"
        : null,
  },
  {
    name: "engineNumber",
    label: "listings.fields.engineNumber",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "previousOwners",
    label: "listings.fields.previousOwners",
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
    options: [
      { value: "local", label: "Local" },
      { value: "imported", label: "Imported" },
    ],
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
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "transferable", label: "Transferable" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "insuranceType",
    label: "listings.fields.insuranceType",
    type: "select",
    options: [
      { value: "comprehensive", label: "Comprehensive" },
      { value: "thirdParty", label: "Third Party" },
      { value: "none", label: "None" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "upholsteryMaterial",
    label: "listings.fields.upholsteryMaterial",
    type: "select",
    options: [
      { value: "leather", label: "Leather" },
      { value: "fabric", label: "Fabric" },
      { value: "other", label: "Other" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "tireCondition",
    label: "listings.fields.tireCondition",
    type: "select",
    options: [
      { value: "new", label: "New" },
      { value: "", label: "" },
      { value: "worn", label: "Worn" },
    ],
    section: "advanced",
    required: false,
  },

  // === Engine & Performance ===
  {
    name: "engineSize",
    label: "listings.fields.engineSize",
    type: "select",
    options: ["", "1.0L", "1.2L", "1.4L", "1.6L", "1.8L", "2.0L", "2.5L", "3.0L", "4.0L", "5.0L"].map((val) => ({
      value: val,
      label: val,
    })),
    section: "advanced",
    required: false,
  },
  {
    name: "horsepower",
    label: "listings.fields.horsepower",
    type: "select",
    options: [
      "upTo100",
      "101-150",
      "151-200",
      "201-250",
      "251-300",
      "301-400",
      "401-500",
      "501-600",
      "600+",
    ].map((val) => ({ value: val, label: val })),
    section: "advanced",
    required: false,
  },
  {
    name: "torque",
    label: "listings.fields.torque",
    type: "select",
    options: [
      "upTo150",
      "151-200",
      "201-250",
      "251-300",
      "301-350",
      "351-400",
      "401-450",
      "450+",
    ].map((val) => ({ value: val, label: val })),
    section: "advanced",
    required: false,
  },

  // === Exterior & Interior ===
  {
    name: "bodyType",
    label: "listings.fields.bodyType",
    type: "select",
    options: [
      "sedan",
      "hatchback",
      "suv",
      "coupe",
      "convertible",
      "wagon",
      "minivan",
      "pickup",
      "other",
    ].map((val) => ({ value: val, label: val })),
    section: "advanced",
    required: false,
  },
  {
    name: "roofType",
    label: "listings.fields.roofType",
    type: "select",
    options: ["fixed", "sunroof", "moonroof", "convertible"].map((val) => ({
      value: val,
      label: val,
    })),
    section: "advanced",
    required: false,
  },

  // ================= SAFETY FEATURES =================
  {
    name: "safetyFeatures",
    label: "listings.fields.safetyFeatures",
    type: "featureGroup",
    section: "advanced",
    required: false,
    featureGroups: {
      airbags: {
        label: "Airbags",
        features: [
          { name: "frontAirbags", label: "Front Airbags", type: "toggle" },
          { name: "sideAirbags", label: "Side Airbags", type: "toggle" },
          { name: "curtainAirbags", label: "Curtain Airbags", type: "toggle" },
          { name: "kneeAirbags", label: "Knee Airbags", type: "toggle" },
        ],
      },
      driverAssist: {
        label: "Driver Assistance",
        features: [
          { name: "cruiseControl", label: "Cruise Control", type: "toggle" },
          { name: "adaptiveCruiseControl", label: "Adaptive Cruise Control", type: "toggle" },
          { name: "laneDepartureWarning", label: "Lane Departure Warning", type: "toggle" },
          { name: "laneKeepAssist", label: "Lane Keep Assist", type: "toggle" },
          { name: "automaticEmergencyBraking", label: "Automatic Emergency Braking", type: "toggle" },
        ],
      },
    },
  },

  // ================= ADDITIONAL DETAILS =================
  {
    name: "customsCleared",
    label: "listings.fields.customsCleared",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "warrantyPeriod",
    label: "listings.fields.warrantyPeriod",
    type: "select",
    options: [
      { value: "3", label: "3 months" },
      { value: "6", label: "6 months" },
      { value: "12", label: "12 months" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "serviceHistoryDetails",
    label: "listings.fields.serviceHistoryDetails",
    type: "textarea",
    section: "advanced",
    required: false,
  },
  {
    name: "additionalNotes",
    label: "listings.fields.additionalNotes",
    type: "textarea",
    section: "advanced",
    required: false,
  },

  // ================= VEHICLE FEATURES =================
  {
    name: "features",
    label: "listings.fields.vehicleFeatures",
    type: "featureGroup",
    section: "advanced",
    required: false,
    featureGroups: {
      safety: {
        label: "Safety Features",
        features: [
          { name: "blindSpotMonitor", label: "features.blindSpotMonitor", type: "toggle" },
          { name: "laneAssist", label: "features.laneAssist", type: "toggle" },
          { name: "adaptiveCruiseControl", label: "features.adaptiveCruiseControl", type: "toggle" },
          { name: "tractionControl", label: "features.tractionControl", type: "toggle" },
          { name: "abs", label: "features.abs", type: "toggle" },
          { name: "emergencyBrakeAssist", label: "features.emergencyBrakeAssist", type: "toggle" },
          { name: "tirePressureMonitoring", label: "features.tirePressureMonitoring", type: "toggle" },
        ],
      },
      cameras: {
        label: "Camera Features",
        features: [
          { name: "rearCamera", label: "features.rearCamera", type: "toggle" },
          { name: "camera360", label: "features.camera360", type: "toggle" },
          { name: "dashCam", label: "features.dashCam", type: "toggle" },
          { name: "nightVision", label: "features.nightVision", type: "toggle" },
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
          { name: "usbPorts", label: "features.usbPorts", type: "toggle" },
          { name: "cdPlayer", label: "features.cdPlayer", type: "toggle" },
          { name: "dvdPlayer", label: "features.dvdPlayer", type: "toggle" },
          { name: "rearSeatEntertainment", label: "features.rearSeatEntertainment", type: "toggle" },
      
        ],
      },
      lighting: {
        label: "Lighting Features",
        features: [
          { name: "ledHeadlights", label: "features.ledHeadlights", type: "toggle" },
          { name: "adaptiveHeadlights", label: "features.adaptiveHeadlights", type: "toggle" },
          { name: "ambientLighting", label: "features.ambientLighting", type: "toggle" },
          { name: "fogLights", label: "features.fogLights", type: "toggle" },
          { name: "automaticHighBeams", label: "features.automaticHighBeams", type: "toggle" },
        ],
      },
      climate: {
        label: "Climate Features",
        features: [
          { name: "climateControl", label: "features.climateControl", type: "toggle" },
          { name: "heatedSeats", label: "features.heatedSeats", type: "toggle" },
          { name: "ventilatedSeats", label: "features.ventilatedSeats", type: "toggle" },
          { name: "dualZoneClimate", label: "features.dualZoneClimate", type: "toggle" },
          { name: "rearAC", label: "features.rearAC", type: "toggle" },
          { name: "airQualitySensor", label: "features.airQualitySensor", type: "toggle" },
        ],
      },
      convenience: {
        label: "Convenience Features",
        features: [
          { name: "keylessEntry", label: "features.keylessEntry", type: "toggle" },
          { name: "sunroof", label: "features.sunroof", type: "toggle" },
          { name: "spareKey", label: "features.spareKey", type: "toggle" },
          { name: "remoteStart", label: "features.remoteStart", type: "toggle" },
          { name: "powerTailgate", label: "features.powerTailgate", type: "toggle" },
          { name: "autoDimmingMirrors", label: "features.autoDimmingMirrors", type: "toggle" },
          { name: "rainSensingWipers", label: "features.rainSensingWipers", type: "toggle" },
          { name: "parkingSensors", label: "features.parkingSensors", type: "toggle" },
        ],
      },
    },
  },
];
