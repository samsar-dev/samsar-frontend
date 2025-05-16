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
      "Prius",
      "Supra",
      "GR86",
      "Mirai",
      "C-HR",
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
      "Fit",
      "HR-V",
      "Civic Type R",
      "Pilot Elite",
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
      "Mustang Mach-E",
      "F-150 Lightning",
      "Mustang GT",
      "Bronco Sport",
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
      "AMG GT",
      "Maybach S-Class",
      "GLS",
      "GLB",
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
      "M4",
      "i8",
      "X6",
      "X4",
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
      "Golf GTI",
      "Atlas Cross Sport",
      "Jetta GLI",
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
      "Trax",
      "Colorado",
      "Bolt EV",
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
      "Nexo",
      "Veloster",
      "Elantra N",
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
      "Stinger",
      "K900",
      "Rio",
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
      "370Z",
      "GT-R",
      "Armada",
    ],
    Audi: [
      "A3",
      "A4",
      "A6",
      "A7",
      "A8",
      "Q3",
      "Q5",
      "Q7",
      "Q8",
      "R8",
      "TT",
      "e-tron",
    ],
    Porsche: [
      "911",
      "Cayenne",
      "Macan",
      "Panamera",
      "Taycan",
      "Boxster",
      "Cayman",
      "718",
    ],
    Lexus: ["IS", "ES", "LS", "RX", "GX", "LX", "NX", "UX", "LC", "RC"],
    Subaru: [
      "Outback",
      "Forester",
      "Crosstrek",
      "Impreza",
      "WRX",
      "BRZ",
      "Legacy",
      "Ascent",
    ],
    Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C40 Recharge"],
  },
  electric: {
    Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    "Mercedes-Benz": ["EQS", "EQE", "EQB", "EQA", "EQV", "EQC"],
    BMW: ["i4", "iX", "i7", "i3", "iX3", "iX1"],
    Volkswagen: ["ID.4", "ID.3", "ID.5", "ID. Buzz", "ID.6"],
    Hyundai: ["IONIQ 5", "IONIQ 6", "Kona Electric", "IONIQ 7"],
    Kia: ["EV6", "Niro EV", "EV9", "CV"],
    Nissan: ["LEAF", "Ariya", "Max-Out"],
    Porsche: ["Taycan", "Taycan Cross Turismo"],
    Audi: ["e-tron GT", "Q4 e-tron", "Q8 e-tron", "e-tron"],
    Ford: ["Mustang Mach-E", "F-150 Lightning", "E-Transit"],
    Polestar: ["Polestar 2", "Polestar 3", "Polestar 4"],
    Rivian: ["R1T", "R1S"],
    Lucid: ["Air", "Gravity"],
    Fisker: ["Ocean", "Pear"],
  },
};

export const getAllMakes = (): string[] => {
  const makes = new Set<string>();
  if (carModels.regular) {
    Object.keys(carModels.regular).forEach((make) => makes.add(make));
  }
  if (carModels.electric) {
    Object.keys(carModels.electric).forEach((make) => makes.add(make));
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
