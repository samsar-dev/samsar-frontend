import { listingsAPI } from "@/api/listings.api";
import { MessagesAPI } from "@/api/messaging.api";
import { useAuth } from "@/hooks/useAuth";
import { ListingAction, ListingCategory } from "@/types/enums";
import type { PropertyType, VehicleType } from "@/types/enums";
import type { Listing, ListingDetails, MotorcycleDetails } from "@/types/listings";
import type { ListingMessageInput } from "@/types/messaging";
import { formatCurrency } from "@/utils/formatUtils";
import { useEffect, useState, lazy, Suspense } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { normalizeLocation } from '@/utils/locationUtils';
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
const ImageGallery = lazy(
  () => import("@/components/listings/images/ImageGallery")
);



interface ExtendedListing extends Listing {
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
    allowMessaging: boolean;
  };
}

interface Features {
  safetyFeatures: string[];
  cameraFeatures: string[];
  climateFeatures: string[];
  enternmentFeatures: string[];
  lightingFeatures: string[];
  convenienceFeatures: string[];
}

// Using types directly from listings.ts
import { LoadingSpinner } from "@/api";
import FeatureSection from "./FeatureSection";

// Type guard to check if vehicle details are for a motorcycle
const isMotorcycleDetails = (details: any): details is MotorcycleDetails => {
  return details?.vehicleType === 'MOTORCYCLE';
};

const featuresDetails = {
  safetyFeatures: [
    "blindSpotMonitor",
    "laneAssist",
    "adaptiveCruiseControl",
    "tractionControl",
    "abs",
    "emergencyBrakeAssist",
    "tirePressureMonitoring",
    "parkingSensors",
    "frontAirbags",
    "sideAirbags",
    "curtainAirbags",
    "kneeAirbags",
    "cruiseControl",
    "laneDepartureWarning",
    "laneKeepAssist",
    "automaticEmergencyBraking",
  ],
  cameraFeatures: ["rearCamera", "camera360", "dashCam", "nightVision"],
  climateFeatures: [
    "climateControl",
    "heatedSeats",
    "ventilatedSeats",
    "dualZoneClimate",
    "rearAC",
    "airQualitySensor",
  ],
  enternmentFeatures: [
    "bluetooth",
    "appleCarPlay",
    "androidAuto",
    "premiumSound",
    "wirelessCharging",
    "usbPorts",
    "cdPlayer",
    "dvdPlayer",
    "rearSeatEntertainment",
  ],
  lightingFeatures: [
    "ledHeadlights",
    "adaptiveHeadlights",
    "ambientLighting",
    "fogLights",
    "automaticHighBeams",
  ],
  convenienceFeatures: [
    "keylessEntry",
    "sunroof",
    "spareKey",
    "remoteStart",
    "powerTailgate",
    "autoDimmingMirrors",
    "rainSensingWipers",
  ],
};

