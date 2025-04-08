import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MessagesAPI } from "@/api/messaging.api";
import type { Listing } from "@/types/listings";
import { 
  ListingCategory, 
  VehicleType, 
  PropertyType,
  FuelType,
  TransmissionType,
  Condition
} from "@/types/enums";
import type { ListingMessageInput } from "@/types/messaging";
import { toast } from "react-toastify";
import { listingsAPI } from "@/api/listings.api";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/format";
import ImageGallery from "@/components/listings/images/ImageGallery";
import TokenManager from "@/utils/tokenManager";

interface ListingImage {
  url: string;
}

interface ListingDetails {
  vehicles?: {
    vehicleType: VehicleType;
    make: string;
    model: string;
    year: string;
    mileage?: string;
    fuelType?: FuelType;
    transmissionType?: TransmissionType;
    color?: string;
    condition?: Condition;
    features?: string[];
    interiorColor?: string;
    engine?: string;
    warranty?: string | number;
    serviceHistory?: string;
    previousOwners?: number;
    registrationStatus?: string;
  };
  realEstate?: {
    propertyType: PropertyType;
    size?: string;
    yearBuilt?: string;
    bedrooms?: string | number;
    bathrooms?: string | number;
    condition?: Condition;
    features?: string[];
  };
}

const ListingDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const initializeAndFetchListing = async () => {
      if (!id) {
        setError("No listing ID provided");
        setLoading(false);
        return;
      }

      try {
        // Initialize token manager first
        await TokenManager.initialize();

        if (!isAuthenticated) {
          // Redirect to login if not authenticated
          toast.error(t("common.loginRequired"));
          navigate("/login", { state: { from: `/listings/${id}` } });
          return;
        }

        console.log('Initializing token manager...');
        await TokenManager.initialize();

        if (!isAuthenticated) {
          console.log('User not authenticated, redirecting to login...');
          toast.error(t("common.loginRequired"));
          navigate("/login", { state: { from: `/listings/${id}` } });
          return;
        }

        console.log('Fetching listing data...');
        const response = await listingsAPI.getById(id);
        console.log('Got response:', response);
        
        // Log the full response data for debugging advanced details
        console.log('Response data details:', JSON.stringify(response.data?.details, null, 2));
        if (response.data?.details?.vehicles) {
          console.log('Vehicle details:', JSON.stringify(response.data.details.vehicles, null, 2));
        }

        if (!response.success || !response.data) {
          const error = response.error || "Failed to load listing";
          console.error('API error:', error);
          throw new Error(error);
        }

        const listing = response.data;
        console.log('Listing data:', listing);
        console.log('Listing images:', listing.images);

        if (!listing) {
          console.error('No listing data in response');
          throw new Error("Listing not found");
        }

        // Ensure images are in the correct format
        const processedImages = (listing.images || []).map(img => {
          console.log('Processing image:', img);
          if (typeof img === 'string') return img;
          if (img && typeof img === 'object') {
            if ('url' in img) return img.url;
            // If image is an object but doesn't have url property, try to find a string property
            const stringProps = Object.values(img).find(val => typeof val === 'string');
            return stringProps || '';
          }
          return '';
        }).filter(Boolean);
        
        console.log('Processed images:', processedImages);
        
        const { mainCategory, subCategory, details, listingAction, status, ...rest } = listing;
        
        // Log all the details to debug what's available
        console.log('Details before transformation:', JSON.stringify(details, null, 2));
        console.log('Vehicle details before:', details.vehicles ? JSON.stringify(details.vehicles, null, 2) : 'No vehicle details');
        
        // Transform vehicle details if present
        const transformedDetails = {
          vehicles: details.vehicles ? {
            ...details.vehicles,
            vehicleType: subCategory as VehicleType,
            features: details.vehicles.features || [],
            // Ensure all required fields are present
            mileage: details.vehicles.mileage || "0",
            fuelType: details.vehicles.fuelType || FuelType.GASOLINE,
            transmissionType: details.vehicles.transmissionType || TransmissionType.AUTOMATIC,
            color: details.vehicles.color || "",
            condition: details.vehicles.condition || Condition.GOOD
          } : undefined,
          realEstate: details.realEstate ? {
            ...details.realEstate,
            propertyType: subCategory as PropertyType,
            features: details.realEstate.features || []
          } : undefined
        };
        
        console.log('Vehicle details after transformation:', transformedDetails.vehicles ? JSON.stringify(transformedDetails.vehicles, null, 2) : 'No vehicle details');

        setListing({
          ...rest,
          category: {
            mainCategory: mainCategory as ListingCategory,
            subCategory: subCategory as VehicleType | PropertyType
          },
          details: transformedDetails,
          listingAction: listingAction?.toLowerCase() as 'sell' | 'rent',

          images: processedImages
        });
      } catch (error) {
        console.error("Error fetching listing:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load listing";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeAndFetchListing();
  }, [id, navigate, t, isAuthenticated]);

  const handleContactSeller = async () => {
    if (!user) {
      toast.error(t("common.loginRequired"));
      navigate("/login");
      return;
    }

    if (!listing) return;

    setIsSending(true);
    try {
      const messageInput: ListingMessageInput = {
        content: message.trim(),
        listingId: id || '',
        recipientId: listing.userId || ''
      };

      const response = await MessagesAPI.sendMessage(messageInput);
      if (response.success) {
        toast.success(t("messages.messageSent"));
        setMessage("");
        setShowContactForm(false);
      } else {
        toast.error(response.error || t("common.errorOccurred"));
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

  const isVehicle = listing.category.mainCategory === ListingCategory.VEHICLES;
  const isRealEstate = listing.category.mainCategory === ListingCategory.REAL_ESTATE;
  const isOwner = user?.id === listing.userId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="w-full">
          <ImageGallery 
            images={listing.images} 
          />
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(listing.price)}
              {listing.listingAction === 'rent' && "/month"}
            </p>
          </div>

          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("listings.basicInformation")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t("listings.title")}</p>
                  <p className="font-medium">{listing.title}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t("listings.price")}</p>
                  <p className="font-medium">{formatCurrency(listing.price)}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t("listings.location")}</p>
                  <p className="font-medium">{listing.location}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t("listings.listingAction")}</p>
                  <p className="font-medium capitalize">{t(`listings.actions.${listing.listingAction}`) || t("common.notProvided")}</p>
                </div>
                {listing.description && (
                  <div className="col-span-2">
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.description")}</p>
                    <p className="font-medium whitespace-pre-wrap">{listing.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Details */}
            {isVehicle && listing.details.vehicles && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">{t("listings.vehicleDetails")}</h2>
                
                {/* Essential Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("listings.essentialDetails")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.make")}</span>
                      <p className="font-medium">{listing.details.vehicles.make}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.model")}</span>
                      <p className="font-medium">{listing.details.vehicles.model}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.year")}</span>
                      <p className="font-medium">{listing.details.vehicles.year}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.mileage")}</span>
                      <p className="font-medium">{listing.details.vehicles.mileage} km</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.fuelType")}</span>
                      <p className="font-medium capitalize">{t(`listings.fuelTypes.${listing.details.vehicles.fuelType}`)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.transmission")}</span>
                      <p className="font-medium capitalize">{t(`listings.transmissionTypes.${listing.details.vehicles.transmissionType}`)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Appearance */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("listings.appearance")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.exteriorColor")}</span>
                      <div className="flex items-center gap-2">
                        {listing.details.vehicles.color && (
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-200" 
                            style={{ backgroundColor: listing.details.vehicles.color }}
                          />
                        )}
                        <p className="font-medium">{listing.details.vehicles.color}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.interiorColor")}</span>
                      <div className="flex items-center gap-2">
                        {listing.details.vehicles.interiorColor && (
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-200" 
                            style={{ backgroundColor: listing.details.vehicles.interiorColor }}
                          />
                        )}
                        <p className="font-medium">{listing.details.vehicles.interiorColor}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.condition")}</span>
                      <p className="font-medium capitalize">{t(`listings.conditions.${listing.details.vehicles.condition}`)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Technical Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("listings.technicalDetails")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {listing.details.vehicles.engine && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.engine")}</span>
                        <p className="font-medium">{listing.details.vehicles.engine}</p>
                      </div>
                    )}
                    {listing.details.vehicles.warranty !== undefined && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.warranty")}</span>
                        <p className="font-medium">{listing.details.vehicles.warranty} {t("listings.months")}</p>
                      </div>
                    )}
                    {listing.details.vehicles.serviceHistory && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.serviceHistory")}</span>
                        <p className="font-medium">{listing.details.vehicles.serviceHistory}</p>
                      </div>
                    )}
                    {listing.details.vehicles.previousOwners !== undefined && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.previousOwners")}</span>
                        <p className="font-medium">{listing.details.vehicles.previousOwners}</p>
                      </div>
                    )}
                    {listing.details.vehicles.registrationStatus && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.registrationStatus")}</span>
                        <p className="font-medium capitalize">{t(`listings.registrationStatuses.${listing.details.vehicles.registrationStatus}`)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                {listing.details.vehicles.features && listing.details.vehicles.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("listings.features")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.details.vehicles.features.map((feature, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                        >
                          {t(`listings.features.${feature}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Section */}
            {!isOwner && (
              <div className="mt-8">
                {!showContactForm ? (
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t("listings.contactSeller")}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("messages.enterMessage")}
                      className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      rows={4}
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={handleContactSeller}
                        disabled={!message.trim() || isSending}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        {isSending ? t("common.sending") : t("messages.send")}
                      </button>
                      <button
                        onClick={() => setShowContactForm(false)}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
    </div>
  );
};

export default ListingDetails;
