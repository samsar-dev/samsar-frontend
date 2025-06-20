import type {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
  ListingAction,
  ListingStatus,
} from "./enums";

export enum YesNo {
  Yes = "true",
  No = "false",
}

export enum Zoning {
  Residential = "residential",
  Commercial = "commercial",
  Industrial = "industrial",
  Agricultural = "agricultural",
  MixedUse = "mixed_use",
  Recreational = "recreational",
}

export enum PropertyCondition {
  New = "new",
  Excellent = "excellent",
  Good = "good",
  Fair = "fair",
  NeedsWork = "needs_work",
  FixerUpper = "fixer_upper",
}

export enum PropertyUsage {
  Retail = "retail",
  Office = "office",
  Industrial = "industrial",
  Warehouse = "warehouse",
  Hospitality = "hospitality",
  MixedUse = "mixed_use",
  Other = "other",
}

export enum CustomFeature {
  Furnished = "furnished",
  Basement = "basement",
  Security = "security",
  Fireplace = "fireplace",
}

export interface SelectOption {
  value: string;
  label: string;
}

// Real estate specific interfaces
export interface HouseDetails {
  propertyType: PropertyType.HOUSE;
  totalArea: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  livingArea: number;
  halfBathrooms: number;
  stories: number;
  hasGarden?: boolean;
  hasGarage?: boolean;
  floors?: number;
  parkingSpaces?: number;
  garage?: boolean;
  garden?: boolean;
  petsAllowed?: boolean;
  constructionType?: string;
  parking?: string;
}

export interface ApartmentDetails {
  propertyType: PropertyType.APARTMENT;
  totalArea: number;
  bedrooms: number;
  bathrooms: number;
  floorLevel: number;
  yearBuilt: number;
  totalFloors?: number;
  hasElevator?: boolean;
  hasBalcony?: boolean;
}

export interface CondoDetails {
  propertyType: PropertyType.CONDO;
  totalArea: number;
  bedrooms: number;
  bathrooms: number;
  floorLevel: number;
  yearBuilt: number;
  totalFloors?: number;
  hasElevator?: boolean;
  hasBalcony?: boolean;
  hasGym?: boolean;
}

export interface LandDetails {
  propertyType: PropertyType.LAND;
  totalArea: number;
  isBuildable?: boolean;
  hasUtilities?: boolean;
  hasAccessRoad?: boolean;
}

export interface CommercialDetails {
  propertyType: PropertyType.COMMERCIAL;
  totalArea: number;
  usageType: string;
  yearBuilt: number;
  hasParking?: boolean;
  isAccessible?: boolean;
}

export interface OtherDetails {
  propertyType: PropertyType.OTHER;
  totalArea: number;
  yearBuilt: number;
  customFeatures?: string[];
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
  validate?: (value: string | number | boolean) => string | null;
  featureGroups?: FeatureGroups;
  featureCategory?:
    | "entertainment"
    | "lighting"
    | "cameras"
    | "safety"
    | "climate";
  tooltip?: string;
}

export interface VehicleFeatures {
  // Safety Features
  accidentFree?: boolean;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruiseControl?: boolean;
  tractionControl?: boolean;
  abs?: boolean;
  emergencyBrakeAssist?: boolean;
  tirePressureMonitoring?: boolean;
  distanceTempomat?: boolean;
  distanceWarning?: boolean;
  passengerAirbag?: boolean;
  glarelessHighBeam?: boolean;
  esp?: boolean;
  driverAirbag?: boolean;
  highBeamAssistant?: boolean;
  speedLimitingSystem?: boolean;
  isofix?: boolean;
  fatigueWarningSystem?: boolean;
  emergencyCallSystem?: boolean;
  sideAirbag?: boolean;
  trackHoldingAssistant?: boolean;
  deadAngleAssistant?: boolean;
  trafficSignRecognition?: boolean;
  burglarAlarmSystem?: boolean;
  immobilizer?: boolean;
  centralLocking?: boolean;

  // Camera Features
  rearCamera?: boolean;
  camera360?: boolean;
  dashCam?: boolean;
  nightVision?: boolean;
  parkingSensors?: boolean;
  parkingAid?: boolean;
  parkingAidCamera?: boolean;
  parkingAidSensorsRear?: boolean;
  parkingAidSensorsFront?: boolean;

  // Climate Features
  climateControl?: boolean | string[];
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  dualZoneClimate?: boolean;
  rearAC?: boolean;
  airQualitySensor?: boolean;
  airConditioning?: boolean;
  twoZoneClimateControl?: boolean;

