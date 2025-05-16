import { VehicleDataStructure } from "../vehicleModels";

export const vansModels: VehicleDataStructure = {
  regular: {
    "Mercedes-Benz": ["Sprinter", "Vito", "V-Class", "Metris", "Citan"],
    Ford: [
      "Transit",
      "Transit Custom",
      "Transit Connect",
      "Transit Courier",
      "E-Series",
    ],
    Volkswagen: ["Transporter", "Crafter", "Caddy", "Multivan", "California"],
    Fiat: ["Ducato", "Doblo", "Scudo", "Talento", "Fiorino"],
    Renault: ["Master", "Trafic", "Kangoo", "Express", "Space Class"],
    Peugeot: ["Boxer", "Expert", "Partner", "Traveller", "e-Expert"],
    Citroen: ["Jumper", "Dispatch", "Berlingo", "SpaceTourer", "e-Dispatch"],
    Iveco: [
      "Daily",
      "Daily Hi-Matic",
      "Daily Tourys",
      "Daily Blue Power",
      "Daily Minibus",
    ],
  },
  electric: {
    "Mercedes-Benz": ["eSprinter", "eVito", "EQV"],
    Ford: ["E-Transit", "E-Transit Custom", "E-Transit Connect"],
    Volkswagen: ["ID. Buzz", "e-Crafter", "e-Transporter"],
    Fiat: ["E-Ducato", "E-Doblo", "E-Scudo"],
    Renault: ["Master E-Tech", "Kangoo E-Tech", "Zoe Van"],
  },
};

export const getAllMakes = (): string[] => {
  const makes = new Set<string>();
  if (vansModels.regular) {
    Object.keys(vansModels.regular).forEach((make) => makes.add(make));
  }
  if (vansModels.electric) {
    Object.keys(vansModels.electric).forEach((make) => makes.add(make));
  }
  return Array.from(makes);
};

export const getModelsForMake = (make: string): string[] => {
  const regularModels = vansModels.regular[make] || [];
  const electricModels = vansModels.electric?.[make] || [];
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
