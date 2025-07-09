import { TransmissionType } from "@/types/enums";
import { ListingFieldSchema } from "@/types/listings";

export const tractorSchema: ListingFieldSchema[] = [
  // Essential Section

  {
    name: "color",
    label: "fields.exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
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
      {
        value: "forParts",
        label: "FOR_PARTS",
        translationKey: "enums.condition.FOR_PARTS",
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
    options: Object.values(TransmissionType).map((value) => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.transmission.${value.toUpperCase()}`,
    })),
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
  },
  {
    name: "fuelType",
    label: "fields.fuelType",
    type: "select",
    options: [
      { value: "", label: "" },
      {
        value: "diesel",
        label: "DIESEL",
        translationKey: "enums.fuelType.DIESEL",
      },
      {
        value: "biodiesel",
        label: "BIODIESEL",
        translationKey: "enums.fuelType.BIODIESEL",
      },
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
      { value: "lpg", label: "LPG", translationKey: "enums.fuelType.LPG" },
      { value: "cng", label: "CNG", translationKey: "enums.fuelType.CNG" },
    ],
    section: "essential",
    required: true,
  },

  {
    name: "hours",
    label: "fields.hours",
    type: "number",
    section: "essential",
    required: true,
  },
  {
    name: "horsepower",
    label: "fields.horsepower",
    type: "number",
    section: "essential",
    required: true,
  },
  {
    name: "driveSystem",
    label: "fields.driveSystem",
    type: "select",
    options: [
      { value: "2WD", label: "2WD", translationKey: "enums.driveSystem.2WD" },
      { value: "4WD", label: "4WD", translationKey: "enums.driveSystem.4WD" },
      {
        value: "MFWD",
        label: "MFWD",
        translationKey: "enums.driveSystem.MFWD",
      },
      { value: "AWD", label: "AWD", translationKey: "enums.driveSystem.AWD" },
      {
        value: "tracked",
        label: "TRACKED",
        translationKey: "enums.driveSystem.TRACKED",
      },
    ],
    section: "essential",
    required: true,
  },

  // Advanced Section
  // Engine & Performance
  {
    name: "engineSpecs",
    label: "fields.engineSpecs",
    type: "multiselect",
    options: [
      {
        value: "turbocharged",
        label: "TURBOCHARGED",
        translationKey: "enums.engineSpecs.TURBOCHARGED",
      },
      {
        value: "intercooled",
        label: "INTERCOOLED",
        translationKey: "enums.engineSpecs.INTERCOOLED",
      },
      {
        value: "directInjection",
        label: "DIRECT_INJECTION",
        translationKey: "enums.engineSpecs.DIRECT_INJECTION",
      },
      {
        value: "commonRail",
        label: "COMMON_RAIL",
        translationKey: "enums.engineSpecs.COMMON_RAIL",
      },
      {
        value: "mechanicalInjection",
        label: "MECHANICAL_INJECTION",
        translationKey: "enums.engineSpecs.MECHANICAL_INJECTION",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "engineManufacturer",
    label: "fields.engineManufacturer",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "engineModel",
    label: "fields.engineModel",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "displacement",
    label: "fields.displacement",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "cylinders",
    label: "fields.cylinders",
    type: "select",
    options: [
      {
        value: "2",
        label: "2_CYLINDERS",
        translationKey: "enums.cylinders.TWO",
      },
      {
        value: "3",
        label: "3_CYLINDERS",
        translationKey: "enums.cylinders.THREE",
      },
      {
        value: "4",
        label: "4_CYLINDERS",
        translationKey: "enums.cylinders.FOUR",
      },
      {
        value: "5",
        label: "5_CYLINDERS",
        translationKey: "enums.cylinders.FIVE",
      },
      {
        value: "6",
        label: "6_CYLINDERS",
        translationKey: "enums.cylinders.SIX",
      },
      {
        value: "8",
        label: "8_CYLINDERS",
        translationKey: "enums.cylinders.EIGHT",
      },
      {
        value: "other",
        label: "OTHER",
        translationKey: "enums.cylinders.OTHER",
      },
    ],
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
    name: "emissions",
    label: "fields.emissions",
    type: "select",
    options: [
      {
        value: "Tier4Final",
        label: "TIER_4_FINAL",
        translationKey: "enums.emissions.TIER_4_FINAL",
      },
      {
        value: "Tier4Interim",
        label: "TIER_4_INTERIM",
        translationKey: "enums.emissions.TIER_4_INTERIM",
      },
      {
        value: "Tier3",
        label: "TIER_3",
        translationKey: "enums.emissions.TIER_3",
      },
      {
        value: "Tier2",
        label: "TIER_2",
        translationKey: "enums.emissions.TIER_2",
      },
      {
        value: "StageV",
        label: "STAGE_V",
        translationKey: "enums.emissions.STAGE_V",
      },
      {
        value: "StageIV",
        label: "STAGE_IV",
        translationKey: "enums.emissions.STAGE_IV",
      },
      {
        value: "StageIIIB",
        label: "STAGE_IIIB",
        translationKey: "enums.emissions.STAGE_IIIB",
      },
      {
        value: "other",
        label: "OTHER",
        translationKey: "enums.emissions.OTHER",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Hydraulics & PTO
  {
    name: "hydraulicSystem",
    label: "fields.hydraulicSystem",
    type: "select",
    options: [
      {
        value: "open",
        label: "OPEN",
        translationKey: "enums.hydraulicSystem.OPEN",
      },
      {
        value: "closed",
        label: "CLOSED",
        translationKey: "enums.hydraulicSystem.CLOSED",
      },
      {
        value: "loadSensing",
        label: "LOAD_SENSING",
        translationKey: "enums.hydraulicSystem.LOAD_SENSING",
      },
      {
        value: "pressureCompensated",
        label: "PRESSURE_COMPENSATED",
        translationKey: "enums.hydraulicSystem.PRESSURE_COMPENSATED",
      },
      {
        value: "other",
        label: "OTHER",
        translationKey: "enums.hydraulicSystem.OTHER",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "hydraulicFlow",
    label: "fields.hydraulicFlow",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "hydraulicOutlets",
    label: "fields.hydraulicOutlets",
    type: "multiselect",
    options: [
      {
        value: "standard",
        label: "STANDARD",
        translationKey: "enums.hydraulicOutlets.STANDARD",
      },
      {
        value: "deluxe",
        label: "DELUXE",
        translationKey: "enums.hydraulicOutlets.DELUXE",
      },
      {
        value: "electrohydraulic",
        label: "ELECTROHYDRAULIC",
        translationKey: "enums.hydraulicOutlets.ELECTROHYDRAULIC",
      },
      {
        value: "powerBeyond",
        label: "POWER_BEYOND",
        translationKey: "enums.hydraulicOutlets.POWER_BEYOND",
      },
      {
        value: "frontRemotes",
        label: "FRONT_REMOTES",
        translationKey: "enums.hydraulicOutlets.FRONT_REMOTES",
      },
      {
        value: "midRemotes",
        label: "MID_REMOTES",
        translationKey: "enums.hydraulicOutlets.MID_REMOTES",
      },
      {
        value: "rearRemotes",
        label: "REAR_REMOTES",
        translationKey: "enums.hydraulicOutlets.REAR_REMOTES",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "ptoSystem",
    label: "fields.ptoSystem",
    type: "multiselect",
    options: [
      {
        value: "rear540",
        label: "REAR_540",
        translationKey: "enums.ptoSystem.REAR_540",
      },
      {
        value: "rear1000",
        label: "REAR_1000",
        translationKey: "enums.ptoSystem.REAR_1000",
      },
      {
        value: "rearDual",
        label: "REAR_DUAL",
        translationKey: "enums.ptoSystem.REAR_DUAL",
      },
      { value: "mid", label: "MID", translationKey: "enums.ptoSystem.MID" },
      {
        value: "front",
        label: "FRONT",
        translationKey: "enums.ptoSystem.FRONT",
      },
      {
        value: "groundSpeed",
        label: "GROUND_SPEED",
        translationKey: "enums.ptoSystem.GROUND_SPEED",
      },
      {
        value: "independent",
        label: "INDEPENDENT",
        translationKey: "enums.ptoSystem.INDEPENDENT",
      },
      {
        value: "reversible",
        label: "REVERSIBLE",
        translationKey: "enums.ptoSystem.REVERSIBLE",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "ptoHorsepower",
    label: "fields.ptoHorsepower",
    type: "number",
    section: "advanced",
    required: false,
  },

  // Implements & Attachments
  {
    name: "frontAttachments",
    label: "fields.frontAttachments",
    type: "multiselect",
    options: [
      {
        value: "loader",
        label: "LOADER",
        translationKey: "enums.attachments.LOADER",
      },
      {
        value: "dozer",
        label: "DOZER",
        translationKey: "enums.attachments.DOZER",
      },
      {
        value: "snowblower",
        label: "SNOWBLOWER",
        translationKey: "enums.attachments.SNOWBLOWER",
      },
      {
        value: "mower",
        label: "MOWER",
        translationKey: "enums.attachments.MOWER",
      },
      {
        value: "broom",
        label: "BROOM",
        translationKey: "enums.attachments.BROOM",
      },
      {
        value: "forks",
        label: "FORKS",
        translationKey: "enums.attachments.FORKS",
      },
      {
        value: "grapple",
        label: "GRAPPLE",
        translationKey: "enums.attachments.GRAPPLE",
      },
      {
        value: "bucket",
        label: "BUCKET",
        translationKey: "enums.attachments.BUCKET",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "rearAttachments",
    label: "fields.rearAttachments",
    type: "multiselect",
    options: [
      {
        value: "backhoe",
        label: "BACKHOE",
        translationKey: "enums.attachments.BACKHOE",
      },
      {
        value: "cultivator",
        label: "CULTIVATOR",
        translationKey: "enums.attachments.CULTIVATOR",
      },
      {
        value: "plow",
        label: "PLOW",
        translationKey: "enums.attachments.PLOW",
      },
      {
        value: "harrow",
        label: "HARROW",
        translationKey: "enums.attachments.HARROW",
      },
      {
        value: "sprayer",
        label: "SPRAYER",
        translationKey: "enums.attachments.SPRAYER",
      },
      {
        value: "baler",
        label: "BALER",
        translationKey: "enums.attachments.BALER",
      },
      {
        value: "mower",
        label: "MOWER",
        translationKey: "enums.attachments.MOWER",
      },
      {
        value: "rake",
        label: "RAKE",
        translationKey: "enums.attachments.RAKE",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "threePointHitch",
    label: "fields.threePointHitch",
    type: "select",
    options: [
      {
        value: "category1",
        label: "CATEGORY_1",
        translationKey: "enums.threePointHitch.CATEGORY_1",
      },
      {
        value: "category2",
        label: "CATEGORY_2",
        translationKey: "enums.threePointHitch.CATEGORY_2",
      },
      {
        value: "category3",
        label: "CATEGORY_3",
        translationKey: "enums.threePointHitch.CATEGORY_3",
      },
      {
        value: "category4",
        label: "CATEGORY_4",
        translationKey: "enums.threePointHitch.CATEGORY_4",
      },
      {
        value: "none",
        label: "NONE",
        translationKey: "enums.threePointHitch.NONE",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "hitchCapacity",
    label: "fields.hitchCapacity",
    type: "number",
    section: "advanced",
    required: false,
  },
  // Maintenance & Documentation
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
        value: "powertrain",
        label: "POWERTRAIN",
        translationKey: "enums.warranty.POWERTRAIN",
      },
      {
        value: "comprehensive",
        label: "COMPREHENSIVE",
        translationKey: "enums.warranty.COMPREHENSIVE",
      },
      { value: "none", label: "NONE", translationKey: "enums.warranty.NONE" },
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
    name: "electricalSystem",
    label: "fields.electricalSystem",
    type: "select",
    options: [
      {
        value: "12V",
        label: "12V",
        translationKey: "enums.electricalSystem.TWELVE_VOLT",
      },
      {
        value: "24V",
        label: "24V",
        translationKey: "enums.electricalSystem.TWENTY_FOUR_VOLT",
      },
      {
        value: "dual",
        label: "DUAL",
        translationKey: "enums.electricalSystem.DUAL",
      },
      {
        value: "other",
        label: "OTHER",
        translationKey: "enums.electricalSystem.OTHER",
      },
    ],
    section: "advanced",
    required: false,
  },
  // ================= VEHICLE FEATURES =================
  {
    name: "features",
    label: "fields.vehicleFeatures",
    type: "featureGroup",
    section: "advanced",
    required: false,
    featureGroups: {
      cab: {
        label: "featureCategories.cabFeatures",
        features: [
          {
            name: "airConditioning",
            label: "features.airConditioning",
            type: "toggle",
          },
          { name: "heating", label: "features.heating", type: "toggle" },
          {
            name: "airSuspension",
            label: "features.airSuspension",
            type: "toggle",
          },
          {
            name: "soundproofing",
            label: "features.soundproofing",
            type: "toggle",
          },
          { name: "radio", label: "features.radio", type: "toggle" },
          { name: "bluetooth", label: "features.bluetooth", type: "toggle" },
          {
            name: "powerWindows",
            label: "features.powerWindows",
            type: "toggle",
          },
          { name: "sunroof", label: "features.sunroof", type: "toggle" },
        ],
      },
      seating: {
        label: "featureCategories.seatingFeatures",
        features: [
          {
            name: "airSuspensionSeat",
            label: "features.airSuspensionSeat",
            type: "toggle",
          },
          {
            name: "mechanicalSeat",
            label: "features.mechanicalSeat",
            type: "toggle",
          },
          { name: "heatedSeat", label: "features.heatedSeat", type: "toggle" },
          {
            name: "ventilatedSeat",
            label: "features.ventilatedSeat",
            type: "toggle",
          },
          {
            name: "instructorSeat",
            label: "features.instructorSeat",
            type: "toggle",
          },
          { name: "swivelSeat", label: "features.swivelSeat", type: "toggle" },
        ],
      },
      steering: {
        label: "featureCategories.steeringFeatures",
        features: [
          {
            name: "powerSteering",
            label: "features.powerSteering",
            type: "toggle",
          },
          {
            name: "hydrostaticSteering",
            label: "features.hydrostaticSteering",
            type: "toggle",
          },
          { name: "autoSteer", label: "features.autoSteer", type: "toggle" },
          {
            name: "gpsReadySteering",
            label: "features.gpsReadySteering",
            type: "toggle",
          },
          {
            name: "joystickSteering",
            label: "features.joystickSteering",
            type: "toggle",
          },
        ],
      },
      lighting: {
        label: "featureCategories.lightingFeatures",
        features: [
          {
            name: "halogenLights",
            label: "features.halogenLights",
            type: "toggle",
          },
          { name: "ledLights", label: "features.ledLights", type: "toggle" },
          {
            name: "xenonLights",
            label: "features.xenonLights",
            type: "toggle",
          },
          { name: "workLights", label: "features.workLights", type: "toggle" },
          {
            name: "beaconLights",
            label: "features.beaconLights",
            type: "toggle",
          },
          { name: "roadLights", label: "features.roadLights", type: "toggle" },
          { name: "cabLights", label: "features.cabLights", type: "toggle" },
        ],
      },
      technology: {
        label: "featureCategories.technologyFeatures",
        features: [
          { name: "gps", label: "features.gps", type: "toggle" },
          {
            name: "autoSteerTech",
            label: "features.autoSteerTech",
            type: "toggle",
          },
          {
            name: "variableRateTech",
            label: "features.variableRateTech",
            type: "toggle",
          },
          {
            name: "sectionControl",
            label: "features.sectionControl",
            type: "toggle",
          },
          {
            name: "yieldMonitoring",
            label: "features.yieldMonitoring",
            type: "toggle",
          },
          { name: "telemetry", label: "features.telemetry", type: "toggle" },
          {
            name: "digitalMonitor",
            label: "features.digitalMonitor",
            type: "toggle",
          },
          {
            name: "touchscreenMonitor",
            label: "features.touchscreenMonitor",
            type: "toggle",
          },
          {
            name: "performanceMonitor",
            label: "features.performanceMonitor",
            type: "toggle",
          },
          {
            name: "implementMonitor",
            label: "features.implementMonitor",
            type: "toggle",
          },
          {
            name: "cameraMonitor",
            label: "features.cameraMonitor",
            type: "toggle",
          },
        ],
      },
    },
  },
];
