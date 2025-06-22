import { listingsAdvancedFieldSchema } from "@/components/listings/create/advanced/listingsAdvancedFieldSchema";

export const generateFeaturesDetails = () => {
  const categories = {
    safetyFeatures: new Set<string>(),
    cameraFeatures: new Set<string>(),
    climateFeatures: new Set<string>(),
    entertainmentFeatures: new Set<string>(),
    lightingFeatures: new Set<string>(),
    convenienceFeatures: new Set<string>(),
  } as const;

  // Helper to map a feature-group key (or label) to a category in categories
  const mapToCategory = (key: string): keyof typeof categories | null => {
    const k = key.toLowerCase();
    if (k.includes("safety")) return "safetyFeatures";
    if (k.includes("camera")) return "cameraFeatures";
    if (k.includes("climate")) return "climateFeatures";
    if (k.includes("entertainment") || k.includes("infotainment")) return "entertainmentFeatures";
    if (k.includes("light")) return "lightingFeatures";
    if (k.includes("convenience") || k.includes("comfort")) return "convenienceFeatures";
    return null;
  };

  // Iterate through every schema in listingsAdvancedFieldSchema
  Object.values(listingsAdvancedFieldSchema).forEach((schema: any) => {
    if (!Array.isArray(schema)) return;
    schema.forEach((field: any) => {
      if (field.type === "featureGroup" && field.featureGroups) {
        Object.entries(field.featureGroups).forEach(([groupKey, groupVal]: any) => {
          const category = mapToCategory(groupKey) || mapToCategory(groupVal?.label || "");
          if (!category) return; // skip if we can't classify
          (groupVal.features || []).forEach((feat: any) => {
            if (feat?.name) categories[category].add(feat.name);
          });
        });
      }
    });
  });

  // Convert sets to arrays
  return Object.fromEntries(
    Object.entries(categories).map(([k, v]) => [k, Array.from(v)])
  ) as {
    safetyFeatures: string[];
    cameraFeatures: string[];
    climateFeatures: string[];
    entertainmentFeatures: string[];
    lightingFeatures: string[];
    convenienceFeatures: string[];
  };
};
