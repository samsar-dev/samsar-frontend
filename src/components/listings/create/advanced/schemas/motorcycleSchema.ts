import { ListingFieldSchema } from "@/types/listings";

export const motorcycleSchema: ListingFieldSchema[] = [
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
    options: [
      { value: "new", label: "NEW", translationKey: "enums.condition.NEW" },
      {
        value: "likeNew",
        label: "LIKE_NEW",
        translationKey: "enums.condition.LIKE_NEW",
      },
      {
        value: "excellent",
        label: "EXCELLENT",
        translationKey: "enums.condition.EXCELLENT",
      },
      { value: "good", label: "GOOD", translationKey: "enums.condition.GOOD" },
      { value: "fair", label: "FAIR", translationKey: "enums.condition.FAIR" },
      { value: "poor", label: "POOR", translationKey: "enums.condition.POOR" },
      {
        value: "salvage",
        label: "SALVAGE",
        translationKey: "enums.condition.SALVAGE",
      },
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Condition is required" : null,
  },
  {
    name: "transmissionType",
    label: "fields.transmissionType",
    type: "select",
    options: [
      { value: "", label: "" },
      {
        value: "manual",
        label: "MANUAL",
        translationKey: "enums.transmission.MANUAL",
      },
      {
        value: "automatic",
        label: "AUTOMATIC",
        translationKey: "enums.transmission.AUTOMATIC",
      },
      {
        value: "semiAutomatic",
        label: "SEMI_AUTOMATIC",
        translationKey: "enums.transmission.SEMI_AUTOMATIC",
      },
      {
        value: "dct",
        label: "DUAL_CLUTCH",
        translationKey: "enums.transmission.DUAL_CLUTCH",
      },
      {
        value: "cvt",
        label: "CONTINUOUSLY_VARIABLE",
        translationKey: "enums.transmission.CONTINUOUSLY_VARIABLE",
      },
    ],
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
    options: [
      { value: "", label: "" },
      {
        value: "gasoline",
        label: "GASOLINE",
        translationKey: "enums.fuelType.GASOLINE",
      },
      {
        value: "electric",
        label: "ELECTRIC",
        translationKey: "enums.fuelType.ELECTRIC",
      },
      {
        value: "hybrid",
        label: "HYBRID",
        translationKey: "enums.fuelType.HYBRID",
      },
      {
        value: "diesel",
        label: "DIESEL",
        translationKey: "enums.fuelType.DIESEL",
      },
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Fuel type is required" : null,
  },

  {
    name: "engineSize",
    label: "fields.engineSize",
    type: "select",
    options: [
      {
        value: "50cc",
        label: "CC_50",
        translationKey: "enums.engineSize.CC_50",
      },
      {
        value: "125cc",
        label: "CC_125",
        translationKey: "enums.engineSize.CC_125",
      },
      {
        value: "250cc",
        label: "CC_250",
        translationKey: "enums.engineSize.CC_250",
      },
      {
        value: "300cc",
        label: "CC_300",
        translationKey: "enums.engineSize.CC_300",
      },
      {
        value: "400cc",
        label: "CC_400",
        translationKey: "enums.engineSize.CC_400",
      },
      {
        value: "500cc",
        label: "CC_500",
        translationKey: "enums.engineSize.CC_500",
      },
      {
        value: "600cc",
        label: "CC_600",
        translationKey: "enums.engineSize.CC_600",
      },
      {
        value: "650cc",
        label: "CC_650",
        translationKey: "enums.engineSize.CC_650",
      },
      {
        value: "750cc",
        label: "CC_750",
        translationKey: "enums.engineSize.CC_750",
      },
      {
        value: "800cc",
        label: "CC_800",
        translationKey: "enums.engineSize.CC_800",
      },
      {
        value: "900cc",
        label: "CC_900",
        translationKey: "enums.engineSize.CC_900",
      },
      {
        value: "1000cc",
        label: "CC_1000",
        translationKey: "enums.engineSize.CC_1000",
      },
      {
        value: "1200cc",
        label: "CC_1200",
        translationKey: "enums.engineSize.CC_1200",
      },
      {
        value: "1400cc",
        label: "CC_1400",
        translationKey: "enums.engineSize.CC_1400",
      },
      {
        value: "1500cc+",
        label: "CC_1500_PLUS",
        translationKey: "enums.engineSize.CC_1500_PLUS",
      },
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Engine size is required" : null,
  },
  {
    name: "engineType",
    label: "fields.engineType",
    type: "select",
    options: [
      {
        value: "singleCylinder",
        label: "SINGLE_CYLINDER",
        translationKey: "enums.engineType.SINGLE_CYLINDER",
      },
      {
        value: "parallel-twin",
        label: "PARALLEL_TWIN",
        translationKey: "enums.engineType.PARALLEL_TWIN",
      },
      {
        value: "v-twin",
        label: "V_TWIN",
        translationKey: "enums.engineType.V_TWIN",
      },
      {
        value: "inline-3",
        label: "INLINE_3",
        translationKey: "enums.engineType.INLINE_3",
      },
      {
        value: "inline-4",
        label: "INLINE_4",
        translationKey: "enums.engineType.INLINE_4",
      },
      { value: "v4", label: "V4", translationKey: "enums.engineType.V4" },
      {
        value: "boxer",
        label: "BOXER",
        translationKey: "enums.engineType.BOXER",
      },
      {
        value: "rotary",
        label: "ROTARY",
        translationKey: "enums.engineType.ROTARY",
      },
      {
        value: "electric",
        label: "ELECTRIC",
        translationKey: "enums.engineType.ELECTRIC",
      },
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Engine type is required" : null,
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
      {
        value: "registered",
        label: "REGISTERED",
        translationKey: "enums.registrationStatus.REGISTERED",
      },
      {
        value: "unregistered",
        label: "UNREGISTERED",
        translationKey: "enums.registrationStatus.UNREGISTERED",
      },
      {
        value: "expired",
        label: "EXPIRED",
        translationKey: "enums.registrationStatus.EXPIRED",
      },
      {
        value: "sorn",
        label: "SORN",
        translationKey: "enums.registrationStatus.SORN",
      },
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Registration status is required" : null,
  },
  {
    name: "brakeSystem",
    label: "fields.brakeSystem",
    type: "multiselect",
    options: [
      {
        value: "frontDisc",
        label: "FRONT_DISC",
        translationKey: "enums.brakeSystem.FRONT_DISC",
      },
      {
        value: "rearDisc",
        label: "REAR_DISC",
        translationKey: "enums.brakeSystem.REAR_DISC",
      },
      {
        value: "frontDrum",
        label: "FRONT_DRUM",
        translationKey: "enums.brakeSystem.FRONT_DRUM",
      },
      {
        value: "rearDrum",
        label: "REAR_DRUM",
        translationKey: "enums.brakeSystem.REAR_DRUM",
      },
      { value: "abs", label: "ABS", translationKey: "enums.brakeSystem.ABS" },
      {
        value: "combinedBraking",
        label: "COMBINED_BRAKING",
        translationKey: "enums.brakeSystem.COMBINED_BRAKING",
      },
      {
        value: "linkedBraking",
        label: "LINKED_BRAKING",
        translationKey: "enums.brakeSystem.LINKED_BRAKING",
      },
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Brake system is required" : null,
  },

  // Advanced Section
  // Performance & Technical
  {
    name: "powerOutput",
    label: "fields.powerOutput",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "torque",
    label: "fields.torque",
    type: "number",
    section: "advanced",
    required: false,
  },

  {
    name: "fuelSystem",
    label: "fields.fuelSystem",
    type: "select",
    options: [
      {
        value: "carburetor",
        label: "CARBURETOR",
        translationKey: "enums.fuelSystem.CARBURETOR",
      },
      {
        value: "fuelInjection",
        label: "FUEL_INJECTION",
        translationKey: "enums.fuelSystem.FUEL_INJECTION",
      },
      {
        value: "directInjection",
        label: "DIRECT_INJECTION",
        translationKey: "enums.fuelSystem.DIRECT_INJECTION",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "coolingSystem",
    label: "fields.coolingSystem",
    type: "select",
    options: [
      {
        value: "airCooled",
        label: "AIR_COOLED",
        translationKey: "enums.coolingSystem.AIR_COOLED",
      },
      {
        value: "liquidCooled",
        label: "LIQUID_COOLED",
        translationKey: "enums.coolingSystem.LIQUID_COOLED",
      },
      {
        value: "oilCooled",
        label: "OIL_COOLED",
        translationKey: "enums.coolingSystem.OIL_COOLED",
      },
      {
        value: "hybrid",
        label: "HYBRID",
        translationKey: "enums.coolingSystem.HYBRID",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Chassis & Suspension
  {
    name: "frameType",
    label: "fields.frameType",
    type: "select",
    options: [
      {
        value: "tubular",
        label: "TUBULAR",
        translationKey: "enums.frameType.TUBULAR",
      },
      {
        value: "trellis",
        label: "TRELLIS",
        translationKey: "enums.frameType.TRELLIS",
      },
      {
        value: "twin-spar",
        label: "TWIN_SPAR",
        translationKey: "enums.frameType.TWIN_SPAR",
      },
      {
        value: "monocoque",
        label: "MONOCOQUE",
        translationKey: "enums.frameType.MONOCOQUE",
      },
      {
        value: "backbone",
        label: "BACKBONE",
        translationKey: "enums.frameType.BACKBONE",
      },
      {
        value: "perimeter",
        label: "PERIMETER",
        translationKey: "enums.frameType.PERIMETER",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "frontSuspension",
    label: "fields.frontSuspension",
    type: "multiselect",
    options: [
      {
        value: "telescopicFork",
        label: "TELESCOPIC_FORK",
        translationKey: "enums.suspension.TELESCOPIC_FORK",
      },
      {
        value: "upsideDownFork",
        label: "UPSIDE_DOWN_FORK",
        translationKey: "enums.suspension.UPSIDE_DOWN_FORK",
      },
      {
        value: "earlessFork",
        label: "EARLESS_FORK",
        translationKey: "enums.suspension.EARLESS_FORK",
      },
      {
        value: "girder",
        label: "GIRDER",
        translationKey: "enums.suspension.GIRDER",
      },
      {
        value: "leadingLink",
        label: "LEADING_LINK",
        translationKey: "enums.suspension.LEADING_LINK",
      },
      {
        value: "electronicallyAdjustable",
        label: "ELECTRONICALLY_ADJUSTABLE",
        translationKey: "enums.suspension.ELECTRONICALLY_ADJUSTABLE",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "rearSuspension",
    label: "fields.rearSuspension",
    type: "multiselect",
    options: [
      {
        value: "twinShock",
        label: "TWIN_SHOCK",
        translationKey: "enums.suspension.TWIN_SHOCK",
      },
      {
        value: "monoShock",
        label: "MONO_SHOCK",
        translationKey: "enums.suspension.MONO_SHOCK",
      },
      {
        value: "cantilever",
        label: "CANTILEVER",
        translationKey: "enums.suspension.CANTILEVER",
      },
      {
        value: "softail",
        label: "SOFTAIL",
        translationKey: "enums.suspension.SOFTAIL",
      },
      {
        value: "electronicallyAdjustable",
        label: "ELECTRONICALLY_ADJUSTABLE",
        translationKey: "enums.suspension.ELECTRONICALLY_ADJUSTABLE",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "wheelType",
    label: "fields.wheelType",
    type: "select",
    options: [
      {
        value: "alloy",
        label: "ALLOY",
        translationKey: "enums.wheelType.ALLOY",
      },
      {
        value: "spoked",
        label: "SPOKED",
        translationKey: "enums.wheelType.SPOKED",
      },
      {
        value: "carbon",
        label: "CARBON",
        translationKey: "enums.wheelType.CARBON",
      },
      {
        value: "hybrid",
        label: "HYBRID",
        translationKey: "enums.wheelType.HYBRID",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Rider Aids & Electronics
  {
    name: "startType",
    label: "fields.startType",
    type: "multiselect",
    options: [
      {
        value: "electric",
        label: "ELECTRIC",
        translationKey: "enums.startType.ELECTRIC",
      },
      {
        value: "kickStart",
        label: "KICK_START",
        translationKey: "enums.startType.KICK_START",
      },
      { value: "both", label: "BOTH", translationKey: "enums.startType.BOTH" },
      {
        value: "keyless",
        label: "KEYLESS",
        translationKey: "enums.startType.KEYLESS",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "riderAids",
    label: "fields.riderAids",
    type: "multiselect",
    options: [
      { value: "abs", label: "ABS", translationKey: "enums.riderAids.ABS" },
      {
        value: "tractionControl",
        label: "TRACTION_CONTROL",
        translationKey: "enums.riderAids.TRACTION_CONTROL",
      },
      {
        value: "wheelieControl",
        label: "WHEELIE_CONTROL",
        translationKey: "enums.riderAids.WHEELIE_CONTROL",
      },
      {
        value: "launchControl",
        label: "LAUNCH_CONTROL",
        translationKey: "enums.riderAids.LAUNCH_CONTROL",
      },
      {
        value: "cruiseControl",
        label: "CRUISE_CONTROL",
        translationKey: "enums.riderAids.CRUISE_CONTROL",
      },
      {
        value: "ridingModes",
        label: "RIDING_MODES",
        translationKey: "enums.riderAids.RIDING_MODES",
      },
      {
        value: "quickshifter",
        label: "QUICKSHIFTER",
        translationKey: "enums.riderAids.QUICKSHIFTER",
      },
      {
        value: "autoBlipper",
        label: "AUTO_BLIPPER",
        translationKey: "enums.riderAids.AUTO_BLIPPER",
      },
      {
        value: "hillHoldControl",
        label: "HILL_HOLD_CONTROL",
        translationKey: "enums.riderAids.HILL_HOLD_CONTROL",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "electronics",
    label: "fields.electronics",
    type: "multiselect",
    options: [
      {
        value: "digitalDisplay",
        label: "DIGITAL_DISPLAY",
        translationKey: "enums.electronics.DIGITAL_DISPLAY",
      },
      { value: "tft", label: "TFT", translationKey: "enums.electronics.TFT" },
      {
        value: "bluetooth",
        label: "BLUETOOTH",
        translationKey: "enums.electronics.BLUETOOTH",
      },
      {
        value: "usbCharging",
        label: "USB_CHARGING",
        translationKey: "enums.electronics.USB_CHARGING",
      },
      {
        value: "smartphoneIntegration",
        label: "SMARTPHONE_INTEGRATION",
        translationKey: "enums.electronics.SMARTPHONE_INTEGRATION",
      },
      { value: "gps", label: "GPS", translationKey: "enums.electronics.GPS" },
      {
        value: "immobilizer",
        label: "IMMOBILIZER",
        translationKey: "enums.electronics.IMMOBILIZER",
      },
      {
        value: "alarm",
        label: "ALARM",
        translationKey: "enums.electronics.ALARM",
      },
      {
        value: "keyless",
        label: "KEYLESS",
        translationKey: "enums.electronics.KEYLESS",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "lighting",
    label: "fields.lighting",
    type: "multiselect",
    options: [
      { value: "led", label: "LED", translationKey: "enums.lighting.LED" },
      {
        value: "halogen",
        label: "HALOGEN",
        translationKey: "enums.lighting.HALOGEN",
      },
      {
        value: "xenon",
        label: "XENON",
        translationKey: "enums.lighting.XENON",
      },
      {
        value: "drl",
        label: "DAYTIME_RUNNING_LIGHTS",
        translationKey: "enums.lighting.DAYTIME_RUNNING_LIGHTS",
      },
      {
        value: "adaptiveLighting",
        label: "ADAPTIVE_LIGHTING",
        translationKey: "enums.lighting.ADAPTIVE_LIGHTING",
      },
      {
        value: "cornering",
        label: "CORNERING_LIGHTS",
        translationKey: "enums.lighting.CORNERING_LIGHTS",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Comfort & Ergonomics
  {
    name: "seatType",
    label: "fields.seatType",
    type: "multiselect",
    options: [
      {
        value: "single",
        label: "SINGLE",
        translationKey: "enums.seatType.SINGLE",
      },
      { value: "dual", label: "DUAL", translationKey: "enums.seatType.DUAL" },
      {
        value: "heated",
        label: "HEATED",
        translationKey: "enums.seatType.HEATED",
      },
      {
        value: "adjustable",
        label: "ADJUSTABLE",
        translationKey: "enums.seatType.ADJUSTABLE",
      },
      {
        value: "custom",
        label: "CUSTOM",
        translationKey: "enums.seatType.CUSTOM",
      },
      {
        value: "comfort",
        label: "COMFORT",
        translationKey: "enums.seatType.COMFORT",
      },
      {
        value: "sport",
        label: "SPORT",
        translationKey: "enums.seatType.SPORT",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "seatHeight",
    label: "fields.seatHeight",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "handlebarType",
    label: "fields.handlebarType",
    type: "select",
    options: [
      {
        value: "standard",
        label: "STANDARD",
        translationKey: "enums.handlebarType.STANDARD",
      },
      {
        value: "clipOn",
        label: "CLIP_ON",
        translationKey: "enums.handlebarType.CLIP_ON",
      },
      {
        value: "riser",
        label: "RISER",
        translationKey: "enums.handlebarType.RISER",
      },
      {
        value: "touring",
        label: "TOURING",
        translationKey: "enums.handlebarType.TOURING",
      },
      {
        value: "custom",
        label: "CUSTOM",
        translationKey: "enums.handlebarType.CUSTOM",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "comfortFeatures",
    label: "fields.comfortFeatures",
    type: "multiselect",
    options: [
      {
        value: "heatedGrips",
        label: "HEATED_GRIPS",
        translationKey: "enums.comfortFeatures.HEATED_GRIPS",
      },
      {
        value: "heatedSeats",
        label: "HEATED_SEATS",
        translationKey: "enums.comfortFeatures.HEATED_SEATS",
      },
      {
        value: "windscreen",
        label: "WINDSCREEN",
        translationKey: "enums.comfortFeatures.WINDSCREEN",
      },
      {
        value: "adjustableWindscreen",
        label: "ADJUSTABLE_WINDSCREEN",
        translationKey: "enums.comfortFeatures.ADJUSTABLE_WINDSCREEN",
      },
      {
        value: "handGuards",
        label: "HAND_GUARDS",
        translationKey: "enums.comfortFeatures.HAND_GUARDS",
      },
      {
        value: "footboards",
        label: "FOOTBOARDS",
        translationKey: "enums.comfortFeatures.FOOTBOARDS",
      },
      {
        value: "backrest",
        label: "BACKREST",
        translationKey: "enums.comfortFeatures.BACKREST",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Storage & Accessories
  {
    name: "storageOptions",
    label: "fields.storageOptions",
    type: "multiselect",
    options: [
      {
        value: "saddlebags",
        label: "SADDLEBAGS",
        translationKey: "enums.storage.SADDLEBAGS",
      },
      {
        value: "topBox",
        label: "TOP_BOX",
        translationKey: "enums.storage.TOP_BOX",
      },
      {
        value: "tankBag",
        label: "TANK_BAG",
        translationKey: "enums.storage.TANK_BAG",
      },
      {
        value: "luggageRack",
        label: "LUGGAGE_RACK",
        translationKey: "enums.storage.LUGGAGE_RACK",
      },
      {
        value: "integrated",
        label: "INTEGRATED",
        translationKey: "enums.storage.INTEGRATED",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "protectiveEquipment",
    label: "fields.protectiveEquipment",
    type: "multiselect",
    options: [
      {
        value: "crashBars",
        label: "CRASH_BARS",
        translationKey: "enums.protectiveEquipment.CRASH_BARS",
      },
      {
        value: "engineGuards",
        label: "ENGINE_GUARDS",
        translationKey: "enums.protectiveEquipment.ENGINE_GUARDS",
      },
      {
        value: "radiatorGuard",
        label: "RADIATOR_GUARD",
        translationKey: "enums.protectiveEquipment.RADIATOR_GUARD",
      },
      {
        value: "skidPlate",
        label: "SKID_PLATE",
        translationKey: "enums.protectiveEquipment.SKID_PLATE",
      },
      {
        value: "handGuards",
        label: "HAND_GUARDS",
        translationKey: "enums.protectiveEquipment.HAND_GUARDS",
      },
      {
        value: "tankPads",
        label: "TANK_PADS",
        translationKey: "enums.protectiveEquipment.TANK_PADS",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "customParts",
    label: "fields.customParts",
    type: "multiselect",
    options: [
      {
        value: "exhaust",
        label: "EXHAUST",
        translationKey: "enums.customParts.EXHAUST",
      },
      {
        value: "suspension",
        label: "SUSPENSION",
        translationKey: "enums.customParts.SUSPENSION",
      },
      {
        value: "brakes",
        label: "BRAKES",
        translationKey: "enums.customParts.BRAKES",
      },
      {
        value: "engineParts",
        label: "ENGINE_PARTS",
        translationKey: "enums.customParts.ENGINE_PARTS",
      },
      {
        value: "cosmetic",
        label: "COSMETIC",
        translationKey: "enums.customParts.COSMETIC",
      },
      {
        value: "performance",
        label: "PERFORMANCE",
        translationKey: "enums.customParts.PERFORMANCE",
      },
      {
        value: "ergonomic",
        label: "ERGONOMIC",
        translationKey: "enums.customParts.ERGONOMIC",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Documentation & History
  {
    name: "serviceHistory",
    label: "fields.serviceHistory",
    type: "multiselect",
    options: [
      {
        value: "fullDealerHistory",
        label: "FULL_DEALER_HISTORY",
        translationKey: "enums.serviceHistory.FULL_DEALER_HISTORY",
      },
      {
        value: "partialDealerHistory",
        label: "PARTIAL_DEALER_HISTORY",
        translationKey: "enums.serviceHistory.PARTIAL_DEALER_HISTORY",
      },
      {
        value: "fullServiceRecords",
        label: "FULL_SERVICE_RECORDS",
        translationKey: "enums.serviceHistory.FULL_SERVICE_RECORDS",
      },
      {
        value: "partialServiceRecords",
        label: "PARTIAL_SERVICE_RECORDS",
        translationKey: "enums.serviceHistory.PARTIAL_SERVICE_RECORDS",
      },
      {
        value: "noHistory",
        label: "NO_HISTORY",
        translationKey: "enums.serviceHistory.NO_HISTORY",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "modifications",
    label: "fields.modifications",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "warranty",
    label: "fields.warranty",
    type: "select",
    options: [
      {
        value: "manufacturer",
        label: "MANUFACTURER",
        translationKey: "enums.warranty.MANUFACTURER",
      },
      {
        value: "extended",
        label: "EXTENDED",
        translationKey: "enums.warranty.EXTENDED",
      },
      {
        value: "aftermarket",
        label: "AFTERMARKET",
        translationKey: "enums.warranty.AFTERMARKET",
      },
      { value: "none", label: "NONE", translationKey: "enums.warranty.NONE" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "emissions",
    label: "fields.emissions",
    type: "select",
    options: [
      {
        value: "Euro5",
        label: "EURO_5",
        translationKey: "enums.emissions.EURO_5",
      },
      {
        value: "Euro4",
        label: "EURO_4",
        translationKey: "enums.emissions.EURO_4",
      },
      {
        value: "Euro3",
        label: "EURO_3",
        translationKey: "enums.emissions.EURO_3",
      },
      {
        value: "Euro2",
        label: "EURO_2",
        translationKey: "enums.emissions.EURO_2",
      },
      {
        value: "nonEuro",
        label: "NON_EURO",
        translationKey: "enums.emissions.NON_EURO",
      },
      {
        value: "unknown",
        label: "UNKNOWN",
        translationKey: "enums.emissions.UNKNOWN",
      },
    ],
    section: "advanced",
    required: false,
  },
];
