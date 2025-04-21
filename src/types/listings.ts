import type {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
  ListingAction,
} from "./enums";

export enum ListingStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  SOLD = "SOLD",
  DELETED = "DELETED",
}

interface FeatureItem {
  name: string;
  label: string;
  type: "toggle" | "checkbox";
}

interface FeatureGroup {
  label: string;
  features: FeatureItem[];
}

interface FeatureGroups {
  [key: string]: FeatureGroup;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface ListingFieldSchema {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "select"
    | "textarea"
    | "checkbox"
    | "date"
    | "colorpicker"
    | "multiselect"
    | "toggle"
    | "featureGroup";
  section: string;
  required: boolean;
  options?: string[] | SelectOption[];
  validate?: (value: any) => string | null;
  featureGroups?: FeatureGroups;
  featureCategory?:
    | "entertainment"
    | "lighting"
    | "cameras"
    | "safety"
    | "climate";
}

// Common fields for all vehicle types
// Base interface for all vehicles
export interface BaseVehicleDetails {
  make: string;
  model: string;
  year: string;
  mileage: number;
  fuelType: FuelType;
  transmissionType: TransmissionType;
  transmission?: string;
  gearbox?: string;
  color: string;
  condition: Condition;
  features?: Record<string, any>;
  interiorColor?: string;
  warranty?: string;
  previousOwners?: string | number;
  registrationStatus?: string;
  upholsteryMaterial?: string;
  tireCondition?: string;
  warrantyPeriod?: string;
  customsCleared?: boolean;
  bodyType?: string;
  roofType?: string;
  horsepower?: number;
  torque?: number;
  brakeType?: string;
  engineNumber?: string;
  engineSize?: string;
  serviceHistory?: boolean;
  accidentFree?: boolean;
  importStatus?: string;
  registrationExpiry?: string;
  insuranceType?: string;
  serviceHistoryDetails?: string;
  additionalNotes?: string;
  safetyFeatures?: Record<string, any>;
  vin?: string;
  attachments?: string[];
  fuelTankCapacity?: string;
  tires?: string;
  hydraulicSystem?: string;
  ptoType?: string;
  fuelEfficiency?: string;
  emissionClass?: string;
  driveType?: string;
  wheelSize?: string;
  wheelType?: string;
  // Safety features
  tractionControl?: boolean;
  abs?: boolean;
  emergencyBrakeAssist?: boolean;
  tirePressureMonitoring?: boolean;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruiseControl?: boolean;
  parkingSensors?: boolean;
  parkingCamera?: boolean;
  
  // Camera features
  rearCamera?: boolean;
  camera360?: boolean;
  dashCam?: boolean;
  nightVision?: boolean;
  
  // Comfort features
  climateControl?: boolean;
  dualZoneClimate?: boolean;
  rearAC?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  
  // Lighting features
  ledHeadlights?: boolean;
  adaptiveHeadlights?: boolean;
  ambientLighting?: boolean;
  fogLights?: boolean;
  
  // Technology features
  bluetooth?: boolean;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  premiumSound?: boolean;
  wirelessCharging?: boolean;
  keylessEntry?: boolean;
  sunroof?: boolean;
  spareKey?: boolean;
  remoteStart?: boolean;
}

export interface CarDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.CAR;
  seatingCapacity?: number;
  trunkCapacity?: number;
  fuelEfficiency?: string;
  emissionClass?: string;
  driveType?: string;
  acceleration?: string;
  maxSpeed?: number;
  wheelSize?: string;
  wheelType?: string;
  airbags?: number;
  engineSize?: string;
  horsepower?: number;
  torque?: number;
  numberOfOwners?: number;
  transmission?: string;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruiseControl?: boolean;
  rearCamera?: boolean;
  camera360?: boolean;
  climateControl?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  ledHeadlights?: boolean;
  adaptiveHeadlights?: boolean;
  ambientLighting?: boolean;
  bluetooth?: boolean;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  premiumSound?: boolean;
  wirelessCharging?: boolean;
  keylessEntry?: boolean;
  sunroof?: boolean;
  spareKey?: boolean;
  remoteStart?: boolean;
  engine?: string;
  brakeType?: string;
  fuelTankCapacity?: string;
  tires?: string;
  attachments?: string[];
  warrantyPeriod?: string;
  customsCleared?: boolean;
  bodyType?: string;
  roofType?: string;
  serviceHistoryDetails?: string;
  additionalNotes?: string;
  safetyFeatures?: Record<string, any>;
  features?: Record<string, any>;
  hydraulicSystem?: string;
  ptoType?: string;
}

