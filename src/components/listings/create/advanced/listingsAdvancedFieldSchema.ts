// src/components/listings/create/advanced/listingsAdvancedFieldSchema.ts
import { ListingFieldSchema } from "@/types/listings";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
} from "@/types/enums";

export const listingsAdvancedFieldSchema: Record<string, ListingFieldSchema[]> =
  {
    cars: [
      // Essential Section
      {
        name: "color",
        label: "listings.exteriorColor",
        type: "colorpicker",
        section: "essential",
        required: true,
        validate: (value: string) => !value ? "Exterior color is required" : null,
      },
      {
        name: "interiorColor",
        label: "listings.interiorColor",
        type: "colorpicker",
        section: "essential",
        required: true,
        validate: (value: string) => !value ? "Interior color is required" : null,
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
          "salvage"
        ],
        section: "essential",
        required: true,
        validate: (value: string) => !value ? "Condition is required" : null,
      },
      {
        name: "warranty",
        label: "listings.warranty",
        type: "number",
        section: "essential",
        required: true,
        validate: (value: number) => {
          if (value === undefined || value === null) return "Warranty months is required";
          if (value < 0) return "Warranty months must be 0 or greater";
          return null;
        },
      },
      {
        name: "serviceHistory",
        label: "listings.serviceHistory",
        type: "select",
        options: [
          "full",
          "partial",
          "none"
        ],
        section: "essential",
        required: true,
        validate: (value: string) => !value ? "Service history is required" : null,
      },
      {
        name: "previousOwners",
        label: "listings.previousOwners",
        type: "number",
        section: "essential",
        required: true,
        validate: (value: number) => {
          if (value === undefined || value === null) return "Number of previous owners is required";
          if (value < 0) return "Number of previous owners must be 0 or greater";
          return null;
        },
      },
      {
        name: "registrationStatus",
        label: "listings.registrationStatus",
        type: "select",
        options: ["registered", "unregistered", "expired"],
        section: "essential",
        required: true,
        validate: (value: string) => !value ? "Registration status is required" : null,
      },
      {
        name: "transmissionType",
        label: "listings.transmission",
        type: "select",
        options: ["automatic", "manual", "semiAutomatic", "continuouslyVariable", "dualClutch"],
        section: "essential",
        required: true,
        validate: (value: string) => !value ? "Transmission type is required" : null,
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

      // Performance Section
      {
        name: "engine",
        label: "listings.engine",
        type: "text",
        section: "performance",
        required: false,
      },
      {
        name: "horsepower",
        label: "performance.horsepower",
        type: "number",
        section: "performance",
        required: false,
      },
      {
        name: "torque",
        label: "performance.torque",
        type: "number",
        section: "performance",
      },
      {
        name: "drivetrain",
        label: "performance.drivetrain",
        type: "select",
        options: ["FWD", "RWD", "AWD", "4WD"],
        section: "performance",
      },
      {
        name: "fuelEfficiency",
        label: "performance.fuelEfficiency",
        type: "number",
        section: "performance",
      },
      {
        name: "engineConfiguration",
        label: "performance.engineConfiguration",
        type: "select",
        options: ["inline", "v_type", "flat", "rotary"],
        section: "performance",
      },
      {
        name: "turbocharger",
        label: "performance.turbocharger",
        type: "checkbox",
        section: "performance",
      },
      {
        name: "supercharger",
        label: "performance.supercharger",
        type: "checkbox",
        section: "performance",
      },
      {
        name: "tires",
        label: "performance.tires",
        type: "select",
        options: ["summer", "winter", "all_season", "performance", "run_flat"],
        section: "performance",
      },
      {
        name: "brakeType",
        label: "performance.brakeSystem",
        type: "select",
        options: [
          "disc_all",
          "disc_front_drum_rear",
          "drum_all",
          "carbon_ceramic",
        ],
        section: "performance",
      },

      // Comfort Section
      {
        name: "airConditioning",
        label: "comfort.climateControl",
        type: "select",
        options: [
          "manual",
          "automatic_single_zone",
          "automatic_dual_zone",
          "automatic_tri_zone",
          "none",
        ],
        section: "comfort",
      },
      {
        name: "seatingMaterial",
        label: "Seat Material",
        type: "select",
        options: [
          "cloth",
          "leather",
          "leatherette",
          "alcantara",
          "premium_leather",
        ],
        section: "comfort",
      },
      {
        name: "seatHeating",
        label: "Seat Heating",
        type: "select",
        options: ["front", "front_rear", "none"],
        section: "comfort",
      },
      {
        name: "seatVentilation",
        label: "Seat Ventilation",
        type: "select",
        options: ["front", "front_rear", "none"],
        section: "comfort",
      },
      {
        name: "seatMemory",
        label: "Seat Memory",
        type: "checkbox",
        section: "comfort",
      },
      {
        name: "steeringAdjustment",
        label: "Steering Adjustment",
        type: "select",
        options: [
          "manual_tilt",
          "manual_tilt_telescopic",
          "power_tilt_telescopic",
        ],
        section: "comfort",
      },
      {
        name: "cruiseControl",
        label: "Cruise Control",
        type: "select",
        options: ["standard", "adaptive", "none"],
        section: "comfort",
      },
      {
        name: "keylessEntry",
        label: "Keyless Entry",
        type: "checkbox",
        section: "comfort",
      },
      {
        name: "pushStart",
        label: "Push Button Start",
        type: "checkbox",
        section: "comfort",
      },
      {
        name: "sunroof",
        label: "Sunroof Type",
        type: "select",
        options: ["none", "standard", "panoramic", "dual_panel"],
        section: "comfort",
      },
      {
        name: "audioSystem",
        label: "Audio System",
        type: "select",
        options: ["standard", "premium", "branded_premium", "surround"],
        section: "comfort",
      },
      {
        name: "navigation",
        label: "Navigation System",
        type: "select",
        options: ["built_in", "smartphone", "none"],
        section: "comfort",
      },
      {
        name: "connectivity",
        label: "Connectivity",
        type: "select",
        options: ["bluetooth", "apple_carplay", "android_auto", "all"],
        section: "comfort",
      },

      // Safety Section
      {
        name: "airbags",
        label: "Airbag System",
        type: "select",
        options: ["front_only", "front_side", "full_system"],
        section: "safety",
        required: false,
      },
      { name: "abs", label: "ABS", type: "checkbox", section: "safety" },
      {
        name: "stabilityControl",
        label: "Stability Control",
        type: "checkbox",
        section: "safety",
      },
      {
        name: "tractionControl",
        label: "Traction Control",
        type: "checkbox",
        section: "safety",
      },
      {
        name: "backupCamera",
        label: "Backup Camera",
        type: "select",
        options: ["standard", "360_view", "none"],
        section: "safety",
      },
      {
        name: "parkingSensors",
        label: "Parking Sensors",
        type: "select",
        options: ["front", "rear", "both", "none"],
        section: "safety",
      },
      {
        name: "blindSpot",
        label: "Blind Spot Monitor",
        type: "checkbox",
        section: "safety",
      },
      {
        name: "laneDeparture",
        label: "Lane Departure Warning",
        type: "checkbox",
        section: "safety",
      },
      {
        name: "forwardCollision",
        label: "Forward Collision Warning",
        type: "checkbox",
        section: "safety",
      },
      {
        name: "nightVision",
        label: "Night Vision",
        type: "checkbox",
        section: "safety",
      },
      {
        name: "tirePressure",
        label: "Tire Pressure Monitoring",
        type: "checkbox",
        section: "safety",
      },
    ],

    realEstate: [
      // Essential Section
      {
        name: "propertyType",
        label: "listings.propertyType",
        type: "select",
        options: ["house", "apartment", "condo", "land", "commercial", "other"],
        section: "essential",
        required: true,
        validate: (value: string) => !value ? "Property type is required" : null,
      },
      {
        name: "size",
        label: "listings.size",
        type: "number",
        section: "essential",
        required: true,
        validate: (value: number) => {
          if (value === undefined || value === null) return "Size is required";
          if (value <= 0) return "Size must be greater than 0";
          return null;
        },
      },
      {
        name: "yearBuilt",
        label: "listings.yearBuilt",
        type: "number",
        section: "essential",
        required: false,
        validate: (value: number) => {
          if (value && value > new Date().getFullYear()) {
            return "Year built cannot be in the future";
          }
          return null;
        },
      },
      {
        name: "bedrooms",
        label: "listings.bedrooms",
        type: "number",
        section: "essential",
        required: true,
        validate: (value: number) => {
          if (value === undefined || value === null) return "Number of bedrooms is required";
          if (value < 0) return "Number of bedrooms cannot be negative";
          return null;
        },
      },
      {
        name: "bathrooms",
        label: "listings.bathrooms",
        type: "number",
        section: "essential",
        required: true,
        validate: (value: number) => {
          if (value === undefined || value === null) return "Number of bathrooms is required";
          if (value < 0) return "Number of bathrooms cannot be negative";
          return null;
        },
      },
      {
        name: "condition",
        label: "listings.condition",
        type: "select",
        options: ["new", "likeNew", "excellent", "good", "fair", "poor"],
        section: "essential",
        required: true,
        validate: (value: string) => !value ? "Condition is required" : null,
      },
      {
        name: "lotSize",
        label: "Lot Size (m²)",
        type: "number",
        section: "essential",
      },
      {
        name: "halfBathrooms",
        label: "Half Bathrooms",
        type: "number",
        section: "essential",
      },
      {
        name: "stories",
        label: "Number of Stories",
        type: "number",
        section: "essential",
      },
      {
        name: "basement",
        label: "Basement Type",
        type: "select",
        options: [
          "none",
          "unfinished",
          "finished",
          "partially_finished",
          "walkout",
        ],
        section: "essential",
      },
      {
        name: "garage",
        label: "Garage Type",
        type: "select",
        options: ["none", "attached", "detached", "carport", "underground"],
        section: "essential",
      },
      {
        name: "parkingSpaces",
        label: "Parking Spaces",
        type: "number",
        section: "essential",
      },

      // Features Section
      {
        name: "kitchenType",
        label: "Kitchen Type",
        type: "select",
        options: ["standard", "gourmet", "eat_in", "open_concept", "galley"],
        section: "features",
      },
      {
        name: "kitchenAppliances",
        label: "Kitchen Appliances",
        type: "select",
        options: ["standard", "stainless_steel", "premium", "luxury"],
        section: "features",
      },
      {
        name: "flooring",
        label: "Flooring Type",
        type: "select",
        options: ["hardwood", "tile", "carpet", "laminate", "mixed"],
        section: "features",
      },
      {
        name: "heating",
        label: "Heating System",
        type: "select",
        options: [
          "forced_air",
          "radiant",
          "heat_pump",
          "baseboard",
          "geothermal",
        ],
        section: "features",
      },
      {
        name: "cooling",
        label: "Cooling System",
        type: "select",
        options: ["central_air", "ductless", "window_units", "none"],
        section: "features",
      },
      {
        name: "waterHeater",
        label: "Water Heater",
        type: "select",
        options: ["standard", "tankless", "solar", "hybrid"],
        section: "features",
      },
      {
        name: "fireplace",
        label: "Fireplace",
        type: "select",
        options: ["none", "gas", "wood", "electric", "multiple"],
        section: "features",
      },
      {
        name: "laundry",
        label: "Laundry Location",
        type: "select",
        options: [
          "basement",
          "main_floor",
          "upper_floor",
          "in_unit",
          "hookups_only",
        ],
        section: "features",
      },
      {
        name: "windows",
        label: "Window Type",
        type: "select",
        options: ["standard", "double_pane", "triple_pane", "low_e"],
        section: "features",
      },
      {
        name: "renovated",
        label: "Last Renovated",
        type: "select",
        options: [
          "never",
          "0_5_years",
          "5_10_years",
          "10_20_years",
          "20_plus_years",
        ],
        section: "features",
      },

      // Outdoor Section
      {
        name: "lotFeatures",
        label: "Lot Features",
        type: "select",
        options: [
          "flat",
          "sloped",
          "wooded",
          "waterfront",
          "corner",
          "cul_de_sac",
        ],
        section: "outdoor",
      },
      {
        name: "landscape",
        label: "Landscaping",
        type: "select",
        options: ["minimal", "basic", "professional", "extensive"],
        section: "outdoor",
      },
      {
        name: "patio",
        label: "Patio/Deck",
        type: "select",
        options: ["none", "patio", "deck", "both"],
        section: "outdoor",
      },
      {
        name: "pool",
        label: "Pool",
        type: "select",
        options: ["none", "inground", "above_ground", "indoor"],
        section: "outdoor",
      },
      {
        name: "spa",
        label: "Spa/Hot Tub",
        type: "checkbox",
        section: "outdoor",
      },
      {
        name: "fencing",
        label: "Fencing",
        type: "select",
        options: ["none", "partial", "full", "privacy"],
        section: "outdoor",
      },
      {
        name: "outdoorKitchen",
        label: "Outdoor Kitchen",
        type: "checkbox",
        section: "outdoor",
      },
      {
        name: "sprinklerSystem",
        label: "Sprinkler System",
        type: "checkbox",
        section: "outdoor",
      },

      // Security Section
      {
        name: "securitySystem",
        label: "Security System",
        type: "select",
        options: ["none", "basic", "monitored", "smart"],
        section: "security",
      },
      {
        name: "smartHome",
        label: "Smart Home Features",
        type: "select",
        options: ["none", "basic", "comprehensive", "fully_automated"],
        section: "security",
      },
      {
        name: "doorLocks",
        label: "Door Locks",
        type: "select",
        options: ["standard", "smart", "biometric"],
        section: "security",
      },
      {
        name: "cameras",
        label: "Security Cameras",
        type: "select",
        options: ["none", "doorbell", "exterior", "full_coverage"],
        section: "security",
      },
      {
        name: "gatedCommunity",
        label: "Gated Community",
        type: "checkbox",
        section: "security",
      },
      {
        name: "intercomSystem",
        label: "Intercom System",
        type: "checkbox",
        section: "security",
      },
    ],
  };
