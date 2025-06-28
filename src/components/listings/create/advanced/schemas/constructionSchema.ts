import { ListingFieldSchema } from "@/types/listings";

export const constructionSchema: ListingFieldSchema[] = [
  // Essential Section

  {
    name: "condition",
    label: "fields.condition",
    type: "select",
    options: [
      { value: "new", label: "NEW", translationKey: "enums.condition.NEW" },
      { value: "likeNew", label: "LIKE_NEW", translationKey: "enums.condition.LIKE_NEW" },
      { value: "excellent", label: "EXCELLENT", translationKey: "enums.condition.EXCELLENT" },
      { value: "good", label: "GOOD", translationKey: "enums.condition.GOOD" },
      { value: "fair", label: "FAIR", translationKey: "enums.condition.FAIR" },
      { value: "poor", label: "POOR", translationKey: "enums.condition.POOR" },
      { value: "salvage", label: "SALVAGE", translationKey: "enums.condition.SALVAGE" },
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return "Condition is required";
      return null;
    },
  },
  {
    name: "equipmentType",
    label: "fields.equipmentType",
    type: "select",
    options: [
      { value: "Excavator", label: "EXCAVATOR", translationKey: "enums.constructionEquipment.EXCAVATOR" },
      { value: "Bulldozer", label: "BULLDOZER", translationKey: "enums.constructionEquipment.BULLDOZER" },
      { value: "Crane", label: "CRANE", translationKey: "enums.constructionEquipment.CRANE" },
      { value: "Forklift", label: "FORKLIFT", translationKey: "enums.constructionEquipment.FORKLIFT" },
      { value: "Loader", label: "LOADER", translationKey: "enums.constructionEquipment.LOADER" },
      { value: "Backhoe", label: "BACKHOE", translationKey: "enums.constructionEquipment.BACKHOE" },
      { value: "Dump Truck", label: "DUMP_TRUCK", translationKey: "enums.constructionEquipment.DUMP_TRUCK" },
      { value: "Other", label: "OTHER", translationKey: "enums.constructionEquipment.OTHER" },
    ],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return "Equipment type is required";
      return null;
    },
  },
  {
    name: "operatingWeight",
    label: "fields.operatingWeight",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return null;
      if (typeof value === "string" && /^\d+$/.test(value)) return null;
      if (typeof value === "number" && value >= 0) return null;
      return "Invalid weight format";
    },
  },
  {
    name: "enginePower",
    label: "fields.enginePower",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return null;
      if (typeof value === "string" && /^\d+$/.test(value)) return null;
      if (typeof value === "number" && value >= 0) return null;
      return "Invalid power format";
    },
  },

  {
    name: "previousOwners",
    label: "fields.previousOwners",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return "Previous owners is required";
      if (typeof value === "number" && value >= 0) return null;
      if (typeof value === "string" && /^\d+$/.test(value)) return null;
      return "Previous owners must be 0 or greater";
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
    validate: (value: string | number | boolean) => {
      if (!value) return "Registration status is required";
      return null;
    },
  },

  {
    name: "serviceHistory",
    label: "fields.serviceHistory",
    type: "select",
    options: [
      { value: "full", label: "FULL", translationKey: "enums.serviceHistory.FULL" },
      { value: "partial", label: "PARTIAL", translationKey: "enums.serviceHistory.PARTIAL" },
      { value: "none", label: "NONE", translationKey: "enums.serviceHistory.NONE" },
    ],
    section: "essential",
    required: false,
    validate: (value: string | number | boolean) => null,
    // Default to "none" if not provided - this will be handled in the form submission
  },
  {
    name: "hoursUsed",
    label: "fields.hoursUsed",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return null;
      if (typeof value === "string" && /^\d+$/.test(value)) return null;
      if (typeof value === "number" && value >= 0) return null;
      return "Invalid hours format";
    },
  },

  // Advanced Section
  {
    name: "maxLiftingCapacity",
    label: "fields.maxLiftingCapacity",
    type: "text",
    section: "advanced",
    required: false,
    validate: (value: string | number | boolean) => {
      if (!value) return null;
      if (typeof value === "string" && /^\d+$/.test(value)) return null;
      if (typeof value === "number" && value >= 0) return null;
      return "Invalid capacity format";
    },
  },
  {
    name: "maintenanceHistory",
    label: "fields.maintenanceHistory",
    type: "textarea",
    section: "advanced",
    required: false,
  },
  {
    name: "hydraulicSystem",
    label: "fields.hydraulicSystem",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "emissions",
    label: "fields.emissions",
    type: "select",
    options: ["Tier 4", "Tier 3", "Tier 2", "Stage V", "Other", "Unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "operatorCabType",
    label: "fields.operatorCabType",
    type: "select",
    options: ["enclosed", "open", "airConditioned", "heated"],
    section: "advanced",
    required: false,
  },
  {
    name: "tireType",
    label: "fields.tireType",
    type: "select",
    options: ["tracks", "tires", "dualTires", "foamFilled", "solid"],
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
    name: "ptoType",
    label: "fields.ptoType",
    type: "select",
    options: ["none", "540", "1000", "other"],
    section: "advanced",
    required: false,
  },
  {
    name: "hydraulicOutlets",
    label: "fields.hydraulicOutlets",
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
    name: "implementCompatibility",
    label: "fields.implementCompatibility",
    type: "text",
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
      protection: {
        label: "Protection Systems",
        features: [
          { name: "rops", label: "ROPS (Rollover Protection)", type: "toggle" },
          {
            name: "fops",
            label: "FOPS (Falling Object Protection)",
            type: "toggle",
          },
          { name: "emergencyStop", label: "Emergency Stop", type: "toggle" },
          {
            name: "fireSuppression",
            label: "Fire Suppression",
            type: "toggle",
          },
        ],
      },
      monitoring: {
        label: "Monitoring Systems",
        features: [
          { name: "backupCamera", label: "Backup Camera", type: "toggle" },
          { name: "safetySensors", label: "Safety Sensors", type: "toggle" },
          {
            name: "proximityWarning",
            label: "Proximity Warning",
            type: "toggle",
          },
          { name: "loadMonitoring", label: "Load Monitoring", type: "toggle" },
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
      attachments: {
        label: "Attachments",
        features: [
          { name: "bucket", label: "Bucket", type: "toggle" },
          { name: "hammer", label: "Hammer", type: "toggle" },
          { name: "auger", label: "Auger", type: "toggle" },
          { name: "grapple", label: "Grapple", type: "toggle" },
          { name: "fork", label: "Fork", type: "toggle" },
          { name: "blade", label: "Blade", type: "toggle" },
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
        ],
      },
      technology: {
        label: "Technology Features",
        features: [
          { name: "gps", label: "GPS", type: "toggle" },
          { name: "telematics", label: "Telematics", type: "toggle" },
          {
            name: "remoteDiagnostics",
            label: "Remote Diagnostics",
            type: "toggle",
          },
          {
            name: "fleetManagement",
            label: "Fleet Management",
            type: "toggle",
          },
        ],
      },
      comfort: {
        label: "Comfort Features",
        features: [
          { name: "heatedSeat", label: "Heated Seat", type: "toggle" },
          {
            name: "airSuspensionSeat",
            label: "Air Suspension Seat",
            type: "toggle",
          },
          { name: "bluetooth", label: "Bluetooth", type: "toggle" },
          { name: "radio", label: "Radio", type: "toggle" },
        ],
      },
    },
  },
];
