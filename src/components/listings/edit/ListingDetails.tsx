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
    make: string;
    model: string;
    year: string;
    mileage?: string;
    fuelType?: FuelType;
    transmissionType?: TransmissionType;
    color?: string;
    condition?: Condition;
    features?: string[];
  };
  realEstate?: {
    propertyType: PropertyType;
    size?: string;
    yearBuilt?: string;
    bedrooms?: string;
    bathrooms?: string;
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
        
        // Transform vehicle details if present
        const transformedDetails = {
          vehicles: details.vehicles ? {
            ...details.vehicles,
            vehicleType: subCategory as VehicleType,
            features: details.vehicles.features || []
          } : undefined,
          realEstate: details.realEstate ? {
            ...details.realEstate,
            propertyType: subCategory as PropertyType,
            features: details.realEstate.features || []
          } : undefined
        };

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
        recipientId: listing.userId
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
              {listing.listingAction?.toLowerCase() === 'rent' && "/month"}
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
                  <p className="text-gray-600 dark:text-gray-400">{t("listings.description")}</p>
                  <p className="font-medium">{listing.description}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t("listings.price")}</p>
                  <p className="font-medium">${listing.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t("listings.location")}</p>
                  <p className="font-medium">{listing.location}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{t("listings.listingAction")}</p>
                  <p className="font-medium capitalize">{listing.listingAction || t("common.notProvided")}</p>
                </div>
                {listing.listingAction === 'sell' && listing.sellDescription && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.sellDescription")}</p>
                    <p className="font-medium">{listing.sellDescription}</p>
                  </div>
                )}
                {listing.listingAction === 'rent' && listing.rentDescription && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.rentDescription")}</p>
                    <p className="font-medium">{listing.rentDescription}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Details */}
            {listing.category.mainCategory === ListingCategory.VEHICLES && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t("listings.vehicleDetails")}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.make")}</p>
                    <p className="font-medium">{listing.details.vehicles?.make || t("common.notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.model")}</p>
                    <p className="font-medium">{listing.details.vehicles?.model || t("common.notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.year")}</p>
                    <p className="font-medium">{listing.details.vehicles?.year || t("common.notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.vehicleType")}</p>
                    <p className="font-medium">{listing.category.subCategory || t("common.notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.mileage")}</p>
                    <p className="font-medium">{listing.details.vehicles?.mileage || t("common.notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.fuelType")}</p>
                    <p className="font-medium">{listing.details.vehicles?.fuelType || t("common.notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.transmission")}</p>
                    <p className="font-medium">{listing.details.vehicles?.transmissionType || t("common.notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{t("listings.color")}</p>
                    <div className="flex items-center gap-2">
                      {listing.details.vehicles?.color && (
                        <div 
                          className="w-6 h-6 rounded-full border border-gray-200" 
                          style={{ backgroundColor: listing.details.vehicles.color }}
                        />
                      )}
                      <p className="font-medium">{listing.details.vehicles?.color || t("common.notProvided")}</p>
                    </div>
                  </div>
                </div>
                {/* Additional Vehicle Details */}
                {(listing.details.vehicles?.features ?? []).length > 0 && (
                  <div className="col-span-2 mt-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{t("listings.features")}</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.details.vehicles?.features?.map((feature, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {listing.details.realEstate?.features?.length > 0 && (
              <div className="col-span-2 mt-4">
                <p className="text-gray-600 dark:text-gray-400 mb-2">{t("listings.features")}</p>
                <div className="flex flex-wrap gap-2">
                  {listing.details.realEstate?.features?.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
            </div>

            {/* Vehicle Details */}
            {isVehicle && listing.details.vehicles && (
              <div className="space-y-6">
                {/* Essential Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("listings.vehicleDetails")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.make")}</span>
                      <p>{listing.details.vehicles.make}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.model")}</span>
                      <p>{listing.details.vehicles.model}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.year")}</span>
                      <p>{listing.details.vehicles.year}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.condition")}</span>
                      <p>{listing.details.vehicles.condition}</p>
                    </div>
                    {listing.details.vehicles.mileage && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.mileage")}</span>
                        <p>{listing.details.vehicles.mileage} km</p>
                      </div>
                    )}
                    {listing.details.vehicles.warranty && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.warranty")}</span>
                        <p>{listing.details.vehicles.warranty} {t("listings.months")}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("listings.performance")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {listing.details.vehicles.engine && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.engine")}</span>
                        <p>{listing.details.vehicles.engine}L</p>
                      </div>
                    )}
                    {listing.details.vehicles.horsepower && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.horsepower")}</span>
                        <p>{listing.details.vehicles.horsepower} HP</p>
                      </div>
                    )}
                    {listing.details.vehicles.fuelType && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.fuelType")}</span>
                        <p>{t(`listings.fuelTypes.${listing.details.vehicles.fuelType.toLowerCase()}`)}</p>
                      </div>
                    )}
                    {listing.details.vehicles.transmissionType && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.transmission")}</span>
                        <p>{t(`listings.transmissionTypes.${listing.details.vehicles.transmissionType.toLowerCase()}`)}</p>
                      </div>
                    )}
                    {listing.details.vehicles.drivetrain && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.drivetrain")}</span>
                        <p>{listing.details.vehicles.drivetrain}</p>
                      </div>
                    )}
                    {listing.details.vehicles.fuelEfficiency && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.fuelEfficiency")}</span>
                        <p>{listing.details.vehicles.fuelEfficiency} L/100km</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comfort & Features */}
                {(listing.details.vehicles.airConditioning || 
                  listing.details.vehicles.seatingMaterial || 
                  listing.details.vehicles.seatHeating || 
                  listing.details.vehicles.seatVentilation) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("listings.comfort")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {listing.details.vehicles.airConditioning && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t("listings.airConditioning")}</span>
                          <p>{t(`listings.climateControl.${listing.details.vehicles.airConditioning}`)}</p>
                        </div>
                      )}
                      {listing.details.vehicles.seatingMaterial && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t("listings.seatingMaterial")}</span>
                          <p>{t(`listings.seatMaterial.${listing.details.vehicles.seatingMaterial}`)}</p>
                        </div>
                      )}
                      {listing.details.vehicles.seatHeating && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t("listings.seatHeating")}</span>
                          <p>{t(`listings.heating.${listing.details.vehicles.seatHeating}`)}</p>
                        </div>
                      )}
                      {listing.details.vehicles.seatVentilation && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t("listings.seatVentilation")}</span>
                          <p>{t(`listings.ventilation.${listing.details.vehicles.seatVentilation}`)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Real Estate Details */}
            {isRealEstate && listing.details.realEstate && (
              <div className="space-y-6">
                {/* Basic Property Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("listings.propertyDetails")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.propertyType")}</span>
                      <p>{t(`listings.propertyTypes.${listing.details.realEstate.propertyType.toLowerCase()}`)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.size")}</span>
                      <p>{listing.details.realEstate.size} m²</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.bedrooms")}</span>
                      <p>{listing.details.realEstate.bedrooms}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.bathrooms")}</span>
                      <p>{listing.details.realEstate.bathrooms}</p>
                    </div>
                    {listing.details.realEstate.yearBuilt && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.yearBuilt")}</span>
                        <p>{listing.details.realEstate.yearBuilt}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">{t("listings.condition")}</span>
                      <p>{t(`listings.conditions.${listing.details.realEstate.condition?.toLowerCase()}`)}</p>
                    </div>
                  </div>
                </div>

                {/* Property Style & Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t("listings.propertyStyle")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {listing.details.realEstate.propertyStyle && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.style")}</span>
                        <p>{t(`listings.propertyStyles.${listing.details.realEstate.propertyStyle}`)}</p>
                      </div>
                    )}
                    {listing.details.realEstate.floor && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.floor")}</span>
                        <p>{listing.details.realEstate.floor}</p>
                      </div>
                    )}
                    {listing.details.realEstate.totalFloors && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.totalFloors")}</span>
                        <p>{listing.details.realEstate.totalFloors}</p>
                      </div>
                    )}
                    {listing.details.realEstate.parking && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t("listings.parking")}</span>
                        <p>{t(`listings.parkingTypes.${listing.details.realEstate.parking}`)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Features */}
                {(listing.details.realEstate.heating || 
                  listing.details.realEstate.cooling || 
                  listing.details.realEstate.pool || 
                  listing.details.realEstate.furnished) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t("listings.additionalFeatures")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {listing.details.realEstate.heating && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t("listings.heating")}</span>
                          <p>{t(`listings.heatingTypes.${listing.details.realEstate.heating}`)}</p>
                        </div>
                      )}
                      {listing.details.realEstate.cooling && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t("listings.cooling")}</span>
                          <p>{t(`listings.coolingTypes.${listing.details.realEstate.cooling}`)}</p>
                        </div>
                      )}
                      {listing.details.realEstate.pool && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t("listings.pool")}</span>
                          <p>{t(`listings.poolTypes.${listing.details.realEstate.pool}`)}</p>
                        </div>
                      )}
                      {listing.details.realEstate.furnished && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">{t("listings.furnished")}</span>
                          <p>{t(listing.details.realEstate.furnished ? "common.yes" : "common.no")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            {((isVehicle && listing.details.vehicles?.features?.length) ||
              (isRealEstate && listing.details.realEstate?.features?.length)) && (
              <div>
                <h3 className="text-lg font-semibold mb-2">{t("listings.features")}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {isVehicle &&
                    listing.details.vehicles?.features?.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </div>
                    ))}
                  {isRealEstate &&
                    listing.details.realEstate?.features?.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("listings.description")}</h3>
              <p className="whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

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
  );
};

export default ListingDetails;
