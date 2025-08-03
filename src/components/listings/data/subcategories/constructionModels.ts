import type { VehicleDataStructure } from "../vehicleModels";

export const constructionModels: VehicleDataStructure = {
  regular: {
    Caterpillar: [
      "D6 Dozer",
      "D8 Dozer",
      "320 Excavator",
      "336 Excavator",
      "950 Loader",
      "980 Loader",
      "745 Articulated Truck",
      "777 Mining Truck",
    ],
    Komatsu: [
      "PC200 Excavator",
      "PC300 Excavator",
      "WA380 Loader",
      "WA500 Loader",
      "D61 Dozer",
      "D85 Dozer",
      "HD605 Dump Truck",
      "HM300 Articulated Truck",
    ],
    "John Deere": [
      "310L Backhoe",
      "350P Excavator",
      "524L Loader",
      "644P Loader",
      "850L Dozer",
      "950K Dozer",
      "410L Loader Backhoe",
      "460E Articulated Truck",
    ],
    Volvo: [
      "EC220 Excavator",
      "EC300 Excavator",
      "L120 Loader",
      "L150 Loader",
      "A30 Articulated Hauler",
      "A40 Articulated Hauler",
      "ECR235 Excavator",
      "EW160 Wheeled Excavator",
    ],
    Hitachi: [
      "ZX210 Excavator",
      "ZX350 Excavator",
      "ZW180 Loader",
      "ZW220 Loader",
      "EH3500 Dump Truck",
      "EH4000 Dump Truck",
      "ZX300 Excavator",
      "ZX400 Excavator",
    ],
    Liebherr: [
      "R950 Excavator",
      "R970 Excavator",
      "L550 Loader",
      "L580 Loader",
      "PR736 Dozer",
      "PR756 Dozer",
      "TA230 Dump Truck",
      "TA240 Dump Truck",
    ],
    JCB: [
      "3CX Backhoe",
      "4CX Backhoe",
      "JS220 Excavator",
      "JS300 Excavator",
      "427 Loader",
      "437 Loader",
      "Hydradig",
      "Fastrac",
    ],
    CASE: [
      "580 Backhoe",
      "590 Backhoe",
      "CX210 Excavator",
      "CX300 Excavator",
      "621G Loader",
      "721G Loader",
      "850M Dozer",
      "1150M Dozer",
    ],
  },
  electric: {
    Caterpillar: ["R1700 XE", "246 XE", "301.9 Electric", "320 Electric"],
    Volvo: [
      "ECR25 Electric",
      "L25 Electric",
      "EC230 Electric",
      "EX03 Electric",
    ],
    Komatsu: [
      "PC30E Electric",
      "WA70E Electric",
      "HD605E Electric",
      "PC200E Electric",
    ],
    JCB: [
      "19C-1E Electric",
      "525-60E Electric",
      "30-19E Electric",
      "HTD5E Electric",
    ],
  },
};

// Helper Functions
export const getAllMakes = (): string[] => {
  const makes = new Set<string>();
  if (constructionModels.regular) {
    Object.keys(constructionModels.regular).forEach((make) => makes.add(make));
  }
  if (constructionModels.electric) {
    Object.keys(constructionModels.electric).forEach((make) => makes.add(make));
  }
  return Array.from(makes);
};

export const getModelsForMake = (make: string): string[] => {
  const regularModels = constructionModels.regular[make] || [];
  const electricModels = constructionModels.electric?.[make] || [];
  return [...new Set([...regularModels, ...electricModels])].sort();
};

export const searchMakes = (query: string): string[] => {
  return getAllMakes().filter((make) =>
    make.toLowerCase().includes(query.toLowerCase()),
  );
};

export const searchModels = (make: string, query: string): string[] => {
  return getModelsForMake(make).filter((model) =>
    model.toLowerCase().includes(query.toLowerCase()),
  );
};
