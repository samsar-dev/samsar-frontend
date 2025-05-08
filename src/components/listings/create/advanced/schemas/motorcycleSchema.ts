import { ListingFieldSchema } from "@/types/listings";

export const motorcycleSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "make",
    label: "listings.make",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Make is required" : null,
  },
  {
    name: "model",
    label: "listings.model",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Model is required" : null,
  },
  {
    name: "year",
    label: "listings.year",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return "Year is required";
      if (typeof value === "number") {
        if (value < 1885) return "Year must be 1885 or later";
        if (value > new Date().getFullYear())
          return "Year cannot be in the future";
      }
      return null;
    },
  },
  {
    name: "color",
    label: "listings.exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Exterior color is required" : null,
  },
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: ["new", "likeNew", "excellent", "good", "fair", "poor", "salvage"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Condition is required" : null,
  },
  {
    name: "mileage",
    label: "listings.mileage",
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
    name: "engineSize",
    label: "listings.engineSize",
    type: "select",
    options: [
      "50cc",
      "125cc",
      "250cc",
      "300cc",
      "400cc",
      "500cc",
      "600cc",
      "650cc",
      "750cc",
      "800cc",
      "900cc",
      "1000cc",
      "1200cc",
      "1400cc",
      "1500cc+",
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Engine size is required" : null,
  },
  {
    name: "engineType",
    label: "listings.engineType",
    type: "select",
    options: [
      "singleCylinder",
      "parallel-twin",
      "v-twin",
      "inline-3",
      "inline-4",
      "v4",
      "boxer",
      "rotary",
      "electric",
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Engine type is required" : null,
  },
  {
    name: "previousOwners",
    label: "listings.previousOwners",
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
    label: "listings.registrationStatus",
    type: "select",
    options: ["registered", "unregistered", "expired", "sorn"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Registration status is required" : null,
  },
  {
    name: "brakeSystem",
    label: "listings.brakeSystem",
    type: "multiselect",
    options: [
      "frontDisc",
      "rearDisc",
      "frontDrum",
      "rearDrum",
      "abs",
      "combinedBraking",
      "linkedBraking",
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Brake system is required" : null,
  },
  {
    name: "fuelType",
    label: "listings.fuelType",
    type: "select",
    options: ["", "gasoline", "electric", "hybrid", "diesel"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Fuel type is required" : null,
  },
  {
    name: "transmissionType",
    label: "listings.transmissionType",
    type: "select",
    options: ["", "manual", "automatic", "semiAutomatic", "dct", "cvt"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Transmission type is required" : null,
  },

  // Advanced Section
  // Performance & Technical
  {
    name: "powerOutput",
    label: "listings.powerOutput",
    type: "number",
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
    name: "fuelSystem",
    label: "listings.fuelSystem",
    type: "select",
    options: ["carburetor", "fuelInjection", "directInjection"],
    section: "advanced",
    required: false,
  },
  {
    name: "coolingSystem",
    label: "listings.coolingSystem",
    type: "select",
    options: ["airCooled", "liquidCooled", "oilCooled", "hybrid"],
    section: "advanced",
    required: false,
  },

  // Chassis & Suspension
  {
    name: "frameType",
    label: "listings.frameType",
    type: "select",
    options: [
      "tubular",
      "trellis",
      "twin-spar",
      "monocoque",
      "backbone",
      "perimeter",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "frontSuspension",
    label: "listings.frontSuspension",
    type: "multiselect",
    options: [
      "telescopicFork",
      "upsideDownFork",
      "earlessFork",
      "girder",
      "leadingLink",
      "electronicallyAdjustable",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "rearSuspension",
    label: "listings.rearSuspension",
    type: "multiselect",
    options: [
      "twinShock",
      "monoShock",
      "cantilever",
      "softail",
      "electronicallyAdjustable",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "wheelType",
    label: "listings.wheelType",
    type: "select",
    options: ["alloy", "spoked", "carbon", "hybrid"],
    section: "advanced",
    required: false,
  },

  // Rider Aids & Electronics
  {
    name: "startType",
    label: "listings.startType",
    type: "multiselect",
    options: ["electric", "kickStart", "both", "keyless"],
    section: "advanced",
    required: false,
  },
  {
    name: "riderAids",
    label: "listings.riderAids",
    type: "multiselect",
    options: [
      "abs",
      "tractionControl",
      "wheelieControl",
      "launchControl",
      "cruiseControl",
      "ridingModes",
      "quickshifter",
      "autoBlipper",
      "hillHoldControl",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "electronics",
    label: "listings.electronics",
    type: "multiselect",
    options: [
      "digitalDisplay",
      "tft",
      "bluetooth",
      "usbCharging",
      "smartphone integration",
      "gps",
      "immobilizer",
      "alarm",
      "keyless",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "lighting",
    label: "listings.lighting",
    type: "multiselect",
    options: [
      "LED",
      "halogen",
      "xenon",
      "drl",
      "adaptiveLighting",
      "cornering",
    ],
    section: "advanced",
    required: false,
  },

  // Comfort & Ergonomics
  {
    name: "seatType",
    label: "listings.seatType",
    type: "multiselect",
    options: [
      "single",
      "dual",
      "heated",
      "adjustable",
      "custom",
      "comfort",
      "sport",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "seatHeight",
    label: "listings.seatHeight",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "handlebarType",
    label: "listings.handlebarType",
    type: "select",
    options: ["standard", "clipOn", "riser", "touring", "custom"],
    section: "advanced",
    required: false,
  },
  {
    name: "comfortFeatures",
    label: "listings.comfortFeatures",
    type: "multiselect",
    options: [
      "heatedGrips",
      "heatedSeats",
      "windscreen",
      "adjustableWindscreen",
      "handGuards",
      "footboards",
      "backrest",
    ],
    section: "advanced",
    required: false,
  },

  // Storage & Accessories
  {
    name: "storageOptions",
    label: "listings.storageOptions",
    type: "multiselect",
    options: ["saddlebags", "topBox", "tankBag", "luggageRack", "integrated"],
    section: "advanced",
    required: false,
  },
  {
    name: "protectiveEquipment",
    label: "listings.protectiveEquipment",
    type: "multiselect",
    options: [
      "crashBars",
      "engineGuards",
      "radiatorGuard",
      "skidPlate",
      "handGuards",
      "tankPads",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "customParts",
    label: "listings.customParts",
    type: "multiselect",
    options: [
      "exhaust",
      "suspension",
      "brakes",
      "engineParts",
      "cosmetic",
      "performance",
      "ergonomic",
    ],
    section: "advanced",
    required: false,
  },

  // Documentation & History
  {
    name: "serviceHistory",
    label: "listings.serviceHistory",
    type: "select",
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
    name: "modifications",
    label: "listings.modifications",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "warranty",
    label: "listings.warranty",
    type: "select",
    options: ["manufacturer", "extended", "aftermarket", "none"],
    section: "advanced",
    required: false,
  },
  {
    name: "emissions",
    label: "listings.emissions",
    type: "select",
    options: ["Euro5", "Euro4", "Euro3", "Euro2", "nonEuro", "unknown"],
    section: "advanced",
    required: false,
  },
];
