import type { VehicleDataStructure } from "../vehicleModels";

export const motorcycleModels: VehicleDataStructure = {
  regular: {
    "Harley-Davidson": [
      "Street Glide",
      "Road King",
      "Sportster",
      "Fat Boy",
      "Iron 883",
      "Street Bob",
      "Road Glide",
    ],
    Honda: [
      "CBR1000RR",
      "CB650R",
      "Gold Wing",
      "Africa Twin",
      "Rebel 500",
      "CBR600RR",
      "CRF450R",
    ],
    Yamaha: [
      "YZF-R1",
      "MT-09",
      "YZF-R6",
      "MT-07",
      "Super Ténéré",
      "V Star 250",
      "FZ-09",
    ],
    Kawasaki: [
      "Ninja ZX-10R",
      "Z900",
      "Ninja 650",
      "Vulcan 900",
      "Versys 650",
      "Z400",
      "KLR650",
    ],
    BMW: [
      "R 1250 GS",
      "S 1000 RR",
      "F 850 GS",
      "R nineT",
      "K 1600 GTL",
      "G 310 R",
      "F 750 GS",
    ],
    Ducati: [
      "Panigale V4",
      "Monster",
      "Multistrada",
      "Scrambler",
      "Diavel",
      "SuperSport",
      "Hypermotard",
    ],
  },
  electric: {
    Zero: ["SR/F", "SR/S", "FX", "S", "DSR Black Forest"],
    Energica: ["Ego", "Eva Ribelle", "Eva EsseEsse9"],
    LiveWire: ["One", "S2 Del Mar"],
    Cake: ["Kalk", "Ösa", "Makka"],
  },
};

export const getAllMakes = (): string[] => {
  const makes = new Set<string>();
  if (motorcycleModels.regular) {
    Object.keys(motorcycleModels.regular).forEach((make) => makes.add(make));
  }
  if (motorcycleModels.electric) {
    Object.keys(motorcycleModels.electric).forEach((make) => makes.add(make));
  }
  return Array.from(makes);
};

export const getModelsForMake = (make: string): string[] => {
  const regularModels = motorcycleModels.regular[make] || [];
  const electricModels = motorcycleModels.electric?.[make] || [];
  return [...new Set([...regularModels, ...electricModels])];
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
