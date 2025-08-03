import type { VehicleDataStructure } from "../vehicleModels";

export const busesModels: VehicleDataStructure = {
  regular: {
    "Mercedes-Benz": [
      "Citaro",
      "Tourismo",
      "Travego",
      "Conecto",
      "Intouro",
      "Sprinter City",
    ],
    Volvo: ["9700", "9900", "B8R", "B11R", "7900", "8900"],
    MAN: [
      "Lion's City",
      "Lion's Coach",
      "Lion's Intercity",
      "Lion's Regio",
      "Lion's Explorer",
      "Lion's Top Coach",
    ],
    Scania: [
      "Touring",
      "Interlink",
      "Citywide",
      "OmniExpress",
      "Irizar i6",
      "Irizar i8",
    ],
    VanHool: ["TX", "TDX", "EX", "CX", "T9", "A-Series"],
    Setra: [
      "ComfortClass",
      "TopClass",
      "MultiClass",
      "S 531 DT",
      "S 517 HDH",
      "S 415 LE",
    ],
    Iveco: [
      "Crossway",
      "Evadys",
      "Magelys",
      "Urbanway",
      "Crealis",
      "Daily Line",
    ],
    Neoplan: [
      "Cityliner",
      "Skyliner",
      "Tourliner",
      "Starliner",
      "Jetliner",
      "Trendliner",
    ],
  },
  electric: {
    "Mercedes-Benz": ["eCitaro", "eCitaro G", "eVito Tourer"],
    Volvo: ["7900 Electric", "BZL Electric", "Electric Articulated"],
    MAN: ["Lion's City E", "Lion's City E LE", "Lion's Explorer E"],
    VanHool: ["CX45E", "TDX25E", "Exqui.City"],
    Scania: ["Citywide BEV", "Interlink Electric", "Fencer f1"],
  },
};

// Helper Functions
export const getAllMakes = (): string[] => {
  const makes = new Set<string>();
  if (busesModels.regular) {
    Object.keys(busesModels.regular).forEach((make) => makes.add(make));
  }
  if (busesModels.electric) {
    Object.keys(busesModels.electric).forEach((make) => makes.add(make));
  }
  return Array.from(makes);
};
