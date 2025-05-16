import { VehicleDataStructure } from "../vehicleModels";

export const tractorsModels: VehicleDataStructure = {
  regular: {
    "John Deere": [
      "6M Series",
      "6R Series",
      "7R Series",
      "8R Series",
      "9R Series",
      "5E Series",
      "5M Series",
      "4M Series",
    ],
    "Case IH": [
      "Magnum",
      "Steiger",
      "Puma",
      "Maxxum",
      "Farmall",
      "Optum",
      "Quadtrac",
      "Scout",
    ],
    "New Holland": [
      "T6 Series",
      "T7 Series",
      "T8 Series",
      "T9 Series",
      "T4 Series",
      "T5 Series",
      "Workmaster",
      "Boomer",
    ],
    "Massey Ferguson": [
      "8S Series",
      "7S Series",
      "6S Series",
      "5S Series",
      "4700 Series",
      "3700 Series",
      "2800 Series",
      "1700 Series",
    ],
    Fendt: [
      "1000 Vario",
      "900 Vario",
      "800 Vario",
      "700 Vario",
      "500 Vario",
      "300 Vario",
      "200 Vario",
      "1100 MT",
    ],
    Claas: [
      "Axion 900",
      "Axion 800",
      "Arion 600",
      "Arion 500",
      "Xerion",
      "Nexos",
      "Elios",
      "Atos",
    ],
    Kubota: [
      "M8 Series",
      "M7 Series",
      "M6 Series",
      "M5 Series",
      "M4 Series",
      "L Series",
      "B Series",
      "BX Series",
    ],
    "Deutz-Fahr": [
      "9 Series",
      "8 Series",
      "7 Series",
      "6 Series",
      "5 Series",
      "4E Series",
      "3E Series",
      "Agrokid",
    ],
  },
  electric: {
    "John Deere": ["SESAM", "GridCON", "Battery-Electric Tractor"],
    Fendt: ["e100 Vario"],
    Kubota: ["e-Series Prototype", "Electric Compact"],
    Solectrac: ["e70N", "eUtility", "eFarmer"],
  },
};

// Helper Functions
export const getAllMakes = (): string[] => {
  return Object.keys(tractorsModels.regular);
};
