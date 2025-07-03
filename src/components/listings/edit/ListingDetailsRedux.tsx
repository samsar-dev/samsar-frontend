import React, { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// Redux
import { 
  fetchListingDetails, 
  setMessageFormVisibility, 
  setMessage, 
  setMessageType, 
  sendMessage as sendMessageAction,
  resetListingDetailsState
} from "@/store/listing/listingDetails.actions";
import type { Listing } from "@/types/listings";

import { useAuth } from "@/hooks/useAuth";
import { ListingCategory, VehicleType, PropertyType } from "@/types/enums";
import { formatCurrency } from "@/utils/formatUtils";
import { normalizeLocation } from "@/utils/locationUtils";
import { getFieldsBySection, getFieldValue } from "@/utils/listingSchemaUtils";

// Simple image gallery component that handles both string and File objects
const ImageGallery = ({ images }: { images: (string | File)[] }) => (
  <div className="grid grid-cols-2 gap-2">
    {images.map((img, i) => (
      <img 
        key={i} 
        src={typeof img === 'string' ? img : URL.createObjectURL(img)} 
        alt={`Listing ${i + 1}`}
        className="w-full h-48 object-cover rounded"
      />
    ))}
  </div>
);

// Types
type SchemaType = VehicleType | PropertyType;

// Extended type for the listing with all required properties
type ExtendedListing = Listing & {
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
    allowMessaging: boolean;
    privateProfile: boolean;
  };
  details: {
    vehicles?: { [key: string]: any };
    realEstate?: { [key: string]: any };
    [key: string]: any;
  };
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  location: any;
  price: number;
  title: string;
  description: string;
  images?: (string | File)[];
  sellerId?: string;
};

