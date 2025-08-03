import type { VehicleDataStructure } from "../vehicleModels";

export const trucksModels: VehicleDataStructure = {
  regular: {
    Volvo: ["VNL 860", "VNL 760", "VNL 740", "VNR 640", "VNR 440", "VHD"],
    Freightliner: ["Cascadia", "M2 106", "M2 112", "108SD", "114SD", "122SD"],
    Kenworth: ["T680", "T880", "W900", "T440", "T470", "T800"],
    Peterbilt: [
      "Model 579",
      "Model 389",
      "Model 567",
      "Model 520",
      "Model 220",
      "Model 348",
    ],
    Mack: ["Anthem", "Pinnacle", "Granite", "TerraPro", "LR", "MD"],
    International: [
      "LT Series",
      "RH Series",
      "HX Series",
      "HV Series",
      "MV Series",
      "CV Series",
    ],
  },
  electric: {
    Volvo: ["VNR Electric", "FE Electric", "FL Electric"],
    Freightliner: ["eCascadia", "eM2"],
    Peterbilt: ["Model 579EV", "Model 520EV", "Model 220EV"],
    Kenworth: ["T680E", "K270E", "K370E"],
  },
};

export const getAllMakes = (): string[] => {
  const regularMakes = Object.keys(trucksModels.regular);
  const electricMakes = Object.keys(trucksModels.electric || {});
  return [...new Set([...regularMakes, ...electricMakes])];
};

export const getModelsForMake = (make: string): string[] => {
  const regularModels = trucksModels.regular[make] || [];
  const electricModels = trucksModels.electric?.[make] || [];
  return [...new Set([...regularModels, ...electricModels])];
};
