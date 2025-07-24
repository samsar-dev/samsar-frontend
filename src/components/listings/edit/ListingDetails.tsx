import { CheckCircle } from "lucide-react";
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

// Helper function to safely render translated text as string
const renderTranslatedText = (
  t: (key: string, options?: any) => string,
  key: string,
  defaultValue: string,
): string => {
  try {
    // Force the return type to be a string by using String()
    const result = t(key, { defaultValue, returnObjects: false });

    // Handle null or undefined
    if (result == null) return defaultValue;

    // Handle primitive types
    if (typeof result === "string") return result;
    if (typeof result === "number" || typeof result === "boolean") {
      return String(result);
    }

    // Handle objects with toString method
    const obj = result as any;
    if (typeof obj === "object" && typeof obj.toString === "function") {
      return obj.toString();
    }

    // Fallback to default value
    return defaultValue;
  } catch (e) {
    console.error("Translation error:", e);
    return defaultValue;
  }
};

import { listingsAPI } from "@/api/listings.api";
import { MessagesAPI } from "@/api/messaging.api";
import { useAuth } from "@/hooks/useAuth";
import type { ListingCategory, PropertyType, VehicleType } from "@/types/enums";
import type { Listing } from "@/types/listings";
import { formatCurrency } from "@/utils/formatUtils";
import { getFieldsBySection, getFieldValue } from "@/utils/listingSchemaUtils";
import { normalizeLocation } from "@/utils/locationUtils";

type SchemaType = VehicleType | PropertyType;

const ImageGallery = lazy(
  () => import("@/components/listings/images/ImageGallery"),
);

interface ExtendedListing
  extends Omit<Listing, "images" | "category" | "details"> {
  seller?: {
    id: string;
    username: string;
    profilePicture: string | null;
    allowMessaging: boolean;
    privateProfile: boolean;
  };
  sellerId?: string;
  vehicleType?: VehicleType;
  propertyType?: PropertyType;
  details: {
    vehicles?: any;
    realEstate?: any;
    [key: string]: any; // Allow any other properties
  };
  images?: (string | File)[];
  price: number;
  title: string;
  description: string;
  category: {
    mainCategory: ListingCategory;
    subCategory: VehicleType | PropertyType;
  };
  location: any; // Location is required in the base Listing interface
}

// Helper component to safely convert any value to a string
const safeString = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object" && val !== null) {
    if ("toString" in val && typeof val.toString === "function") {
      return val.toString();
    }
    return JSON.stringify(val);
  }
  return String(val);
};