// Field component for consistent field display
const Field = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 ${className}`}>
    <dt className="font-medium text-gray-700 dark:text-gray-300">{label}</dt>
    <dd className="md:col-span-2 text-gray-900 dark:text-gray-100">
      {value || "-"}
    </dd>
  </div>
);

// Section component to group related fields
const Section = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-4 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const ListingDetailsRedux = () => {
  const { t } = useTranslation(["listings", "common"]);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  // Get the listing ID from URL params
  if (!id) {
    return <div>No listing ID provided</div>;
  }
  
  // Select state from Redux store with proper typing
  const listing = useSelector((state: any) => state.listingDetails.listing) as ExtendedListing | null;
  const loading = useSelector((state: any) => state.listingDetails.loading) as boolean;
  const error = useSelector((state: any) => state.listingDetails.error) as string | null;
  const showMessageForm = useSelector((state: any) => state.listingDetails.showMessageForm) as boolean;
  const message = useSelector((state: any) => state.listingDetails.message) as string;
  const messageType = useSelector((state: any) => state.listingDetails.messageType) as 'question' | 'offer' | 'meeting';
  const messageSuccess = useSelector((state: any) => state.listingDetails.messageSuccess) as boolean;

  // Handle message input changes
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setMessage(e.target.value));
  };

  const handleMessageTypeChange = (type: "question" | "offer" | "meeting") => {
    dispatch(setMessageType(type));
  };

  // Handle form submission
  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      // Use type assertion to handle the thunk action
      const sendMessage = sendMessageAction as any;
      await dispatch(sendMessage({ 
        listingId: id, 
        message,
        messageType
      }));
      
      // Show success message (handled by Redux state)
      console.log('Message sent successfully');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Fetch listing details when component mounts or id changes
  useEffect(() => {
    if (id) {
      // Use type assertion to handle the thunk action
      const fetchDetails = fetchListingDetails as any;
      dispatch(fetchDetails(id));
    }

    // Cleanup function to reset state when component unmounts
    return () => {
      const resetState = resetListingDetailsState as any;
      dispatch(resetState());
    };
  }, [dispatch, id]);

  // Get schema fields based on listing type
  const { essentialFields, advancedFields } = useMemo(() => {
    if (!listing) {
      return { essentialFields: [], advancedFields: [] };
    }

    // Determine the listing type based on the main category
    let listingType: SchemaType | undefined;
    const vehicleType = listing.details?.vehicles?.vehicleType;
    const propertyType = listing.details?.realEstate?.propertyType;

    if (listing.category?.mainCategory === ListingCategory.VEHICLES) {
      listingType = vehicleType;
    } else if (listing.category?.mainCategory === ListingCategory.REAL_ESTATE) {
      listingType = propertyType;
    } else {
      listingType = listing.category?.subCategory as SchemaType;
    }

    if (!listingType) {
      return { essentialFields: [], advancedFields: [] };
    }

    // Get fields by section
    return {
      essentialFields: getFieldsBySection(listingType, "essential"),
      advancedFields: getFieldsBySection(listingType, "advanced"),
    };
  }, [listing]);
  
  // Get user ID for message form
  const userId = user?.id;
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    const objectUrls: string[] = [];
    
    // Create object URLs for any File objects
    if (listing?.images) {
      listing.images.forEach(img => {
        if (img instanceof File) {
          const url = URL.createObjectURL(img);
          objectUrls.push(url);
        }
      });
    }
    
    return () => {
      // Revoke all object URLs we created
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [listing]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Type guard to ensure listing is not null before rendering
  if (!listing) {
    return (
      <div className="p-8 text-center">
        <p>Listing not found</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{String(error)}</p>
      </div>
    );
  }

  // Render the listing details
  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Listing header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{listing.title || 'Untitled Listing'}</h1>
        <p className="text-2xl font-semibold text-blue-600">
          {formatCurrency(listing.price || 0)}
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <span>{listing.location ? normalizeLocation(listing.location) : 'Location not specified'}</span>
        </div>
      </div>

      {/* Image gallery */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Images</h2>
        {listing.images?.length ? (
          <ImageGallery images={listing.images} />
        ) : (
          <p>No images available</p>
        )}
      </div>

      {/* Description */}
      <Section title={t("listings:description")}>
        <p className="whitespace-pre-line">{listing.description}</p>
      </Section>

      {/* Essential fields */}
      {essentialFields.length > 0 && (
        <Section title="Essential Information">
          <div className="space-y-4">
            {essentialFields.map((field) => (
              <Field 
                key={field.name} 
                label={field.label} 
                value={String(getFieldValue(listing, field.name) || '-')} 
              />
            ))}
          </div>
        </Section>
      )}

      {/* Advanced fields */}
      {advancedFields.length > 0 && (
        <Section title="Additional Information">
          <div className="space-y-4">
            {advancedFields.map((field) => (
              <Field 
                key={field.name} 
                label={field.label} 
                value={String(getFieldValue(listing, field.name) || '-')} 
              />
            ))}
          </div>
        </Section>
      )}

      {/* Message form */}
      {userId && userId !== listing.sellerId && (
        <div className="mt-8 border-t pt-6">
          {!showMessageForm ? (
            <button
              onClick={() => dispatch(setMessageFormVisibility(true))}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t("listings:contactSeller")}
            </button>
          ) : (
            <form onSubmit={handleSubmitMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("listings:messageType")}
                </label>
                <div className="flex space-x-4">
                  {["question", "offer", "meeting"].map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        checked={messageType === type}
                        onChange={() =>
                          handleMessageTypeChange(
                            type as "question" | "offer" | "meeting"
                          )
                        }
                      />
                      <span className="ml-2">
                        {t(`listings:messageTypes.${type}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("listings:yourMessage")}
                </label>
                <textarea
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  rows={4}
                  value={message || ''}
                  onChange={handleMessageChange}
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={!message.trim()}
                >
                  {t("common:send")}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(setMessageFormVisibility(false))}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("common:cancel")}
                </button>
              </div>
            </form>
          )}

          {messageSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {t("messageSentSuccess")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListingDetailsRedux;
