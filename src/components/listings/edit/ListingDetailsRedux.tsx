import React, {
  useState,
  useEffect,
  useMemo,
  Suspense,
  lazy,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, Flag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import * as listingDetailsActions from "@/store/listing/listingDetails.actions";
import { toast } from "sonner";

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
import { useAuth } from "@/hooks/useAuth";
import type { VehicleType, PropertyType } from "@/types/enums";
import { ListingCategory } from "@/types/enums";
type SchemaType = VehicleType | PropertyType;
import { formatCurrency } from "@/utils/formatUtils";
import { normalizeLocation } from "@/utils/locationUtils";
import { getFieldsBySection, getFieldValue } from "@/utils/listingSchemaUtils";

const UnifiedImageGallery = lazy(
  () => import("@/components/listings/images/UnifiedImageGallery"),
);

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

  // Skip rendering entirely for empty/meaningless values
  const hasMeaningfulValue = 
    value !== undefined && 
    value !== null && 
    value !== "" &&
    value !== "Not provided" &&
    value !== "None" &&
    value !== "-" &&
    (typeof value !== "string" || value.trim() !== "") &&
    String(value).toLowerCase() !== "no" &&
    String(value).toLowerCase() !== "لا";

  if (!hasMeaningfulValue) {
    return null;
  }

  // Helper function to render translated text
  const renderText = (
    text: string | number | boolean,
    options?: { capitalize?: boolean },
  ): React.ReactNode => {
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
    // Handle Yes/No values - show checkmark for Yes, hide No completely
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase().trim();
      if (lowerValue === "yes") {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      }
      if (lowerValue === "no") {
        return null; // Hide "No" values completely
      }
    }
    
    // For boolean values, show checkmark for true, hide false
    if (typeof value === "boolean") {
      return value ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : null;
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

    case "boolean":
    case "checkbox":
      if (value === true || (typeof value === 'string' && value.toLowerCase() === 'yes')) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      }
      return null;

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

      // Handle Yes/No values - show checkmark for Yes, hide No completely
      if (typeof strValue === "string") {
        const lowerValue = strValue.toLowerCase().trim();
        if (lowerValue === "yes" || lowerValue === "نعم") {
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          );
        }
        if (lowerValue === "no" || lowerValue === "لا") {
          return null; // Hide "No" values completely
        }
      }

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
  
  // Skip rendering entirely if children is empty/meaningless
  const hasMeaningfulContent = 
    children !== null && 
    children !== undefined && 
    children !== "" &&
    String(children).trim() !== "" &&
    String(children) !== "-" &&
    String(children).toLowerCase() !== "no" &&
    String(children).toLowerCase() !== "لا" &&
    String(children).toLowerCase() !== "none" &&
    String(children).toLowerCase() !== "not provided";
    
  if (!hasMeaningfulContent) {
    return null;
  }
  
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
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  // Get state from Redux store
  const { loading, error, listing, showMessageForm, messageSuccess } =
    useSelector((state: RootState) => state.listingDetails);

  // Local state for sending message loading state
  const [sendingMessage, setSendingMessage] = useState(false);

  // Local state for message form
  const [message, setMessage] = useState<{
    content: string;
    type: "question" | "offer" | "meeting";
  }>({ content: "", type: "question" });

  // Report state
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportType, setReportType] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Fetch listing details when component mounts or id changes
  useEffect(() => {
    if (id) {
      const res = listingsAPI.increaseViewCount(id);
      console.log(res);
      dispatch(listingDetailsActions.fetchListingDetails(id));
    }

    // Cleanup function to reset state when component unmounts
    return () => {
      dispatch(listingDetailsActions.resetListingDetailsState());
    };
  }, [id, dispatch, isAuthenticated]);

  // Toggle message form visibility
  const toggleMessageForm = useCallback(
    (isVisible: boolean) => {
      dispatch(listingDetailsActions.setMessageFormVisibility(isVisible));
    },
    [dispatch],
  );

  // Handle message input change
  const handleMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage((prev) => ({
        ...prev,
        content: e.target.value,
      }));
    },
    [],
  );

  // Handle message type change
  const handleMessageTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMessage((prev) => ({
        ...prev,
        type: e.target.value as "question" | "offer" | "meeting",
      }));
    },
    [],
  );

  // Handle send message
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!listing?.id || !message.content.trim() || !listing.seller?.id)
        return;

      try {
        setSendingMessage(true);

        // Use the Redux thunk action to send the message
        await dispatch(
          listingDetailsActions.sendMessage(
            listing.id,
            message.content,
            message.type,
          ),
        );

        // Reset the form
        setMessage({ content: "", type: "question" });

        // Show success message and hide form after delay
        setTimeout(() => {
          toggleMessageForm(false);
        }, 3000);
      } catch (err) {
        console.error("Error sending message:", err);
      } finally {
        setSendingMessage(false);
      }
    },
    [listing, message, dispatch, toggleMessageForm],
  );

  // Handle report submission
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !reportType) return;

    try {
      setIsReporting(true);
      // Here you would typically call your API to submit the report
      // For example: await ReportsAPI.createReport({
      //   targetId: listing.id,
      //   type: reportType,
      //   reason: reportReason,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Report submitted successfully");
      setShowReportForm(false);
      setReportReason("");
      setReportType("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsReporting(false);
    }
  };

  // Get schema fields based on listing type
  const { essentialFields, advancedFields } = useMemo(() => {
    if (!listing) {
      console.log("No listing data yet");
      return { essentialFields: [] as any[], advancedFields: [] as any[] };
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

        // Only add the field if it has a meaningful value
        const hasMeaningfulValue = 
          value !== undefined && 
          value !== null && 
          value !== "" && 
          value !== "Not provided" && 
          value !== "None" && 
          value !== "-" &&
          (typeof value !== "string" || value.trim() !== "");
        
        if (hasMeaningfulValue) {
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

          // Skip empty values, null values, empty strings, and "Not provided"
          const shouldInclude =
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value !== "Not provided" &&
            value !== "None" &&
            value !== "-" &&
            (typeof value !== "string" || value.trim() !== "");

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
        dispatch({
          type: listingDetailsActions.LISTING_DETAILS_TYPES.SET_LOADING,
          payload: true,
        });
        const response = await listingsAPI.getById(id);

        if (!response.success || !response.data) {
          throw new Error(response.error || "Failed to load listing");
        }

        dispatch({
          type: listingDetailsActions.LISTING_DETAILS_TYPES.SET_LISTING_DETAILS,
          payload: response.data,
        });
      } catch (err) {
        console.error("Error fetching listing:", err);
        dispatch({
          type: listingDetailsActions.LISTING_DETAILS_TYPES.SET_ERROR,
          payload:
            err instanceof Error ? err.message : "An unknown error occurred",
        });
      } finally {
        dispatch({
          type: listingDetailsActions.LISTING_DETAILS_TYPES.SET_LOADING,
          payload: false,
        });
      }
    };

    fetchListing();

    // Cleanup on unmount
    return () => {
      dispatch({
        type: listingDetailsActions.LISTING_DETAILS_TYPES.RESET_STATE,
      });
    };
  }, [id, user?.id, dispatch]);

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
            <UnifiedImageGallery images={listing.images || []} />
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

          {/* Contact & Report Section */}
          {listing.seller && user?.id !== listing.seller.id && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {t("contactSeller", { ns: "listings" })}
                </h2>
                {!showMessageForm ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        dispatch(
                          listingDetailsActions.setMessageFormVisibility(true),
                        )
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {t("contactSeller", { ns: "listings" })}
                    </button>
                    <button
                      onClick={() => setShowReportForm(true)}
                      className="flex items-center justify-center w-12 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-3 rounded-lg transition-colors"
                      title="Report this listing"
                    >
                      <Flag size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <select
                      value={message.type}
                      onChange={handleMessageTypeChange}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    >
                      {Object.entries({
                        question: t("messageTypes.question", {
                          ns: "listings",
                        }),
                        offer: t("messageTypes.offer", { ns: "listings" }),
                        meeting: t("messageTypes.meeting", { ns: "listings" }),
                      }).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={message.content}
                      onChange={handleMessageChange}
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      rows={4}
                      placeholder={t("typeYourMessage", { ns: "listings" })}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() =>
                          dispatch(
                            listingDetailsActions.setMessageFormVisibility(
                              false,
                            ),
                          )
                        }
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t("cancel", { ns: "common" })}
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={sendingMessage || !message.content.trim()}
                        className={`px-4 py-2 rounded-lg text-white ${
                          sendingMessage
                            ? "bg-blue-400"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {sendingMessage
                          ? t("sending", { ns: "common" })
                          : message.type === "question"
                            ? t("sendQuestion", { ns: "listings" })
                            : message.type === "offer"
                              ? t("sendOffer", { ns: "listings" })
                              : t("requestMeeting", { ns: "listings" })}
                      </button>
                      {sendingMessage && (
                        <span className="ml-2">
                          <svg
                            className="animate-spin h-4 w-4 text-white inline-block"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </span>
                      )}
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

              {/* Report Form */}
              {showReportForm && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Report Listing</h2>
                    <button
                      onClick={() => {
                        setShowReportForm(false);
                        setReportReason("");
                        setReportType("");
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Reason for Report
                      </label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        required
                      >
                        <option value="">Select a reason</option>
                        <option value="spam">Spam or Scam</option>
                        <option value="inappropriate">
                          Inappropriate Content
                        </option>
                        <option value="misleading">
                          Misleading Information
                        </option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Additional Details
                      </label>
                      <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                        placeholder="Please provide more details about your report"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowReportForm(false);
                          setReportReason("");
                          setReportType("");
                        }}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={isReporting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
                        disabled={
                          isReporting || !reportReason.trim() || !reportType
                        }
                      >
                        {isReporting ? "Submitting..." : "Submit Report"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>



      {/* التفاصيل الأساسية */}
      {essentialFields.length > 0 && (
        <Section
          title="التفاصيل الأساسية"
          className="mt-8"
        >
          {essentialFields.map((field) => {
            const value = getFieldValue(listing, field.name);
            
            // Skip rendering if value is empty or meaningless
            const hasMeaningfulValue = 
              value !== undefined && 
              value !== null && 
              value !== "" && 
              value !== "Not provided" && 
              value !== "None" && 
              value !== "-" &&
              (typeof value !== "string" || value.trim() !== "");
            
            if (!hasMeaningfulValue) {
              return null;
            }
            
            return (
              <Field key={field.name} label={field.label}>
                <FieldValue field={field} value={value} />
              </Field>
            );
          })}
        </Section>
      )}

      {/* التفاصيل المتقدمة */}
      {advancedFields.length > 0 && (
        <Section
          title="التفاصيل المتقدمة"
          className="mt-8"
        >
          {advancedFields.map((field) => {
            const value = getFieldValue(listing, field.name);
            
            // Skip rendering if value is empty or meaningless
            const hasMeaningfulValue = 
              value !== undefined && 
              value !== null && 
              value !== "" && 
              value !== "Not provided" && 
              value !== "None" && 
              value !== "-" &&
              (typeof value !== "string" || value.trim() !== "");
            
            if (!hasMeaningfulValue) {
              return null;
            }
            
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
