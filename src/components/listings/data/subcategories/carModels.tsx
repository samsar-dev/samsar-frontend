import { VehicleDataStructure } from "../vehicleModels";

export const carModels: VehicleDataStructure = {
  regular: {
    Toyota: [
      "Camry",
      "Corolla",
      "RAV4",
      "Highlander",
      "4Runner",
      "Land Cruiser",
      "Tacoma",
      "Tundra",
      "Sienna",
      "Avalon",
    ],
    Honda: [
      "Civic",
      "Accord",
      "CR-V",
      "Pilot",
      "HR-V",
      "Passport",
      "Odyssey",
      "Ridgeline",
      "Insight",
    ],
    Ford: [
      "F-150",
      "Mustang",
      "Explorer",
      "Escape",
      "Edge",
      "Bronco",
      "Ranger",
      "Expedition",
      "EcoSport",
    ],
    "Mercedes-Benz": [
      "C-Class",
      "E-Class",
      "S-Class",
      "GLE",
      "GLC",
      "GLA",
      "A-Class",
      "CLA",
      "G-Class",
    ],
    BMW: [
      "3 Series",
      "5 Series",
      "7 Series",
      "X3",
      "X5",
      "X7",
      "M3",
      "M5",
      "i4",
    ],
    Volkswagen: [
      "Golf",
      "Jetta",
      "Passat",
      "Tiguan",
      "Atlas",
      "Taos",
      "ID.4",
      "Arteon",
    ],
    Chevrolet: [
      "Silverado",
      "Equinox",
      "Tahoe",
      "Suburban",
      "Traverse",
      "Malibu",
      "Camaro",
      "Corvette",
      "Blazer",
    ],
    Hyundai: [
      "Elantra",
      "Sonata",
      "Tucson",
      "Santa Fe",
      "Palisade",
      "Kona",
      "Venue",
      "IONIQ",
    ],
    Kia: [
      "Forte",
      "K5",
      "Sportage",
      "Telluride",
      "Sorento",
      "Soul",
      "Carnival",
      "EV6",
    ],
    Nissan: [
      "Altima",
      "Sentra",
      "Rogue",
      "Pathfinder",
      "Murano",
      "Maxima",
      "Frontier",
      "Titan",
      "LEAF",
    ],
  },
  electric: {
    Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    "Mercedes-Benz": ["EQS", "EQE", "EQB", "EQA"],
    BMW: ["i4", "iX", "i7", "i3"],
    Volkswagen: ["ID.4", "ID.3", "ID.5", "ID. Buzz"],
    Hyundai: ["IONIQ 5", "IONIQ 6", "Kona Electric"],
    Kia: ["EV6", "Niro EV", "EV9"],
    Nissan: ["LEAF", "Ariya"],
    Porsche: ["Taycan", "Taycan Cross Turismo"],
    Audi: ["e-tron GT", "Q4 e-tron", "Q8 e-tron"],
    Ford: ["Mustang Mach-E", "F-150 Lightning"],
  },
};

export const getAllMakes = (): string[] => {
  const makes = new Set<string>();
  if (carModels.regular) {
    Object.keys(carModels.regular).forEach(make => makes.add(make));
  }
  if (carModels.electric) {
    Object.keys(carModels.electric).forEach(make => makes.add(make));
  }
  return Array.from(makes);
};

export const getModelsForMake = (make: string): string[] => {
  const regularModels = carModels.regular[make] || [];
  const electricModels = carModels.electric?.[make] || [];
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