// Helper component to render a field value
const FieldValue = ({
  field,
  value,
}: {
  field: any;
  value: any;
}): React.ReactNode => {
  const { t } = useTranslation("listings");

  // Helper function to render translated text
  const renderText = (
    text: string | number | boolean,
    options?: { capitalize?: boolean },
  ): React.ReactNode => {
    if (text === undefined || text === null || text === "") {
      return <span className="text-gray-400">-</span>;
    }

    const strValue = safeString(text);

    // Try to translate the value
    let translated = strValue;
    try {
      // Try with field-specific translation first
      const fieldSpecificKey =
        `fields.${field?.name}.${strValue}`.toLowerCase();
      const fieldSpecificTranslation = t(fieldSpecificKey, {
        defaultValue: undefined,
      });

      if (fieldSpecificTranslation !== fieldSpecificKey) {
        translated = fieldSpecificTranslation;
      } else {
        // Fall back to general options translation
        translated = t(`options.${strValue}`, { defaultValue: strValue });
      }
    } catch (e) {
      console.error("Translation error:", e);
      translated = strValue;
    }

    return (
      <span className={options?.capitalize !== false ? "capitalize" : ""}>
        {translated}
      </span>
    );
  };

  // Handle empty values
  if (value === undefined || value === null || value === "") {
    return renderText("");
  }

  // Get the field type from the field definition or infer from the value
  const fieldType =
    field?.type ||
    (Array.isArray(value)
      ? "array"
      : value instanceof Date
        ? "date"
        : typeof value);

  // Handle primitive types first
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    // For boolean values, show Yes/No
    if (typeof value === "boolean") {
      return renderText(value ? "Yes" : "No");
    }
    return renderText(value);
  }

  // Handle special field types based on field type
  switch (fieldType) {
    case "colorpicker":
      return (
        <div className="flex items-center">
          <div
            className="w-5 h-5 rounded-full border border-gray-300 mr-2"
            style={{ backgroundColor: safeString(value) }}
          />
          <span className="uppercase">{safeString(value)}</span>
        </div>
      );

    case "date":
      try {
        const date = new Date(value);
        const formattedDate = !isNaN(date.getTime())
          ? date.toLocaleDateString()
          : safeString(value);
        return <span>{formattedDate}</span>;
      } catch (e) {
        console.error("Error formatting date:", e);
        return <span>{safeString(value)}</span>;
      }

    case "select":
    case "radio":
      // Handle select/radio fields with options
      if (field.options && Array.isArray(field.options)) {
        // Convert value to string for comparison if it's a number
        const stringValue = typeof value === "number" ? String(value) : value;

        const option = field.options.find((opt: any) => {
          if (!opt) return false;
          if (typeof opt === "object") {
            return (
              opt.value === value ||
              opt.value === stringValue ||
              opt.label === value ||
              opt === value ||
              (opt.value &&
                String(opt.value).toLowerCase() === String(value).toLowerCase())
            );
          }
          return (
            opt === value ||
            opt === stringValue ||
            String(opt).toLowerCase() === String(value).toLowerCase()
          );
        });

        if (option) {
          const displayText =
            typeof option === "object"
              ? option.label || option.value || ""
              : String(option);
          return renderText(displayText, { capitalize: true });
        }
      }
      // If no matching option found, try to display the raw value
      return renderText(value, { capitalize: true });

    case "number":
      return (
        <span>
          {typeof value === "number"
            ? value.toLocaleString()
            : safeString(value)}
        </span>
      );

    case "currency":
      return <span>{formatCurrency(Number(value))}</span>;

    case "array":
      if (!Array.isArray(value) || value.length === 0) {
        return renderText("");
      }
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => {
            if (item === undefined || item === null || item === "") {
              return null;
            }

            // Handle different types of array items
            let displayValue;
            if (typeof item === "object") {
              // If it's an object with label or value
              displayValue = item.label || item.value || "";
              // If it's an object with a name property (like for features)
              if (!displayValue && item.name) {
                displayValue = item.name;
              }
              // If it's an object with a value property that's an object
              if (typeof item.value === "object" && item.value !== null) {
                displayValue = item.value.label || item.value.value || "";
              }
            } else {
              // For primitive values
              displayValue = String(item);
            }

            if (!displayValue) return null;

            return (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm capitalize"
              >
                {renderText(displayValue, { capitalize: true })}
              </span>
            );
          })}
        </div>
      );

    default:
      // For unknown types, try to handle common cases
      const strValue = safeString(value);

      // If it looks like a translation key (contains dots), try to translate it
      if (typeof strValue === "string" && strValue.includes(".")) {
        const translated = renderTranslatedText(t, strValue, strValue);
        if (translated !== strValue) {
          return <span className="capitalize">{translated}</span>;
        }
      }

      // Default rendering
      return <span className="capitalize">{strValue}</span>;
  }
};

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
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${className}`}
  >
    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

// Field component for consistent field display
const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation("listings");
  const displayLabel = label.startsWith("fields.") ? t(label) : label;

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
        {displayLabel}
      </p>
      <div className="font-medium text-gray-900 dark:text-white">
        {children}
      </div>
    </div>
  );
};

const ListingDetails = () => {
  const { t } = useTranslation(["listings", "common"]);
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth(); // Removed unused navigate

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<ExtendedListing | null>(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState<{
    message: string;
    type: "question" | "offer" | "meeting";
  }>({
    message: "",
    type: "question",
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  // Debug: Log the listing data when it's loaded
  useEffect(() => {
    if (listing) {
      console.log("Listing data:", listing);
      console.log("Listing category:", listing.category);
      console.log("Listing details:", listing.details);
    }
  }, [listing]);

  // Get schema fields based on listing type
  const { essentialFields, advancedFields } = useMemo(() => {
    if (!listing) {
      console.log("No listing data yet");
      return { essentialFields: [], advancedFields: [] };
    }

    console.log("Listing category:", listing.category);

    // Get vehicle or property type from the appropriate location
    const vehicleType = listing.details?.vehicles?.vehicleType as VehicleType;
    const propertyType = listing.details?.realEstate
      ?.propertyType as PropertyType;

    console.log("Vehicle type from details:", vehicleType);
    console.log("Property type from details:", propertyType);

    // Determine the listing type based on the main category
    let listingType: SchemaType | undefined;

    if (listing.category?.mainCategory === ListingCategory.VEHICLES) {
      // For vehicles, use the vehicle type from details.vehicles
      listingType = vehicleType;
      console.log("Using vehicle type:", listingType);
    } else if (listing.category?.mainCategory === ListingCategory.REAL_ESTATE) {
      // For properties, use the property type from details.realEstate
      listingType = propertyType;
      console.log("Using property type:", listingType);
    } else {
      // Fallback to using the subCategory if available
      listingType = listing.category?.subCategory as SchemaType;
      console.log("Using subCategory as fallback:", listingType);
    }

    console.log("Determined listing type:", listingType);

    if (!listingType) {
      console.log("No listing type determined");
      return { essentialFields: [], advancedFields: [] };
    }

    // Helper function to get all possible fields from the listing data and schema
    const getAllPossibleFields = () => {
      const fields = new Set<string>();

      // Add all fields from the schema first
      const schemaFields = [
        ...getFieldsBySection(listingType, "essential"),
        ...getFieldsBySection(listingType, "advanced"),
      ];

      // Add all field names from schema
      schemaFields.forEach((field) => {
        fields.add(field.name);

        // Handle feature groups (safety, entertainment, etc.)
        if (field.featureGroups) {
          Object.values(field.featureGroups).forEach((group: any) => {
            if (group.features) {
              group.features.forEach((feature: any) => {
                fields.add(feature.name);
              });
            }
          });
        }
      });

      // Add all fields from listing.details.vehicles
      if (listing.details?.vehicles) {
        Object.keys(listing.details.vehicles).forEach((key) => {
          // Skip internal fields
          if (!["id", "listingId", "createdAt", "updatedAt"].includes(key)) {
            fields.add(key);
          }
        });
      }

      // Add common fields that might be at the listing level
      ["price", "title", "description", "location"].forEach((field) =>
        fields.add(field),
      );

      return Array.from(fields);
    };

    // Helper function to process and sort fields
    const processFields = (fields: any[]) => {
      const processedFields = [];
      const fieldMap = new Map();
      const allPossibleFields = getAllPossibleFields();

      // First, process all fields from the schema
      for (const field of fields) {
        let value = getFieldValue(listing, field.name);

        // Special handling for feature groups
        if (field.featureGroups) {
          const features: Array<{
            name: string;
            label: string;
            type: string;
            value: boolean;
          }> = [];

          // Process each feature group
          Object.values(field.featureGroups).forEach((group: any) => {
            if (group.features) {
              group.features.forEach((feature: any) => {
                if (feature.name) {
                  const featureValue = getFieldValue(listing, feature.name);
                  if (featureValue === true) {
                    features.push({
                      name: feature.name,
                      label: feature.label || `fields.${feature.name}`,
                      type: "boolean",
                      value: true,
                    });
                  }
                }
              });
            }
          });

          value = features.length > 0 ? features : undefined;
        }

        // Only add the field if it has a value or is required
        if (value !== undefined && value !== null && value !== "") {
          const processedField = {
            ...field,
            value,
            // Add type if not specified
            type: field.type || (Array.isArray(value) ? "array" : typeof value),
          };

          processedFields.push(processedField);
          fieldMap.set(field.name, processedField);

          if (process.env.NODE_ENV === "development") {
            console.log(`Processed field ${field.name} (${field.label}):`, {
              value,
              type: typeof value,
              isArray: Array.isArray(value),
              isEmpty:
                value === undefined ||
                value === null ||
                value === "" ||
                (Array.isArray(value) && value.length === 0),
            });
          }
        }
      }

      // Then, add any additional fields found in the listing data
      for (const fieldName of allPossibleFields) {
        if (!fieldMap.has(fieldName)) {
          const value = getFieldValue(listing, fieldName);

          // Skip empty values except for booleans (which can be false)
          const shouldInclude =
            value !== undefined &&
            value !== null &&
            (value !== "" || typeof value === "boolean");

          if (shouldInclude) {
            const field = {
              name: fieldName,
              label: `fields.${fieldName}`,
              type: Array.isArray(value) ? "array" : typeof value,
              section: "additional",
              value,
            };

            processedFields.push(field);
            fieldMap.set(fieldName, field);

            if (process.env.NODE_ENV === "development") {
              console.log(`Added additional field ${fieldName}:`, value);
            }
          }
        }
      }

      return processedFields.sort((a, b) => {
        // Sort required fields first, then by label
        if (a.required && !b.required) return -1;
        if (!a.required && b.required) return 1;
        return (a.label || "").localeCompare(b.label || "");
      });
    };

    // Get all fields for the determined type
    const allEssential = getFieldsBySection(listingType, "essential");
    const allAdvanced = getFieldsBySection(listingType, "advanced");

    // Process fields (get values and sort)
    const essential = processFields(allEssential);
    const advanced = processFields(allAdvanced);

    console.log("Essential fields:", essential);
    console.log("Advanced fields:", advanced);

    return {
      essentialFields: essential,
      advancedFields: advanced,
      listingType, // Include listingType in the return value for debugging
    };
  }, [listing]);

  // Fetch listing data
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await listingsAPI.getById(id);

        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to load listing");
        }

        setListing(response.data);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user?.id, isAuthenticated]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!listing?.id || !message.message.trim() || !listing.seller?.id) return;

    try {
      setSendingMessage(true);
      const messageData = {
        listingId: listing.id,
        recipientId: listing.seller.id, // Use seller.id instead of sellerId
        content: message.message,
        messageType: message.type,
        // Add any other required fields from ListingMessageInput
      };
      const response = await MessagesAPI.sendMessage(messageData);

      if (response.success) {
        setMessageSuccess(true);
        setMessage({ ...message, message: "" });
        setTimeout(() => setMessageSuccess(false), 3000);
      } else {
        throw new Error(response.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Handle error (e.g., show toast)
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="p-4 text-red-600">{error || "Listing not found"}</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div className="w-full">
          <Suspense fallback={<div>Loading images...</div>}>
            <ImageGallery images={listing.images || []} />
          </Suspense>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Title & Price */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {listing.title}
            </h1>
            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
              {formatCurrency(listing.price)}
            </div>
            {listing.location && (
              <div className="text-gray-600 dark:text-gray-300">
                {normalizeLocation(listing.location)}
              </div>
            )}
          </div>

          {/* Contact Seller */}
          {listing.seller && user?.id !== listing.seller.id && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                {t("contactSeller", { ns: "listings" })}
              </h2>
              {!showMessageForm ? (
                <button
                  onClick={() => setShowMessageForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {t("contactSeller", { ns: "listings" })}
                </button>
              ) : (
                <div className="space-y-4">
                  <select
                    value={message.type}
                    onChange={(e) =>
                      setMessage({
                        ...message,
                        type: e.target.value as
                          | "question"
                          | "offer"
                          | "meeting",
                      })
                    }
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="question">
                      {t("messageTypes.question", { ns: "listings" })}
                    </option>
                    <option value="offer">
                      {t("messageTypes.offer", { ns: "listings" })}
                    </option>
                    <option value="meeting">
                      {t("messageTypes.meeting", { ns: "listings" })}
                    </option>
                  </select>
                  <textarea
                    value={message.message}
                    onChange={(e) =>
                      setMessage({
                        ...message,
                        message: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    rows={4}
                    placeholder={t("typeYourMessage", { ns: "listings" })}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowMessageForm(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t("cancel", { ns: "common" })}
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !message.message.trim()}
                      className={`px-4 py-2 rounded-lg text-white ${
                        sendingMessage
                          ? "bg-blue-400"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {sendingMessage
                        ? t("sending", { ns: "common" })
                        : t("send", { ns: "common" })}
                    </button>
                  </div>
                  {messageSuccess && (
                    <div className="mt-2 text-green-600 dark:text-green-400 flex items-center">
                      <CheckCircle className="mr-1" size={16} />
                      {t("messageSent", { ns: "listings" })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Debug Info - Only show in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
            Debug Info
          </h3>
          <div className="text-sm mb-2">
            Listing Type: {listing.category?.mainCategory} /{" "}
            {listing.category?.subCategory}
          </div>
          <pre className="text-xs overflow-auto p-2 bg-white dark:bg-gray-800 rounded mt-2">
            {JSON.stringify(
              {
                essentialFields: essentialFields.map((f) => ({
                  name: f.name,
                  label: f.label,
                  value: getFieldValue(listing, f.name),
                })),
                advancedFields: advancedFields.map((f) => ({
                  name: f.name,
                  label: f.label,
                  value: getFieldValue(listing, f.name),
                })),
                listingKeys: Object.keys(listing),
                detailsKeys: listing.details
                  ? Object.keys(listing.details)
                  : [],
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}

      {/* Essential Details */}
      {essentialFields.length > 0 && (
        <Section
          title={t("essentialDetails", { ns: "listings" })}
          className="mt-8"
        >
          {essentialFields.map((field) => {
            const value = getFieldValue(listing, field.name);
            // Always render the field if it's in essentialFields (already filtered)
            return (
              <Field key={field.name} label={field.label}>
                <FieldValue field={field} value={value} />
              </Field>
            );
          })}
        </Section>
      )}

      {/* Advanced Details */}
      {advancedFields.length > 0 && (
        <Section
          title={t("technicalSpecs", { ns: "listings" })}
          className="mt-6"
        >
          {advancedFields.map((field) => {
            const value = getFieldValue(listing, field.name);
            // Always render the field if it's in advancedFields (already filtered)
            return (
              <Field key={field.name} label={field.label}>
                <FieldValue field={field} value={value} />
              </Field>
            );
          })}
        </Section>
      )}

      {/* Description */}
      {listing.description && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t("description", { ns: "listings" })}
          </h2>
          <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
            {listing.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ListingDetails;
