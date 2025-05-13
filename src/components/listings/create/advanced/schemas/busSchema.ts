import { ListingFieldSchema } from "@/types/listings";
import { Condition, TransmissionType, FuelType } from "@/types/enums";

export const busSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "color",
    label: "exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Exterior color is required" : null,
  },
  {
    name: "interiorColor",
    label: "interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Interior color is required" : null,
  },
  {
    name: "condition",
    label: "listings.condition",
    type: "select",
    options: Object.values(Condition),
    section: "essential",
    required: true,
  },
  {
    name: "transmissionType",
    label: "listings.transmissionType",
    type: "select",
    options: Object.values(TransmissionType),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Transmission type is required" : null,
  },

  {
    name: "mileage",
    label: "mileage",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return "Mileage is required";
      if (typeof value === "number" && value < 0)
        return "Mileage must be 0 or greater";
      return null;
    },
  },
  {
    name: "fuelType",
    label: "fuelType",
    type: "select",
    options: Object.values(FuelType),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Fuel type is required" : null,
  },

  {
    name: "previousOwners",
    label: "previousOwners",
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
    name: "busType",
    label: "listings.busType",
    type: "select",
    options: [
      "schoolBus",
      "transitBus",
      "tourBus",
      "shuttle",
      "miniBus",
      "coachBus",
      "doubleDeckerBus",
      "articulatedBus",
      "partyBus",
      "electricBus",
      "hybridBus",
    ],
    section: "essential",
    required: true,
  },
  {
    name: "registrationStatus",
    label: "registrationStatus",
    type: "select",
    options: ["registered", "unregistered", "expired"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Registration status is required" : null,
  },
  {
    name: "seatingCapacity",
    label: "listings.seatingCapacity",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (!value) return "Seating capacity is required";
      if (typeof value === "number" && value <= 0)
        return "Seating capacity must be greater than 0";
      return null;
    },
  },

  {
    name: "engine",
    label: "engine",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Engine details are required" : null,
  },

  {
    name: "serviceHistory",
    label: "serviceHistory",
    type: "multiselect",
    options: ["full", "partial", "none"],
    section: "essential",
    required: false,
    validate: (value: string | number | boolean) => null,
  },

  // Advanced Section
  // Comfort Features
  {
    name: "airConditioning",
    label: "comfort.airConditioning",
    type: "select",
    options: ["none", "front", "full", "zoneControl"],
    section: "advanced",
    required: false,
  },
  {
    name: "luggageSpace",
    label: "listings.luggageSpace",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "comfortFeatures",
    label: "listings.comfortFeatures",
    type: "featureGroup",
    section: "advanced",
    required: false,
    featureGroups: {
      comfort: {
        label: "Comfort Features",
        features: [
          { name: "recliningSeats", label: "Reclining Seats", type: "toggle" },
          { name: "footRests", label: "Footrests", type: "toggle" },
          { name: "armRests", label: "Armrests", type: "toggle" },
          { name: "trayTables", label: "Tray Tables", type: "toggle" },
          { name: "readingLights", label: "Reading Lights", type: "toggle" },
          { name: "curtains", label: "Curtains", type: "toggle" },
          { name: "toilets", label: "Toilets", type: "toggle" },
          { name: "waterDispenser", label: "Water Dispenser", type: "toggle" },
        ],
      },
    },
  },
  {
    name: "seatType",
    label: "listings.seatType",
    type: "select",
    options: ["standard", "luxury", "sleeper", "executive"],
    section: "advanced",
    required: false,
  },
  {
    name: "seatMaterial",
    label: "listings.seatMaterial",
    type: "select",
    options: ["fabric", "leather", "vinyl", "other"],
    section: "advanced",
    required: false,
  },

  // Accessibility Features
  {
    name: "wheelchairAccessible",
    label: "accessibility.wheelchairAccessible",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "wheelchairLift",
    label: "listings.wheelchairLift",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "accessibilityFeatures",
    label: "listings.fields.accessibilityFeatures",
    type: "featureGroup",
    section: "advanced",
    required: false,
    featureGroups: {
      accessibility: {
        label: "Accessibility Features",
        features: [
          { name: "lowFloor", label: "Low Floor", type: "toggle" },
          { name: "kneeling", label: "Kneeling System", type: "toggle" },
          {
            name: "audioAnnouncements",
            label: "Audio Announcements",
            type: "toggle",
          },
          { name: "brailleSignage", label: "Braille Signage", type: "toggle" },
          {
            name: "prioritySeating",
            label: "Priority Seating",
            type: "toggle",
          },
          { name: "handrails", label: "Handrails", type: "toggle" },
        ],
      },
    },
  },

  // Safety Features
  {
    name: "emergencyExits",
    label: "safety.emergencyExits",
    type: "number",
    section: "advanced",
    required: false,
  },
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
        ],
      },
      driverAssist: {
        label: "Driver Assistance",
        features: [
          { name: "abs", label: "ABS", type: "toggle" },
          { name: "laneAssist", label: "Lane Assist", type: "toggle" },
          {
            name: "collisionWarning",
            label: "Collision Warning",
            type: "toggle",
          },
          { name: "speedLimiter", label: "Speed Limiter", type: "toggle" },
          {
            name: "tirePressureMonitoring",
            label: "Tire Pressure Monitoring",
            type: "toggle",
          },
          { name: "reverseCamera", label: "Reverse Camera", type: "toggle" },
          {
            name: "blindSpotDetection",
            label: "Blind Spot Detection",
            type: "toggle",
          },
        ],
      },
      emergency: {
        label: "Emergency Equipment",
        features: [
          {
            name: "fireExtinguisher",
            label: "Fire Extinguisher",
            type: "toggle",
          },
          { name: "firstAidKit", label: "First Aid Kit", type: "toggle" },
          {
            name: "emergencyHammer",
            label: "Emergency Hammer",
            type: "toggle",
          },
        ],
      },
    },
  },
  {
    name: "seatBelts",
    label: "listings.seatBelts",
    type: "select",
    options: ["all", "driver", "none"],
    section: "advanced",
    required: false,
  },

  // Technical Specifications
  {
    name: "emissionStandard",
    label: "listings.emissionStandard",
    type: "select",
    options: ["Euro 6", "Euro 5", "Euro 4", "Euro 3", "Other", "Unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "enginePower",
    label: "listings.enginePower",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "engineTorque",
    label: "listings.engineTorque",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "suspension",
    label: "listings.suspension",
    type: "multiselect",
    options: ["air", "leaf", "electronic", "hydraulic"],
    section: "advanced",
    required: false,
  },
  {
    name: "brakeSystem",
    label: "listings.brakeSystem",
    type: "multiselect",
    options: ["abs", "disc", "drum", "retarder", "engineBrake"],
    section: "advanced",
    required: false,
  },

  // Entertainment & Technology
  {
    name: "entertainmentFeatures",
    label: "listings.entertainmentFeatures",
    type: "multiselect",
    options: [
      "tv",
      "dvdPlayer",
      "audioSystem",
      "wifi",
      "usbCharging",
      "wirelessCharging",
      "bluetooth",
    ],
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
  {
    name: "communicationSystem",
    label: "listings.communicationSystem",
    type: "multiselect",
    options: ["pa", "intercom", "radioSystem"],
    section: "advanced",
    required: false,
  },

  // Maintenance & Documentation
  {
    name: "maintenanceHistory",
    label: "listings.maintenanceHistory",
    type: "select",
    options: ["complete", "partial", "minimal", "unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "lastInspectionDate",
    label: "listings.lastInspectionDate",
    type: "date",
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
    name: "certifications",
    label: "listings.certifications",
    type: "multiselect",
    options: ["safety", "emissions", "accessibility", "tourism"],
    section: "advanced",
    required: false,
  },

  // Storage & Capacity
  {
    name: "luggageCompartments",
    label: "listings.luggageCompartments",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "luggageRacks",
    label: "listings.luggageRacks",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "fuelTankCapacity",
    label: "listings.fuelTankCapacity",
    type: "number",
    section: "advanced",
    required: false,
  },
];
