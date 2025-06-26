import type { ListingFieldSchema } from "@/types/listings";
import { Condition, FuelType, TransmissionType } from "@/types/enums";

export const truckSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "color",
    label: "fields.exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Exterior color is required" : null,
  },
  {
    name: "condition",
    label: "fields.condition",
    type: "select",
    options: Object.values(Condition),
    section: "essential",
    required: true,
  },
  {
    name: "truckType",
    label: "fields.truckType",
    type: "select",
    options: [
      "pickup",
      "flatbed",
      "boxTruck",
      "dump",
      "semi",
      "tanker",
      "refrigerated",
      "utility",
      "tow",
      "garbage",
      "concrete",
      "crane",
    ],
    section: "essential",
    required: true,
  },

  {
    name: "transmissionType",
    label: "fields.transmissionType",
    type: "select",
    options: Object.values(TransmissionType),
    section: "essential",
    required: true,
  },

  {
    name: "mileage",
    label: "fields.mileage",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value && value !== 0) return "Mileage is required";
      if (typeof value === "number" && value < 0)
        return "Mileage must be 0 or greater";
      return null;
    },
  },
  {
    name: "fuelType",
    label: "fields.fuelType",
    type: "select",
    options: Object.values(FuelType),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Fuel type is required" : null,
  },
  {
    name: "cabType",
    label: "fields.cabType",
    type: "select",
    options: ["regular", "extended", "crew", "sleeper"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Cab type is required" : null,
  },

  {
    name: "previousOwners",
    label: "fields.previousOwners",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value && value !== 0) return "Previous owners is required";
      if (typeof value === "number" && value < 0)
        return "Previous owners must be 0 or greater";
      return null;
    },
  },
  {
    name: "registrationStatus",
    label: "fields.registrationStatus",
    type: "select",
    options: ["registered", "unregistered", "expired"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Registration status is required" : null,
  },

  // Advanced Section
  {
    name: "vin",
    label: "fields.vin",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "engineNumber",
    label: "fields.engineNumber",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "registrationExpiry",
    label: "fields.registrationExpiry",
    type: "date",
    section: "advanced",
    required: false,
  },
  {
    name: "insuranceType",
    label: "fields.insuranceType",
    type: "select",
    options: [
      "insuranceType.comprehensive",
      "insuranceType.thirdParty",
      "insuranceType.none",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "upholsteryMaterial",
    label: "fields.upholsteryMaterial",
    type: "select",
    options: [
      "upholsteryMaterial.leather",
      "upholsteryMaterial.fabric",
      "upholsteryMaterial.other",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "tireCondition",
    label: "fields.tireCondition",
    type: "select",
    options: ["tireCondition.new", "tireCondition.good", "tireCondition.worn"],
    section: "advanced",
    required: false,
  },
  {
    name: "importStatus",
    label: "fields.importStatus",
    type: "select",
    options: ["importStatus.local", "importStatus.imported"],
    section: "advanced",
    required: false,
  },
  {
    name: "accidentFree",
    label: "fields.accidentFree",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "previousOwners",
    label: "fields.previousOwners",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "serviceHistory",
    label: "fields.serviceHistory",
    type: "multiselect",
    options: [
      "serviceHistory.full",
      "serviceHistory.partial",
      "serviceHistory.none",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "bedLength",
    label: "bedLength",
    type: "select",
    options: ["short", "standard", "long"],
    section: "advanced",
    required: false,
  },
  {
    name: "emissions",
    label: "emissions",
    type: "select",
    options: ["Euro 6", "Euro 5", "Euro 4", "Euro 3", "Other", "Unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "warranty",
    label: "warranty",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "suspensionType",
    label: "suspensionType",
    type: "select",
    options: ["air", "leaf", "coil", "torsion", "other"],
    section: "advanced",
    required: false,
  },
  {
    name: "seatConfiguration",
    label: "seatConfiguration",
    type: "select",
    options: ["standard", "bench", "bucket", "other"],
    section: "advanced",
    required: false,
  },

  // Features

  {
    name: "safetyFeatures",
    label: "safetyFeatures",
    type: "featureGroup",
    featureGroups: {
      braking: {
        label: "Braking Systems",
        features: [
          { name: "abs", label: "ABS", type: "toggle" },
          {
            name: "emergencyBraking",
            label: "Emergency Braking",
            type: "toggle",
          },
          {
            name: "hillStartAssist",
            label: "Hill Start Assist",
            type: "toggle",
          },
        ],
      },
      driverAssist: {
        label: "Driver Assistance",
        features: [
          { name: "laneAssist", label: "Lane Assist", type: "toggle" },
          {
            name: "collisionWarning",
            label: "Collision Warning",
            type: "toggle",
          },
          {
            name: "blindSpotMonitoring",
            label: "Blind Spot Monitoring",
            type: "toggle",
          },
        ],
      },
      emergencyEquipment: {
        label: "Emergency Equipment",
        features: [
          {
            name: "fireExtinguisher",
            label: "Fire Extinguisher",
            type: "toggle",
          },
          { name: "firstAidKit", label: "First Aid Kit", type: "toggle" },
          {
            name: "emergencyTriangle",
            label: "Emergency Triangle",
            type: "toggle",
          },
        ],
      },
    },
    section: "advanced",
    required: false,
  },
  {
    name: "vehicleFeatures",
    label: "fields.vehicleFeatures",
    type: "featureGroup",
    featureGroups: {
      infotainment: {
        label: "Infotainment",
        features: [
          { name: "navigation", label: "Navigation System", type: "toggle" },
          {
            name: "infotainment",
            label: "Infotainment System",
            type: "toggle",
          },
          { name: "gps", label: "GPS", type: "toggle" },
          { name: "bluetooth", label: "Bluetooth", type: "toggle" },
        ],
      },
      lighting: {
        label: "Lighting",
        features: [
          { name: "LED", label: "LED Lights", type: "toggle" },
          { name: "halogen", label: "Halogen Lights", type: "toggle" },
          { name: "workLights", label: "Work Lights", type: "toggle" },
          { name: "beacon", label: "Beacon Lights", type: "toggle" },
          { name: "strobe", label: "Strobe Lights", type: "toggle" },
        ],
      },
      comfort: {
        label: "Comfort Features",
        features: [
          { name: "cruiseControl", label: "Cruise Control", type: "toggle" },
          { name: "climateControl", label: "Climate Control", type: "toggle" },
          { name: "powerWindows", label: "Power Windows", type: "toggle" },
          { name: "powerMirrors", label: "Power Mirrors", type: "toggle" },
        ],
      },
    },
    section: "advanced",
    required: false,
  },
  {
    name: "cargoFeatures",
    label: "cargoFeatures",
    type: "featureGroup",
    featureGroups: {
      cargoCapacity: {
        label: "Cargo Capacity",
        features: [
          { name: "payload", label: "Payload Capacity", type: "toggle" },
          { name: "cargoCover", label: "Cargo Cover", type: "toggle" },
          { name: "cargoTieDowns", label: "Cargo Tie Downs", type: "toggle" },
        ],
      },
      cargoSecurity: {
        label: "Cargo Security",
        features: [
          {
            name: "lockableCargoArea",
            label: "Lockable Cargo Area",
            type: "toggle",
          },
          { name: "cargoDivider", label: "Cargo Divider", type: "toggle" },
          {
            name: "securityCameras",
            label: "Security Cameras",
            type: "toggle",
          },
        ],
      },
    },
    section: "advanced",
    required: false,
  },
];
