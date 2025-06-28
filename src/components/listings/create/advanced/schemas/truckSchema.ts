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
    options: Object.values(Condition).map(value => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.condition.${value.toUpperCase()}`
    })),
    section: "essential",
    required: true,
  },
  {
    name: "truckType",
    label: "fields.truckType",
    type: "select",
    options: [
      { value: "pickup", label: "PICKUP", translationKey: "enums.truckType.PICKUP" },
      { value: "flatbed", label: "FLATBED", translationKey: "enums.truckType.FLATBED" },
      { value: "boxTruck", label: "BOX_TRUCK", translationKey: "enums.truckType.BOX_TRUCK" },
      { value: "dump", label: "DUMP", translationKey: "enums.truckType.DUMP" },
      { value: "semi", label: "SEMI", translationKey: "enums.truckType.SEMI" },
      { value: "tanker", label: "TANKER", translationKey: "enums.truckType.TANKER" },
      { value: "refrigerated", label: "REFRIGERATED", translationKey: "enums.truckType.REFRIGERATED" },
      { value: "utility", label: "UTILITY", translationKey: "enums.truckType.UTILITY" },
      { value: "tow", label: "TOW", translationKey: "enums.truckType.TOW" },
      { value: "garbage", label: "GARBAGE", translationKey: "enums.truckType.GARBAGE" },
      { value: "concrete", label: "CONCRETE", translationKey: "enums.truckType.CONCRETE" },
      { value: "crane", label: "CRANE", translationKey: "enums.truckType.CRANE" },
    ],
    section: "essential",
    required: true,
  },

  {
    name: "transmissionType",
    label: "fields.transmissionType",
    type: "select",
    options: Object.values(TransmissionType).map(value => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.transmission.${value.toUpperCase()}`
    })),
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
    options: Object.values(FuelType).map(value => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.fuelType.${value.toUpperCase()}`
    })),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Fuel type is required" : null,
  },
  {
    name: "cabType",
    label: "fields.cabType",
    type: "select",
    options: [
      { value: "regular", label: "REGULAR", translationKey: "enums.cabType.REGULAR" },
      { value: "extended", label: "EXTENDED", translationKey: "enums.cabType.EXTENDED" },
      { value: "crew", label: "CREW", translationKey: "enums.cabType.CREW" },
      { value: "sleeper", label: "SLEEPER", translationKey: "enums.cabType.SLEEPER" },
    ],
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
    options: [
      { value: "registered", label: "REGISTERED", translationKey: "enums.registrationStatus.REGISTERED" },
      { value: "unregistered", label: "UNREGISTERED", translationKey: "enums.registrationStatus.UNREGISTERED" },
      { value: "expired", label: "EXPIRED", translationKey: "enums.registrationStatus.EXPIRED" },
    ],
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
      { value: "comprehensive", label: "COMPREHENSIVE", translationKey: "enums.insuranceType.COMPREHENSIVE" },
      { value: "thirdParty", label: "THIRD_PARTY", translationKey: "enums.insuranceType.THIRD_PARTY" },
      { value: "none", label: "NONE", translationKey: "enums.insuranceType.NONE" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "upholsteryMaterial",
    label: "fields.upholsteryMaterial",
    type: "select",
    options: [
      { value: "leather", label: "LEATHER", translationKey: "enums.upholsteryMaterial.LEATHER" },
      { value: "fabric", label: "FABRIC", translationKey: "enums.upholsteryMaterial.FABRIC" },
      { value: "other", label: "OTHER", translationKey: "enums.upholsteryMaterial.OTHER" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "tireCondition",
    label: "fields.tireCondition",
    type: "select",
    options: [
      { value: "new", label: "NEW", translationKey: "enums.tireCondition.NEW" },
      { value: "good", label: "GOOD", translationKey: "enums.tireCondition.GOOD" },
      { value: "worn", label: "WORN", translationKey: "enums.tireCondition.WORN" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "importStatus",
    label: "fields.importStatus",
    type: "select",
    options: [
      { value: "local", label: "LOCAL", translationKey: "enums.importStatus.LOCAL" },
      { value: "imported", label: "IMPORTED", translationKey: "enums.importStatus.IMPORTED" },
    ],
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
      { value: "full", label: "FULL", translationKey: "enums.serviceHistory.FULL" },
      { value: "partial", label: "PARTIAL", translationKey: "enums.serviceHistory.PARTIAL" },
      { value: "none", label: "NONE", translationKey: "enums.serviceHistory.NONE" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "bedLength",
    label: "bedLength",
    type: "select",
    options: [
      { value: "short", label: "SHORT", translationKey: "enums.bedLength.SHORT" },
      { value: "standard", label: "STANDARD", translationKey: "enums.bedLength.STANDARD" },
      { value: "long", label: "LONG", translationKey: "enums.bedLength.LONG" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "emissions",
    label: "emissions",
    type: "select",
    options: [
      { value: "euro6", label: "EURO_6", translationKey: "enums.emissions.EURO_6" },
      { value: "euro5", label: "EURO_5", translationKey: "enums.emissions.EURO_5" },
      { value: "euro4", label: "EURO_4", translationKey: "enums.emissions.EURO_4" },
      { value: "euro3", label: "EURO_3", translationKey: "enums.emissions.EURO_3" },
      { value: "other", label: "OTHER", translationKey: "enums.emissions.OTHER" },
      { value: "unknown", label: "UNKNOWN", translationKey: "enums.emissions.UNKNOWN" },
    ],
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
    options: [
      { value: "air", label: "AIR", translationKey: "enums.suspensionType.AIR" },
      { value: "leaf", label: "LEAF", translationKey: "enums.suspensionType.LEAF" },
      { value: "coil", label: "COIL", translationKey: "enums.suspensionType.COIL" },
      { value: "torsion", label: "TORSION", translationKey: "enums.suspensionType.TORSION" },
      { value: "other", label: "OTHER", translationKey: "enums.suspensionType.OTHER" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "seatConfiguration",
    label: "seatConfiguration",
    type: "select",
    options: [
      { value: "standard", label: "STANDARD", translationKey: "enums.seatConfiguration.STANDARD" },
      { value: "bench", label: "BENCH", translationKey: "enums.seatConfiguration.BENCH" },
      { value: "bucket", label: "BUCKET", translationKey: "enums.seatConfiguration.BUCKET" },
      { value: "other", label: "OTHER", translationKey: "enums.seatConfiguration.OTHER" },
    ],
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
        label: "featureCategories.brakingSystems",
        features: [
          { name: "abs", label: "features.abs", type: "toggle" },
          {
            name: "emergencyBraking",
            label: "features.emergencyBraking",
            type: "toggle",
          },
          {
            name: "hillStartAssist",
            label: "features.hillStartAssist",
            type: "toggle",
          },
        ],
      },
      driverAssist: {
        label: "featureCategories.driverAssistance",
        features: [
          { name: "laneAssist", label: "features.laneAssist", type: "toggle" },
          {
            name: "collisionWarning",
            label: "features.collisionWarning",
            type: "toggle",
          },
          {
            name: "blindSpotMonitoring",
            label: "features.blindSpotMonitoring",
            type: "toggle",
          },
        ],
      },
      emergencyEquipment: {
        label: "featureCategories.emergencyEquipment",
        features: [
          {
            name: "fireExtinguisher",
            label: "features.fireExtinguisher",
            type: "toggle",
          },
          { name: "firstAidKit", label: "features.firstAidKit", type: "toggle" },
          {
            name: "emergencyTriangle",
            label: "features.emergencyTriangle",
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
        label: "featureCategories.infotainment",
        features: [
          { name: "navigation", label: "features.navigationSystem", type: "toggle" },
          {
            name: "infotainment",
            label: "features.infotainmentSystem",
            type: "toggle",
          },
          { name: "gps", label: "features.gps", type: "toggle" },
          { name: "bluetooth", label: "features.bluetooth", type: "toggle" },
        ],
      },
      lighting: {
        label: "featureCategories.lighting",
        features: [
          { name: "LED", label: "features.ledLights", type: "toggle" },
          { name: "halogen", label: "features.halogenLights", type: "toggle" },
          { name: "workLights", label: "features.workLights", type: "toggle" },
          { name: "beacon", label: "features.beaconLights", type: "toggle" },
          { name: "strobe", label: "features.strobeLights", type: "toggle" },
        ],
      },
      comfort: {
        label: "featureCategories.comfortFeatures",
        features: [
          { name: "cruiseControl", label: "features.cruiseControl", type: "toggle" },
          { name: "climateControl", label: "features.climateControl", type: "toggle" },
          { name: "powerWindows", label: "features.powerWindows", type: "toggle" },
          { name: "powerMirrors", label: "features.powerMirrors", type: "toggle" },
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
        label: "featureCategories.cargoCapacity",
        features: [
          { name: "payload", label: "features.payloadCapacity", type: "toggle" },
          { name: "cargoCover", label: "features.cargoCover", type: "toggle" },
          { name: "cargoTieDowns", label: "features.cargoTieDowns", type: "toggle" },
        ],
      },
      cargoSecurity: {
        label: "featureCategories.cargoSecurity",
        features: [
          {
            name: "lockableCargoArea",
            label: "features.lockableCargoArea",
            type: "toggle",
          },
          { name: "cargoDivider", label: "features.cargoDivider", type: "toggle" },
          {
            name: "securityCameras",
            label: "features.securityCameras",
            type: "toggle",
          },
        ],
      },
    },
    section: "advanced",
    required: false,
  },
];