const ListingDetails = () => {
  const { t } = useTranslation(["listings", "common", "locations"]);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<ExtendedListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [features, setFeatures] = useState<Features>({
    safetyFeatures: [],
    cameraFeatures: [],
    climateFeatures: [],
    enternmentFeatures: [],
    lightingFeatures: [],
    convenienceFeatures: [],
  });

  useEffect(() => {
    const initializeAndFetchListing = async () => {
      if (!id) {
        setError("No listing ID provided");
        setLoading(false);
        return;
      }
      try {
        const response = await listingsAPI.getById(id);
        console.log("Got response:", response);

        // Log the full response data for debugging advanced details
        console.log(
          "Response data details:",
          JSON.stringify(response.data?.details, null, 2)
        );
        console.log(
          "FULL Response Data:",
          JSON.stringify(response.data, null, 2)
        );

        // Log specific vehicle details for debugging
        if (response.data?.details?.vehicles) {
          console.log(
            "Vehicle details (raw):",
            JSON.stringify(response.data.details.vehicles, null, 2)
          );

          // Log each individual field for debugging
          const vehicles = response.data.details.vehicles;
          console.log("Vehicle fields available:", Object.keys(vehicles));

          // Check specific fields that might be missing
          console.log("Checking specific fields:");
          console.log("- make:", vehicles.make);
          console.log("- model:", t("model", { ns: "listings" }), ":", vehicles.model);
          console.log("- year:", t("year", { ns: "listings" }), ":", vehicles.year);
          console.log("- mileage:", t("mileage", { ns: "listings" }), ":", vehicles.mileage);
          console.log("- color:", vehicles.color);
          console.log("- condition:", vehicles.condition);
          console.log("- features:", vehicles.features);
          console.log("- horsepower:", vehicles.horsepower);
          console.log("- torque:", vehicles.torque);
        }

        if (!response.success || !response.data) {
          const error = response.error || "Failed to load listing";
          console.error("API error:", error);
          setError(error);
          setLoading(false);
          return;
        }

        const listing = response.data;
        console.log("Listing data:", listing);
        console.log("Listing images:", listing.images);

        if (!listing) {
          console.error("No listing data in response");
          setError("Listing not found");
          setLoading(false);
          return;
        }

        // Ensure images are in the correct format
        const processedImages = (listing.images || [])
          .map((img: string | File) => {
            if (typeof img === "string") return img;
            if (img instanceof File) {
              // Create URL from File object
              return URL.createObjectURL(img);
            }
            return "";
          })
          .filter(Boolean);

        console.log("Processed images:", processedImages);

        const {
          category,
          details = {},
          listingAction,
          status,
          ...rest
        } = listing;

        console.log("Listing category:", category);

        // Log all the details to debug what's available
        console.log(
          "Details before transformation:",
          JSON.stringify(details, null, 2)
        );
        console.log(
          "Vehicle details before:",
          details.vehicles
            ? JSON.stringify(details.vehicles, null, 2)
            : "No vehicle details"
        );

        // Transform vehicle details if present
        // Determine category type
        const isVehicleListing =
          category.mainCategory === ListingCategory.VEHICLES;

        // Transform the features array into a boolean object
        const transformFeatures = (
          features: Record<string, boolean> | undefined
        ) => {
          if (!features) return {};

          // First, collect all top-level feature values
          const transformedFeatures: Record<string, boolean> = {
            // Safety Features
            blindSpotMonitor: Boolean(features.blindSpotMonitor),
            laneAssist: Boolean(features.laneAssist),
            adaptiveCruiseControl: Boolean(features.adaptiveCruiseControl),
            tractionControl: Boolean(features.tractionControl),
            abs: Boolean(features.abs),
            emergencyBrakeAssist: Boolean(features.emergencyBrakeAssist),
            tirePressureMonitoring: Boolean(features.tirePressureMonitoring),

            // Camera Features
            rearCamera: Boolean(features.rearCamera),
            camera360: Boolean(features.camera360),
            dashCam: Boolean(features.dashCam),
            nightVision: Boolean(features.nightVision),
            parkingSensors: Boolean(features.parkingSensors),

            // Climate Features
            climateControl: Boolean(features.climateControl),
            heatedSeats: Boolean(features.heatedSeats),
            ventilatedSeats: Boolean(features.ventilatedSeats),
            dualZoneClimate: Boolean(features.dualZoneClimate),
            rearAC: Boolean(features.rearAC),
            airQualitySensor: Boolean(features.airQualitySensor),

            // Entertainment Features
            bluetooth: Boolean(features.bluetooth),
            appleCarPlay: Boolean(features.appleCarPlay),
            androidAuto: Boolean(features.androidAuto),
            premiumSound: Boolean(features.premiumSound),
            wirelessCharging: Boolean(features.wirelessCharging),
            usbPorts: Boolean(features.usbPorts),
            cdPlayer: Boolean(features.cdPlayer),
            dvdPlayer: Boolean(features.dvdPlayer),
            rearSeatEntertainment: Boolean(features.rearSeatEntertainment),

            // Lighting Features
            ledHeadlights: Boolean(features.ledHeadlights),
            adaptiveHeadlights: Boolean(features.adaptiveHeadlights),
            ambientLighting: Boolean(features.ambientLighting),
            fogLights: Boolean(features.fogLights),
            automaticHighBeams: Boolean(features.automaticHighBeams),

            // Convenience Features
            keylessEntry: Boolean(features.keylessEntry),
            sunroof: Boolean(features.sunroof),
            spareKey: Boolean(features.spareKey),
            remoteStart: Boolean(features.remoteStart),
            powerTailgate: Boolean(features.powerTailgate),
            autoDimmingMirrors: Boolean(features.autoDimmingMirrors),
            rainSensingWipers: Boolean(features.rainSensingWipers),

            // Airbags
            frontAirbags: Boolean(features.frontAirbags),
            sideAirbags: Boolean(features.sideAirbags),
            curtainAirbags: Boolean(features.curtainAirbags),
            kneeAirbags: Boolean(features.kneeAirbags),

            // Driver Assistance
            cruiseControl: Boolean(features.cruiseControl),
            laneDepartureWarning: Boolean(features.laneDepartureWarning),
            laneKeepAssist: Boolean(features.laneKeepAssist),
            automaticEmergencyBraking: Boolean(
              features.automaticEmergencyBraking
            ),
          };

          // Now merge in any additional feature properties we didn't explicitly handle
          Object.keys(features).forEach((key) => {
            if (
              typeof features[key] === "boolean" &&
              transformedFeatures[key] === undefined
            ) {
              transformedFeatures[key] = features[key];
            }
          });

          return transformedFeatures;
        };

        const transformedDetails = {
          vehicles:
            isVehicleListing && details.vehicles
              ? ({
                  vehicleType: details.vehicles.vehicleType,
                  make: details.vehicles.make,
                  model: details.vehicles.model,
                  year: details.vehicles.year,
                  mileage: details.vehicles.mileage,
                  fuelType: details.vehicles.fuelType,
                  transmissionType:
                    details.vehicles.transmissionType ||
                    details.vehicles.transmission,
                  color: details.vehicles.color,
                  condition: details.vehicles.condition,
                  features: details.vehicles.features,
                  interiorColor: details.vehicles.interiorColor,
                  engine: details.vehicles.engine || "",
                  warranty: details.vehicles.warranty,
                  serviceHistory: Boolean(details.vehicles.serviceHistory),
                  previousOwners: details.vehicles.previousOwners,
                  registrationStatus: details.vehicles.registrationStatus || 'unregistered', // Default to 'unregistered' if not provided
                  accidentFree: Boolean(details.vehicles.accidentFree),
                  customsCleared: Boolean(details.vehicles.customsCleared),
                  bodyType: details.vehicles.bodyType || "",
                  roofType: details.vehicles.roofType || "",
                  warrantyPeriod: details.vehicles.warrantyPeriod || "",
                  serviceHistoryDetails: details.vehicles.serviceHistoryDetails || "",
                  additionalNotes: details.vehicles.additionalNotes || "",

                  // Individual feature fields
                  frontAirbags: Boolean(details.vehicles.frontAirbags),
                  sideAirbags: Boolean(details.vehicles.sideAirbags),
                  curtainAirbags: Boolean(details.vehicles.curtainAirbags),
                  kneeAirbags: Boolean(details.vehicles.kneeAirbags),

                  cruiseControl: Boolean(details.vehicles.cruiseControl),
                  laneDepartureWarning: Boolean(
                    details.vehicles.laneDepartureWarning
                  ),
                  laneKeepAssist: Boolean(details.vehicles.laneKeepAssist),
                  automaticEmergencyBraking: Boolean(
                    details.vehicles.automaticEmergencyBraking
                  ),

                  blindSpotMonitor: Boolean(details.vehicles.blindSpotMonitor),
                  laneAssist: Boolean(details.vehicles.laneAssist),
                  adaptiveCruiseControl: Boolean(
                    details.vehicles.adaptiveCruiseControl
                  ),
                  tractionControl: Boolean(details.vehicles.tractionControl),
                  abs: Boolean(details.vehicles.abs),
                  emergencyBrakeAssist: Boolean(
                    details.vehicles.emergencyBrakeAssist
                  ),
                  tirePressureMonitoring: Boolean(
                    details.vehicles.tirePressureMonitoring
                  ),

                  rearCamera: Boolean(details.vehicles.rearCamera),
                  camera360: Boolean(details.vehicles.camera360),
                  dashCam: Boolean(details.vehicles.dashCam),
                  nightVision: Boolean(details.vehicles.nightVision),
                  parkingSensors: Boolean(details.vehicles.parkingSensors),

                  climateControl: Boolean(details.vehicles.climateControl),
                  heatedSeats: Boolean(details.vehicles.heatedSeats),
                  ventilatedSeats: Boolean(details.vehicles.ventilatedSeats),
                  dualZoneClimate: Boolean(details.vehicles.dualZoneClimate),
                  rearAC: Boolean(details.vehicles.rearAC),
                  airQualitySensor: Boolean(details.vehicles.airQualitySensor),

                  bluetooth: Boolean(details.vehicles.bluetooth),
                  appleCarPlay: Boolean(details.vehicles.appleCarPlay),
                  androidAuto: Boolean(details.vehicles.androidAuto),
                  premiumSound: Boolean(details.vehicles.premiumSound),
                  wirelessCharging: Boolean(details.vehicles.wirelessCharging),
                  usbPorts: Boolean(details.vehicles.usbPorts),
                  cdPlayer: Boolean(details.vehicles.cdPlayer),
                  dvdPlayer: Boolean(details.vehicles.dvdPlayer),
                  rearSeatEntertainment: Boolean(
                    details.vehicles.rearSeatEntertainment
                  ),

                  ledHeadlights: Boolean(details.vehicles.ledHeadlights),
                  adaptiveHeadlights: Boolean(
                    details.vehicles.adaptiveHeadlights
                  ),
                  ambientLighting: Boolean(details.vehicles.ambientLighting),
                  fogLights: Boolean(details.vehicles.fogLights),
                  automaticHighBeams: Boolean(
                    details.vehicles.automaticHighBeams
                  ),

                  keylessEntry: Boolean(details.vehicles.keylessEntry),
                  sunroof: Boolean(details.vehicles.sunroof),
                  spareKey: Boolean(details.vehicles.spareKey),
                  remoteStart: Boolean(details.vehicles.remoteStart),
                  powerTailgate: Boolean(details.vehicles.powerTailgate),
                  autoDimmingMirrors: Boolean(
                    details.vehicles.autoDimmingMirrors
                  ),
                  rainSensingWipers: Boolean(
                    details.vehicles.rainSensingWipers
                  ),

                  // Engine & Performance
                  engineType: details.vehicles.engineType || "",
                  engineSize: details.vehicles.engineSize || "",
                  powerOutput: details.vehicles.powerOutput !== undefined ? details.vehicles.powerOutput : null,
                  horsepower: details.vehicles.horsepower !== undefined ? details.vehicles.horsepower : null,
                  torque: details.vehicles.torque !== undefined ? details.vehicles.torque : null,
                  fuelSystem: details.vehicles.fuelSystem || "",
                  coolingSystem: details.vehicles.coolingSystem || "",
                  
                  // Chassis & Suspension
                  frameType: details.vehicles.frameType || "",
                  frontSuspension: Array.isArray(details.vehicles.frontSuspension) ? details.vehicles.frontSuspension : [],
                  rearSuspension: Array.isArray(details.vehicles.rearSuspension) ? details.vehicles.rearSuspension : [],
                  brakeSystem: Array.isArray(details.vehicles.brakeSystem) ? details.vehicles.brakeSystem : [],
                  brakeType: details.vehicles.brakeType || "",
                  driveType: details.vehicles.driveType || "",
                  wheelSize: details.vehicles.wheelSize || "",
                  wheelType: details.vehicles.wheelType || "",
                  
                  // Starting & Electronics
                  startType: Array.isArray(details.vehicles.startType) ? details.vehicles.startType : [],
                  riderAids: Array.isArray(details.vehicles.riderAids) ? details.vehicles.riderAids : [],
                  electronics: Array.isArray(details.vehicles.electronics) ? details.vehicles.electronics : [],
                  lighting: Array.isArray(details.vehicles.lighting) ? details.vehicles.lighting : [],
                  
                  // Comfort & Ergonomics
                  seatType: Array.isArray(details.vehicles.seatType) ? details.vehicles.seatType : [],
                  seatHeight: details.vehicles.seatHeight || 0,
                  handlebarType: details.vehicles.handlebarType || "",
                  comfortFeatures: Array.isArray(details.vehicles.comfortFeatures) ? details.vehicles.comfortFeatures : [],
                  
                  // Storage & Accessories
                  storageOptions: Array.isArray(details.vehicles.storageOptions) ? details.vehicles.storageOptions : [],
                  protectiveEquipment: Array.isArray(details.vehicles.protectiveEquipment) ? details.vehicles.protectiveEquipment : [],
                  customParts: Array.isArray(details.vehicles.customParts) ? details.vehicles.customParts : [],
                  
                  // Documentation & History
                  modifications: details.vehicles.modifications || "",
                  emissions: details.vehicles.emissions || "",
                  importStatus: details.vehicles.importStatus || "",
                } as any)
              : undefined,
          realEstate:
            !isVehicleListing && details.realEstate
              ? {
                  ...details.realEstate,
                  features: details.realEstate.features || [],
                }
              : undefined,
        };

        // Then update the vehicleDetails assignment
        let vehicleDetails = transformedDetails.vehicles;
        if (vehicleDetails) {
          const subCategory = category.subCategory as VehicleType;

          // First ensure all required fields are present
          const baseVehicle = {
            ...vehicleDetails,
            vehicleType: subCategory,
            make: vehicleDetails.make || "",
            model: vehicleDetails.model || "",
            year: vehicleDetails.year || "",
            mileage: vehicleDetails.mileage || 0,
            color: vehicleDetails.color || "",
            condition: vehicleDetails.condition,
            fuelType: vehicleDetails.fuelType,
            transmissionType: vehicleDetails.transmissionType,
          };

          // Use 'as any' to bypass TypeScript checking for this specific assignment
          vehicleDetails = baseVehicle as any;
        }

        // Only set vehicle features if this is a vehicle listing and vehicleDetails exists
        setFeatures({
          safetyFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.safetyFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value
                  );
                })
              : [],
          cameraFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.cameraFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value
                  );
                })
              : [],
          climateFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.climateFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value
                  );
                })
              : [],
          enternmentFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.enternmentFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value
                  );
                })
              : [],
          lightingFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.lightingFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value
                  );
                })
              : [],
          convenienceFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.convenienceFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value
                  );
                })
              : [],
        });

        console.log("[ListingDetails] vehicleDetails:", vehicleDetails);
        setListing({
          ...rest,
          category: {
            mainCategory: category.mainCategory as ListingCategory,
            subCategory: category.subCategory as VehicleType | PropertyType,
          },
          details: {
            ...transformedDetails,
            vehicles: vehicleDetails as any,
          },
          listingAction: listing.listingAction as ListingAction,
          images: processedImages,
          seller: {
            id: listing.userId || "",
            username: listing.seller?.username || "Unknown Seller",
            profilePicture: listing.seller?.profilePicture || null,
            allowMessaging: listing.seller?.allowMessaging || true,
          },
        });
      } catch (error) {
        console.error("Error fetching listing:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load listing";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetchListing();
  }, [id, navigate, t]);

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      toast.error(t("common.loginRequired"));
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    setShowContactForm(true);
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated || !user || !listing) {
      toast.error(t("common.loginRequired"));
      return;
    }

    setIsSending(true);
    try {
      // Create a conversation if it doesn't exist
      const conversationResponse = await MessagesAPI.createConversation({
        participantIds: [user?.id || "", listing.userId || ""],
        initialMessage: message.trim(),
      });

      if (conversationResponse.success && conversationResponse.data) {
        const conversationId = conversationResponse.data._id;

        // Send the message using the correct structure
        const messageInput: ListingMessageInput = {
          content: message.trim(),
          listingId: id || "",
          recipientId: listing.userId || "",
        };
        const response = await MessagesAPI.sendMessage(messageInput);

        if (response.success) {
          toast.success(t("messages.messageSent"));
          setMessage("");
          setShowContactForm(false);
        } else {
          toast.error(response.error || t("common.errorOccurred"));
        }
      } else {
        toast.error(conversationResponse.error || t("common.errorOccurred"));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("common.errorOccurred"));
    } finally {
      setIsSending(false);
    }
  };

  // Early return for loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  // Early return if no listing
  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 mb-4">{t("notFound")}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  const isVehicle =
    listing.category.mainCategory.toLocaleLowerCase() ===
    ListingCategory.VEHICLES.toLocaleLowerCase();

  const isRealEstate =
    listing.category.mainCategory.toLocaleLowerCase() ===
    ListingCategory.REAL_ESTATE.toLocaleLowerCase();
  const isOwner = user?.id === listing.userId;

  console.log("features", features);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="w-full">
          <Suspense fallback={<div>Loading images...</div>}>
            <ImageGallery images={listing?.images || []} />
          </Suspense>
        </div>

        {/* Details Section */}
        <div className="space-y-8">
          {/* Title & Price Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 border border-gray-100 dark:border-gray-800">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-0">
              {listing?.title}
            </h1>
            <span className="inline-block bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-4 py-1 rounded-full text-lg font-medium shadow-sm">
              {listing?.price && formatCurrency(listing.price)}
              {listing?.listingAction?.toLowerCase() === ListingAction.RENT && (
                <span className="text-sm ml-1 font-normal">/mo</span>
              )}
            </span>
          </div>
          {/* Seller Info Card - Professional Layout */}
          {listing?.seller && (
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow p-5 border border-gray-100 dark:border-gray-800 mb-6">
              <Link
                to={`/users/${listing.seller.id}`}
                className="flex items-center gap-4 hover:text-blue-600 transition-colors"
                style={{ textDecoration: "none" }}
              >
                {listing.seller.profilePicture ? (
                  <img
                    src={listing.seller.profilePicture}
                    alt={listing.seller.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl text-gray-600 dark:text-gray-300 border-2 border-blue-500 shadow">
                    {listing.seller.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-base text-gray-900 dark:text-white">
                    {listing.seller.username}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Posted on:{" "}
                    <span className="font-medium">
                      {new Date(listing.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
              {!isOwner && !showContactForm && (
                <button
                  onClick={handleContactSeller}
                  className={` flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium mt-4 sm:mt-0 shadow ${listing?.seller.allowMessaging === false && "pointer-events-none opacity-50"}}`}
                  style={{ minWidth: 0 }}
                  title={t("contactSeller") as string}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12H8m0 0l4-4m-4 4l4 4"
                    />
                  </svg>
                  <span>{t("contactSeller")}</span>
                </button>
              )}
            </div>
          )}
          {/* End Seller Info Card */}

          {/* Contact Seller Form (shows only when triggered) */}
          {!isOwner && showContactForm && (
            <div className="mt-4">
              <div className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messages.enterMessage")}
                  className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSending}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium"
                  >
                    {isSending ? t("common.sending") : t("messages.send")}
                  </button>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t("basicInformation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("title")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {listing.title}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("price")}
                </p>
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(listing.price)}
                  {listing.listingAction?.toLowerCase() === "rent" && "/month"}
                </p>
              </div>
              <div className="space-y-1">
                {listing?.location && (
                  <>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("location")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {(() => {
                        const normalizedLocation = normalizeLocation(listing.location);
                        const locationText = normalizedLocation
                          ? t(`cities.${normalizedLocation}`, {
                              ns: 'locations',
                              defaultValue: listing.location,
                            })
                          : listing.location;

                        const allCities = t('cities', { returnObjects: true, ns: 'locations' }) || {};
                        const cityKeys = Object.keys(allCities);

                        // Debug logging
                        if (process.env.NODE_ENV === 'development') {
                          console.group('ListingDetails - Location Translation Debug');
                          console.log('Current language:', i18n.language);
                          console.log('Raw location:', listing.location);
                          console.log('Normalized location:', normalizedLocation);
                          console.log('Available city keys:', cityKeys);
                          console.log('Translation result:', locationText);
                          console.log('Using default value?', !normalizedLocation || !cityKeys.includes(normalizedLocation));
                          console.groupEnd();
                        }

                        // Create Google Maps search URL with language support
                        const currentLang = i18n.language;
                        const isRTL = currentLang === 'ar';
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}&hl=${currentLang}${isRTL ? '&gl=SA' : ''}`;
                        
                        return (
                          <a 
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 cursor-pointer inline-flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {locationText}
                            <svg 
                              className="w-4 h-4 ml-1 inline-block" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                              />
                            </svg>
                          </a>
                        );
                      })()}
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("listingAction")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {listing.listingAction === 'SALE' 
                    ? t("common.forSale")
                    : listing.listingAction === 'RENT' 
                      ? t("common.forRent")
                      : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          {isVehicle && listing?.details?.vehicles && (
            <div className=" ">
              {/* <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        {t("vehicleDetails")}
                     </h2> */}

              <div className="space-y-6">
                {/* Essential Details */}
                {(listing?.details?.vehicles?.make ||
                  listing?.details?.vehicles?.model ||
                  listing?.details?.vehicles?.year ||
                  listing?.details?.vehicles?.mileage ||
                  listing?.details?.vehicles?.fuelType ||
                  listing?.details?.vehicles?.transmissionType ||
                  listing?.details?.vehicles?.transmission) && (
                  <div className=" bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t("essentialDetails")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listing?.details?.vehicles?.make && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.make')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.make}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.model && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.model')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.model}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.year && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('listings.fields.year')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.year}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.mileage && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("fields.mileage")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {`${listing.details.vehicles.mileage.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : undefined)} ${i18n.language === 'ar' ? 'كم' : 'km'}`}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.fuelType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("fields.fuelType")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(
                              `fields.fuelTypes.${listing?.details?.vehicles?.fuelType}`
                            )}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles?.transmissionType ||
                        listing?.details?.vehicles?.transmission) && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('listings.fields.transmission')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(
                              `fields.transmissionTypes.${listing?.details?.vehicles?.transmissionType || listing?.details?.vehicles?.transmission}`,
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Appearance */}
                {(listing?.details?.vehicles?.color ||
                  listing?.details?.vehicles?.interiorColor ||
                  listing?.details?.vehicles?.condition) && (
                  <div className=" bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t("appearance")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listing?.details?.vehicles?.color && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("exteriorColor")}
                          </p>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                              style={{
                                backgroundColor:
                                  listing?.details?.vehicles?.color,
                              }}
                            />
                            <p className="font-medium text-gray-900 dark:text-white">
                              {listing?.details?.vehicles?.color}
                            </p>
                          </div>
                        </div>
                      )}
                      {listing?.details?.vehicles?.interiorColor && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("interiorColor")}
                          </p>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                              style={{
                                backgroundColor:
                                  listing?.details?.vehicles?.interiorColor,
                              }}
                            />
                            <p className="font-medium text-gray-900 dark:text-white">
                              {listing?.details?.vehicles?.interiorColor}
                            </p>
                          </div>
                        </div>
                      )}
                      {listing?.details?.vehicles?.condition && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("fields.condition")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(
                              `fields.conditions.${listing?.details?.vehicles?.condition}`
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Vehicle History Section */}
                {(listing?.details?.vehicles?.numberOfOwners ||
                  listing?.details?.vehicles?.previousOwners ||
                  (listing?.details?.vehicles as any)?.serviceHistory !==
                    undefined ||
                  (listing?.details?.vehicles as any)?.accidentFree !==
                    undefined ||
                  listing?.details?.vehicles?.warranty ||
                  (listing?.details?.vehicles?.registrationStatus !== undefined && 
                   listing?.details?.vehicles?.registrationStatus !== '')) && (
                  <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t('sections.vehicleHistory')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Vehicle Owner */}
                      {(listing?.details?.vehicles?.numberOfOwners ||
                        listing?.details?.vehicles?.previousOwners) && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.vehicleOwners')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.numberOfOwners ||
                              listing?.details?.vehicles?.previousOwners}
                          </p>
                        </div>
                      )}
                      {/* Service History */}
                      {(listing?.details?.vehicles as any)?.serviceHistory !==
                        undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.serviceHistory')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(listing?.details?.vehicles as any)?.serviceHistory
                              ? <CheckCircle className="w-5 h-5 text-green-500" />
                              : <XCircle className="w-5 h-5 text-red-500" />}
                          </p>
                        </div>
                      )}
                      {/* Accident Free */}
                      {(listing?.details?.vehicles as any)?.accidentFree !==
                        undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.accidentFree')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(listing?.details?.vehicles as any)?.accidentFree
                              ? <CheckCircle className="w-5 h-5 text-green-500" />
                              : <XCircle className="w-5 h-5 text-red-500" />}
                          </p>
                        </div>
                      )}
                      {/* Warranty */}
                      {listing?.details?.vehicles?.warranty && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.warranty')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.warranty === 'yes' 
                              ? <CheckCircle className="w-5 h-5 text-green-500" />
                              : <XCircle className="w-5 h-5 text-red-500" />}
                          </p>
                        </div>
                      )}
                      {/* Registration Status */}
                      {listing?.details?.vehicles?.registrationStatus && listing?.details?.vehicles?.registrationStatus !== '' && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.registrationStatus')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(`fields.registrationStatuses.${listing?.details?.vehicles?.registrationStatus}`, {
                              defaultValue: listing?.details?.vehicles?.registrationStatus
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {(listing?.details?.vehicles?.vin ||
                  listing?.details?.vehicles?.engineNumber ||
                  (listing?.details?.vehicles as any)?.importStatus ||
                  (listing?.details?.vehicles as any)?.registrationExpiry ||
                  (listing?.details?.vehicles as any)?.insuranceType ||
                  listing?.details?.vehicles?.upholsteryMaterial ||
                  listing?.details?.vehicles?.tireCondition ||
                  listing?.details?.vehicles?.customsCleared ||
                  listing?.details?.vehicles?.warrantyPeriod ||
                  (listing?.details?.vehicles as any)?.serviceHistoryDetails ||
                  listing?.details?.vehicles?.bodyType ||
                  listing?.details?.vehicles?.roofType) && (
                  <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t('additionalDetails', { ns: 'listings', defaultValue: 'Additional Details' })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listing?.details?.vehicles?.vin && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.vin')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.vin}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.engineNumber && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.engineNumber')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.engineNumber}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles as any)?.importStatus && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.importStatus')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(`importStatuses.${(listing?.details?.vehicles as any)?.importStatus?.toLowerCase()}`, { 
                              defaultValue: (listing?.details?.vehicles as any)?.importStatus 
                            })}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles as any)
                        ?.registrationExpiry && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.registrationExpiry')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(
                              (
                                listing?.details?.vehicles as any
                              ).registrationExpiry
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles as any)?.insuranceType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.insuranceType')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(listing?.details?.vehicles as any)?.insuranceType}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.upholsteryMaterial && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.upholsteryMaterial')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.upholsteryMaterial}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.tireCondition && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.tireCondition')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.tireCondition}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.customsCleared !==
                        undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.customsCleared')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.customsCleared
                              ? <CheckCircle className="w-5 h-5 text-green-500" />
                              : <XCircle className="w-5 h-5 text-red-500" />}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.warrantyPeriod && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.warrantyPeriod')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {`${listing.details.vehicles.warrantyPeriod} ${t('common:months')}`}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles as any)
                        ?.serviceHistoryDetails?.trim() && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.serviceHistoryDetails')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {
                              (listing?.details?.vehicles as any)
                                ?.serviceHistoryDetails.trim()
                            }
                          </p>
                        </div>
                      )}
                      {(() => {
                        // Safely access the vehicle details with proper typing
                        const vehicle = listing?.details?.vehicles;
                        if (!vehicle) return null;
                        
                        // Handle both bodyStyle and bodyType fields with type safety
                        const bodyValue = (vehicle as any)?.bodyStyle || (vehicle as any)?.bodyType;
                        if (!bodyValue?.trim()) return null;
                        
                        // Convert to lowercase and replace spaces with underscores for the translation key
                        const translationKey = `fields.bodyTypes.${bodyValue.toLowerCase().replace(/\s+/g, '')}`;
                        
                        return (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('fields.bodyType')}
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {t(translationKey, {
                                defaultValue: bodyValue,
                                ns: 'listings'
                              })}
                            </p>
                          </div>
                        );
                      })()}
                      {listing?.details?.vehicles?.roofType?.trim() && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.roofType')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(`fields.roofTypes.${listing.details.vehicles.roofType.toLowerCase()}`, {
                              defaultValue: listing.details.vehicles.roofType,
                              ns: 'listings'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                {(listing?.details?.vehicles?.engine ||
                  listing?.details?.vehicles?.engineSize ||
                  listing?.details?.vehicles?.horsepower ||
                  listing?.details?.vehicles?.torque ||
                  listing?.details?.vehicles?.brakeType ||
                  listing?.details?.vehicles?.driveType ||
                  listing?.details?.vehicles?.wheelSize ||
                  listing?.details?.vehicles?.wheelType ||
                  listing?.details?.vehicles?.engineNumber ||
                  listing?.details?.vehicles?.bodyType ||
                  listing?.details?.vehicles?.roofType ||
                  listing?.details?.vehicles?.navigationSystem ||
                  listing?.details?.vehicles?.importStatus ||
                  listing?.details?.vehicles?.registrationExpiry ||
                  listing?.details?.vehicles?.accidentFree) && (
                  <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t('sections.technicalDetails')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listing?.details?.vehicles?.engine && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Engine
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.engine}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.engineSize ? (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.engineSize')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.engineSize}
                          </p>
                        </div>
                      ) : null}
                      {listing?.details?.vehicles?.horsepower ? (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.horsepower')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.horsepower} {t('fields.hp')}
                          </p>
                        </div>
                      ) : null}
                      {listing?.details?.vehicles?.torque ? (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.torque')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.torque} {t('fields.nm')}
                          </p>
                        </div>
                      ) : null}
                      {(() => {
                        const brakeType = listing?.details?.vehicles?.brakeType;
                        // Only show if brakeType exists, is a non-empty string after trimming, and is not 'Not provided'
                        if (!brakeType || 
                            typeof brakeType !== 'string' || 
                            brakeType.trim() === '' ||
                            brakeType.toLowerCase() === 'not provided') {
                          return null;
                        }
                        
                        // Only show if we have a valid translation for this brake type
                        const translatedBrakeType = t(`fields.brakeSystemOptions.${brakeType}`, {
                          ns: 'listings',
                          defaultValue: ''
                        });
                        
                        if (!translatedBrakeType) {
                          return null;
                        }
                        
                        return (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t('brakeType', { ns: 'listings' })}
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {translatedBrakeType}
                            </p>
                          </div>
                        );
                      })()}
                      {listing?.details?.vehicles?.driveType?.trim() && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.driveType')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(`driveType.${listing.details.vehicles.driveType}`, {
                              defaultValue: listing.details.vehicles.driveType,
                              ns: 'listings'
                            })}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.registrationExpiry && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.registrationExpiry')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(listing.details.vehicles.registrationExpiry).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.accidentFree !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.accidentFree')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.accidentFree ? 
                              <CheckCircle className="w-5 h-5 text-green-500" /> : 
                              <XCircle className="w-5 h-5 text-red-500" />}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {(listing?.details?.vehicles?.serviceHistoryDetails ||
                  listing?.details?.vehicles?.additionalNotes ||
                  listing?.details?.vehicles?.customsCleared ||
                  listing?.details?.vehicles?.warranty ||
                  listing?.details?.vehicles?.warrantyPeriod ||
                  (listing?.details?.vehicles?.serviceHistory !== undefined && listing?.details?.vehicles?.serviceHistory !== null && 
                  (typeof listing.details.vehicles.serviceHistory === 'boolean' || 
                   typeof listing.details.vehicles.serviceHistory === 'string'))) && (
                  <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t('additionalInformation')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listing?.details?.vehicles?.customsCleared !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.customsCleared')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.customsCleared ? 
                              <CheckCircle className="w-5 h-5 text-green-500" /> : 
                              <XCircle className="w-5 h-5 text-red-500" />}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.serviceHistory && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.serviceHistory')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {Array.isArray(listing.details.vehicles.serviceHistory)
                              ? listing.details.vehicles.serviceHistory
                                  .map((item: any) => t(`fields.serviceHistoryTypes.${item}`))
                                  .join(', ')
                              : t(`fields.serviceHistoryTypes.${listing.details.vehicles.serviceHistory}`)}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.warranty && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.warranty')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.warranty === 'yes' 
                              ? <CheckCircle className="w-5 h-5 text-green-500" /> 
                              : <XCircle className="w-5 h-5 text-red-500" />}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.warrantyPeriod && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.warrantyPeriod')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {`${listing.details.vehicles.warrantyPeriod} ${t('common:months')}`}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.serviceHistoryDetails && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('fields.serviceHistoryDetails')}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.serviceHistoryDetails || t('common:notAvailable')}
                          </p>
                        </div>
                      )}
                    </div>
                    {(listing?.details?.vehicles?.serviceHistoryDetails?.trim() || 
                      listing?.details?.vehicles?.additionalNotes) && (
                      <div className="mt-4 space-y-4">
                        {listing?.details?.vehicles?.serviceHistoryDetails?.trim() && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              {t('fields.serviceHistoryDetails')}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                              {listing.details.vehicles.serviceHistoryDetails}
                            </p>
                          </div>
                        )}
                        {listing?.details?.vehicles?.additionalNotes && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              {t('fields.additionalNotes')}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                              {listing.details.vehicles.additionalNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Vehicle Features Section */}
                {(features.safetyFeatures.length > 0 ||
                  features.cameraFeatures.length > 0 ||
                  features.climateFeatures.length > 0 ||
                  features.enternmentFeatures.length > 0 ||
                  features.lightingFeatures.length > 0 ||
                  features.convenienceFeatures.length > 0) && (
                  <>
                    <h3 className="text-xl font-semibold mt-6 mb-4 text-gray-900 dark:text-white">
                      {t('listings:vehicleFeatures')}
                    </h3>

                    {/* Safety Features */}
                    {features.safetyFeatures.length > 0 && (
                      <FeatureSection
                        title="safetyFeatures"
                        features={features.safetyFeatures}
                      />
                    )}

                    {/* Camera Features */}
                    {features.cameraFeatures.length > 0 && (
                      <FeatureSection
                        title="cameraFeatures"
                        features={features.cameraFeatures}
                      />
                    )}

                    {/* Climate Features */}
                    {features.climateFeatures.length > 0 && (
                      <FeatureSection
                        title="climateFeatures"
                        features={features.climateFeatures}
                      />
                    )}

                    {/* Entertainment Features */}
                    {features.enternmentFeatures.length > 0 && (
                      <FeatureSection
                        title="entertainmentFeatures"
                        features={features.enternmentFeatures}
                      />
                    )}

                    {/* Lighting Features */}
                    {features.lightingFeatures.length > 0 && (
                      <FeatureSection
                        title="lightingFeatures"
                        features={features.lightingFeatures}
                      />
                    )}

                    {/* Convenience Features */}
                    {features.convenienceFeatures.length > 0 && (
                      <FeatureSection
                        title="convenienceFeatures"
                        features={features.convenienceFeatures}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Motorcycle Specific Details */}
          {listing?.details?.vehicles?.vehicleType?.toLowerCase() === 'motorcycle' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t('Motorcycle Details')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Engine & Performance */}
                {listing.details.vehicles.engineType && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.engineType')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t(`fields.engineTypes.${listing.details.vehicles.engineType}`)}
                    </p>
                  </div>
                )}

                {isMotorcycleDetails(listing.details.vehicles) && 
                 (listing.details.vehicles.enginePowerOutput !== null && listing.details.vehicles.enginePowerOutput !== undefined || 
                  listing.details.vehicles.powerOutput !== null && listing.details.vehicles.powerOutput !== undefined) && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.powerOutput')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing.details.vehicles.enginePowerOutput || listing.details.vehicles.powerOutput} {t('common.hp')}
                    </p>
                  </div>
                )}

                {listing.details.vehicles.torque !== null && listing.details.vehicles.torque !== undefined && listing.details.vehicles.torque > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.torque')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing.details.vehicles.torque} {t('common.nm')}
                    </p>
                  </div>
                )}

                {isMotorcycleDetails(listing.details.vehicles) && listing.details.vehicles.fuelSystem && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.fuelSystem')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t(`fields.fuelSystemTypes.${listing.details.vehicles.fuelSystem}`)}
                    </p>
                  </div>
                )}

                {listing.details.vehicles.coolingSystem && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.coolingSystem')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t(`fields.coolingSystemTypes.${listing.details.vehicles.coolingSystem}`)}
                    </p>
                  </div>
                )}

                {listing.details.vehicles.engineSize && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.engineSize')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {typeof listing.details.vehicles.engineSize === 'string' 
                        ? listing.details.vehicles.engineSize.replace(/\s*cc\s*/i, '') + ' cc'
                        : listing.details.vehicles.engineSize + ' cc'}
                    </p>
                  </div>
                )}

                {listing.details.vehicles.brakeSystem && listing.details.vehicles.brakeSystem.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.brakeSystem')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.brakeSystem.map((brake: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
                          {t(`fields.brakeSystems.${brake}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chassis & Suspension */}
                {listing.details.vehicles.frameType && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.frameType')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t(`fields.frameTypes.${listing.details.vehicles.frameType}`)}
                    </p>
                  </div>
                )}

                {listing.details.vehicles.frontSuspension && 
                 Array.isArray(listing.details.vehicles.frontSuspension) && 
                 listing.details.vehicles.frontSuspension.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.frontSuspension')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.frontSuspension.map((type: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-xs rounded-full">
                          {t(`fields.suspensionTypes.${type}`, { defaultValue: type })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {listing.details.vehicles.rearSuspension && 
                 Array.isArray(listing.details.vehicles.rearSuspension) && 
                 listing.details.vehicles.rearSuspension.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.rearSuspension')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.rearSuspension.map((type: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-xs rounded-full">
                          {t(`fields.suspensionTypes.${type}`, { defaultValue: type })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rider Aids & Electronics */}
                {listing.details.vehicles.startType && 
                 Array.isArray(listing.details.vehicles.startType) && 
                 listing.details.vehicles.startType.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.startType')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(listing.details.vehicles.startType) 
                        ? listing.details.vehicles.startType.map((type: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
                              {t(`fields.startTypes.${type}`)}
                            </span>
                          ))
                        : (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs rounded-full">
                              {t('fields.startTypes.' + listing.details.vehicles.startType, { defaultValue: listing.details.vehicles.startType })}
                            </span>
                          )}
                    </div>
                  </div>
                )}

                {listing.details.vehicles.electronics && listing.details.vehicles.electronics.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.electronics')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.electronics.map((item: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 text-xs rounded-full">
                          {t(`fields.electronicsTypes.${item}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {isMotorcycleDetails(listing.details.vehicles) && listing.details.vehicles.lighting && listing.details.vehicles.lighting.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.lighting')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.lighting.map((item: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 text-xs rounded-full">
                          {t(`fields.lightingTypes.${item}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {listing.details.vehicles.riderAids && listing.details.vehicles.riderAids.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.riderAids')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.riderAids.map((aid: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">
                          {t(`fields.riderAidTypes.${aid}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comfort & Ergonomics */}
                {listing.details.vehicles.seatType && 
                 Array.isArray(listing.details.vehicles.seatType) && 
                 listing.details.vehicles.seatType.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.seatType')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(listing.details.vehicles.seatType) 
                        ? listing.details.vehicles.seatType.map((type: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">
                              {t(`fields.seatTypes.${type}`)}
                            </span>
                          ))
                        : (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">
                              {t('fields.seatTypes.' + listing.details.vehicles.seatType, { defaultValue: listing.details.vehicles.seatType })}
                            </span>
                          )}
                    </div>
                  </div>
                )}

                {listing.details.vehicles.handlebarType && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.handlebarType')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t(`fields.handlebarTypes.${listing.details.vehicles.handlebarType}`)}
                    </p>
                  </div>
                )}

                {isMotorcycleDetails(listing.details.vehicles) && listing.details.vehicles.comfortFeatures && listing.details.vehicles.comfortFeatures.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.comfortFeatures')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.comfortFeatures.map((feature: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-100 text-xs rounded-full">
                          {t(`fields.comfortFeatureTypes.${feature}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {listing.details.vehicles.seatHeight && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.seatHeight')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing.details.vehicles.seatHeight} mm
                    </p>
                  </div>
                )}

                {/* Storage & Accessories */}
                {listing.details.vehicles.wheelType && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.wheelType')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t(`fields.wheelTypes.${listing.details.vehicles.wheelType}`)}
                    </p>
                  </div>
                )}

                {listing.details.vehicles.storageOptions && listing.details.vehicles.storageOptions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.storageOptions')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.storageOptions.map((option: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-xs rounded-full">
                          {t(`fields.storageOptionTypes.${option}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {isMotorcycleDetails(listing.details.vehicles) && listing.details.vehicles.customParts && listing.details.vehicles.customParts.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.customParts')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.customParts.map((part: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-100 text-xs rounded-full">
                          {t(`fields.customPartTypes.${part}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {listing.details.vehicles.protectiveEquipment && listing.details.vehicles.protectiveEquipment.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.protectiveEquipment')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.protectiveEquipment.map((equipment: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 text-xs rounded-full">
                          {t(`fields.protectiveEquipmentTypes.${equipment}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documentation & History */}
                {listing.details.vehicles.serviceHistory && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.serviceHistory')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(listing.details.vehicles.serviceHistory) 
                        ? listing.details.vehicles.serviceHistory.map((item: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 text-xs rounded-full">
                              {t(`fields.serviceHistoryTypes.${item}`)}
                            </span>
                          ))
                        : (
                            <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-100 text-xs rounded-full">
                              {t(`fields.serviceHistoryTypes.${listing.details.vehicles.serviceHistory}`)}
                            </span>
                          )}
                    </div>
                  </div>
                )}

                {listing.details.vehicles.ownershipHistory && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.ownershipHistory')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing.details.vehicles.ownershipHistory}
                    </p>
                  </div>
                )}

                {isMotorcycleDetails(listing.details.vehicles) && listing.details.vehicles.customFeatures && listing.details.vehicles.customFeatures.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.customFeatures')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {listing.details.vehicles.customFeatures.map((feature: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {listing.details.vehicles.serviceHistory && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.serviceHistory')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing.details.vehicles.serviceHistory}
                    </p>
                  </div>
                )}

                {listing.details.vehicles.accidentHistory !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.accidentHistory')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing.details.vehicles.accidentHistory ? t('common.yes') : t('common.no')}
                    </p>
                  </div>
                )}

                {listing.details.vehicles.ownerManual !== undefined && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('fields.ownerManual')}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing.details.vehicles.ownerManual ? t('common.yes') : t('common.no')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Real Estate Details */}
          {isRealEstate && listing?.details?.realEstate && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t("propertyDetails")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("propertyType")}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t(
                      `propertyTypes.${listing?.details?.realEstate?.propertyType.toLowerCase()}`
                    )}
                  </p>
                </div>
                {listing?.details?.realEstate?.size && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("size")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.size} m²
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.bedrooms && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("bedrooms")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.bedrooms}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.bathrooms && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("bathrooms")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.bathrooms}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.yearBuilt && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("yearBuilt")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.yearBuilt}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.condition && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("condition")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t(
                        `conditions.${listing.details.realEstate.condition?.toLowerCase() || ""}`
                      )}
                    </p>
                  </div>
                )}
              </div>

              {listing?.details?.realEstate?.features &&
                listing?.details?.realEstate?.features?.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t("features")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.details.realEstate.features.map(
                        (feature: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-200"
                          >
                            {feature}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-base font-semibold mb-4 text-gray-900 dark:text-white">
                {t("description")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
