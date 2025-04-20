import { ListingFieldSchema } from "@/types/listings";

export const busSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "color",
    label: "exteriorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Exterior color is required" : null),
  },
  {
    name: "interiorColor",
    label: "interiorColor",
    type: "colorpicker",
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Interior color is required" : null),
  },
  {
    name: "condition",
    label: "condition",
    type: "select",
    options: ["new", "likeNew", "excellent", "good", "fair", "poor", "salvage"],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Condition is required" : null),
  },
  {
    name: "mileage",
    label: "mileage",
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
    name: "seatingCapacity",
    label: "seatingCapacity",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null)
        return "Seating capacity is required";
      if (value < 1) return "Seating capacity must be greater than 0";
      return null;
    },
  },
  {
    name: "previousOwners",
    label: "previousOwners",
    type: "number",
    section: "essential",
    required: true,
    validate: (value: number) => {
      if (value === undefined || value === null)
        return "Previous owners is required";
      if (value < 0) return "Previous owners must be 0 or greater";
      return null;
    },
  },
  {
    name: "registrationStatus",
    label: "registrationStatus",
    type: "select",
    options: ["registered", "unregistered", "expired"],
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Registration status is required" : null,
  },
  {
    name: "engine",
    label: "engine",
    type: "text",
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Engine details are required" : null,
  },
  {
    name: "fuelType",
    label: "fuelType",
    type: "select",
    options: ["", "diesel", "gasoline", "electric", "hybrid", "cng"],
    section: "essential",
    required: true,
    validate: (value: string) => (!value ? "Fuel type is required" : null),
  },
  {
    name: "transmissionType",
    label: "listings.transmissionType",
    type: "select",
    options: ["manual", "automatic", "semi_automatic"],
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Transmission type is required" : null,
  },
  {
    name: "serviceHistory",
    label: "serviceHistory",
    type: "select",
    options: ["full", "partial", "none"],
    section: "essential",
    required: true,
    validate: (value: string) =>
      !value ? "Service history is required" : null,
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
    type: "multiselect",
    options: ["recliningSeats", "footRests", "armRests", "trayTables", "readingLights", "curtains", "toilets", "waterDispenser"],
    section: "advanced",
    required: false,
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
    label: "listings.accessibilityFeatures",
    type: "multiselect",
    options: ["lowFloor", "kneeling", "audioAnnouncements", "brailleSignage", "prioritySeating", "handrails"],
    section: "advanced",
    required: false,
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
    label: "listings.safetyFeatures",
    type: "multiselect",
    options: ["abs", "laneAssist", "collisionWarning", "fireExtinguisher", "firstAidKit", "emergencyHammer", "speedLimiter", "tirePressureMonitoring", "reverseCamera", "blindSpotDetection"],
    section: "advanced",
    required: false,
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
    options: ["tv", "dvdPlayer", "audioSystem", "wifi", "usbCharging", "wirelessCharging", "bluetooth"],
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
