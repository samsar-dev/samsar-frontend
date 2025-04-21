import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MessagesAPI } from "@/api/messaging.api";
import { 
  Listing, 
  CarDetails, 
  MotorcycleDetails, 
  TruckDetails, 
  VanDetails, 
  BusDetails, 
  TractorDetails, 
  BaseVehicleDetails,
  VehicleDetails 
} from "@/types/listings";
import {
  ListingCategory,
  VehicleType,
  PropertyType,
  FuelType,
  TransmissionType,
  Condition,
  ListingAction,
} from "@/types/enums";
import type { ListingMessageInput } from "@/types/messaging";
import { toast } from "react-toastify";
import { listingsAPI } from "@/api/listings.api";
import { useTranslation } from "react-i18next";
import TokenManager from "@/utils/tokenManager";
import { formatCurrency } from "@/utils/format";
import ImageGallery from "@/components/listings/images/ImageGallery";
import { Link } from "react-router-dom";

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

// Using types directly from listings.ts
import type { ListingDetails } from "@/types/listings";
import { LoadingSpinner } from "@/api";

const ListingDetails: React.FC = () => {
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

  useEffect(() => {
    // Debug log
    const token = TokenManager.getAccessToken();
    console.log('Auth debug:', { isAuthenticated, token });

    // Only run fetch if both are present
    if (!isAuthenticated || !token) {
      // Don't show error immediately; wait for auth state to resolve
      if (isAuthenticated === false) {
        setError(t('common.loginRequired'));
        setLoading(false);
      }
      return;
    }

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
          throw new Error(error);
        }

        const listing = response.data;
        console.log("Listing data:", listing);
        console.log("Listing images:", listing.images);

        if (!listing) {
          console.error("No listing data in response");
          throw new Error("Listing not found");
        }

        // Ensure images are in the correct format
        const processedImages = (listing.images || [])
          .map((img: string | File) => {
            if (typeof img === 'string') return img;
            if (img instanceof File) {
              // Create URL from File object
              return URL.createObjectURL(img);
            }
            return '';
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
        const isVehicleListing = category.mainCategory === ListingCategory.VEHICLES;
        
        const transformedDetails = {
          vehicles: isVehicleListing && details.vehicles
            ? {
                ...details.vehicles,
                vehicleType: category.subCategory as VehicleType,
                features: details.vehicles.features || {} as Record<string, any>,
                // Essential fields
                make: details.vehicles.make || "",
                model: details.vehicles.model || "",
                year: details.vehicles.year || "",
                mileage: typeof details.vehicles.mileage === "string" ? parseInt(details.vehicles.mileage, 10) : (details.vehicles.mileage || 0),
                color: details.vehicles.color || "",
                interiorColor: details.vehicles.interiorColor || "",
                condition: details.vehicles.condition || Condition.GOOD,
                transmissionType: details.vehicles.transmissionType || TransmissionType.AUTOMATIC,
                transmission: details.vehicles.transmission || "",
                fuelType: details.vehicles.fuelType || "",
                // Advanced fields
                vin: details.vehicles.vin || "",
                engineNumber: details.vehicles.engineNumber || "",
                // Handle both field names for compatibility
                numberOfOwners: typeof details.vehicles.numberOfOwners === "string" ? 
                  parseInt(details.vehicles.numberOfOwners, 10) : 
                  (typeof details.vehicles.previousOwners === "string" ? 
                    parseInt(details.vehicles.previousOwners, 10) : 
                    (details.vehicles.numberOfOwners || details.vehicles.previousOwners || 0)),
                previousOwners: typeof details.vehicles.previousOwners === "string" ? 
                  parseInt(details.vehicles.previousOwners, 10) : 
                  (details.vehicles.previousOwners || 0),
                // Boolean fields - explicitly transform
                serviceHistory: Boolean(details.vehicles.serviceHistory),
                accidentFree: Boolean(details.vehicles.accidentFree),
                customsCleared: Boolean(details.vehicles.customsCleared),
                // Safety features - explicitly transform
                blindSpotMonitor: Boolean(details.vehicles.blindSpotMonitor),
                laneAssist: Boolean(details.vehicles.laneAssist),
                adaptiveCruiseControl: Boolean(details.vehicles.adaptiveCruiseControl),
                tractionControl: Boolean(details.vehicles.tractionControl),
                abs: Boolean(details.vehicles.abs),
                emergencyBrakeAssist: Boolean(details.vehicles.emergencyBrakeAssist),
                tirePressureMonitoring: Boolean(details.vehicles.tirePressureMonitoring),
                // Camera features - explicitly transform
                rearCamera: Boolean(details.vehicles.rearCamera),
                camera360: Boolean(details.vehicles.camera360),
                dashCam: Boolean(details.vehicles.dashCam),
                parkingSensors: Boolean(details.vehicles.parkingSensors),
                // Comfort features - explicitly transform
                climateControl: Boolean(details.vehicles.climateControl),
                heatedSeats: Boolean(details.vehicles.heatedSeats),
                ventilatedSeats: Boolean(details.vehicles.ventilatedSeats),
                dualZoneClimate: Boolean(details.vehicles.dualZoneClimate),
                rearAC: Boolean(details.vehicles.rearAC),
                // Lighting features - explicitly transform
                ledHeadlights: Boolean(details.vehicles.ledHeadlights),
                adaptiveHeadlights: Boolean(details.vehicles.adaptiveHeadlights),
                ambientLighting: Boolean(details.vehicles.ambientLighting),
                fogLights: Boolean(details.vehicles.fogLights),
                // Technology features - explicitly transform
                bluetooth: Boolean(details.vehicles.bluetooth),
                appleCarPlay: Boolean(details.vehicles.appleCarPlay),
                androidAuto: Boolean(details.vehicles.androidAuto),
                premiumSound: Boolean(details.vehicles.premiumSound),
                wirelessCharging: Boolean(details.vehicles.wirelessCharging),
                keylessEntry: Boolean(details.vehicles.keylessEntry),
                sunroof: Boolean(details.vehicles.sunroof),
                spareKey: Boolean(details.vehicles.spareKey),
                remoteStart: Boolean(details.vehicles.remoteStart),
                // Other fields with their actual values
                importStatus: details.vehicles.importStatus || "Local",
                registrationStatus: details.vehicles.registrationStatus || "",
                registrationExpiry: details.vehicles.registrationExpiry || "",
                warranty: details.vehicles.warranty || "No",
                warrantyPeriod: details.vehicles.warrantyPeriod || "",
                insuranceType: details.vehicles.insuranceType || "None",
                upholsteryMaterial: details.vehicles.upholsteryMaterial || "Other",
                bodyType: details.vehicles.bodyType || "",
                roofType: details.vehicles.roofType || "",
                tireCondition: details.vehicles.tireCondition || "",
                // Technical fields
                engine: details.vehicles.engine || "",
                engineSize: details.vehicles.engineSize || "",
                gearbox: details.vehicles.gearbox || "",
                horsepower: typeof details.vehicles.horsepower === "string" 
                  ? parseInt(details.vehicles.horsepower, 10) 
                  : (details.vehicles.horsepower || 0),
                torque: typeof details.vehicles.torque === "string" 
                  ? parseInt(details.vehicles.torque, 10) 
                  : (details.vehicles.torque || 0),
                brakeType: details.vehicles.brakeType || "",
                driveType: details.vehicles.driveType || "",
                wheelSize: details.vehicles.wheelSize || "",
                wheelType: details.vehicles.wheelType || "",
                // Additional fields
                attachments: Array.isArray(details.vehicles.attachments) ? details.vehicles.attachments : [],
                fuelTankCapacity: details.vehicles.fuelTankCapacity || "",
                tires: details.vehicles.tires || "",
                hydraulicSystem: details.vehicles.hydraulicSystem || "",
                ptoType: details.vehicles.ptoType || "",
                fuelEfficiency: details.vehicles.fuelEfficiency || "",
                emissionClass: details.vehicles.emissionClass || "",
                serviceHistoryDetails: details.vehicles.serviceHistoryDetails || "",
                additionalNotes: details.vehicles.additionalNotes || "",
                safetyFeatures: typeof details.vehicles.safetyFeatures === "object" ? details.vehicles.safetyFeatures || {} : {}
              }
            : undefined,
          realEstate: details.realEstate
            ? {
                ...details.realEstate,
                propertyType: category.subCategory as PropertyType,
                features: details.realEstate.features || {},
              }
            : undefined,
        };

        // Remove the problematic section and simplify the vehicle details assignment
        let vehicleDetails = transformedDetails.vehicles;
        if (vehicleDetails) {
          const subCategory = category.subCategory as VehicleType;
          // Initialize base details with required fields
          const baseDetails = {
            make: vehicleDetails.make || '',
            model: vehicleDetails.model || '',
            year: vehicleDetails.year || '',
            mileage: vehicleDetails.mileage || 0,
            color: vehicleDetails.color || '',
            condition: vehicleDetails.condition,
            fuelType: vehicleDetails.fuelType,
            transmissionType: vehicleDetails.transmissionType,
            features: vehicleDetails.features || {} as Record<string, any>,
            previousOwners: typeof vehicleDetails.previousOwners === 'string' 
              ? parseInt(vehicleDetails.previousOwners, 10) 
              : (vehicleDetails.previousOwners || 0)
          } as const;
          
          // Type assertion based on vehicle type
          let typedDetails: VehicleDetails;
          switch (subCategory) {
            case VehicleType.CAR:
              typedDetails = { ...vehicleDetails, ...baseDetails, vehicleType: VehicleType.CAR } as CarDetails;
              break;
            case VehicleType.MOTORCYCLE:
              typedDetails = { ...vehicleDetails, ...baseDetails, vehicleType: VehicleType.MOTORCYCLE } as MotorcycleDetails;
              break;
            case VehicleType.TRUCK:
              typedDetails = { ...vehicleDetails, ...baseDetails, vehicleType: VehicleType.TRUCK } as TruckDetails;
              break;
            case VehicleType.VAN:
              typedDetails = { ...vehicleDetails, ...baseDetails, vehicleType: VehicleType.VAN } as VanDetails;
              break;
            case VehicleType.BUS:
              typedDetails = { ...vehicleDetails, ...baseDetails, vehicleType: VehicleType.BUS } as BusDetails;
              break;
            case VehicleType.TRACTOR:
              typedDetails = { ...vehicleDetails, ...baseDetails, vehicleType: VehicleType.TRACTOR } as TractorDetails;
              break;
            default:
              throw new Error(`Unsupported vehicle type: ${subCategory}`);
          }
          
          // Preserve all fields from the original vehicleDetails
          vehicleDetails = {
            ...vehicleDetails,
            ...typedDetails,
            // Ensure these fields are preserved with their original values
            insuranceType: vehicleDetails.insuranceType || "None",
            upholsteryMaterial: vehicleDetails.upholsteryMaterial || "Other",
            tireCondition: vehicleDetails.tireCondition || "",
            engineSize: vehicleDetails.engineSize || "",
            horsepower: vehicleDetails.horsepower || 0,
            torque: vehicleDetails.torque || 0,
            bodyType: vehicleDetails.bodyType || "",
            roofType: vehicleDetails.roofType || "",
            warrantyPeriod: vehicleDetails.warrantyPeriod || "",
            serviceHistoryDetails: vehicleDetails.serviceHistoryDetails || "",
            // Preserve all boolean fields
            blindSpotMonitor: Boolean(vehicleDetails.blindSpotMonitor),
            laneAssist: Boolean(vehicleDetails.laneAssist),
            adaptiveCruiseControl: Boolean(vehicleDetails.adaptiveCruiseControl),
            tractionControl: Boolean(vehicleDetails.tractionControl),
            abs: Boolean(vehicleDetails.abs),
            emergencyBrakeAssist: Boolean(vehicleDetails.emergencyBrakeAssist),
            tirePressureMonitoring: Boolean(vehicleDetails.tirePressureMonitoring),
            rearCamera: Boolean(vehicleDetails.rearCamera),
            camera360: Boolean(vehicleDetails.camera360),
            dashCam: Boolean(vehicleDetails.dashCam),
            parkingSensors: Boolean(vehicleDetails.parkingSensors),
            climateControl: Boolean(vehicleDetails.climateControl),
            heatedSeats: Boolean(vehicleDetails.heatedSeats),
            ventilatedSeats: Boolean(vehicleDetails.ventilatedSeats),
            dualZoneClimate: Boolean(vehicleDetails.dualZoneClimate),
            rearAC: Boolean(vehicleDetails.rearAC),
            ledHeadlights: Boolean(vehicleDetails.ledHeadlights),
            adaptiveHeadlights: Boolean(vehicleDetails.adaptiveHeadlights),
            ambientLighting: Boolean(vehicleDetails.ambientLighting),
            fogLights: Boolean(vehicleDetails.fogLights),
            bluetooth: Boolean(vehicleDetails.bluetooth),
            appleCarPlay: Boolean(vehicleDetails.appleCarPlay),
            androidAuto: Boolean(vehicleDetails.androidAuto),
            premiumSound: Boolean(vehicleDetails.premiumSound),
            wirelessCharging: Boolean(vehicleDetails.wirelessCharging),
            keylessEntry: Boolean(vehicleDetails.keylessEntry),
            sunroof: Boolean(vehicleDetails.sunroof),
            spareKey: Boolean(vehicleDetails.spareKey),
            remoteStart: Boolean(vehicleDetails.remoteStart)
          } as VehicleDetails;
        }

        setListing({
          ...rest,
          category: {
            mainCategory: category.mainCategory as ListingCategory,
            subCategory: category.subCategory as VehicleType | PropertyType,
          },
          details: {
            ...transformedDetails,
            vehicles: vehicleDetails
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
        initialMessage: message.trim()
      });

      if (conversationResponse.success && conversationResponse.data) {
        const conversationId = conversationResponse.data._id;
        
        // Send the message using the correct structure
        const messageInput: ListingMessageInput = {
          content: message.trim(),
          listingId: id || "",
          recipientId: listing.userId || ""
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="w-full">
          <ImageGallery images={listing?.images || []} />
        </div>

        {/* Details Section */}
        <div className="space-y-8">
          {/* Title and Price Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              {listing?.title}
            </h1>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {listing?.price && formatCurrency(listing.price)}
              {listing?.listingAction?.toLowerCase() === ListingAction.RENT &&
                "/month"}
            </p>
          </div>

          {/* Seller Information */}
          {listing?.seller && (
            <>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Link
                  to={`/users/${listing.seller.id}`}
                  className="flex items-center space-x-3 hover:text-blue-600"
                >
                  {listing.seller.profilePicture ? (
                    <img
                      src={listing.seller.profilePicture}
                      alt={listing.seller.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-xl">
                        {listing.seller.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{listing.seller.username}</p>
                    <p className="text-sm text-gray-500">
                      {t("listings.posted_on")}: {" "}
                      {new Date(listing.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                {/* Contact Seller Button (now inside card, right-aligned) */}
                {!isOwner && !showContactForm && (
                  <button
                    onClick={handleContactSeller}
                    className="flex items-center gap-2 px-3 py-1.5 border border-blue-500 text-blue-600 bg-white dark:bg-gray-900 rounded-md hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
                    style={{minWidth: 0}}
                    title={t("listings.contactSeller") as string}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-2.25M17.25 8.25l-5.25 5.25-5.25-5.25" />
                    </svg>
                    <span className="hidden sm:inline">{t("listings.contactSeller")}</span>
                  </button>
                )}
              </div>

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
            </>
          )}

          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t("listings.basicInformation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("listings.title")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {listing.title}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("listings.price")}
                </p>
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  {formatCurrency(listing.price)}
                  {listing.listingAction?.toLowerCase() === "rent" && "/month"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("listings.location")}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {listing.location}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
              {/* <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {t("listings.vehicleDetails")}
                     </h2> */}

              <div className="space-y-6">
                {/* Essential Details */}
                <div className=" bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.essentialDetails")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.make")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.make}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.model")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.model}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.year")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.year}
                      </p>
                    </div>
                    {listing.details.vehicles.mileage && (
  <div className="space-y-1">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {t("listings.fields.mileage")}
    </p>
    <p className="font-medium text-gray-900 dark:text-white">
      {listing.details.vehicles.mileage} {t("listings.fields.mileage")}
    </p>
  </div>
)}
                    {listing.details.vehicles.fuelType && (
  <div className="space-y-1">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {t("listings.fields.fuelType")}
    </p>
    <p className="font-medium text-gray-900 dark:text-white">
      {t(`listings.fields.fuelTypes.${listing.details.vehicles.fuelType}`)}
    </p>
  </div>
)}
                    {listing.details.vehicles.transmission && (
  <div className="space-y-1">
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {t("listings.fields.transmission")}
    </p>
    <p className="font-medium text-gray-900 dark:text-white">
      {t(`listings.fields.transmissionTypes.${listing.details.vehicles.transmission}`)}
    </p>
  </div>
)}
                  </div>
                </div>

                {/* Appearance */}
                <div className=" bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.appearance")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {listing.details.vehicles.color && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.exteriorColor")}
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                            style={{
                              backgroundColor: listing.details.vehicles.color,
                            }}
                          />
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.color}
                          </p>
                        </div>
                      </div>
                    )}
                    {listing.details.vehicles.interiorColor && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.interiorColor")}
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm"
                            style={{
                              backgroundColor:
                                listing.details.vehicles.interiorColor,
                            }}
                          />
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.details.vehicles.interiorColor}
                          </p>
                        </div>
                      </div>
                    )}
                    {listing.details.vehicles.condition && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.fields.condition")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {t(`listings.fields.conditions.${listing.details.vehicles.condition}`)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Vehicle Details */}
                <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.additionalDetails")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Always show these fields regardless of value */}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.warranty")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.warranty || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.serviceHistory")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.serviceHistory ? t("common.yes") : t("common.no")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.numberOfOwners")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.numberOfOwners || listing.details.vehicles.previousOwners || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.registrationStatus")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.registrationStatus || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.vin")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.vin || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.engineNumber")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.engineNumber || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.accidentFree")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.accidentFree ? t("common.yes") : t("common.no")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.importStatus")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.importStatus || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.registrationExpiry")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.registrationExpiry ? 
                          new Date(listing.details.vehicles.registrationExpiry).toLocaleDateString() : 
                          t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.insuranceType")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.insuranceType || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.upholsteryMaterial")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.upholsteryMaterial || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.tireCondition")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.tireCondition || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.customsCleared")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.customsCleared ? t("common.yes") : t("common.no")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.warrantyPeriod")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.warrantyPeriod || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.serviceHistoryDetails")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.serviceHistoryDetails || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.bodyType")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.bodyType || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.roofType")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.roofType || t("common.notProvided")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-white dark:bg-gray-800 shadow-md p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.technicalDetails")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.engine")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.engine || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.engineSize")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.engineSize || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.horsepower")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.horsepower ? `${listing.details.vehicles.horsepower} HP` : t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.torque")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.torque ? `${listing.details.vehicles.torque} Nm` : t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.brakeType")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.brakeType || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.driveType")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.driveType || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.wheelSize")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.wheelSize || t("common.notProvided")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("listings.fields.wheelType")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {listing.details.vehicles.wheelType || t("common.notProvided")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white dark:bg-gray-800 shadow-sm p-6 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("listings.features")}
                  </h3>
                  
                  {/* Safety Features */}
                  <div className="space-y-2">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                      {t("listings.features.safetyFeatures")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.blindSpotMonitor")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.blindSpotMonitor ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.laneAssist")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.laneAssist ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.adaptiveCruiseControl")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.adaptiveCruiseControl ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.tractionControl")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.tractionControl ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.abs")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.abs ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.emergencyBrakeAssist")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.emergencyBrakeAssist ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.tirePressureMonitoring")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.tirePressureMonitoring ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Camera Features */}
                  <div className="space-y-2">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                      {t("listings.features.cameraFeatures")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.rearCamera")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.rearCamera ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.camera360")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.camera360 ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.dashCam")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.dashCam ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.nightVision")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.nightVision ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.parkingSensors")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.parkingSensors ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Climate Features */}
                  <div className="space-y-2">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                      {t("listings.features.climateFeatures")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.climateControl")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.climateControl ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.heatedSeats")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.heatedSeats ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.ventilatedSeats")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.ventilatedSeats ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.dualZoneClimate")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.dualZoneClimate ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.rearAC")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.rearAC ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Entertainment Features */}
                  <div className="space-y-2">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                      {t("listings.features.entertainmentFeatures")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.bluetooth")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.bluetooth ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.appleCarPlay")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.appleCarPlay ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.androidAuto")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.androidAuto ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.premiumSound")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.premiumSound ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.wirelessCharging")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.wirelessCharging ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lighting Features */}
                  <div className="space-y-2">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                      {t("listings.features.lightingFeatures")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.ledHeadlights")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.ledHeadlights ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.adaptiveHeadlights")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.adaptiveHeadlights ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.ambientLighting")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.ambientLighting ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.fogLights")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.fogLights ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Convenience Features */}
                  <div className="space-y-2">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                      {t("listings.features.convenienceFeatures")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.keylessEntry")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.keylessEntry ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.sunroof")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.sunroof ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.spareKey")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.spareKey ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("listings.features.remoteStart")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {listing.details.vehicles.remoteStart ? t("common.yes") : t("common.no")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {listing.details.vehicles.features &&
                  listing.details.vehicles.features.length > 0 && (
                    <div className=" bg-white dark:bg-gray-800 shadow-sm p-6 rounded-xl space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t("listings.features")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.details.vehicles.features.map(
                          (feature: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-200"
                            >
                              {feature}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Real Estate Details */}
          {isRealEstate && listing?.details?.realEstate && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t("listings.propertyDetails")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("listings.size")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.size} m²
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.bedrooms && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("listings.bedrooms")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.bedrooms}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.bathrooms && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("listings.bathrooms")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.bathrooms}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.yearBuilt && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("listings.yearBuilt")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {listing?.details?.realEstate?.yearBuilt}
                    </p>
                  </div>
                )}
                {listing?.details?.realEstate?.condition && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("listings.features")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.details.realEstate.features.map(
                        (feature: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-200"
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
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t("listings.description")}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {/* Contact Section */}
          {!isOwner && (
            <div className="mt-6">
              {!showContactForm ? (
                <button
                  onClick={handleContactSeller}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t("listings.contactSeller")}
                </button>
              ) : (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;