  // Entertainment Features
  bluetooth?: boolean;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  premiumSound?: boolean;
  wirelessCharging?: boolean;
  usbPorts?: boolean;
  cdPlayer?: boolean;
  dvdPlayer?: boolean;
  rearSeatEntertainment?: boolean;
  androidCar?: boolean;
  onBoardComputer?: boolean;
  dabRadio?: boolean;
  handsFreeCalling?: boolean;
  integratedMusicStreaming?: boolean;
  radio?: boolean;
  soundSystem?: boolean;
  wifiHotspot?: boolean;

  // Lighting Features
  ledHeadlights?: boolean;
  adaptiveHeadlights?: boolean;
  ambientLighting?: boolean;
  fogLights?: boolean;
  automaticHighBeams?: boolean;
  ledDaytimeRunningLights?: boolean;
  daytimeRunningLights?: boolean;
  headlightCleaning?: boolean;
  lightSensor?: boolean;

  // Convenience Features
  keylessEntry?: boolean;
  sunroof?: boolean;
  spareKey?: boolean;
  remoteStart?: boolean;
  powerTailgate?: boolean;
  autoDimmingMirrors?: boolean;
  rainSensingWipers?: boolean;
  mountainDrivingAssistant?: boolean;
  electricalWindowLifter?: boolean;
  electricalSideMirrors?: boolean;
  electricSeats?: boolean;
  headUpDisplay?: boolean;
  leatherSteeringWheel?: boolean;
  lumbarSupport?: boolean;
  multifunctionalSteeringWheel?: boolean;
  navigationSystem?: string;
  rainSensor?: boolean;
  automaticStartStop?: boolean;
  automaticDazzlingInteriorMirrors?: boolean;
  switchingRockers?: boolean;
  armrest?: boolean;
  voiceControl?: boolean;
  touchscreen?: boolean;

  // Extras
  aluminumRims?: boolean;
  luggageCompartmentSeparation?: boolean;
  summerTires?: boolean;
  powerSteering?: boolean;
}

// Common fields for all vehicle types
// Base interface for all vehicles
export interface BaseVehicleDetails {
  customMake?: string;
  customModel?: string;
  make: string;
  // vin: string;
  insuranceType?: string;
  model: string;
  year: string;
  mileage: string | number;
  fuelType: FuelType | string;
  transmissionType?: TransmissionType | string;
  transmission?: string;
  gearbox?: string;
  color: string;
  condition: Condition;
  features: VehicleFeatures;
  interiorColor: string;
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
  engine?: string;
  registrationExpiry?: string;

  // Safety Features
  accidentFree?: boolean;
  blindSpotMonitor?: boolean;
  laneAssist?: boolean;
  adaptiveCruiseControl?: boolean;
  tractionControl?: boolean;
  abs?: boolean;
  emergencyBrakeAssist?: boolean;
  tirePressureMonitoring?: boolean;
  distanceTempomat?: boolean;
  distanceWarning?: boolean;
  passengerAirbag?: boolean;
  glarelessHighBeam?: boolean;
  esp?: boolean;
  driverAirbag?: boolean;
  highBeamAssistant?: boolean;
  speedLimitingSystem?: boolean;
  isofix?: boolean;
  fatigueWarningSystem?: boolean;
  emergencyCallSystem?: boolean;
  sideAirbag?: boolean;
  trackHoldingAssistant?: boolean;
  deadAngleAssistant?: boolean;
  trafficSignRecognition?: boolean;
  burglarAlarmSystem?: boolean;
  immobilizer?: boolean;
  centralLocking?: boolean;

  // Camera Features
  rearCamera?: boolean;
  camera360?: boolean;
  dashCam?: boolean;
  nightVision?: boolean;
  parkingSensors?: boolean;
  parkingAid?: boolean;
  parkingAidCamera?: boolean;
  parkingAidSensorsRear?: boolean;
  parkingAidSensorsFront?: boolean;

  // Climate Features
  climateControl?: boolean | string[];
  heatedSeats?: boolean;
  ventilatedSeats?: boolean;
  dualZoneClimate?: boolean;
  rearAC?: boolean;
  airQualitySensor?: boolean;
  airConditioning?: boolean;
  twoZoneClimateControl?: boolean;

  // Entertainment Features
  bluetooth?: boolean;
  appleCarPlay?: boolean;
  androidAuto?: boolean;
  premiumSound?: boolean;
  wirelessCharging?: boolean;
  usbPorts?: boolean;
  cdPlayer?: boolean;
  dvdPlayer?: boolean;
  rearSeatEntertainment?: boolean;
  androidCar?: boolean;
  onBoardComputer?: boolean;
  dabRadio?: boolean;
  handsFreeCalling?: boolean;
  integratedMusicStreaming?: boolean;
  radio?: boolean;
  soundSystem?: boolean;
  wifiHotspot?: boolean;

  // Lighting Features
  ledHeadlights?: boolean;
  adaptiveHeadlights?: boolean;
  ambientLighting?: boolean;
  fogLights?: boolean;
  automaticHighBeams?: boolean;
  ledDaytimeRunningLights?: boolean;
  daytimeRunningLights?: boolean;
  headlightCleaning?: boolean;
  lightSensor?: boolean;

