import { ListingFieldSchema } from "@/types/listings";

export const tractorSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "make",
    label: "listings.make",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Make is required" : null),
  },
  {
    name: "model",
    label: "listings.model",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Model is required" : null),
  },
  {
    name: "year",
    label: "listings.year",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return "Year is required";
      if (value < 1892) return "Year must be 1892 or later";
      if (value > new Date().getFullYear() + 1)
        return "Year cannot be in the future";
      return null;
    },
  },
  {
    name: "color",
    label: "listings.exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Exterior color is required" : null),
  },
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: [
      "new",
      "likeNew",
      "excellent",
      "good",
      "fair",
      "poor",
      "salvage",
      "forParts",
    ],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Condition is required" : null),
  },
  {
    name: "hours",
    label: "listings.hours",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null) return "Hours is required";
      if (value < 0) return "Hours must be 0 or greater";
      return null;
    },
  },
  {
    name: "horsepower",
    label: "listings.horsepower",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null)
        return "Horsepower is required";
      if (value < 0) return "Horsepower must be 0 or greater";
      return null;
    },
  },
  {
    name: "driveSystem",
    label: "listings.driveSystem",
    type: "select",
    options: ["2WD", "4WD", "MFWD", "AWD", "tracked"],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Drive system is required" : null),
  },

  {
    name: "mileage",
    label: "listings.mileage",
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
    name: "transmissionType",
    label: "listings.transmissionType",
    type: "select",
    options: [
      "",
      "manual",
      "powerShift",
      "cvt",
      "hydrostatic",
      "automatic",
      "shuttle",
    ],
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Transmission type is required" : null,
  },
  {
    name: "fuelType",
    label: "listings.fuelType",
    type: "select",
    options: [
      "",
      "diesel",
      "biodiesel",
      "gasoline",
      "electric",
      "hybrid",
      "lpg",
      "cng",
    ],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Fuel type is required" : null),
  },

  // Advanced Section
  // Engine & Performance
  {
    name: "engineSpecs",
    label: "listings.engineSpecs",
    type: "multiselect",
    options: [
      "turbocharged",
      "intercooled",
      "directInjection",
      "commonRail",
      "mechanicalInjection",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "engineManufacturer",
    label: "listings.engineManufacturer",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "engineModel",
    label: "listings.engineModel",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "displacement",
    label: "listings.displacement",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "cylinders",
    label: "listings.cylinders",
    type: "select",
    options: ["2", "3", "4", "5", "6", "8", "other"],
    section: "advanced",
    required: false,
  },
  {
    name: "torque",
    label: "listings.torque",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "emissions",
    label: "listings.emissions",
    type: "select",
    options: [
      "Tier4Final",
      "Tier4Interim",
      "Tier3",
      "Tier2",
      "StageV",
      "StageIV",
      "StageIIIB",
      "other",
    ],
    section: "advanced",
    required: false,
  },

  // Hydraulics & PTO
  {
    name: "hydraulicSystem",
    label: "listings.hydraulicSystem",
    type: "select",
    options: ["open", "closed", "loadSensing", "pressureCompensated", "other"],
    section: "advanced",
    required: false,
  },
  {
    name: "hydraulicFlow",
    label: "listings.hydraulicFlow",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "hydraulicOutlets",
    label: "listings.hydraulicOutlets",
    type: "multiselect",
    options: [
      "standard",
      "deluxe",
      "electrohydraulic",
      "powerBeyond",
      "frontRemotes",
      "midRemotes",
      "rearRemotes",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "ptoSystem",
    label: "listings.ptoSystem",
    type: "multiselect",
    options: [
      "rear540",
      "rear1000",
      "rearDual",
      "mid",
      "front",
      "groundSpeed",
      "independent",
      "reversible",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "ptoHorsepower",
    label: "listings.ptoHorsepower",
    type: "number",
    section: "advanced",
    required: false,
  },

  // Implements & Attachments
  {
    name: "frontAttachments",
    label: "listings.frontAttachments",
    type: "multiselect",
    options: [
      "loader",
      "dozer",
      "snowblower",
      "mower",
      "broom",
      "forks",
      "grapple",
      "bucket",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "rearAttachments",
    label: "listings.rearAttachments",
    type: "multiselect",
    options: [
      "backhoe",
      "cultivator",
      "plow",
      "harrow",
      "sprayer",
      "baler",
      "mower",
      "rake",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "threePointHitch",
    label: "listings.threePointHitch",
    type: "select",
    options: ["category1", "category2", "category3", "category4", "none"],
    section: "advanced",
    required: false,
  },
  {
    name: "hitchCapacity",
    label: "listings.hitchCapacity",
    type: "number",
    section: "advanced",
    required: false,
  },

  // Cab & Controls
  {
    name: "cabFeatures",
    label: "listings.cabFeatures",
    type: "multiselect",
    options: [
      "airConditioning",
      "heating",
      "airSuspension",
      "soundproofing",
      "radio",
      "bluetooth",
      "powerWindows",
      "sunroof",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "seating",
    label: "listings.seating",
    type: "multiselect",
    options: [
      "airSuspension",
      "mechanical",
      "heated",
      "ventilated",
      "instructor",
      "swivel",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "steeringSystem",
    label: "listings.steeringSystem",
    type: "multiselect",
    options: ["power", "hydrostatic", "autoSteer", "gpsReady", "joystick"],
    section: "advanced",
    required: false,
  },
  {
    name: "lighting",
    label: "listings.lighting",
    type: "multiselect",
    options: [
      "halogen",
      "led",
      "xenon",
      "workLights",
      "beaconLights",
      "roadLights",
      "cabLights",
    ],
    section: "advanced",
    required: false,
  },

  // Technology & Electronics
  {
    name: "precisionFarming",
    label: "listings.precisionFarming",
    type: "multiselect",
    options: [
      "gps",
      "autoSteer",
      "variableRate",
      "sectionControl",
      "yieldMonitoring",
      "telemetry",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "monitor",
    label: "listings.monitor",
    type: "multiselect",
    options: ["digital", "touchscreen", "performance", "implement", "camera"],
    section: "advanced",
    required: false,
  },
  {
    name: "electricalSystem",
    label: "listings.electricalSystem",
    type: "select",
    options: ["12V", "24V", "dual", "other"],
    section: "advanced",
    required: false,
  },

  // Maintenance & Documentation
  {
    name: "serviceHistory",
    label: "listings.serviceHistory",
    type: "multiselect",
    options: [
      "fullDealerHistory",
      "partialDealerHistory",
      "fullServiceRecords",
      "partialServiceRecords",
      "noHistory",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "warranty",
    label: "listings.warranty",
    type: "select",
    options: [
      "manufacturer",
      "extended",
      "powertrain",
      "comprehensive",
      "none",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "modifications",
    label: "listings.modifications",
    type: "text",
    section: "advanced",
    required: false,
  },
];
