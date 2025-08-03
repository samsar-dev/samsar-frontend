import type { ListingFieldSchema } from "@/types/listings";

export const houseSchema: ListingFieldSchema[] = [
  // Essential Section
  {
    name: "condition",
    label: "fields.condition",
    type: "select",
    options: [
      { value: "new", label: "NEW", translationKey: "enums.condition.NEW" },
      {
        value: "excellent",
        label: "EXCELLENT",
        translationKey: "enums.condition.EXCELLENT",
      },
      { value: "good", label: "GOOD", translationKey: "enums.condition.GOOD" },
      { value: "fair", label: "FAIR", translationKey: "enums.condition.FAIR" },
      {
        value: "needsWork",
        label: "NEEDS_WORK",
        translationKey: "enums.condition.NEEDS_WORK",
      },
    ],
    section: "essential",
    required: true,
  },
  {
    name: "livingArea",
    label: "fields.livingArea",
    type: "number",
    section: "essential",
    required: true,
  },
  {
    name: "halfBathrooms",
    label: "fields.halfBathrooms",
    type: "number",
    section: "essential",
    required: false,
  },
  {
    name: "stories",
    label: "fields.stories",
    type: "number",
    section: "essential",
    required: true,
  },
  {
    name: "parking",
    label: "fields.parking",
    type: "select",
    options: [
      {
        value: "attachedGarage",
        label: "ATTACHED_GARAGE",
        translationKey: "enums.parking.ATTACHED_GARAGE",
      },
      {
        value: "detachedGarage",
        label: "DETACHED_GARAGE",
        translationKey: "enums.parking.DETACHED_GARAGE",
      },
      {
        value: "carport",
        label: "CARPORT",
        translationKey: "enums.parking.CARPORT",
      },
      {
        value: "street",
        label: "STREET",
        translationKey: "enums.parking.STREET",
      },
      { value: "none", label: "NONE", translationKey: "enums.parking.NONE" },
    ],
    section: "essential",
    required: true,
  },
  {
    name: "parkingSpaces",
    label: "fields.parkingSpaces",
    type: "number",
    section: "essential",
    required: true,
  },
  {
    name: "constructionType",
    label: "fields.constructionType",
    type: "select",
    options: [
      {
        value: "brick",
        label: "BRICK",
        translationKey: "enums.constructionType.BRICK",
      },
      {
        value: "wood",
        label: "WOOD",
        translationKey: "enums.constructionType.WOOD",
      },
      {
        value: "concrete",
        label: "CONCRETE",
        translationKey: "enums.constructionType.CONCRETE",
      },
      {
        value: "steelFrame",
        label: "STEEL_FRAME",
        translationKey: "enums.constructionType.STEEL_FRAME",
      },
      {
        value: "stonework",
        label: "STONEWORK",
        translationKey: "enums.constructionType.STONEWORK",
      },
      {
        value: "stucco",
        label: "STUCCO",
        translationKey: "enums.constructionType.STUCCO",
      },
      {
        value: "vinyl",
        label: "VINYL",
        translationKey: "enums.constructionType.VINYL",
      },
      {
        value: "other",
        label: "OTHER",
        translationKey: "enums.constructionType.OTHER",
      },
    ],
    section: "essential",
    required: true,
  },

  // Advanced Section
  // HVAC & Energy
  {
    name: "heating",
    label: "fields.heating",
    type: "multiselect",
    options: [
      {
        value: "central",
        label: "CENTRAL",
        translationKey: "enums.heating.CENTRAL",
      },
      {
        value: "forcedAir",
        label: "FORCED_AIR",
        translationKey: "enums.heating.FORCED_AIR",
      },
      {
        value: "radiant",
        label: "RADIANT",
        translationKey: "enums.heating.RADIANT",
      },
      {
        value: "heatPump",
        label: "HEAT_PUMP",
        translationKey: "enums.heating.HEAT_PUMP",
      },
      {
        value: "baseboard",
        label: "BASEBOARD",
        translationKey: "enums.heating.BASEBOARD",
      },
      {
        value: "geothermal",
        label: "GEOTHERMAL",
        translationKey: "enums.heating.GEOTHERMAL",
      },
      {
        value: "woodStove",
        label: "WOOD_STOVE",
        translationKey: "enums.heating.WOOD_STOVE",
      },
      {
        value: "pelletStove",
        label: "PELLET_STOVE",
        translationKey: "enums.heating.PELLET_STOVE",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "cooling",
    label: "fields.cooling",
    type: "multiselect",
    options: [
      {
        value: "central",
        label: "CENTRAL",
        translationKey: "enums.cooling.CENTRAL",
      },
      {
        value: "window",
        label: "WINDOW",
        translationKey: "enums.cooling.WINDOW",
      },
      { value: "split", label: "SPLIT", translationKey: "enums.cooling.SPLIT" },
      {
        value: "evaporative",
        label: "EVAPORATIVE",
        translationKey: "enums.cooling.EVAPORATIVE",
      },
      {
        value: "geothermal",
        label: "GEOTHERMAL",
        translationKey: "enums.cooling.GEOTHERMAL",
      },
      { value: "none", label: "NONE", translationKey: "enums.cooling.NONE" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "energyFeatures",
    label: "fields.energyFeatures",
    type: "multiselect",
    options: [
      {
        value: "solarPanels",
        label: "SOLAR_PANELS",
        translationKey: "enums.energyFeatures.SOLAR_PANELS",
      },
      {
        value: "solarWaterHeater",
        label: "SOLAR_WATER_HEATER",
        translationKey: "enums.energyFeatures.SOLAR_WATER_HEATER",
      },
      {
        value: "doubleGlazedWindows",
        label: "DOUBLE_GLAZED_WINDOWS",
        translationKey: "enums.energyFeatures.DOUBLE_GLAZED_WINDOWS",
      },
      {
        value: "tripleGlazedWindows",
        label: "TRIPLE_GLAZED_WINDOWS",
        translationKey: "enums.energyFeatures.TRIPLE_GLAZED_WINDOWS",
      },
      {
        value: "tanklessWaterHeater",
        label: "TANKLESS_WATER_HEATER",
        translationKey: "enums.energyFeatures.TANKLESS_WATER_HEATER",
      },
      {
        value: "smartThermostat",
        label: "SMART_THERMOSTAT",
        translationKey: "enums.energyFeatures.SMART_THERMOSTAT",
      },
      {
        value: "energyMonitoring",
        label: "ENERGY_MONITORING",
        translationKey: "enums.energyFeatures.ENERGY_MONITORING",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "energyRating",
    label: "fields.energyRating",
    type: "select",
    options: [
      {
        value: "A+",
        label: "A_PLUS",
        translationKey: "enums.energyRating.A_PLUS",
      },
      { value: "A", label: "A", translationKey: "enums.energyRating.A" },
      { value: "B", label: "B", translationKey: "enums.energyRating.B" },
      { value: "C", label: "C", translationKey: "enums.energyRating.C" },
      { value: "D", label: "D", translationKey: "enums.energyRating.D" },
      { value: "E", label: "E", translationKey: "enums.energyRating.E" },
      { value: "F", label: "F", translationKey: "enums.energyRating.F" },
      { value: "G", label: "G", translationKey: "enums.energyRating.G" },
      {
        value: "unknown",
        label: "UNKNOWN",
        translationKey: "enums.energyRating.UNKNOWN",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Interior Features
  {
    name: "basement",
    label: "fields.basement",
    type: "select",
    options: [
      {
        value: "finished",
        label: "FINISHED",
        translationKey: "enums.basement.FINISHED",
      },
      {
        value: "unfinished",
        label: "UNFINISHED",
        translationKey: "enums.basement.UNFINISHED",
      },
      {
        value: "partial",
        label: "PARTIAL",
        translationKey: "enums.basement.PARTIAL",
      },
      {
        value: "walkout",
        label: "WALKOUT",
        translationKey: "enums.basement.WALKOUT",
      },
      { value: "none", label: "NONE", translationKey: "enums.basement.NONE" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "basementFeatures",
    label: "fields.basementFeatures",
    type: "multiselect",
    options: [
      "bathroom",
      "kitchen",
      "bedroom",
      "separateEntrance",
      "wetBar",
      "workshop",
      "storage",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "attic",
    label: "fields.attic",
    type: "select",
    options: [
      {
        value: "finished",
        label: "FINISHED",
        translationKey: "enums.attic.FINISHED",
      },
      {
        value: "unfinished",
        label: "UNFINISHED",
        translationKey: "enums.attic.UNFINISHED",
      },
      { value: "none", label: "NONE", translationKey: "enums.attic.NONE" },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "flooringTypes",
    label: "fields.flooringTypes",
    type: "multiselect",
    options: [
      {
        value: "hardwood",
        label: "HARDWOOD",
        translationKey: "enums.flooringType.HARDWOOD",
      },
      {
        value: "engineeredWood",
        label: "ENGINEERED_WOOD",
        translationKey: "enums.flooringType.ENGINEERED_WOOD",
      },
      {
        value: "laminate",
        label: "LAMINATE",
        translationKey: "enums.flooringType.LAMINATE",
      },
      {
        value: "tile",
        label: "TILE",
        translationKey: "enums.flooringType.TILE",
      },
      {
        value: "carpet",
        label: "CARPET",
        translationKey: "enums.flooringType.CARPET",
      },
      {
        value: "vinyl",
        label: "VINYL",
        translationKey: "enums.flooringType.VINYL",
      },
      {
        value: "stone",
        label: "STONE",
        translationKey: "enums.flooringType.STONE",
      },
      {
        value: "concrete",
        label: "CONCRETE",
        translationKey: "enums.flooringType.CONCRETE",
      },
      {
        value: "bamboo",
        label: "BAMBOO",
        translationKey: "enums.flooringType.BAMBOO",
      },
      {
        value: "cork",
        label: "CORK",
        translationKey: "enums.flooringType.CORK",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "windowFeatures",
    label: "fields.windowFeatures",
    type: "multiselect",
    options: [
      {
        value: "bayWindow",
        label: "BAY_WINDOW",
        translationKey: "enums.windowFeatures.BAY_WINDOW",
      },
      {
        value: "skylights",
        label: "SKYLIGHTS",
        translationKey: "enums.windowFeatures.SKYLIGHTS",
      },
      {
        value: "gardenWindow",
        label: "GARDEN_WINDOW",
        translationKey: "enums.windowFeatures.GARDEN_WINDOW",
      },
      {
        value: "doublePane",
        label: "DOUBLE_PANE",
        translationKey: "enums.windowFeatures.DOUBLE_PANE",
      },
      {
        value: "triplePane",
        label: "TRIPLE_PANE",
        translationKey: "enums.windowFeatures.TRIPLE_PANE",
      },
      {
        value: "lowE",
        label: "LOW_E",
        translationKey: "enums.windowFeatures.LOW_E",
      },
      {
        value: "tinted",
        label: "TINTED",
        translationKey: "enums.windowFeatures.TINTED",
      },
      {
        value: "soundproof",
        label: "SOUNDPROOF",
        translationKey: "enums.windowFeatures.SOUNDPROOF",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "kitchenFeatures",
    label: "fields.kitchenFeatures",
    type: "multiselect",
    options: [
      {
        value: "island",
        label: "ISLAND",
        translationKey: "enums.kitchenFeatures.ISLAND",
      },
      {
        value: "pantry",
        label: "PANTRY",
        translationKey: "enums.kitchenFeatures.PANTRY",
      },
      {
        value: "graniteCabinetry",
        label: "GRANITE_CABINETRY",
        translationKey: "enums.kitchenFeatures.GRANITE_CABINETRY",
      },
      {
        value: "stainlessAppliances",
        label: "STAINLESS_APPLIANCES",
        translationKey: "enums.kitchenFeatures.STAINLESS_APPLIANCES",
      },
      {
        value: "gasStove",
        label: "GAS_STOVE",
        translationKey: "enums.kitchenFeatures.GAS_STOVE",
      },
      {
        value: "doubleOven",
        label: "DOUBLE_OVEN",
        translationKey: "enums.kitchenFeatures.DOUBLE_OVEN",
      },
      {
        value: "wineStorage",
        label: "WINE_STORAGE",
        translationKey: "enums.kitchenFeatures.WINE_STORAGE",
      },
      {
        value: "butlerPantry",
        label: "BUTLER_PANTRY",
        translationKey: "enums.kitchenFeatures.BUTLER_PANTRY",
      },
      {
        value: "breakfastNook",
        label: "BREAKFAST_NOOK",
        translationKey: "enums.kitchenFeatures.BREAKFAST_NOOK",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "bathroomFeatures",
    label: "fields.bathroomFeatures",
    type: "multiselect",
    options: [
      {
        value: "dualVanities",
        label: "DUAL_VANITIES",
        translationKey: "enums.bathroomFeatures.DUAL_VANITIES",
      },
      {
        value: "separateShower",
        label: "SEPARATE_SHOWER",
        translationKey: "enums.bathroomFeatures.SEPARATE_SHOWER",
      },
      {
        value: "soakingTub",
        label: "SOAKING_TUB",
        translationKey: "enums.bathroomFeatures.SOAKING_TUB",
      },
      {
        value: "jetTub",
        label: "JET_TUB",
        translationKey: "enums.bathroomFeatures.JET_TUB",
      },
      {
        value: "steamShower",
        label: "STEAM_SHOWER",
        translationKey: "enums.bathroomFeatures.STEAM_SHOWER",
      },
      {
        value: "bidet",
        label: "BIDET",
        translationKey: "enums.bathroomFeatures.BIDET",
      },
      {
        value: "heatedFloors",
        label: "HEATED_FLOORS",
        translationKey: "enums.bathroomFeatures.HEATED_FLOORS",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Exterior & Structure
  {
    name: "roofType",
    label: "fields.roofType",
    type: "select",
    options: [
      {
        value: "asphaltShingle",
        label: "ASPHALT_SHINGLE",
        translationKey: "enums.roofType.ASPHALT_SHINGLE",
      },
      {
        value: "metalRoof",
        label: "METAL_ROOF",
        translationKey: "enums.roofType.METAL_ROOF",
      },
      {
        value: "tileClay",
        label: "TILE_CLAY",
        translationKey: "enums.roofType.TILE_CLAY",
      },
      {
        value: "slate",
        label: "SLATE",
        translationKey: "enums.roofType.SLATE",
      },
      { value: "flat", label: "FLAT", translationKey: "enums.roofType.FLAT" },
      {
        value: "greenRoof",
        label: "GREEN_ROOF",
        translationKey: "enums.roofType.GREEN_ROOF",
      },
      {
        value: "solar",
        label: "SOLAR",
        translationKey: "enums.roofType.SOLAR",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "roofAge",
    label: "fields.roofAge",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "foundation",
    label: "fields.foundation",
    type: "select",
    options: [
      {
        value: "concrete",
        label: "CONCRETE",
        translationKey: "enums.foundation.CONCRETE",
      },
      {
        value: "crawlSpace",
        label: "CRAWL_SPACE",
        translationKey: "enums.foundation.CRAWL_SPACE",
      },
      { value: "slab", label: "SLAB", translationKey: "enums.foundation.SLAB" },
      { value: "pier", label: "PIER", translationKey: "enums.foundation.PIER" },
      {
        value: "stone",
        label: "STONE",
        translationKey: "enums.foundation.STONE",
      },
      {
        value: "other",
        label: "OTHER",
        translationKey: "enums.foundation.OTHER",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "exteriorFeatures",
    label: "fields.exteriorFeatures",
    type: "multiselect",
    options: [
      {
        value: "porch",
        label: "PORCH",
        translationKey: "enums.exteriorFeatures.PORCH",
      },
      {
        value: "coveredPatio",
        label: "COVERED_PATIO",
        translationKey: "enums.exteriorFeatures.COVERED_PATIO",
      },
      {
        value: "deck",
        label: "DECK",
        translationKey: "enums.exteriorFeatures.DECK",
      },
      {
        value: "balcony",
        label: "BALCONY",
        translationKey: "enums.exteriorFeatures.BALCONY",
      },
      {
        value: "fence",
        label: "FENCE",
        translationKey: "enums.exteriorFeatures.FENCE",
      },
      {
        value: "securityGates",
        label: "SECURITY_GATES",
        translationKey: "enums.exteriorFeatures.SECURITY_GATES",
      },
      {
        value: "outdoorKitchen",
        label: "OUTDOOR_KITCHEN",
        translationKey: "enums.exteriorFeatures.OUTDOOR_KITCHEN",
      },
      {
        value: "firepit",
        label: "FIREPIT",
        translationKey: "enums.exteriorFeatures.FIREPIT",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "outdoorFeatures",
    label: "fields.outdoorFeatures",
    type: "multiselect",
    options: [
      {
        value: "pool",
        label: "POOL",
        translationKey: "enums.outdoorFeatures.POOL",
      },
      {
        value: "spa",
        label: "SPA",
        translationKey: "enums.outdoorFeatures.SPA",
      },
      {
        value: "tennis",
        label: "TENNIS",
        translationKey: "enums.outdoorFeatures.TENNIS",
      },
      {
        value: "garden",
        label: "GARDEN",
        translationKey: "enums.outdoorFeatures.GARDEN",
      },
      {
        value: "sprinklers",
        label: "SPRINKLERS",
        translationKey: "enums.outdoorFeatures.SPRINKLERS",
      },
      {
        value: "pond",
        label: "POND",
        translationKey: "enums.outdoorFeatures.POND",
      },
      {
        value: "greenhouse",
        label: "GREENHOUSE",
        translationKey: "enums.outdoorFeatures.GREENHOUSE",
      },
      {
        value: "rvParking",
        label: "RV_PARKING",
        translationKey: "enums.outdoorFeatures.RV_PARKING",
      },
      {
        value: "workshop",
        label: "WORKSHOP",
        translationKey: "enums.outdoorFeatures.WORKSHOP",
      },
      {
        value: "barn",
        label: "BARN",
        translationKey: "enums.outdoorFeatures.BARN",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "landscaping",
    label: "fields.landscaping",
    type: "multiselect",
    options: [
      {
        value: "professional",
        label: "PROFESSIONAL",
        translationKey: "enums.landscaping.PROFESSIONAL",
      },
      {
        value: "matureTrees",
        label: "MATURE_TREES",
        translationKey: "enums.landscaping.MATURE_TREES",
      },
      {
        value: "fruitTrees",
        label: "FRUIT_TREES",
        translationKey: "enums.landscaping.FRUIT_TREES",
      },
      {
        value: "gardenBeds",
        label: "GARDEN_BEDS",
        translationKey: "enums.landscaping.GARDEN_BEDS",
      },
      {
        value: "lowMaintenance",
        label: "LOW_MAINTENANCE",
        translationKey: "enums.landscaping.LOW_MAINTENANCE",
      },
      {
        value: "xeriscaping",
        label: "XERISCAPING",
        translationKey: "enums.landscaping.XERISCAPING",
      },
      {
        value: "irrigation",
        label: "IRRIGATION",
        translationKey: "enums.landscaping.IRRIGATION",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Systems & Utilities
  {
    name: "waterSystem",
    label: "fields.waterSystem",
    type: "select",
    options: [
      {
        value: "municipal",
        label: "MUNICIPAL",
        translationKey: "enums.waterSystem.MUNICIPAL",
      },
      {
        value: "well",
        label: "WELL",
        translationKey: "enums.waterSystem.WELL",
      },
      {
        value: "sharedWell",
        label: "SHARED_WELL",
        translationKey: "enums.waterSystem.SHARED_WELL",
      },
      {
        value: "cistern",
        label: "CISTERN",
        translationKey: "enums.waterSystem.CISTERN",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "sewerSystem",
    label: "fields.sewerSystem",
    type: "select",
    options: [
      {
        value: "municipal",
        label: "MUNICIPAL",
        translationKey: "enums.sewerSystem.MUNICIPAL",
      },
      {
        value: "septic",
        label: "SEPTIC",
        translationKey: "enums.sewerSystem.SEPTIC",
      },
      {
        value: "other",
        label: "OTHER",
        translationKey: "enums.sewerSystem.OTHER",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "utilities",
    label: "fields.utilities",
    type: "multiselect",
    options: [
      {
        value: "electricity",
        label: "ELECTRICITY",
        translationKey: "enums.utilities.ELECTRICITY",
      },
      {
        value: "naturalGas",
        label: "NATURAL_GAS",
        translationKey: "enums.utilities.NATURAL_GAS",
      },
      {
        value: "propane",
        label: "PROPANE",
        translationKey: "enums.utilities.PROPANE",
      },
      {
        value: "fiberInternet",
        label: "FIBER_INTERNET",
        translationKey: "enums.utilities.FIBER_INTERNET",
      },
      {
        value: "cable",
        label: "CABLE",
        translationKey: "enums.utilities.CABLE",
      },
      {
        value: "phone",
        label: "PHONE",
        translationKey: "enums.utilities.PHONE",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Smart Home & Security
  {
    name: "smartHomeFeatures",
    label: "fields.smartHomeFeatures",
    type: "multiselect",
    options: [
      {
        value: "thermostat",
        label: "THERMOSTAT",
        translationKey: "enums.smartHomeFeatures.THERMOSTAT",
      },
      {
        value: "lighting",
        label: "LIGHTING",
        translationKey: "enums.smartHomeFeatures.LIGHTING",
      },
      {
        value: "security",
        label: "SECURITY",
        translationKey: "enums.smartHomeFeatures.SECURITY",
      },
      {
        value: "doorbell",
        label: "DOORBELL",
        translationKey: "enums.smartHomeFeatures.DOORBELL",
      },
      {
        value: "locks",
        label: "LOCKS",
        translationKey: "enums.smartHomeFeatures.LOCKS",
      },
      {
        value: "irrigation",
        label: "IRRIGATION",
        translationKey: "enums.smartHomeFeatures.IRRIGATION",
      },
      {
        value: "entertainment",
        label: "ENTERTAINMENT",
        translationKey: "enums.smartHomeFeatures.ENTERTAINMENT",
      },
      {
        value: "voiceControl",
        label: "VOICE_CONTROL",
        translationKey: "enums.smartHomeFeatures.VOICE_CONTROL",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "securityFeatures",
    label: "fields.securityFeatures",
    type: "multiselect",
    options: [
      {
        value: "alarm",
        label: "ALARM",
        translationKey: "enums.securityFeatures.ALARM",
      },
      {
        value: "cameras",
        label: "CAMERAS",
        translationKey: "enums.securityFeatures.CAMERAS",
      },
      {
        value: "gatedCommunity",
        label: "GATED_COMMUNITY",
        translationKey: "enums.securityFeatures.GATED_COMMUNITY",
      },
      {
        value: "securityService",
        label: "SECURITY_SERVICE",
        translationKey: "enums.securityFeatures.SECURITY_SERVICE",
      },
      {
        value: "smartLocks",
        label: "SMART_LOCKS",
        translationKey: "enums.securityFeatures.SMART_LOCKS",
      },
      {
        value: "intercom",
        label: "INTERCOM",
        translationKey: "enums.securityFeatures.INTERCOM",
      },
      {
        value: "safeRoom",
        label: "SAFE_ROOM",
        translationKey: "enums.securityFeatures.SAFE_ROOM",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Community & HOA
  {
    name: "communityFeatures",
    label: "fields.communityFeatures",
    type: "multiselect",
    options: [
      {
        value: "pool",
        label: "POOL",
        translationKey: "enums.communityFeatures.POOL",
      },
      {
        value: "clubhouse",
        label: "CLUBHOUSE",
        translationKey: "enums.communityFeatures.CLUBHOUSE",
      },
      {
        value: "gym",
        label: "GYM",
        translationKey: "enums.communityFeatures.GYM",
      },
      {
        value: "tennis",
        label: "TENNIS",
        translationKey: "enums.communityFeatures.TENNIS",
      },
      {
        value: "playground",
        label: "PLAYGROUND",
        translationKey: "enums.communityFeatures.PLAYGROUND",
      },
      {
        value: "park",
        label: "PARK",
        translationKey: "enums.communityFeatures.PARK",
      },
      {
        value: "lake",
        label: "LAKE",
        translationKey: "enums.communityFeatures.LAKE",
      },
      {
        value: "trails",
        label: "TRAILS",
        translationKey: "enums.communityFeatures.TRAILS",
      },
      {
        value: "golfCourse",
        label: "GOLF_COURSE",
        translationKey: "enums.communityFeatures.GOLF_COURSE",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "hoaFeatures",
    label: "fields.hoaFeatures",
    type: "multiselect",
    options: [
      {
        value: "landscaping",
        label: "LANDSCAPING",
        translationKey: "enums.hoaFeatures.LANDSCAPING",
      },
      {
        value: "snowRemoval",
        label: "SNOW_REMOVAL",
        translationKey: "enums.hoaFeatures.SNOW_REMOVAL",
      },
      {
        value: "trash",
        label: "TRASH",
        translationKey: "enums.hoaFeatures.TRASH",
      },
      {
        value: "security",
        label: "SECURITY",
        translationKey: "enums.hoaFeatures.SECURITY",
      },
      {
        value: "commonAreas",
        label: "COMMON_AREAS",
        translationKey: "enums.hoaFeatures.COMMON_AREAS",
      },
      {
        value: "insurance",
        label: "INSURANCE",
        translationKey: "enums.hoaFeatures.INSURANCE",
      },
    ],
    section: "advanced",
    required: false,
  },

  // Additional Features
  {
    name: "furnished",
    label: "fields.furnished",
    type: "select",
    options: [
      {
        value: "fully",
        label: "FULLY",
        translationKey: "enums.furnished.FULLY",
      },
      {
        value: "partially",
        label: "PARTIALLY",
        translationKey: "enums.furnished.PARTIALLY",
      },
      {
        value: "unfurnished",
        label: "UNFURNISHED",
        translationKey: "enums.furnished.UNFURNISHED",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "appliances",
    label: "fields.appliances",
    type: "multiselect",
    options: [
      {
        value: "refrigerator",
        label: "REFRIGERATOR",
        translationKey: "enums.appliances.REFRIGERATOR",
      },
      {
        value: "dishwasher",
        label: "DISHWASHER",
        translationKey: "enums.appliances.DISHWASHER",
      },
      { value: "oven", label: "OVEN", translationKey: "enums.appliances.OVEN" },
      {
        value: "microwave",
        label: "MICROWAVE",
        translationKey: "enums.appliances.MICROWAVE",
      },
      {
        value: "washer",
        label: "WASHER",
        translationKey: "enums.appliances.WASHER",
      },
      {
        value: "dryer",
        label: "DRYER",
        translationKey: "enums.appliances.DRYER",
      },
      {
        value: "waterHeater",
        label: "WATER_HEATER",
        translationKey: "enums.appliances.WATER_HEATER",
      },
      {
        value: "waterSoftener",
        label: "WATER_SOFTENER",
        translationKey: "enums.appliances.WATER_SOFTENER",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "petFeatures",
    label: "fields.petFeatures",
    type: "multiselect",
    options: [
      {
        value: "dogRun",
        label: "DOG_RUN",
        translationKey: "enums.petFeatures.DOG_RUN",
      },
      {
        value: "petDoor",
        label: "PET_DOOR",
        translationKey: "enums.petFeatures.PET_DOOR",
      },
      {
        value: "fencedYard",
        label: "FENCED_YARD",
        translationKey: "enums.petFeatures.FENCED_YARD",
      },
      {
        value: "catDoor",
        label: "CAT_DOOR",
        translationKey: "enums.petFeatures.CAT_DOOR",
      },
      {
        value: "petWashStation",
        label: "PET_WASH_STATION",
        translationKey: "enums.petFeatures.PET_WASH_STATION",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "accessibility",
    label: "fields.accessibility",
    type: "multiselect",
    options: [
      {
        value: "wheelchair",
        label: "WHEELCHAIR",
        translationKey: "enums.accessibility.WHEELCHAIR",
      },
      {
        value: "noSteps",
        label: "NO_STEPS",
        translationKey: "enums.accessibility.NO_STEPS",
      },
      {
        value: "wideHallways",
        label: "WIDE_HALLWAYS",
        translationKey: "enums.accessibility.WIDE_HALLWAYS",
      },
      {
        value: "elevator",
        label: "ELEVATOR",
        translationKey: "enums.accessibility.ELEVATOR",
      },
      {
        value: "stairLift",
        label: "STAIR_LIFT",
        translationKey: "enums.accessibility.STAIR_LIFT",
      },
      {
        value: "firstFloorBedroom",
        label: "FIRST_FLOOR_BEDROOM",
        translationKey: "enums.accessibility.FIRST_FLOOR_BEDROOM",
      },
      {
        value: "modifiedBathroom",
        label: "MODIFIED_BATHROOM",
        translationKey: "enums.accessibility.MODIFIED_BATHROOM",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "storageFeatures",
    label: "fields.storageFeatures",
    type: "multiselect",
    options: [
      {
        value: "attic",
        label: "ATTIC",
        translationKey: "enums.storageFeatures.ATTIC",
      },
      {
        value: "basement",
        label: "BASEMENT",
        translationKey: "enums.storageFeatures.BASEMENT",
      },
      {
        value: "shed",
        label: "SHED",
        translationKey: "enums.storageFeatures.SHED",
      },
      {
        value: "garage",
        label: "GARAGE",
        translationKey: "enums.storageFeatures.GARAGE",
      },
      {
        value: "workshop",
        label: "WORKSHOP",
        translationKey: "enums.storageFeatures.WORKSHOP",
      },
      {
        value: "builtin",
        label: "BUILTIN",
        translationKey: "enums.storageFeatures.BUILTIN",
      },
      {
        value: "mudRoom",
        label: "MUD_ROOM",
        translationKey: "enums.storageFeatures.MUD_ROOM",
      },
    ],
    section: "advanced",
    required: false,
  },
];
