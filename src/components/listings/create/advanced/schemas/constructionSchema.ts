import { ListingFieldSchema } from "@/types/listings";

export const constructionSchema: ListingFieldSchema[] = [
  // Essential Section

  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: ["new", "likeNew", "excellent", "good", "fair", "poor", "salvage"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return "Condition is required";
      return null;
    },
  },
  {
    name: "equipmentType",
    label: "listings.equipmentType",
    type: "select",
    options: [
      "Excavator",
      "Bulldozer",
      "Crane",
      "Forklift",
      "Loader",
      "Backhoe",
      "Dump Truck",
      "Other",
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
    label: "listings.operatingWeight",
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
    label: "listings.enginePower",
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
    label: "listings.previousOwners",
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
    label: "listings.registrationStatus",
    type: "select",
    options: ["registered", "unregistered", "expired"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return "Registration status is required";
      return null;
    },
  },

  {
    name: "serviceHistory",
    label: "listings.serviceHistory",
    type: "select",
    options: ["full", "partial", "none"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return "Service history is required";
      return null;
    },
  },
  {
    name: "hoursUsed",
    label: "listings.hoursUsed",
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
    label: "listings.maxLiftingCapacity",
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
    label: "listings.maintenanceHistory",
    type: "textarea",
    section: "advanced",
    required: false,
  },
  {
    name: "hydraulicSystem",
    label: "listings.hydraulicSystem",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "emissions",
    label: "listings.emissions",
    type: "select",
    options: ["Tier 4", "Tier 3", "Tier 2", "Stage V", "Other", "Unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "operatorCabType",
    label: "listings.operatorCabType",
    type: "select",
    options: ["enclosed", "open", "airConditioned", "heated"],
    section: "advanced",
    required: false,
  },
  {
    name: "tireType",
    label: "listings.tireType",
    type: "select",
    options: ["tracks", "tires", "dualTires", "foamFilled", "solid"],
    section: "advanced",
    required: false,
  },
  {
    name: "warranty",
    label: "listings.warranty",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "ptoType",
    label: "listings.ptoType",
    type: "select",
    options: ["none", "540", "1000", "other"],
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
    name: "implementCompatibility",
    label: "listings.implementCompatibility",
    type: "text",
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
    label: "listings.fields.vehicleFeatures",
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