  // Convenience Features
  keylessEntry?: boolean;
  sunroof?: boolean;
  spareKey?: boolean;
  remoteStart?: boolean;
  powerTailgate?: boolean;
  autoDimmingMirrors?: boolean;
  rainSensingWipers?: boolean;
  mountainDrivingAssistant?: boolean;
  electricalWindowLifter?: boolean;
  electricalSideMirrors?: boolean;
  electricSeats?: boolean;
  headUpDisplay?: boolean;
  leatherSteeringWheel?: boolean;
  lumbarSupport?: boolean;
  multifunctionalSteeringWheel?: boolean;
  navigationSystem?: string;
  rainSensor?: boolean;
  automaticStartStop?: boolean;
  automaticDazzlingInteriorMirrors?: boolean;
  switchingRockers?: boolean;
  armrest?: boolean;
  voiceControl?: boolean;
  touchscreen?: boolean;

  // Extras
  aluminumRims?: boolean;
  luggageCompartmentSeparation?: boolean;
  summerTires?: boolean;
  powerSteering?: boolean;

  // Nested Safety Features
  frontAirbags?: boolean;
  sideAirbags?: boolean;
  curtainAirbags?: boolean;
  kneeAirbags?: boolean;
  cruiseControl?: boolean;
  laneDepartureWarning?: boolean;
  laneKeepAssist?: boolean;
  automaticEmergencyBraking?: boolean;

  // Motorcycle specific fields
  startType?: string;
  coolingSystem?: string;
  frameType?: string;
  frontSuspension?: string[];
  rearSuspension?: string[];
  riderAids?: string[];
  electronics?: string[];
  seatHeight?: number;
  handlebarType?: string;
  storageOptions?: string[];
  protectiveEquipment?: string[];

  // Additional fields
  importStatus?: string;
  serviceHistory?: boolean | string;
  serviceHistoryDetails?: string;
  additionalNotes?: string;
}

export interface CarDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.CAR;
  bodyStyle?: string;
  driveType?: string;
  engineType?: string;
  transmissionType?: string;
  safetyFeatures?: string[];
  comfortFeatures?: string[];
  entertainmentSystem?: string[];
  exteriorFeatures?: string[];
  performanceFeatures?: string[];
  serviceHistory?: string;
  warranty?: string;
  modifications?: string[];
  seatingCapacity?: number;
  trunkCapacity?: number;
  fuelEfficiency?: string;
  emissionClass?: string;
  acceleration?: string;
  maxSpeed?: number;
  wheelSize?: string;
  wheelType?: string;
  airbags?: number;
  engineSize?: string;
  horsepower?: number;
  torque?: number;
  numberOfOwners?: number;
  engine?: string;
  brakeType?: string;
  fuelTankCapacity?: string;
  interiorFeatures?: string[];
  roofType?: string;
  suspensionType?: string;
  steeringType?: string;
  parkingAssist?: string[];
  climateControl?: string[];
}

export interface MotorcycleDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.MOTORCYCLE;
  motorcycleType?: string;
  engineType?: string;
  transmissionType?: string;
  engineConfiguration?: string;
  safetyFeatures?: string[];
  comfortFeatures?: string[];
  performanceFeatures?: string[];
  serviceHistory?: string;
  modifications?: string[];
  accessories?: string[];
  ridingStyle?: string;
  numberOfOwners?: number;
  engine?: string;
  engineSize?: string;
  enginePowerOutput?: string;
  brakeSystem?: string[];
  suspensionType?: string;
  frameType?: string;
  wheelSize?: string;
  tireType?: string;
  startingSystem?: string;
  coolingSystem?: string;
  instrumentCluster?: string[];
  lightingSystem?: string[];
}

export interface TruckDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.TRUCK;
  truckType?: string;
  cargoFeatures?: string[];
  safetyFeatures?: string[];
  comfortFeatures?: string[];
  performanceFeatures?: string[];
  maintenanceHistory?: string;
  certifications?: string[];
  specialFeatures?: string[];
  bodyFeatures?: string[];
  cargoCapacity?: number;
  numberOfOwners?: number;
  engine?: string;
  engineType?: string;
  engineSize?: string;
  enginePowerOutput?: string;
  transmissionType?: string;
  driveType?: string;
  axleConfiguration?: string;
  brakeSystem?: string[];
  suspensionType?: string;
  cabType?: string;
  bedLength?: string;
  payload?: number;
  towingCapacity?: number;
  gvwr?: number;
  wheelbase?: string;
}

