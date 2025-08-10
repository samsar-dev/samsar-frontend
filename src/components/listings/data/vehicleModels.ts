import { VehicleType } from "@/types/enums";

export type ModelData = {
  [make: string]: string[];
};

export type VehicleDataStructure = {
  regular: ModelData;
  electric?: ModelData;
};

import { carModels } from "@/components/listings/data/subcategories/carModels";
 
import { motorcycleModels } from "@/components/listings/data/subcategories/motorcyclesModels";
 

// Define the vehicle models mapping with proper type checking
const vehicleModelsByType: Record<VehicleType, VehicleDataStructure> = {
  
  [VehicleType.CARS]: {
    regular: {
      ...(carModels.regular || {}),
    },
    electric: carModels.electric || {},
  },
  
   
 
  [VehicleType.MOTORCYCLES]: {
    regular: {
      ...(motorcycleModels.regular || {}),
    },
    electric: motorcycleModels.electric || {},
  },
 
  
};

// Improved getMakesForType with better error handling and type safety
export const getMakesForType = (type: VehicleType): string[] => {
  try {
    const vehicleData = vehicleModelsByType[type];
    if (!vehicleData) {
      console.warn(`No data found for vehicle type: ${type}`);
      return [];
    }

    const regularMakes = Object.keys(vehicleData.regular || {});
    const electricMakes = Object.keys(vehicleData.electric || {});

    const allMakes = [...new Set([...regularMakes, ...electricMakes])];
    return allMakes.sort((a, b) => a.localeCompare(b)); // Sort alphabetically
  } catch (error) {
    console.error(`Error getting makes for type ${type}:`, error);
    return [];
  }
};

// Improved getModelsForMakeAndType with better error handling and type safety
export const getModelsForMakeAndType = (
  make: string,
  type: VehicleType,
): string[] => {
  try {
    // Special case for OTHER_MAKE - return a default "Other" model
    if (make === "OTHER_MAKE") {
      return ["OTHER_MODEL"];
    }

    const vehicleData = vehicleModelsByType[type];
    if (!vehicleData) {
      console.warn(`No data found for vehicle type: ${type}`);
      return [];
    }

    const regularModels = vehicleData.regular[make] || [];
    const electricModels = vehicleData.electric?.[make] || [];

    const allModels = [...new Set([...regularModels, ...electricModels])];
    return allModels.sort((a, b) => a.localeCompare(b)); // Sort alphabetically
  } catch (error) {
    console.error(
      `Error getting models for make ${make} and type ${type}:`,
      error,
    );
    return [];
  }
};

// Improved isElectricModel with better error handling
export const isElectricModel = (model: string, type: VehicleType): boolean => {
  try {
    const vehicleData = vehicleModelsByType[type];
    if (!vehicleData?.electric) return false;

    return Object.values(vehicleData.electric).some((models) =>
      models.includes(model),
    );
  } catch (error) {
    console.error(
      `Error checking if model ${model} is electric for type ${type}:`,
      error,
    );
    return false;
  }
};

// Improved search functions with better error handling and type safety
export const searchMakesForType = (
  type: VehicleType,
  query: string,
): string[] => {
  try {
    const makes = getMakesForType(type);
    const normalizedQuery = query.toLowerCase().trim();

    return makes.filter((make) => make.toLowerCase().includes(normalizedQuery));
  } catch (error) {
    console.error(`Error searching makes for type ${type}:`, error);
    return [];
  }
};

export const searchModelsForMake = (
  make: string,
  type: VehicleType,
  query: string,
): string[] => {
  try {
    const models = getModelsForMakeAndType(make, type);
    const normalizedQuery = query.toLowerCase().trim();

    return models.filter((model) =>
      model.toLowerCase().includes(normalizedQuery),
    );
  } catch (error) {
    console.error(`Error searching models for make ${make}:`, error);
    return [];
  }
};

export default vehicleModelsByType;
