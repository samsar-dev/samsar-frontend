import { ListingFieldSchema } from "@/types/listings";
import { Condition, FuelType, TransmissionType } from "@/types/enums";

export const vanSchema: ListingFieldSchema[] = [
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
    name: "interiorColor",
    label: "fields.interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Interior color is required" : null,
  },
  {
    name: "condition",
    label: "fields.condition",
    type: "select",
    options: Object.values(Condition),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Condition is required" : null,
  },
  {
    name: "vanType",
    label: "fields.vanType",
    type: "select",
    options: [
      "cargo",
      "passenger",
      "minivan",
      "camper",
      "shuttle",
      "cutaway",
      "panel",
      "refrigerated",
      "stepVan",
      "highRoof",
      "wheelchair",
      "conversion",
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Van type is required" : null,
  },
  {
    name: "transmissionType",
    label: "fields.transmissionType",
    type: "select",
    options: Object.values(TransmissionType),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Transmission type is required" : null,
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
    options: ["", "diesel", "gasoline", "electric", "hybrid", "cng"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Fuel type is required" : null,
  },

  {
    name: "engineType",
    label: "fields.engineType",
    type: "select",
    options: Object.values(FuelType),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Engine type is required" : null,
  },

  {
    name: "cargoVolume",
    label: "fields.cargoVolume",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value && value !== 0) return "Cargo volume is required";
      if (typeof value === "number" && value < 0)
        return "Cargo volume must be 0 or greater";
      return null;
    },
  },
  {
    name: "payloadCapacity",
    label: "fields.payloadCapacity",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value && value !== 0) return "Payload capacity is required";
      if (typeof value === "number" && value < 0)
        return "Payload capacity must be 0 or greater";
      return null;
    },
  },

  {
    name: "previousOwners",
    label: "fields.previousOwners",
    type: "number",
    section: "advanced",
    required: false,
    validate: (value: string | number | boolean) => {
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
    section: "advanced",
    required: false,
  },
  {
    name: "serviceHistory",
    label: "fields.serviceHistory",
    type: "select",
    options: ["full", "partial", "none"],
    section: "advanced",
    required: false,
  },

  // Advanced Section

  {
    name: "engine",
    label: "fields.engine",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "horsepower",
    label: "fields.horsepower",
    type: "number",
    section: "advanced",
    required: false,
    validate: (value: string | number | boolean) => {
      if (typeof value === "number" && value < 0)
        return "Horsepower must be 0 or greater";
      return null;
    },
  },
  {
    name: "torque",
    label: "fields.torque",
    type: "number",
    section: "advanced",
    required: false,
    validate: (value: string | number | boolean) => {
      if (typeof value === "number" && value < 0)
        return "Torque must be 0 or greater";
      return null;
    },
  },
  {
    name: "roofHeight",
    label: "fields.roofHeight",
    type: "select",
    options: ["Low", "Medium", "High", "Super High"],
    section: "advanced",
    required: false,
  },
  {
    name: "loadingFeatures",
    label: "loadingFeatures",
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
    label: "fields.refrigeration",
    type: "select",
    options: ["yes", "no"],
    section: "advanced",
    required: false,
  },
  {
    name: "temperatureRange",
    label: "fields.temperatureRange",
    type: "text",
    section: "advanced",
    required: false,
    // validate: (value: string | number | boolean) => {
    //   if (!value) return null;
    //   if (typeof value === "string" && !/^-?\d+(\.\d+)?°[CF]$/.test(value))
    //     return "Invalid temperature format";
    //   return null;
    // },
  },
  {
    name: "interiorHeight",
    label: "fields.interiorHeight",
    type: "text",
    section: "advanced",
    required: false,
    validate: (value: string | number | boolean) => {
      if (!value) return null;
      if (typeof value === "string" && !/^\d+(\.\d+)?\s*(m|ft)$/.test(value))
        return "Invalid height format";
      return null;
    },
  },
  {
    name: "interiorLength",
    label: "fields.interiorLength",
    type: "text",
    section: "advanced",
    required: false,
    validate: (value: string | number | boolean) => {
      if (!value) return null;
      if (typeof value === "string" && !/^\d+(\.\d+)?\s*(m|ft)$/.test(value))
        return "Invalid length format";
      return null;
    },
  },
  {
    name: "emissions",
    label: "fields.emissions",
    type: "select",
    options: ["Euro 6", "Euro 5", "Euro 4", "Euro 3", "Other", "Unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "warranty",
    label: "fields.warranty",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "seatingConfiguration",
    label: "fields.seatingConfiguration",
    type: "select",
    options: ["2-seater", "5-seater", "7-seater", "9-seater", "other"],
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
          { name: "backupCamera", label: "Backup Camera", type: "toggle" },
          { name: "parkingSensors", label: "Parking Sensors", type: "toggle" },
          {
            name: "blindSpotMonitor",
            label: "Blind Spot Monitor",
            type: "toggle",
          },
          {
            name: "crossTrafficAlert",
            label: "Cross Traffic Alert",
            type: "toggle",
          },
        ],
      },
      safety: {
        label: "Safety Features",
        features: [
          { name: "abs", label: "ABS", type: "toggle" },
          {
            name: "tractionControl",
            label: "Traction Control",
            type: "toggle",
          },
          {
            name: "stabilityControl",
            label: "Stability Control",
            type: "toggle",
          },
          {
            name: "tirePressureMonitoring",
            label: "Tire Pressure Monitoring",
            type: "toggle",
          },
          {
            name: "fireExtinguisher",
            label: "Fire Extinguisher",
            type: "toggle",
          },
          { name: "firstAidKit", label: "First Aid Kit", type: "toggle" },
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
      cameras: {
        label: "Camera Features",
        features: [
          { name: "rearCamera", label: "Rear Camera", type: "toggle" },
          { name: "camera360", label: "360° Camera", type: "toggle" },
          { name: "dashCam", label: "Dash Cam", type: "toggle" },
          {
            name: "parkingAidCamera",
            label: "Parking Aid Camera",
            type: "toggle",
          },
        ],
      },
      entertainment: {
        label: "Entertainment Features",
        features: [
          { name: "bluetooth", label: "Bluetooth", type: "toggle" },
          { name: "appleCarPlay", label: "Apple CarPlay", type: "toggle" },
          { name: "androidAuto", label: "Android Auto", type: "toggle" },
          {
            name: "premiumSound",
            label: "Premium Sound System",
            type: "toggle",
          },
          { name: "usbPorts", label: "USB Ports", type: "toggle" },
          {
            name: "infotainment",
            label: "Infotainment System",
            type: "toggle",
          },
          { name: "navigation", label: "Navigation System", type: "toggle" },
          { name: "gps", label: "GPS", type: "toggle" },
        ],
      },
      lighting: {
        label: "Lighting Features",
        features: [
          { name: "ledLights", label: "LED Lights", type: "toggle" },
          { name: "halogenLights", label: "Halogen Lights", type: "toggle" },
          { name: "workLights", label: "Work Lights", type: "toggle" },
          { name: "beaconLights", label: "Beacon Lights", type: "toggle" },
          { name: "strobeLights", label: "Strobe Lights", type: "toggle" },
          { name: "fogLights", label: "Fog Lights", type: "toggle" },
        ],
      },
      climate: {
        label: "Climate Features",
        features: [
          {
            name: "airConditioning",
            label: "Air Conditioning",
            type: "toggle",
          },
          {
            name: "rearClimateControl",
            label: "Rear Climate Control",
            type: "toggle",
          },
          { name: "heatedSeats", label: "Heated Seats", type: "toggle" },
        ],
      },
      convenience: {
        label: "Convenience Features",
        features: [
          { name: "powerSteering", label: "Power Steering", type: "toggle" },
          { name: "powerWindows", label: "Power Windows", type: "toggle" },
          { name: "powerLocks", label: "Power Locks", type: "toggle" },
          { name: "keylessEntry", label: "Keyless Entry", type: "toggle" },
          { name: "remoteStart", label: "Remote Start", type: "toggle" },
        ],
      },
      cargo: {
        label: "Cargo Features",
        features: [
          { name: "roofRack", label: "Roof Rack", type: "toggle" },
          { name: "cargoTieDowns", label: "Cargo Tie-Downs", type: "toggle" },
          { name: "loadingRamp", label: "Loading Ramp", type: "toggle" },
        ],
      },
    },
  },
];