export interface MotorcycleDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.MOTORCYCLE;
  numberOfOwners?: number;
  engine?: string;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruiseControl?: boolean;
  rearCamera?: boolean;
  camera360?: boolean;
  climateControl?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  ledHeadlights?: boolean;
  adaptiveHeadlights?: boolean;
  ambientLighting?: boolean;
  bluetooth?: boolean;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  premiumSound?: boolean;
  wirelessCharging?: boolean;
  keylessEntry?: boolean;
  sunroof?: boolean;
  spareKey?: boolean;
  remoteStart?: boolean;
  transmission?: string;
}

export interface TruckDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.TRUCK;
  cargoCapacity?: number;
  numberOfOwners?: number;
  engine?: string;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruiseControl?: boolean;
  rearCamera?: boolean;
  camera360?: boolean;
  climateControl?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  ledHeadlights?: boolean;
  adaptiveHeadlights?: boolean;
  ambientLighting?: boolean;
  bluetooth?: boolean;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  premiumSound?: boolean;
  wirelessCharging?: boolean;
  keylessEntry?: boolean;
  sunroof?: boolean;
  spareKey?: boolean;
  remoteStart?: boolean;
  transmission?: string;
}

export interface VanDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.VAN;
  cargoVolume?: number;
  numberOfOwners?: number;
  engine?: string;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruiseControl?: boolean;
  rearCamera?: boolean;
  camera360?: boolean;
  climateControl?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  ledHeadlights?: boolean;
  adaptiveHeadlights?: boolean;
  ambientLighting?: boolean;
  bluetooth?: boolean;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  premiumSound?: boolean;
  wirelessCharging?: boolean;
  keylessEntry?: boolean;
  sunroof?: boolean;
  spareKey?: boolean;
  remoteStart?: boolean;
  transmission?: string;
}

export interface BusDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.BUS;
  seatingCapacity?: number;
  luggageSpace?: number;
  comfortFeatures?: string[];
  seatType?: string;
  seatMaterial?: string;
  wheelchairAccessible?: boolean;
  wheelchairLift?: boolean;
  accessibilityFeatures?: string[];
  emergencyExits?: number;
  safetyFeatures?: string[];
  seatBelts?: string;
  emissionStandard?: string;
  enginePower?: string;
  engineTorque?: string;
  suspension?: string[];
  brakeSystem?: string[];
  entertainmentFeatures?: string[];
  navigationSystem?: string;
  communicationSystem?: string[];
  maintenanceHistory?: string;
  lastInspectionDate?: string;
  warranty?: string;
  certifications?: string[];
  luggageCompartments?: number;
  luggageRacks?: boolean;
  fuelTankCapacity?: string;
  numberOfOwners?: number;
  engine?: string;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruiseControl?: boolean;
  rearCamera?: boolean;
  camera360?: boolean;
  climateControl?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  ledHeadlights?: boolean;
  adaptiveHeadlights?: boolean;
  ambientLighting?: boolean;
  bluetooth?: boolean;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  premiumSound?: boolean;
  wirelessCharging?: boolean;
  keylessEntry?: boolean;
  sunroof?: boolean;
  spareKey?: boolean;
  remoteStart?: boolean;
  transmission?: string;
}

export interface TractorDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.TRACTOR;
  attachments?: string[];
  fuelTankCapacity?: string;
  tires?: string;
  hydraulicSystem?: string;
  ptoType?: string;
  numberOfOwners?: number;
  serviceHistory?: boolean;
  emissions?: string;
  hydraulicFlow?: number;
  hydraulicOutlets?: string[];
  ptoSystem?: string[];
  ptoHorsepower?: number;
  frontAttachments?: string[];
  rearAttachments?: string[];
  threePointHitch?: string;
  hitchCapacity?: number;
  cabFeatures?: string[];
  seating?: string[];
  steeringSystem?: string[];
  lighting?: string[];
  precisionFarming?: string[];
  monitor?: string[];
  electricalSystem?: string;
  warranty?: string;
  modifications?: string;
  hours?: number;
  horsepower?: number;
  driveSystem?: string;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruiseControl?: boolean;
  rearCamera?: boolean;
  camera360?: boolean;
  climateControl?: boolean;
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  ledHeadlights?: boolean;
  adaptiveHeadlights?: boolean;
  ambientLighting?: boolean;
  bluetooth?: boolean;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  premiumSound?: boolean;
  wirelessCharging?: boolean;
  keylessEntry?: boolean;
  sunroof?: boolean;
  spareKey?: boolean;
  remoteStart?: boolean;
  transmission?: string;
  engine?: string;
}

