import { ListingFieldSchema } from "../../../../../types/listings";
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
    validate: (value: string | number | boolean) => {
      if (typeof value !== "string" || !value)
        return "Exterior color is required";
      return null;
    },
  },
  {
    name: "interiorColor",
    label: "listings.fields.interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (typeof value !== "string" || !value)
        return "Interior color is required";
      return null;
    },
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
    name: "previousOwners",
    label: "listings.previousOwners",
    type: "number",
    section: "essential",
    required: false,
  },

  {
    name: "transmissionType",
    label: "listings.transmissionType",
    type: "select",
    options: Object.values(TransmissionType).map((value) => ({
      value,
      label: `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`,
    })),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (typeof value !== "string" || !value)
        return "errors.transmissionRequired";
      return null;
    },
  },
  {
    name: "mileage",
    label: "listings.fields.mileage",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (value === "" || value === undefined || value === null) return null;
      let numValue = value;
      if (typeof value === "string") {
        numValue = Number(value);
        if (value.trim() !== "" && (isNaN(numValue) || numValue < 0)) {
          return "Mileage must be a positive number";
        }
      } else if (typeof value === "number" && value < 0) {
        return "Mileage must be a positive number";
      }
      return null;
    },
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
  // {
  //   name: "vin",
  //   label: "listings.fields.vin",
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
    label: "listings.bodyStyle",
    type: "select",
    options: [
      "sedan",
      "suv",
      "coupe",
      "convertible",
      "wagon",
      "hatchback",
      "pickup",
      "van",
      "minivan",
      "crossover",
      "sportsCar",
      "luxury",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "driveType",
    label: "listings.driveType",
    type: "select",
    options: ["fwd", "rwd", "awd", "fourwd"],
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
    name: "serviceHistory",
    label: "listings.fields.serviceHistory",
    type: "multiselect",
    options: [
      { value: "full", label: "Full Service History" },
      { value: "partial", label: "Partial Service History" },
      { value: "none", label: "No Service History" },
    ],
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
    options: [
      "",
      "1.0L",
      "1.2L",
      "1.4L",
      "1.6L",
      "1.8L",
      "2.0L",
      "2.5L",
      "3.0L",
      "4.0L",
      "5.0L",
    ].map((val) => ({
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
  {
    name: "navigationSystem",
    label: "listings.navigationSystem",
    type: "select",
    options: ["built-in", "portable", "none"],
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
          {
            name: "adaptiveCruiseControl",
            label: "Adaptive Cruise Control",
            type: "toggle",
          },
          {
            name: "laneDepartureWarning",
            label: "Lane Departure Warning",
            type: "toggle",
          },
          { name: "laneKeepAssist", label: "Lane Keep Assist", type: "toggle" },
          {
            name: "automaticEmergencyBraking",
            label: "Automatic Emergency Braking",
            type: "toggle",
          },
        ],
      },
    },
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
          {
            name: "blindSpotMonitor",
            label: "features.blindSpotMonitor",
            type: "toggle",
          },
          { name: "laneAssist", label: "features.laneAssist", type: "toggle" },
          {
            name: "adaptiveCruiseControl",
            label: "features.adaptiveCruiseControl",
            type: "toggle",
          },
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
        label: "Camera Features",
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
        label: "Entertainment Features",
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
        label: "Lighting Features",
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
        ],
      },
      climate: {
        label: "Climate Features",
        features: [
          {
            name: "climateControl",
            label: "features.climateControl",
            type: "toggle",
          },
          {
            name: "heatedSeats",
            label: "features.heatedSeats",
            type: "toggle",
          },
          {
            name: "ventilatedSeats",
            label: "features.ventilatedSeats",
            type: "toggle",
          },
          {
            name: "dualZoneClimate",
            label: "features.dualZoneClimate",
            type: "toggle",
          },
          { name: "rearAC", label: "features.rearAC", type: "toggle" },
          {
            name: "airQualitySensor",
            label: "features.airQualitySensor",
            type: "toggle",
          },
          {
            name: "airConditioning",
            label: "features.airConditioning",
            type: "toggle",
          },
          {
            name: "twoZoneClimateControl",
            label: "features.twoZoneClimateControl",
            type: "toggle",
          },
        ],
      },
      convenience: {
        label: "Convenience Features",
        features: [
          {
            name: "keylessEntry",
            label: "features.keylessEntry",
            type: "toggle",
          },
          { name: "sunroof", label: "features.sunroof", type: "toggle" },
          { name: "spareKey", label: "features.spareKey", type: "toggle" },
          {
            name: "remoteStart",
            label: "features.remoteStart",
            type: "toggle",
          },
          {
            name: "powerTailgate",
            label: "features.powerTailgate",
            type: "toggle",
          },
          {
            name: "autoDimmingMirrors",
            label: "features.autoDimmingMirrors",
            type: "toggle",
          },
          {
            name: "rainSensingWipers",
            label: "features.rainSensingWipers",
            type: "toggle",
          },
          {
            name: "mountainDrivingAssistant",
            label: "features.mountainDrivingAssistant",
            type: "toggle",
          },
          {
            name: "electricalWindowLifter",
            label: "features.electricalWindowLifter",
            type: "toggle",
          },
          {
            name: "electricalSideMirrors",
            label: "features.electricalSideMirrors",
            type: "toggle",
          },
          {
            name: "electricSeats",
            label: "features.electricSeats",
            type: "toggle",
          },
          {
            name: "headUpDisplay",
            label: "features.headUpDisplay",
            type: "toggle",
          },
          {
            name: "leatherSteeringWheel",
            label: "features.leatherSteeringWheel",
            type: "toggle",
          },
          {
            name: "lumbarSupport",
            label: "features.lumbarSupport",
            type: "toggle",
          },
          {
            name: "multifunctionalSteeringWheel",
            label: "features.multifunctionalSteeringWheel",
            type: "toggle",
          },
          // navigationSystem moved to main schema
          { name: "rainSensor", label: "features.rainSensor", type: "toggle" },
          {
            name: "automaticStartStop",
            label: "features.automaticStartStop",
            type: "toggle",
          },
          {
            name: "automaticDazzlingInteriorMirrors",
            label: "features.automaticDazzlingInteriorMirrors",
            type: "toggle",
          },
          {
            name: "switchingRockers",
            label: "features.switchingRockers",
            type: "toggle",
          },
          { name: "armrest", label: "features.armrest", type: "toggle" },
          {
            name: "voiceControl",
            label: "features.voiceControl",
            type: "toggle",
          },
          {
            name: "touchscreen",
            label: "features.touchscreen",
            type: "toggle",
          },
        ],
      },
      extras: {
        label: "Extra Features",
        features: [
          {
            name: "aluminumRims",
            label: "features.aluminumRims",
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
