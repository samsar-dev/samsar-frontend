import type { ListingFieldSchema } from "../../../../../types/listings";
import { Condition, FuelType, TransmissionType } from "@/types/enums";

// Car Listing Schema
export const carSchema: ListingFieldSchema[] = [
  // ================= ESSENTIAL DETAILS =================
  {
    name: "color",
    label: "fields.exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (typeof value !== "string" || !value) return "errors.fieldRequired";
      return null;
    },
    tooltip: "tooltips.exteriorColor",
  },
  {
    name: "interiorColor",
    label: "fields.interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (typeof value !== "string" || !value) return "errors.fieldRequired";
      return null;
    },
    tooltip: "tooltips.interiorColor",
  },
  {
    name: "condition",
    label: "fields.condition",
    type: "select",
    options: Object.values(Condition).map((value) => ({
      value,
      label: value, // The actual value will be used as the translation key
      translationKey: `enums.condition.${value}`, // Add translation key as a separate property
    })),
    section: "essential",
    required: true,
    tooltip: "tooltips.condition",
  },

  {
    name: "transmissionType",
    label: "fields.transmissionType",
    type: "select",
    options: Object.values(TransmissionType).map((value) => ({
      value,
      label: value, // The actual value will be used as the translation key
      translationKey: `enums.transmission.${value}`, // Add translation key as a separate property
    })),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (typeof value !== "string" || !value)
        return "errors.transmissionRequired";
      return null;
    },
    tooltip: "tooltips.transmissionType",
  },
  {
    name: "mileage",
    label: "fields.mileage",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (value === "" || value === undefined || value === null) return null;
      let numValue = value;
      if (typeof value === "string") {
        numValue = Number(value);
        if (value.trim() !== "" && (isNaN(numValue) || numValue < 0)) {
          return "errors.mileageInvalid";
        }
      } else if (typeof value === "number" && value < 0) {
        return "errors.mileageInvalid";
      }
      return null;
    },
    tooltip: "tooltips.mileage",
  },
  {
    name: "fuelType",
    label: "fields.fuelType",
    type: "select",
    options: Object.values(FuelType).map((value) => ({
      value,
      label: value, // The actual value will be used as the translation key
      translationKey: `enums.fuelType.${value}`, // Add translation key as a separate property
    })),
    section: "essential",
    required: true,
    tooltip: "tooltips.fuelType",
  },
  {
    name: "previousOwners",
    label: "previousOwners",
    type: "number",
    section: "essential",
    required: false,
    tooltip: "tooltips.previousOwners",
  },

  // ================= ADVANCED DETAILS =================
  // {
  //   name: "vin",
  //   label: "fields.vin",
  //   type: "text",
  //   section: "advanced",
  //   required: false,
  //   validate: (value: string | number | boolean) => {
  //     if (typeof value !== "string" || !value) return null;
  //     if (!/^([A-HJ-NPR-Z0-9]{17})$/.test(value)) return "errors.invalidVin";
  //     return null;
  //   },
  // },
  {
    name: "bodyStyle",
    label: "fields.bodyType",
    type: "select",
    options: [
      {
        value: "sedan",
        label: "SEDAN",
        translationKey: "enums.bodyStyle.SEDAN",
      },
      { value: "suv", label: "SUV", translationKey: "enums.bodyStyle.SUV" },
      {
        value: "coupe",
        label: "COUPE",
        translationKey: "enums.bodyStyle.COUPE",
      },
      {
        value: "convertible",
        label: "CONVERTIBLE",
        translationKey: "enums.bodyStyle.CONVERTIBLE",
      },
      {
        value: "wagon",
        label: "WAGON",
        translationKey: "enums.bodyStyle.WAGON",
      },
      {
        value: "hatchback",
        label: "HATCHBACK",
        translationKey: "enums.bodyStyle.HATCHBACK",
      },
      {
        value: "pickup",
        label: "PICKUP",
        translationKey: "enums.bodyStyle.PICKUP",
      },
      { value: "van", label: "VAN", translationKey: "enums.bodyStyle.VAN" },
      {
        value: "minivan",
        label: "MINIVAN",
        translationKey: "enums.bodyStyle.MINIVAN",
      },
      {
        value: "crossover",
        label: "CROSSOVER",
        translationKey: "enums.bodyStyle.CROSSOVER",
      },
      {
        value: "sportsCar",
        label: "SPORTS_CAR",
        translationKey: "enums.bodyStyle.SPORTS_CAR",
      },
      {
        value: "luxury",
        label: "LUXURY",
        translationKey: "enums.bodyStyle.LUXURY",
      },
    ],
    section: "advanced",
    required: false,
    tooltip: "tooltips.bodyType",
  },
  {
    name: "driveType",
    label: "fields.driveType",
    type: "select",
    options: [
      { value: "fwd", label: "FWD", translationKey: "enums.driveType.FWD" },
      { value: "rwd", label: "RWD", translationKey: "enums.driveType.RWD" },
      { value: "awd", label: "AWD", translationKey: "enums.driveType.AWD" },
      {
        value: "fourwd",
        label: "FOUR_WD",
        translationKey: "enums.driveType.FOUR_WD",
      },
    ],
    section: "advanced",
    required: false,
    tooltip: "tooltips.driveType",
  },

  {
    name: "engineNumber",
    label: "fields.engineNumber",
    type: "text",
    section: "advanced",
    required: false,
    tooltip: "tooltips.engineNumber",
  },

  {
    name: "serviceHistory",
    label: "fields.serviceHistory",
    type: "multiselect",
    options: [
      {
        value: "full",
        label: "FULL",
        translationKey: "enums.serviceHistory.FULL",
      },
      {
        value: "partial",
        label: "PARTIAL",
        translationKey: "enums.serviceHistory.PARTIAL",
      },
      {
        value: "none",
        label: "NONE",
        translationKey: "enums.serviceHistory.NONE",
      },
    ],
    section: "advanced",
    required: false,
    tooltip: "tooltips.serviceHistory",
  },
  {
    name: "accidentFree",
    label: "fields.accidentFree",
    type: "checkbox",
    section: "advanced",
    required: false,
    tooltip: "tooltips.accidentFree",
  },
  {
    name: "importStatus",
    label: "fields.importStatus",
    type: "select",
    options: [
      {
        value: "local",
        label: "LOCAL",
        translationKey: "enums.importStatus.LOCAL",
      },
      {
        value: "imported",
        label: "IMPORTED",
        translationKey: "enums.importStatus.IMPORTED",
      },
    ],
    section: "advanced",
    required: false,
    tooltip: "tooltips.importStatus",
  },
  {
    name: "registrationExpiry",
    label: "fields.registrationExpiry",
    type: "date",
    section: "advanced",
    required: false,
    tooltip: "tooltips.registrationExpiry",
  },
  {
    name: "warranty",
    label: "fields.warranty",
    type: "select",
    options: [
      { value: "yes", label: "YES", translationKey: "common.yes" },
      { value: "no", label: "NO", translationKey: "common.no" },
    ],
    section: "advanced",
    required: false,
    tooltip: "tooltips.warranty",
  },
  {
    name: "engineSize",
    label: "fields.engineSize",
    type: "text",
    section: "advanced",
    required: false,
    tooltip: "tooltips.engineSize",
  },
  {
    name: "horsepower",
    label: "fields.horsepower",
    type: "number",
    section: "advanced",
    required: false,
    tooltip: "tooltips.horsepower",
  },
  {
    name: "torque",
    label: "fields.torque",
    type: "number",
    section: "advanced",
    required: false,
    tooltip: "tooltips.torque",
  },

  // === Exterior & Interior ===
  // Removed duplicate bodyType field - using bodyStyle instead
  {
    name: "roofType",
    label: "fields.roofType",
    type: "select",
    options: [
      {
        value: "fixed",
        label: "FIXED",
        translationKey: "enums.roofType.FIXED",
      },
      {
        value: "sunroof",
        label: "SUNROOF",
        translationKey: "enums.roofType.SUNROOF",
      },
      {
        value: "moonroof",
        label: "MOONROOF",
        translationKey: "enums.roofType.MOONROOF",
      },
      {
        value: "convertible",
        label: "CONVERTIBLE",
        translationKey: "enums.roofType.CONVERTIBLE",
      },
    ],
    section: "advanced",
    required: false,
    tooltip: "tooltips.roofType",
  },

  // ================= ADDITIONAL DETAILS =================
  {
    name: "customsCleared",
    label: "fields.customsCleared",
    type: "checkbox",
    options: [
      { value: "yes", label: "YES", translationKey: "common.yes" },
      { value: "no", label: "NO", translationKey: "common.no" },
    ],
    section: "advanced",
    required: false,
    tooltip: "tooltips.customsCleared",
  },
  {
    name: "warrantyPeriod",
    label: "fields.warrantyPeriod",
    type: "select",
    options: [
      {
        value: "3",
        label: "3_MONTHS",
        translationKey: "enums.warrantyPeriod.THREE_MONTHS",
      },
      {
        value: "6",
        label: "6_MONTHS",
        translationKey: "enums.warrantyPeriod.SIX_MONTHS",
      },
      {
        value: "12",
        label: "12_MONTHS",
        translationKey: "enums.warrantyPeriod.TWELVE_MONTHS",
      },
    ],
    section: "advanced",
    required: false,
    tooltip: "tooltips.warrantyPeriod",
  },
  {
    name: "navigationSystem",
    label: "fields.navigationSystem",
    type: "select",
    options: [
      {
        value: "built-in",
        label: "BUILT_IN",
        translationKey: "enums.navigationSystem.BUILT_IN",
      },
      {
        value: "portable",
        label: "PORTABLE",
        translationKey: "enums.navigationSystem.PORTABLE",
      },
      { value: "none", label: "NONE", translationKey: "common.none" },
    ],
    section: "advanced",
    required: false,
  },
  // ================= SAFETY FEATURES =================
  {
    name: "safetyFeatures",
    label: "fields.safetyFeatures",
    type: "featureGroup",
    section: "advanced",
    required: false,
    featureGroups: {
      climate: {
        label: "featureCategories.climateFeatures",
        features: [
          {
            name: "frontAirbags",
            label: "features.frontAirbags",
            type: "toggle",
          },
          {
            name: "sideAirbags",
            label: "features.sideAirbags",
            type: "toggle",
          },
          {
            name: "curtainAirbags",
            label: "features.curtainAirbags",
            type: "toggle",
          },
          {
            name: "kneeAirbags",
            label: "features.kneeAirbags",
            type: "toggle",
          },
        ],
      },
      driverAssistance: {
        label: "featureCategories.driverAssistance",
        features: [
          {
            name: "cruiseControl",
            label: "features.cruiseControl",
            type: "toggle",
          },
          {
            name: "adaptiveCruiseControl",
            label: "features.adaptiveCruiseControl",
            type: "toggle",
          },
          {
            name: "laneDepartureWarning",
            label: "features.laneDepartureWarning",
            type: "toggle",
          },
          {
            name: "laneKeepAssist",
            label: "features.laneKeepAssist",
            type: "toggle",
          },
          {
            name: "automaticEmergencyBraking",
            label: "features.automaticEmergencyBraking",
            type: "toggle",
          },
        ],
      },
    },
  },

  // ================= VEHICLE FEATURES =================
  {
    name: "features",
    label: "fields.vehicleFeatures",
    type: "featureGroup",
    section: "advanced",
    required: false,
    featureGroups: {
      safety: {
        label: "featureCategories.safety",
        features: [
          {
            name: "blindSpotMonitor",
            label: "features.blindSpotMonitor",
            type: "toggle",
          },
          { name: "laneAssist", label: "features.laneAssist", type: "toggle" },
          {
            name: "tractionControl",
            label: "features.tractionControl",
            type: "toggle",
          },
          { name: "abs", label: "features.abs", type: "toggle" },
          {
            name: "emergencyBrakeAssist",
            label: "features.emergencyBrakeAssist",
            type: "toggle",
          },
          {
            name: "tirePressureMonitoring",
            label: "features.tirePressureMonitoring",
            type: "toggle",
          },
          {
            name: "distanceTempomat",
            label: "features.distanceTempomat",
            type: "toggle",
          },
          {
            name: "distanceWarning",
            label: "features.distanceWarning",
            type: "toggle",
          },
          {
            name: "passengerAirbag",
            label: "features.passengerAirbag",
            type: "toggle",
          },
          {
            name: "glarelessHighBeam",
            label: "features.glarelessHighBeam",
            type: "toggle",
          },
          { name: "esp", label: "features.esp", type: "toggle" },
          {
            name: "driverAirbag",
            label: "features.driverAirbag",
            type: "toggle",
          },
          {
            name: "highBeamAssistant",
            label: "features.highBeamAssistant",
            type: "toggle",
          },
          {
            name: "speedLimitingSystem",
            label: "features.speedLimitingSystem",
            type: "toggle",
          },
          { name: "isofix", label: "features.isofix", type: "toggle" },
          {
            name: "fatigueWarningSystem",
            label: "features.fatigueWarningSystem",
            type: "toggle",
          },
          {
            name: "emergencyCallSystem",
            label: "features.emergencyCallSystem",
            type: "toggle",
          },
          { name: "sideAirbag", label: "features.sideAirbag", type: "toggle" },
          {
            name: "trackHoldingAssistant",
            label: "features.trackHoldingAssistant",
            type: "toggle",
          },
          {
            name: "deadAngleAssistant",
            label: "features.deadAngleAssistant",
            type: "toggle",
          },
          {
            name: "trafficSignRecognition",
            label: "features.trafficSignRecognition",
            type: "toggle",
          },
          {
            name: "burglarAlarmSystem",
            label: "features.burglarAlarmSystem",
            type: "toggle",
          },
          {
            name: "immobilizer",
            label: "features.immobilizer",
            type: "toggle",
          },
          {
            name: "centralLocking",
            label: "features.centralLocking",
            type: "toggle",
          },
        ],
      },
      cameras: {
        label: "featureCategories.cameraFeatures",
        features: [
          { name: "rearCamera", label: "features.rearCamera", type: "toggle" },
          { name: "camera360", label: "features.camera360", type: "toggle" },
          { name: "dashCam", label: "features.dashCam", type: "toggle" },
          {
            name: "nightVision",
            label: "features.nightVision",
            type: "toggle",
          },
          {
            name: "parkingSensors",
            label: "features.parkingSensors",
            type: "toggle",
          },
          { name: "parkingAid", label: "features.parkingAid", type: "toggle" },
          {
            name: "parkingAidCamera",
            label: "features.parkingAidCamera",
            type: "toggle",
          },
          {
            name: "parkingAidSensorsRear",
            label: "features.parkingAidSensorsRear",
            type: "toggle",
          },
          {
            name: "parkingAidSensorsFront",
            label: "features.parkingAidSensorsFront",
            type: "toggle",
          },
        ],
      },
      entertainment: {
        label: "featureCategories.entertainment",
        features: [
          { name: "bluetooth", label: "features.bluetooth", type: "toggle" },
          {
            name: "appleCarPlay",
            label: "features.appleCarPlay",
            type: "toggle",
          },
          {
            name: "androidAuto",
            label: "features.androidAuto",
            type: "toggle",
          },
          {
            name: "premiumSound",
            label: "features.premiumSound",
            type: "toggle",
          },
          {
            name: "wirelessCharging",
            label: "features.wirelessCharging",
            type: "toggle",
          },
          { name: "usbPorts", label: "features.usbPorts", type: "toggle" },
          { name: "cdPlayer", label: "features.cdPlayer", type: "toggle" },
          { name: "dvdPlayer", label: "features.dvdPlayer", type: "toggle" },
          {
            name: "rearSeatEntertainment",
            label: "features.rearSeatEntertainment",
            type: "toggle",
          },
          { name: "androidCar", label: "features.androidCar", type: "toggle" },
          {
            name: "onBoardComputer",
            label: "features.onBoardComputer",
            type: "toggle",
          },
          { name: "dabRadio", label: "features.dabRadio", type: "toggle" },
          {
            name: "handsFreeCalling",
            label: "features.handsFreeCalling",
            type: "toggle",
          },
          {
            name: "integratedMusicStreaming",
            label: "features.integratedMusicStreaming",
            type: "toggle",
          },
          { name: "radio", label: "features.radio", type: "toggle" },
          {
            name: "soundSystem",
            label: "features.soundSystem",
            type: "toggle",
          },
          {
            name: "wifiHotspot",
            label: "features.wifiHotspot",
            type: "toggle",
          },
        ],
      },
      lighting: {
        label: "featureCategories.lightingFeatures",
        features: [
          {
            name: "ledHeadlights",
            label: "features.ledHeadlights",
            type: "toggle",
          },
          {
            name: "adaptiveHeadlights",
            label: "features.adaptiveHeadlights",
            type: "toggle",
          },
          {
            name: "ambientLighting",
            label: "features.ambientLighting",
            type: "toggle",
          },
          { name: "fogLights", label: "features.fogLights", type: "toggle" },
          {
            name: "automaticHighBeams",
            label: "features.automaticHighBeams",
            type: "toggle",
          },
          {
            name: "ledDaytimeRunningLights",
            label: "features.ledDaytimeRunningLights",
            type: "toggle",
          },
          {
            name: "daytimeRunningLights",
            label: "features.daytimeRunningLights",
            type: "toggle",
          },
          {
            name: "headlightCleaning",
            label: "features.headlightCleaning",
            type: "toggle",
          },
          {
            name: "lightSensor",
            label: "features.lightSensor",
            type: "toggle",
          },
          {
            name: "luggageCompartmentSeparation",
            label: "features.luggageCompartmentSeparation",
            type: "toggle",
          },
          {
            name: "summerTires",
            label: "features.summerTires",
            type: "toggle",
          },
          {
            name: "powerSteering",
            label: "features.powerSteering",
            type: "toggle",
          },
        ],
      },
    },
  },
];