// Union type for all possible vehicle details
export type VehicleDetails = BaseVehicleDetails & {
  vehicleType: VehicleType;
} & (
  | (Omit<CarDetails, keyof BaseVehicleDetails> & { vehicleType: VehicleType.CAR })
  | (Omit<MotorcycleDetails, keyof BaseVehicleDetails> & { vehicleType: VehicleType.MOTORCYCLE })
  | (Omit<TruckDetails, keyof BaseVehicleDetails> & { vehicleType: VehicleType.TRUCK })
  | (Omit<VanDetails, keyof BaseVehicleDetails> & { vehicleType: VehicleType.VAN })
  | (Omit<BusDetails, keyof BaseVehicleDetails> & { vehicleType: VehicleType.BUS })
  | (Omit<TractorDetails, keyof BaseVehicleDetails> & { vehicleType: VehicleType.TRACTOR })
);

export interface BaseRealEstateDetails {
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  furnished?: boolean;
  features?: Record<string, any>;
}

export interface BasePropertyDetails extends BaseRealEstateDetails {
  size: number;
  yearBuilt: number;
  condition: Condition;
  features: string[];
  furnished?: boolean;
  utilities?: string[] | boolean;
}

export interface HouseDetails extends BaseRealEstateDetails {
  propertyType: PropertyType.HOUSE;
  floors: number;
  parkingSpaces: number;
  garage: boolean;
  garden: boolean;
  petsAllowed: boolean;
  constructionType?: string;
  parking?: string;
  yearBuilt: number;
  condition: Condition;
  size: number;
}

export interface ApartmentDetails extends BasePropertyDetails {
  propertyType: PropertyType.APARTMENT;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  totalFloors: number;
  parking?: string;
  elevator?: boolean;
  balcony?: boolean;
  storage?: boolean;
  heating?: string;
  cooling?: string;
  buildingAmenities?: string[];
  energyRating?: string;
  furnished?: boolean;
  petPolicy?: string;
  view?: string;
  securityFeatures?: string[];
  fireSafety?: string[];
  flooringType?: string;
  internetIncluded?: boolean;
  windowType?: string;
  accessibilityFeatures?: string[];
  renovationHistory?: string;
  parkingType?: string;
  utilities?: string[];
  exposureDirection?: string[];
  storageType?: string[];
  constructionType?: string;
}

export interface LandDetails extends BasePropertyDetails {
  propertyType: PropertyType.LAND;
  zoning: string;
  utilities: boolean;
  roadAccess: boolean;
  buildable: boolean;
  fenced: boolean;
  waterFeatures: boolean;
  soilType: string;
}

export type RealEstateDetails = 
  | HouseDetails 
  | ApartmentDetails 
  | LandDetails;

export interface ListingDetails {
  vehicles?: VehicleDetails;
  realEstate?: RealEstateDetails;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Category {
  mainCategory: ListingCategory;
  subCategory: string;
}

export interface Listing {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  location: string;
  images: Array<string | File>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  userId?: string;
  details: ListingDetails;
  listingAction?: ListingAction;
  status?: ListingStatus;
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
  };
}

export interface ListingUpdateInput {
  title: string;
  description: string;
  price: number;
  location: string;
  category: Category;
  details?: {
    vehicles?: Record<string, any>;
    realEstate?: Record<string, any>;
  };
  status?: ListingStatus;
}

export interface ListingResponse {
  success: boolean;
  data?: Listing;
  message?: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
}

export interface UserListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Base form state with all fields optional for form handling
export interface BaseFormState {
  title?: string;
  description?: string;
  price?: number | string;
  location?: string;
  category?: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  details?: {
    vehicles?: VehicleDetails;
    realEstate?: RealEstateDetails;
  };
  images?: Array<string | File>;
  features?: string[];
  listingAction?: ListingAction;
}

// Complete form state with required fields for final submission
export interface FormState
  extends Required<Omit<BaseFormState, "features" | "listingAction">> {
  features?: string[];
  listingAction?: ListingAction;
}

export type CategoryFilter = "ALL" | "VEHICLES" | "REAL_ESTATE";

export interface ListingParams {
  category: {
    mainCategory: ListingCategory;
    subCategory?: string;
  };
  vehicleDetails?: {
    make?: string;
    model?: string;
  };
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  preview?: boolean;
  forceRefresh?: string;
}

// Extended listing interface to include savedBy
export interface ExtendedListing extends Listing {
  savedBy?: Array<{ id: string }>;
}