export interface VanDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.VAN;
  vanType?: string;
  cargoFeatures?: string[];
  safetyFeatures?: string[];
  comfortFeatures?: string[];
  passengerFeatures?: string[];
  maintenanceHistory?: string;
  certifications?: string[];
  bodyFeatures?: string[];
  conversionFeatures?: string[];
  cargoVolume?: number;
  numberOfOwners?: number;
  engine?: string;
  engineType?: string;
  engineSize?: string;
  enginePowerOutput?: string;
  transmissionType?: string;
  driveType?: string;
  roofHeight?: string;
  interiorHeight?: string;
  interiorLength?: string;
  payload?: number;
  seatingCapacity?: number;
  wheelbase?: string;
  drivingAssistance?: string[];
  climateControl?: string[];
}

export interface BusDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.BUS;
  busType?: string;
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
  engineType?: string;
  engineConfiguration?: string;
  engineSize?: string;
  enginePowerOutput?: string;
  emissionClass?: string;
  fuelEfficiency?: string;
  serviceHistory?: string;
  modifications?: string[];
  customFeatures?: string[];
}

export interface TractorDetails extends BaseVehicleDetails {
  vehicleType: VehicleType.TRACTOR;
  attachments?: string[];
  fuelTankCapacity?: string;
  tires?: string;
  hydraulicSystem?: string;
  ptoType?: string;
  numberOfOwners?: number;
  serviceHistory?: boolean | string;
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
}

// Union type for all possible vehicle details
export type VehicleDetails = BaseVehicleDetails & {
  vehicleType: VehicleType;
} & (
    | (Omit<CarDetails, keyof BaseVehicleDetails> & {
        vehicleType: VehicleType.CAR;
      })
    | (Omit<MotorcycleDetails, keyof BaseVehicleDetails> & {
        vehicleType: VehicleType.MOTORCYCLE;
      })
    | (Omit<TruckDetails, keyof BaseVehicleDetails> & {
        vehicleType: VehicleType.TRUCK;
      })
    | (Omit<VanDetails, keyof BaseVehicleDetails> & {
        vehicleType: VehicleType.VAN;
      })
    | (Omit<BusDetails, keyof BaseVehicleDetails> & {
        vehicleType: VehicleType.BUS;
      })
    | (Omit<TractorDetails, keyof BaseVehicleDetails> & {
        vehicleType: VehicleType.TRACTOR;
      })
  );

export interface BaseRealEstateDetails {
  propertyType: PropertyType;
  area?: number;
  furnished?: boolean;
  features: string[];
  condition: Condition;
  utilities?: string[] | boolean;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
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
  latitude: number;
  longitude: number;
  images: Array<string | File>;
  image?: string;
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
    allowMessaging: boolean;
  };
}

export interface ListingUpdateInput {
  title: string;
  description: string;
  price: number;
  location: string;
  latitude: number;
  longitude: number;
  category: Category;
  details?: {
    vehicles?: Record<string, string | number | boolean | string[]>;
    realEstate?: Record<string, string | number | boolean | string[]>;
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
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

// Extended listing interface to include savedBy
export interface ExtendedListing extends Listing {
  savedBy?: Array<{ id: string }>;
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

// New RealEstateDetails interface based on Prisma schema
export interface RealEstateDetails {
  id: string;
  propertyType: PropertyType;
  condition?: Condition;
  listingId: string;
  constructionType?: string;
  features: string[];
  parking?: string;
  accessibilityFeatures: string[];
  balcony?: boolean;
  buildingAmenities: string[];
  cooling?: string;
  elevator?: boolean;
  energyRating?: string;
  exposureDirection: string[];
  fireSafety: string[];
  floor?: number;
  flooringType?: string;
  furnished?: string;
  livingArea?: number;
  heating?: string;
  internetIncluded?: boolean;
  parkingType?: string;
  petPolicy?: string;
  renovationHistory?: string;
  securityFeatures: string[];
  storage?: boolean;
  storageType: string[];
  totalFloors?: number;
  utilities: string[];
  view?: string;
  windowType?: string;
  attic?: string;
  basement?: string;
  buildable?: string;
  buildingRestrictions?: string;
  elevation?: number;
  environmentalFeatures?: string;
  flooringTypes: string[];
  naturalFeatures?: string;
  parcelNumber?: string;
  permitsInPlace?: string;
  soilTypes: string[];
  topography: string[];
  waterFeatures?: string;
  bedrooms?: number;
  bathrooms?: number;
  size: number;
  yearBuilt: number;
  usageType?: string;
  houseDetails?: HouseDetails;
  apartmentDetails?: ApartmentDetails;
  condoDetails?: CondoDetails;
  landDetails?: LandDetails;
  commercialDetails?: CommercialDetails;
  otherDetails?: OtherDetails;
}

// Update ListingDetails and FormState to use the new RealEstateDetails interface
export interface ListingDetails {
  vehicles?: VehicleDetails;
  realEstate?: RealEstateDetails;
}
