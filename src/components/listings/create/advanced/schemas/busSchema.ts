import type { ListingFieldSchema } from "@/types/listings";
import { Condition, TransmissionType, FuelType } from "@/types/enums";

export const busSchema: ListingFieldSchema[] = [
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
    options: Object.values(Condition).map(value => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.condition.${value.toUpperCase()}`
    })),
    section: "essential",
    required: true,
  },
  {
    name: "transmissionType",
    label: "transmissionType",
    type: "select",
    options: Object.values(TransmissionType).map(value => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.transmission.${value.toUpperCase()}`
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
    validate: (value: string | number | boolean) => {
      if (!value) return "Mileage is required";
      if (typeof value === "number" && value < 0)
        return "Mileage must be 0 or greater";
      return null;
    },
  },
  {
    name: "fuelType",
    label: "fields.fuelType",
    type: "select",
    options: Object.values(FuelType).map(value => ({
      value,
      label: value.toUpperCase(),
      translationKey: `enums.fuelType.${value.toUpperCase()}`
    })),
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Fuel type is required" : null,
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
    name: "busType",
    label: "fields.busType",
    type: "select",
    options: [
      { value: "schoolBus", label: "SCHOOL_BUS", translationKey: "enums.busType.SCHOOL_BUS" },
      { value: "transitBus", label: "TRANSIT_BUS", translationKey: "enums.busType.TRANSIT_BUS" },
      { value: "tourBus", label: "TOUR_BUS", translationKey: "enums.busType.TOUR_BUS" },
      { value: "shuttle", label: "SHUTTLE", translationKey: "enums.busType.SHUTTLE" },
      { value: "miniBus", label: "MINI_BUS", translationKey: "enums.busType.MINI_BUS" },
      { value: "coachBus", label: "COACH_BUS", translationKey: "enums.busType.COACH_BUS" },
      { value: "doubleDeckerBus", label: "DOUBLE_DECKER_BUS", translationKey: "enums.busType.DOUBLE_DECKER_BUS" },
      { value: "articulatedBus", label: "ARTICULATED_BUS", translationKey: "enums.busType.ARTICULATED_BUS" },
      { value: "partyBus", label: "PARTY_BUS", translationKey: "enums.busType.PARTY_BUS" },
      { value: "electricBus", label: "ELECTRIC_BUS", translationKey: "enums.busType.ELECTRIC_BUS" },
      { value: "hybridBus", label: "HYBRID_BUS", translationKey: "enums.busType.HYBRID_BUS" },
    ],
    section: "essential",
    required: true,
  },
  {
    name: "registrationStatus",
    label: "fields.registrationStatus",
    type: "select",
    options: ["registered", "unregistered", "expired"],
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Registration status is required" : null,
  },
  {
    name: "seatingCapacity",
    label: "fields.seatingCapacity",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) => {
      if (value === undefined || value === null || value === '') return "Seating capacity is required";
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < 0) {
        return "Seating capacity must be a non-negative number";
      }
      if (numValue === 0) return null; // Allow 0 as a valid value
      return null;
    },
  },

  {
    name: "engine",
    label: "fields.engineDetails",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string | number | boolean) =>
      !value ? "Engine details are required" : null,
  },

  {
    name: "serviceHistory",
    label: "fields.serviceHistory",
    type: "select",
    options: ["full", "partial", "none"],
    section: "essential",
    required: false,
    validate: (value: string | number | boolean) => null,
  },

  // Advanced Section

  {
    name: "seatBelts",
    label: "fields.seatBelts",
    type: "select",
    options: ["all", "driver", "none"],
    section: "advanced",
    required: false,
  },
  // Entertainment & Technology
  {
    name: "entertainmentFeatures",
    label: "fields.entertainmentFeatures",
    type: "select",
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
    label: "fields.navigationSystem",
    type: "select",
    options: ["built-in", "portable", "none"],
    section: "advanced",
    required: false,
  },
  {
    name: "communicationSystem",
    label: "fields.communicationSystem",
    type: "select",
    options: ["pa", "intercom", "radioSystem"],
    section: "advanced",
    required: false,
  },

  // Maintenance & Documentation
  {
    name: "maintenanceHistory",
    label: "fields.maintenanceHistory",
    type: "select",
    options: ["complete", "partial", "minimal", "unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "lastInspectionDate",
    label: "fields.lastInspectionDate",
    type: "date",
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
    name: "certifications",
    label: "fields.certifications",
    type: "select",
    options: ["safety", "emissions", "accessibility", "tourism"],
    section: "advanced",
    required: false,
  },

  // Storage & Capacity
  {
    name: "luggageCompartments",
    label: "fields.luggageCompartments",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "luggageRacks",
    label: "fields.luggageRacks",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "fuelTankCapacity",
    label: "fields.fuelTankCapacity",
    type: "number",
    section: "advanced",
    required: false,
  },
  // Technical Specifications
  {
    name: "emissionStandard",
    label: "fields.emissionStandard",
    type: "select",
    options: ["Euro 6", "Euro 5", "Euro 4", "Euro 3", "Other", "Unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "enginePower",
    label: "fields.enginePower",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "engineTorque",
    label: "fields.engineTorque",
    type: "text",
    section: "advanced",
    required: false,
  },
  {
    name: "suspension",
    label: "fields.suspension",
    type: "select",
    options: ["air", "leaf", "electronic", "hydraulic"],
    section: "advanced",
    required: false,
  },
  {
    name: "brakeSystem",
    label: "fields.brakeSystem",
    type: "select",
    options: ["abs", "disc", "drum", "retarder", "engineBrake"],
    section: "advanced",
    required: false,
  },

  // Accessibility Features
  {
    name: "wheelchairAccessible",
    label: "fields.wheelchairAccessible",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "wheelchairLift",
    label: "fields.wheelchairLift",
    type: "checkbox",
    section: "advanced",
    required: false,
  },
  {
    name: "seatType",
    label: "fields.seatType",
    type: "select",
    options: ["standard", "luxury", "sleeper", "executive"],
    section: "advanced",
    required: false,
  },
  {
    name: "seatMaterial",
    label: "fields.seatMaterial",
    type: "select",
    options: ["fabric", "leather", "vinyl", "other"],
    section: "advanced",
    required: false,
  },

  // Safety Features
  {
    name: "emergencyExits",
    label: "fields.emergencyExits",
    type: "number",
    section: "advanced",
    required: false,
  },

  // Comfort Features
  {
    name: "airConditioning",
    label: "fields.airConditioning",
    type: "select",
    options: ["none", "front", "full", "zoneControl"],
    section: "advanced",
    required: false,
  },
  {
    name: "luggageSpace",
    label: "fields.luggageSpace",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "comfortFeatures",
    label: "fields.comfortFeatures",
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
    name: "accessibilityFeatures",
    label: "fields.accessibilityFeatures",
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
];
