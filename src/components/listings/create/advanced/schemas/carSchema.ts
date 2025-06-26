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
      if (typeof value !== "string" || !value)
        return "Exterior color is required";
      return null;
    },
    tooltip: "The color of the vehicle's exterior paint or finish.",
  },
  {
    name: "interiorColor",
    label: "fields.interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (typeof value !== "string" || !value)
        return "Interior color is required";
      return null;
    },
    tooltip: "The color of the vehicle's interior upholstery and trim.",
  },
  {
    name: "condition",
    label: "fields.condition",
    type: "select",
    options: Object.values(Condition).map((value) => ({
      value,
      label: `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`,
    })),
    section: "essential",
    required: true,
    tooltip:
      "The overall state of the vehicle, indicating how well it has been maintained and its current working condition.",
  },

  {
    name: "transmissionType",
    label: "fields.transmissionType",
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
    tooltip:
      "The type of transmission system in the vehicle. Common types include Automatic, Manual, and CVT (Continuously Variable Transmission).",
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
          return "Mileage must be a positive number";
        }
      } else if (typeof value === "number" && value < 0) {
        return "Mileage must be a positive number";
      }
      return null;
    },
    tooltip:
      "The total distance the vehicle has traveled, typically measured in kilometers or miles.",
  },
  {
    name: "fuelType",
    label: "fields.fuelType",
    type: "select",
    options: Object.values(FuelType).map((value) => ({
      value,
      label: `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`,
    })),
    section: "essential",
    required: true,
    tooltip:
      "The type of fuel the vehicle uses. Common types include Petrol, Diesel, Electric, and Hybrid.",
  },
  {
    name: "previousOwners",
    label: "previousOwners",
    type: "number",
    section: "essential",
    required: false,
    tooltip:
      "The number of previous owners the vehicle has had. A lower number generally indicates better maintenance history.",
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
      { value: "sedan", label: "Sedan" },
      { value: "suv", label: "SUV" },
      { value: "coupe", label: "Coupe" },
      { value: "convertible", label: "Convertible" },
      { value: "wagon", label: "Wagon" },
      { value: "hatchback", label: "Hatchback" },
      { value: "pickup", label: "Pickup" },
      { value: "van", label: "Van" },
      { value: "minivan", label: "Minivan" },
      { value: "crossover", label: "Crossover" },
      { value: "sportsCar", label: "Sports Car" },
      { value: "luxury", label: "Luxury" },
    ],
    section: "advanced",
    required: false,
    tooltip: "The overall design and shape of the vehicle's body.",
  },
  {
    name: "driveType",
    label: "fields.driveType",
    type: "select",
    options: ["fwd", "rwd", "awd", "fourwd"],
    section: "advanced",
    required: false,
    tooltip:
      "The drive type indicates which wheels receive power from the engine. FWD (Front-Wheel Drive), RWD (Rear-Wheel Drive), AWD (All-Wheel Drive), and 4WD (Four-Wheel Drive) are common configurations.",
  },

  {
    name: "engineNumber",
    label: "fields.engineNumber",
    type: "text",
    section: "advanced",
    required: false,
    tooltip:
      "The engine number is a unique identifier assigned by the manufacturer to each engine. It's typically found on the engine block or in the vehicle's documentation.",
  },

  {
    name: "serviceHistory",
    label: "fields.serviceHistory",
    type: "multiselect",
    options: [
      { value: "full", label: "Full Service History" },
      { value: "partial", label: "Partial Service History" },
      { value: "none", label: "No Service History" },
    ],
    section: "advanced",
    required: false,
    tooltip:
      "The maintenance and repair history of the vehicle, including any services, repairs, or replacements made.",
  },
  {
    name: "accidentFree",
    label: "fields.accidentFree",
    type: "checkbox",
    section: "advanced",
    required: false,
    tooltip:
      "Whether the vehicle has been involved in any accidents or has any damage.",
  },
  {
    name: "importStatus",
    label: "fields.importStatus",
    type: "select",
    options: [
      { value: "local", label: "Local" },
      { value: "imported", label: "Imported" },
    ],
    section: "advanced",
    required: false,
    tooltip:
      "Whether the vehicle was manufactured locally or imported from another country.",
  },
  {
    name: "registrationExpiry",
    label: "fields.registrationExpiry",
    type: "date",
    section: "advanced",
    required: false,
    tooltip: "The date when the vehicle's registration expires.",
  },
  {
    name: "warranty",
    label: "fields.warranty",
    type: "select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    section: "advanced",
    required: false,
    tooltip:
      "Whether the vehicle still has a valid warranty, and if it can be transferred to a new owner.",
  },
  {
    name: "engineSize",
    label: "fields.engineSize",
    type: "text",
    section: "advanced",
    required: false,
    tooltip:
      "The engine displacement or size, typically measured in cubic centimeters (cc) or liters (L). For example, 1.6L or 2000cc.",
  },
  {
    name: "horsepower",
    label: "fields.horsepower",
    type: "number",
    section: "advanced",
    required: false,
    tooltip:
      "The power output of the vehicle's engine, typically measured in horsepower (hp). Higher values indicate more powerful engines.",
  },
  {
    name: "torque",
    label: "fields.torque",
    type: "number",
    section: "advanced",
    required: false,
    tooltip:
      "The rotational force of the vehicle's engine, typically measured in newton-meters (Nm). Higher torque values provide better acceleration and pulling power.",
  },

  // === Exterior & Interior ===
  // Removed duplicate bodyType field - using bodyStyle instead
  {
    name: "roofType",
    label: "fields.roofType",
    type: "select",
    options: ["fixed", "sunroof", "moonroof", "convertible"].map((val) => ({
      value: val,
      label: val,
    })),
    section: "advanced",
    required: false,
    tooltip:
      "The type of roof the vehicle has, such as fixed, sunroof, moonroof, or convertible.",
  },

  // ================= ADDITIONAL DETAILS =================
  {
    name: "customsCleared",
    label: "fields.customsCleared",
    type: "checkbox",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    section: "advanced",
    required: false,
    tooltip:
      "Whether the vehicle has been cleared through customs, indicating that it has been imported and is compliant with local regulations.",
  },
  {
    name: "warrantyPeriod",
    label: "fields.warrantyPeriod",
    type: "select",
    options: [
      { value: "3", label: "3 months" },
      { value: "6", label: "6 months" },
      { value: "12", label: "12 months" },
    ],
    section: "advanced",
    required: false,
    tooltip:
      "The length of time the vehicle's warranty is valid, typically measured in months or years.",
  },
  {
    name: "serviceHistoryDetails",
    label: "fields.serviceHistoryDetails",
    type: "textarea",
    section: "advanced",
    required: false,
    tooltip:
      "Additional details about the vehicle's service history, including any maintenance or repairs made.",
  },
  {
    name: "additionalNotes",
    label: "fields.additionalNotes",
    type: "textarea",
    section: "advanced",
    required: false,
    tooltip:
      "Any additional information about the vehicle that may be relevant to potential buyers.",
  },
  {
    name: "navigationSystem",
    label: "fields.navigationSystem",
    type: "select",
    options: ["built-in", "portable", "none"],
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
        label: "featureCategories.convenience",
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
