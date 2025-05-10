import { listingsAPI } from "@/api/listings.api";
import { MessagesAPI } from "@/api/messaging.api";
import { useAuth } from "@/hooks/useAuth";
import { ListingAction, ListingCategory } from "@/types/enums";
import type { PropertyType, VehicleType } from "@/types/enums";
import type { Listing, ListingDetails } from "@/types/listings";
import type { ListingMessageInput } from "@/types/messaging";
import { formatCurrency } from "@/utils/formatUtils";
import { useEffect, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
const ImageGallery = lazy(
  () => import("@/components/listings/images/ImageGallery"),
);

interface ListingImage {
  url: string;
  id?: string;
  listingId?: string;
  order?: number;
}

interface ExtendedListing extends Listing {
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
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
  const { t } = useTranslation();
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
          JSON.stringify(response.data?.details, null, 2),
        );
        console.log(
          "FULL Response Data:",
          JSON.stringify(response.data, null, 2),
        );

        // Log specific vehicle details for debugging
        if (response.data?.details?.vehicles) {
          console.log(
            "Vehicle details (raw):",
            JSON.stringify(response.data.details.vehicles, null, 2),
          );

          // Log each individual field for debugging
          const vehicles = response.data.details.vehicles;
          console.log("Vehicle fields available:", Object.keys(vehicles));

          // Check specific fields that might be missing
          console.log("Checking specific fields:");
          console.log("- make:", vehicles.make);
          console.log("- model:", vehicles.model);
          console.log("- year:", vehicles.year);
          console.log("- mileage:", vehicles.mileage);
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
          JSON.stringify(details, null, 2),
        );
        console.log(
          "Vehicle details before:",
          details.vehicles
            ? JSON.stringify(details.vehicles, null, 2)
            : "No vehicle details",
        );

        // Transform vehicle details if present
        // Determine category type
        const isVehicleListing =
          category.mainCategory === ListingCategory.VEHICLES;

        // Transform the features array into a boolean object
        const transformFeatures = (
          features: Record<string, boolean> | undefined,
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
              features.automaticEmergencyBraking,
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
                  registrationStatus: details.vehicles.registrationStatus,
                  accidentFree: Boolean(details.vehicles.accidentFree),
                  customsCleared: Boolean(details.vehicles.customsCleared),
                  bodyType: details.vehicles.bodyType || "",
                  roofType: details.vehicles.roofType || "",
                  warrantyPeriod: details.vehicles.warrantyPeriod || "",
                  serviceHistoryDetails:
                    details.vehicles.serviceHistoryDetails ||
                    t("common.notProvided"),
                  additionalNotes: details.vehicles.additionalNotes || "",

                  // Individual feature fields
                  frontAirbags: Boolean(details.vehicles.frontAirbags),
                  sideAirbags: Boolean(details.vehicles.sideAirbags),
                  curtainAirbags: Boolean(details.vehicles.curtainAirbags),
                  kneeAirbags: Boolean(details.vehicles.kneeAirbags),

                  cruiseControl: Boolean(details.vehicles.cruiseControl),
                  laneDepartureWarning: Boolean(
                    details.vehicles.laneDepartureWarning,
                  ),
                  laneKeepAssist: Boolean(details.vehicles.laneKeepAssist),
                  automaticEmergencyBraking: Boolean(
                    details.vehicles.automaticEmergencyBraking,
                  ),

                  blindSpotMonitor: Boolean(details.vehicles.blindSpotMonitor),
                  laneAssist: Boolean(details.vehicles.laneAssist),
                  adaptiveCruiseControl: Boolean(
                    details.vehicles.adaptiveCruiseControl,
                  ),
                  tractionControl: Boolean(details.vehicles.tractionControl),
                  abs: Boolean(details.vehicles.abs),
                  emergencyBrakeAssist: Boolean(
                    details.vehicles.emergencyBrakeAssist,
                  ),
                  tirePressureMonitoring: Boolean(
                    details.vehicles.tirePressureMonitoring,
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
                    details.vehicles.rearSeatEntertainment,
                  ),

                  ledHeadlights: Boolean(details.vehicles.ledHeadlights),
                  adaptiveHeadlights: Boolean(
                    details.vehicles.adaptiveHeadlights,
                  ),
                  ambientLighting: Boolean(details.vehicles.ambientLighting),
                  fogLights: Boolean(details.vehicles.fogLights),
                  automaticHighBeams: Boolean(
                    details.vehicles.automaticHighBeams,
                  ),

                  keylessEntry: Boolean(details.vehicles.keylessEntry),
                  sunroof: Boolean(details.vehicles.sunroof),
                  spareKey: Boolean(details.vehicles.spareKey),
                  remoteStart: Boolean(details.vehicles.remoteStart),
                  powerTailgate: Boolean(details.vehicles.powerTailgate),
                  autoDimmingMirrors: Boolean(
                    details.vehicles.autoDimmingMirrors,
                  ),
                  rainSensingWipers: Boolean(
                    details.vehicles.rainSensingWipers,
                  ),

                  engineSize: details.vehicles.engineSize || "",
                  horsepower: details.vehicles.horsepower || 0,
                  torque: details.vehicles.torque || 0,
                  brakeType: details.vehicles.brakeType || "",
                  driveType: details.vehicles.driveType || "",
                  wheelSize: details.vehicles.wheelSize || "",
                  wheelType: details.vehicles.wheelType || "",
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
                    ([key, value]) => key === feature && value,
                  );
                })
              : [],
          cameraFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.cameraFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value,
                  );
                })
              : [],
          climateFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.climateFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value,
                  );
                })
              : [],
          enternmentFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.enternmentFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value,
                  );
                })
              : [],
          lightingFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.lightingFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value,
                  );
                })
              : [],
          convenienceFeatures:
            isVehicleListing && vehicleDetails
              ? featuresDetails.convenienceFeatures.filter((feature) => {
                  return Object.entries(vehicleDetails).some(
                    ([key, value]) => key === feature && value,
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
          {t("common.goBack")}
        </button>
      </div>
    );
  }

  // Early return if no listing
  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 mb-4">{t("listings.notFound")}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          {t("common.goBack")}
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
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium mt-4 sm:mt-0 shadow"
                  style={{ minWidth: 0 }}
                  title={t("listings.contactSeller") as string}
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
                  <span>{t("listings.contactSeller")}</span>
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
              {t("listings.basicInformation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("listings.title")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {listing.title}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("listings.price")}
                </p>
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(listing.price)}
                  {listing.listingAction?.toLowerCase() === "rent" && "/month"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("listings.location")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {listing.location}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("listings.listingAction")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {listing.listingAction || t("common.notProvided")}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          {isVehicle && listing?.details?.vehicles && (
            <div className=" ">
              {/* <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        {t("listings.vehicleDetails")}
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
                      {t("listings.essentialDetails")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listing?.details?.vehicles?.make && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("listings.fields.make")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.make}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.model && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("listings.fields.model")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.model}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.year && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("listings.fields.year")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.year}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.mileage && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("listings.fields.mileage")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.mileage}{" "}
                            {t("listings.fields.mileage")}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.fuelType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("listings.fields.fuelType")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(
                              `listings.fields.fuelTypes.${listing?.details?.vehicles?.fuelType}`,
                            )}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles?.transmissionType ||
                        listing?.details?.vehicles?.transmission) && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("listings.fields.transmission")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(
                              `listings.fields.transmissionTypes.${(listing?.details?.vehicles?.transmissionType || listing?.details?.vehicles?.transmission)}`,
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
                      {t("listings.appearance")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listing?.details?.vehicles?.color && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("listings.exteriorColor")}
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
                            {t("listings.interiorColor")}
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
                            {t("listings.fields.condition")}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {t(
                              `listings.fields.conditions.${listing?.details?.vehicles?.condition}`,
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
                  listing?.details?.vehicles?.registrationStatus) && (
                  <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Vehicle History
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Vehicle Owner */}
                      {(listing?.details?.vehicles?.numberOfOwners ||
                        listing?.details?.vehicles?.previousOwners) && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Vehicle Owner(s)
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
                            Service History
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(listing?.details?.vehicles as any)?.serviceHistory
                              ? t("common.yes")
                              : t("common.no")}
                          </p>
                        </div>
                      )}
                      {/* Accident Free */}
                      {(listing?.details?.vehicles as any)?.accidentFree !==
                        undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Accident Free
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(listing?.details?.vehicles as any)?.accidentFree
                              ? t("common.yes")
                              : t("common.no")}
                          </p>
                        </div>
                      )}
                      {/* Warranty */}
                      {listing?.details?.vehicles?.warranty && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Warranty
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.warranty}
                          </p>
                        </div>
                      )}
                      {/* Registration Status */}
                      {listing?.details?.vehicles?.registrationStatus && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Registration Status
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.registrationStatus}
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
                      Additional Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listing?.details?.vehicles?.vin && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            VIN
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.vin}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.engineNumber && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Engine Number
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.engineNumber}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles as any)?.importStatus && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Import Status
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(listing?.details?.vehicles as any)?.importStatus}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles as any)
                        ?.registrationExpiry && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Registration Expiry
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(
                              (
                                listing?.details?.vehicles as any
                              ).registrationExpiry,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles as any)?.insuranceType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Insurance Type
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(listing?.details?.vehicles as any)?.insuranceType}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.upholsteryMaterial && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Upholstery Material
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.upholsteryMaterial}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.tireCondition && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Tire Condition
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
                            Customs Cleared
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.customsCleared
                              ? t("listings.fields.yes")
                              : t("listings.fields.no")}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.warrantyPeriod && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Warranty Period
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.warrantyPeriod}
                          </p>
                        </div>
                      )}
                      {(listing?.details?.vehicles as any)
                        ?.serviceHistoryDetails && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Service History Details
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {
                              (listing?.details?.vehicles as any)
                                ?.serviceHistoryDetails
                            }
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.bodyType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Body Type
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.bodyType}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.roofType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Roof Type
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.roofType}
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
                  listing?.details?.vehicles?.wheelType) && (
                  <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Technical Details
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
                      {listing?.details?.vehicles?.engineSize && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Engine Size
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.engineSize}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.horsepower && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Horsepower
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.horsepower}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.torque && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Torque
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.torque}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.brakeType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Brake Type
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.brakeType}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.driveType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Drive Type
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.driveType}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.wheelSize && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Wheel Size
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.wheelSize}
                          </p>
                        </div>
                      )}
                      {listing?.details?.vehicles?.wheelType && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Wheel Type
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing?.details?.vehicles?.wheelType}
                          </p>
                        </div>
                      )}
                    </div>
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
                      {t("Vehicle Features")}
                    </h3>

                    {/* Safety Features */}
                    {features.safetyFeatures.length > 0 && (
                      <FeatureSection
                        title={t("Safety Features")}
                        features={features.safetyFeatures}
                      />
                    )}

                    {/* Camera Features */}
                    {features.cameraFeatures.length > 0 && (
                      <FeatureSection
                        title={t("Camera Features")}
                        features={features.cameraFeatures}
                      />
                    )}

                    {/* Climate Features */}
                    {features.climateFeatures.length > 0 && (
                      <FeatureSection
                        title={t("Climate Features")}
                        features={features.climateFeatures}
                      />
                    )}

                    {/* Entertainment Features */}
                    {features.enternmentFeatures.length > 0 && (
                      <FeatureSection
                        title={t("Entertainment Features")}
                        features={features.enternmentFeatures}
                      />
                    )}

                    {/* Lighting Features */}
                    {features.lightingFeatures.length > 0 && (
                      <FeatureSection
                        title={t("Lighting Features")}
                        features={features.lightingFeatures}
                      />
                    )}

                    {/* Convenience Features */}
                    {features.convenienceFeatures.length > 0 && (
                      <FeatureSection
                        title={t("Convenience Features")}
                        features={features.convenienceFeatures}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Real Estate Details */}
          {isRealEstate && listing?.details?.realEstate && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t("listings.propertyDetails")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("listings.propertyType")}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t(
                      `listings.propertyTypes.${listing?.details?.realEstate?.propertyType.toLowerCase()}`,
                    )}
                  </p>
                </div>
                {listing?.details?.realEstate?.size && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("listings.size")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.size} m²
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.bedrooms && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("listings.bedrooms")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.bedrooms}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.bathrooms && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("listings.bathrooms")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.bathrooms}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.yearBuilt && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("listings.yearBuilt")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.yearBuilt}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.condition && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("listings.condition")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t(
                        `listings.conditions.${listing.details.realEstate.condition?.toLowerCase() || ""}`,
                      )}
                    </p>
                  </div>
                )}
              </div>

              {listing?.details?.realEstate?.features &&
                listing?.details?.realEstate?.features?.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {t("listings.features")}
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
                        ),
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
                {t("listings.description")}
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
