import React, { useEffect, useMemo, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import type { ListingFieldSchema } from "@/types/listings";

import { useAuth } from "@/hooks/useAuth";
import { ListingCategory, VehicleType, PropertyType } from "@/types/enums";
import { normalizeLocation } from "@/utils/locationUtils";
import { getFieldsBySection, getFieldValue } from "@/utils/listingSchemaUtils";

// Lazy load the ImageGallery component
const ImageGallery = lazy(
  () => import("@/components/listings/images/ImageGallery")
);

// Components
import { PriceConverter } from "@/components/common/PriceConverter";

// Fallback component for when ImageGallery is loading
const ImageGalleryFallback = () => (
  <div className="grid grid-cols-2 gap-2">
    {[1, 2].map((i) => (
      <div key={i} className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    ))}
  </div>
);

// Types
type SchemaType = string;

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
  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-sm text-gray-900 dark:text-gray-100">{value}</dd>
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
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
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
    const vehicleType = listing.details?.vehicles?.vehicleType as VehicleType;
    const propertyType = listing.details?.realEstate?.propertyType as PropertyType;

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

    // Helper to get all fields including nested feature groups
    const getAllFields = (fields: ListingFieldSchema[]): ListingFieldSchema[] => {
      const result: ListingFieldSchema[] = [];
      
      fields.forEach(field => {
        // Add the field itself
        const fieldCopy = { ...field };
        result.push(fieldCopy);
        
        // If it's a feature group, add all its features
        if (field.type === 'featureGroup' && field.featureGroups) {
          Object.entries(field.featureGroups).forEach(([groupName, group]: [string, any]) => {
            if (group.features) {
              group.features.forEach((feature: any) => {
                result.push({
                  ...feature,
                  section: field.section,
                  isFeature: true,
                  parentGroup: field.name,
                  groupName: groupName,
                  groupLabel: group.label
                });
              });
            }
          });
        }
      });
      
      return result;
    };

    // Get all fields from schema including nested ones
    const allEssentialFields = getAllFields(getFieldsBySection(listingType as VehicleType | PropertyType, 'essential'));
    const allAdvancedFields = getAllFields(getFieldsBySection(listingType as VehicleType | PropertyType, 'advanced'));

    // Process fields to include all fields from schema, even if empty
    const renderFieldValueFn = (field: any) => {
      if (!listing) return <span className="text-gray-400">-</span>;
      
      // Handle nested paths for feature groups
      let value;
      if (field.isFeature && field.parentGroup) {
        // For features, check both direct path and nested under feature group
        const directValue = getFieldValue(listing, field.name);
        const nestedValue = getFieldValue(listing, `${field.parentGroup}.${field.name}`);
        value = directValue !== undefined ? directValue : nestedValue;
      } else {
        value = getFieldValue(listing, field.name);
      }
      
      // Handle empty values - show a dash but still render the field
      if (value === undefined || value === null || value === "") {
        return <span className="text-gray-400">-</span>;
      }

      // Handle boolean values
      if (typeof value === 'boolean') {
        return value ? t('common:yes') : t('common:no');
      }

      // Handle numeric values
      if (typeof value === 'number') {
        // Special handling for mileage, odometer, etc.
        if (['mileage', 'odometer', 'distance'].includes(field.name)) {
          return value.toLocaleString() + ' ' + (field.unit || 'km');
        }
        // Handle engine size
        if (['engineSize', 'displacement'].includes(field.name)) {
          return value.toLocaleString() + ' ' + (field.unit || 'L');
        }
        // Handle currency fields
        if (['price', 'amount', 'cost', 'value', 'msrp', 'marketValue', 'pricePerUnit'].includes(field.name)) {
          return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value);
        }
        // Handle percentages
        if (field.name.endsWith('Percentage') || field.name.endsWith('Rate') || field.type === 'percentage') {
          return value.toLocaleString() + '%';
        }
        // Handle years
        if (field.name.endsWith('Year') || field.name === 'year') {
          return value.toString();
        }
        // Default number formatting
        return value.toLocaleString();
      }

      // Handle arrays (like features)
      if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-gray-400">-</span>;
        
        // If array of objects with label property
        if (value[0] && typeof value[0] === 'object') {
          // Handle feature groups
          if ('name' in value[0] && 'label' in value[0]) {
            return (
              <div className="flex flex-wrap gap-2">
                {value.map((item, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {t(item.label, { defaultValue: item.name })}
                  </span>
                ))}
              </div>
            );
          }
          
          // Handle array of objects with value/label
          if ('value' in value[0] && 'label' in value[0]) {
            return value.map(item => item.label).join(', ');
          }
          
          // Handle array of strings or numbers
          if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
            return value.join(', ');
          }
          
          // Fallback for any other object array
          return (
            <div className="space-y-2">
              {value.map((item, idx) => (
                <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  {JSON.stringify(item)}
                </div>
              ))}
            </div>
          );
        }
        
        // Simple string or number array
        return value.join(', ');
      }

      // Handle color fields
      if (field.type === 'colorpicker' || field.name.toLowerCase().includes('color')) {
        return (
          <div className="flex items-center">
            <div
              className="w-5 h-5 rounded-full border border-gray-300 mr-2"
              style={{ backgroundColor: String(value) }}
            />
            <span className="uppercase">{String(value)}</span>
          </div>
        );
      }

      // Handle date fields
      if (field.type === 'date' || field.name.toLowerCase().endsWith('date')) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
          }
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }

      // Handle select fields with options
      if (field.options && Array.isArray(field.options)) {
        const option = field.options.find((opt: any) => {
          // Handle both string and number comparisons
          return String(opt.value) === String(value) || opt.value === value;
        });
        
        if (option) {
          // Try to translate using the translationKey first, then label, then fallback to value
          const translationKey = option.translationKey || option.label || option.value;
          const translated = t(translationKey, { defaultValue: option.value });
          return translated !== translationKey ? translated : String(option.value);
        }
        
        // If no matching option but we have a value, show the raw value
        return String(value);
      }

      // Translate field value if it matches an enum
      const translationKey = `enums.${field.name}.${value}`;
      const translated = t(translationKey, { defaultValue: undefined });
      if (translated !== translationKey) {
        return translated;
      }

      // Default string representation
      return String(value);
    };  

    const processFields = (fields: ListingFieldSchema[]) => {
      return fields.map(field => {
        const value = getFieldValue(listing, field.name);
        
        // For feature groups, get all enabled features
        if (field.type === 'featureGroup') {
          const enabledFeatures: any[] = [];
          
          if (field.featureGroups) {
            Object.entries(field.featureGroups).forEach(([groupName, group]: [string, any]) => {
              if (group.features) {
                group.features.forEach((feature: any) => {
                  const featureValue = getFieldValue(listing, feature.name);
                  if (featureValue) {
                    enabledFeatures.push({
                      ...feature,
                      value: featureValue,
                      group: groupName,
                      groupLabel: group.label
                    });
                  }
                });
              }
            });
          }
          
          return {
            ...field,
            value: enabledFeatures,
            type: 'featureGroup'
          };
        }
        
        // For regular fields
        return {
          ...field,
          value,
          type: field.type || (Array.isArray(value) ? 'array' : typeof value)
        };
      });
    };

    const essential = processFields(allEssentialFields);
    const advanced = processFields(allAdvancedFields);

    if (process.env.NODE_ENV === 'development') {
      console.log('Essential fields:', essential);
      console.log('Advanced fields:', advanced);
      console.log('Listing data:', listing);
    }

    return {
      essentialFields: essential,
      advancedFields: advanced,
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
          <PriceConverter price={listing.price || 0} />
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <span>{listing.location ? normalizeLocation(listing.location) : 'Location not specified'}</span>
        </div>
      </div>

      {/* Image gallery */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Images</h2>
        {listing.images?.length ? (
          <div className="mb-6">
            <Suspense fallback={<ImageGalleryFallback />}>
              <ImageGallery images={listing.images} />
            </Suspense>
          </div>
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
