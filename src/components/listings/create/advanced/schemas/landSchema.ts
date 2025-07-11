import { ListingFieldSchema } from "@/types/listings";

export const landSchema: ListingFieldSchema[] = [
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
    name: "zoning",
    label: "fields.zoning",
    type: "select",
    options: [
      {
        value: "residential",
        label: "RESIDENTIAL",
        translationKey: "enums.zoning.RESIDENTIAL",
      },
      {
        value: "commercial",
        label: "COMMERCIAL",
        translationKey: "enums.zoning.COMMERCIAL",
      },
      {
        value: "agricultural",
        label: "AGRICULTURAL",
        translationKey: "enums.zoning.AGRICULTURAL",
      },
      {
        value: "industrial",
        label: "INDUSTRIAL",
        translationKey: "enums.zoning.INDUSTRIAL",
      },
      {
        value: "mixedUse",
        label: "MIXED_USE",
        translationKey: "enums.zoning.MIXED_USE",
      },
      {
        value: "specialUse",
        label: "SPECIAL_USE",
        translationKey: "enums.zoning.SPECIAL_USE",
      },
      {
        value: "conservationDistrict",
        label: "CONSERVATION_DISTRICT",
        translationKey: "enums.zoning.CONSERVATION_DISTRICT",
      },
      { value: "other", label: "OTHER", translationKey: "enums.zoning.OTHER" },
    ],
    section: "essential",
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
        value: "water",
        label: "WATER",
        translationKey: "enums.utilities.WATER",
      },
      {
        value: "naturalGas",
        label: "NATURAL_GAS",
        translationKey: "enums.utilities.NATURAL_GAS",
      },
      {
        value: "sewer",
        label: "SEWER",
        translationKey: "enums.utilities.SEWER",
      },
      {
        value: "phone",
        label: "PHONE",
        translationKey: "enums.utilities.PHONE",
      },
      {
        value: "internet",
        label: "INTERNET",
        translationKey: "enums.utilities.INTERNET",
      },
      {
        value: "cable",
        label: "CABLE",
        translationKey: "enums.utilities.CABLE",
      },
    ],
    section: "essential",
    required: false,
  },
  {
    name: "accessRoad",
    label: "fields.accessRoad",
    type: "select",
    options: [
      {
        value: "paved",
        label: "PAVED",
        translationKey: "enums.accessRoad.PAVED",
      },
      {
        value: "gravel",
        label: "GRAVEL",
        translationKey: "enums.accessRoad.GRAVEL",
      },
      { value: "dirt", label: "DIRT", translationKey: "enums.accessRoad.DIRT" },
      {
        value: "seasonalAccess",
        label: "SEASONAL_ACCESS",
        translationKey: "enums.accessRoad.SEASONAL_ACCESS",
      },
      { value: "none", label: "NONE", translationKey: "enums.accessRoad.NONE" },
    ],
    section: "essential",
    required: false,
  },
  {
    name: "parcelNumber",
    label: "fields.parcelNumber",
    type: "text",
    section: "essential",
    required: false,
  },

  // Advanced Section
  // Topographical Features
  {
    name: "topography",
    label: "fields.topography",
    type: "multiselect",
    options: [
      { value: "flat", label: "FLAT", translationKey: "enums.topography.FLAT" },
      {
        value: "gentlySloped",
        label: "GENTLY_SLOPED",
        translationKey: "enums.topography.GENTLY_SLOPED",
      },
      {
        value: "steep",
        label: "STEEP",
        translationKey: "enums.topography.STEEP",
      },
      {
        value: "rolling",
        label: "ROLLING",
        translationKey: "enums.topography.ROLLING",
      },
      {
        value: "terraced",
        label: "TERRACED",
        translationKey: "enums.topography.TERRACED",
      },
      {
        value: "riverfront",
        label: "RIVERFRONT",
        translationKey: "enums.topography.RIVERFRONT",
      },
      {
        value: "lakefront",
        label: "LAKEFRONT",
        translationKey: "enums.topography.LAKEFRONT",
      },
      {
        value: "oceanfront",
        label: "OCEANFRONT",
        translationKey: "enums.topography.OCEANFRONT",
      },
      {
        value: "mountainous",
        label: "MOUNTAINOUS",
        translationKey: "enums.topography.MOUNTAINOUS",
      },
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "elevation",
    label: "fields.elevation",
    type: "number",
    section: "advanced",
    required: false,
  },
  {
    name: "waterFeatures",
    label: "fields.waterFeatures",
    type: "multiselect",
    options: [
      "creek",
      "river",
      "lake",
      "pond",
      "spring",
      "wetland",
      "ocean",
      "stream",
      "waterfall",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "naturalFeatures",
    label: "fields.naturalFeatures",
    type: "multiselect",
    options: [
      "woods",
      "meadow",
      "pasture",
      "beach",
      "cliffs",
      "cave",
      "minerals",
      "wildlife",
    ],
    section: "advanced",
    required: false,
  },

  // Development & Zoning
  {
    name: "buildable",
    label: "fields.buildable",
    type: "select",
    options: [
      "readyToBuild",
      "needsSitework",
      "needsPermits",
      "notBuildable",
      "unknown",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "buildingRestrictions",
    label: "fields.buildingRestrictions",
    type: "multiselect",
    options: [
      "setbacks",
      "heightLimits",
      "densityLimits",
      "useRestrictions",
      "historicDistrict",
      "environmentalProtection",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "permitsInPlace",
    label: "fields.permitsInPlace",
    type: "multiselect",
    options: [
      "building",
      "septic",
      "well",
      "grading",
      "environmental",
      "subdivision",
    ],
    section: "advanced",
    required: false,
  },

  // Environmental Factors
  {
    name: "environmentalFeatures",
    label: "fields.environmentalFeatures",
    type: "multiselect",
    options: [
      "wetlands",
      "endangeredSpecies",
      "conservationArea",
      "watershed",
      "greenway",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "soilTypes",
    label: "fields.soilTypes",
    type: "multiselect",
    options: ["clay", "loam", "sandy", "silt", "peat", "rocky", "unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "floodZone",
    label: "fields.floodZone",
    type: "select",
    options: [
      "zoneA",
      "zoneAE",
      "zoneX",
      "zone500",
      "notInFloodZone",
      "unknown",
    ],
    section: "advanced",
    required: false,
  },

  // Rights & Access
  {
    name: "mineralRights",
    label: "fields.mineralRights",
    type: "multiselect",
    options: [
      "oil",
      "gas",
      "coal",
      "precious",
      "subsurface",
      "none",
      "unknown",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "waterRights",
    label: "fields.waterRights",
    type: "multiselect",
    options: ["riparian", "appropriative", "shared", "none", "unknown"],
    section: "advanced",
    required: false,
  },
  {
    name: "easements",
    label: "fields.easements",
    type: "multiselect",
    options: [
      "utility",
      "access",
      "conservation",
      "scenic",
      "agricultural",
      "none",
      "unknown",
    ],
    section: "advanced",
    required: false,
  },

  // Infrastructure & Improvements
  {
    name: "boundaryFeatures",
    label: "fields.boundaryFeatures",
    type: "multiselect",
    options: [
      "fenced",
      "stonewalls",
      "hedgerow",
      "natural",
      "surveyed",
      "marked",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "fencingType",
    label: "fields.fencingType",
    type: "multiselect",
    options: [
      "barbedWire",
      "electric",
      "wood",
      "chainLink",
      "vinyl",
      "stone",
      "none",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "irrigation",
    label: "fields.irrigation",
    type: "multiselect",
    options: ["sprinkler", "drip", "flood", "well", "pond", "none"],
    section: "advanced",
    required: false,
  },
  {
    name: "improvements",
    label: "fields.improvements",
    type: "multiselect",
    options: [
      "barn",
      "shed",
      "greenhouse",
      "silo",
      "dock",
      "pier",
      "boathouse",
      "paddock",
      "arena",
    ],
    section: "advanced",
    required: false,
  },

  // Documentation & Studies
  {
    name: "documentsAvailable",
    label: "fields.documentsAvailable",
    type: "multiselect",
    options: [
      "survey",
      "soilTest",
      "environmentalStudy",
      "floodCertification",
      "mineralRights",
      "waterRights",
      "zoning",
      "permits",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "previousUse",
    label: "fields.previousUse",
    type: "multiselect",
    options: [
      "agricultural",
      "residential",
      "commercial",
      "industrial",
      "recreational",
      "conservation",
      "unused",
    ],
    section: "advanced",
    required: false,
  },
  {
    name: "propertyHistory",
    label: "fields.propertyHistory",
    type: "text",
    section: "advanced",
    required: false,
  },
];
