import { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

// Hooks
import { useListingStore } from "@/hooks/useListingEdit";
import { useSocket } from "@/contexts/SocketContext";

// Utils & Types
import { getFieldsBySection } from "@/utils/listingSchemaUtils";
import { VehicleType, PropertyType } from "@/types/enums";
import { updateListing as updateListingAction } from "@/store/listing/listingEdit.actions";
import type { AppDispatch } from "@/store/store";
import { PRICE_CHANGE } from "@/constants/socketEvents";

// Components
import { ImageManager } from "@/components/listings/images/ImageManager";
import { ACTIVE_API_URL } from "@/config";
 

// Types
type SectionId =
  | "basic"
  | "essential"
  | "advanced"
  | "features"
  | "location"
  | "media"
  | "pricing"
  | "contact"
  | "images";
type SupportedFieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "color"
  | "colorpicker"
  | "boolean"
  | "multiselect"
  | "date"
  | "file"
  | "feature-group"
  | "featureGroup"
  | "radio"
  | "toggle"
  | "datetime"
  | "time"
  | "email"
  | "tel"
  | "url"
  | "password";

interface FieldOption {
  value: string;
  label: string;
}

interface IFormData {
  [key: string]: any;
  images?: File[];
  details?: {
    [key: string]: any;
    vehicles?: {
      [key: string]: any;
    };
  };
}

// interface EditListingReduxProps {}

// const EditListingRedux: React.FC<EditListingReduxProps> = () => {
const EditListingRedux = () => {
  interface ExtendedFieldProps {
    name: string;
    label: string;
    type: SupportedFieldType;
    value: any;
    options?: FieldOption[];
    required?: boolean;
    placeholder?: string;
    description?: string;
    section?: string;
    featureGroups?: Record<
      string,
      {
        label: string;
        features: Array<{
          name: string;
          label: string;
          type: string;
          options?: Array<{ value: string; label: string }>;
          required?: boolean;
          description?: string;
        }>;
      }
    >;
    onChange: typeof createFieldChangeHandler;
  }

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { socket } = useSocket();

  const {
    formData = { images: [] } as IFormData,
    loading,
    currentListing,
    fetchListing: fetchListingAction,
    setFormData: setFormDataAction,
    setLoading,
  } = useListingStore();

  const [activeTab, setActiveTab] = useState<SectionId>("basic");

  const getFieldValue = useCallback((obj: any, path: string): any => {
    if (!obj) return undefined;
    return path.split(".").reduce((o, p) => (o || {})[p], obj);
  }, []);

  const listingType = useMemo<VehicleType | PropertyType | null>(() => {
    if (!currentListing) {
      console.log("No currentListing available");
      return null;
    }

    const listingData = currentListing as any;
    const type =
      listingData.listingType ||
      listingData.details?.type ||
      listingData.type ||
      listingData.category?.subCategory;

    console.log("Derived listing type:", {
      type,
      hasListingType: !!listingData.listingType,
      hasDetailsType: !!listingData.details?.type,
      hasType: !!listingData.type,
      hasCategory: !!listingData.category?.subCategory,
      category: listingData.category,
      currentListing: listingData,
    });

    if (!type) {
      console.error("Could not determine listing type from:", listingData);
      return null;
    }

    if (Object.values(VehicleType).includes(type as VehicleType)) {
      console.log("Vehicle type detected:", type);
      return type as VehicleType;
    }
    if (Object.values(PropertyType).includes(type as PropertyType)) {
      console.log("Property type detected:", type);
      return type as PropertyType;
    }

    console.error("Unsupported listing type:", type);
    return null;
  }, [currentListing]);

  // Enhanced setFieldValue to handle nested paths and array indices
  const setFieldValue = useCallback(
    (name: string, value: any) => {
      setFormDataAction((prev: IFormData) => {
        const setNestedValue = (obj: any, path: string, val: any): any => {
          const [current, ...rest] = path.split(".");

          // Handle array indices in path (e.g., 'features[0].name')
          const arrayMatch = current.match(/(.*?)\[(\d+)\]/);
          if (arrayMatch) {
            const arrayPath = arrayMatch[1];
            const index = parseInt(arrayMatch[2], 10);
            const array = obj[arrayPath] || [];

            if (rest.length === 0) {
              // Direct array item assignment
              const newArray = [...array];
              newArray[index] = val;
              return { ...obj, [arrayPath]: newArray };
            } else {
              // Nested path within array item
              const item = array[index] || {};
              const updatedItem = setNestedValue(item, rest.join("."), val);
              const newArray = [...array];
              newArray[index] = updatedItem;
              return { ...obj, [arrayPath]: newArray };
            }
          }

          if (rest.length === 0) {
            // Base case: set the value
            return { ...obj, [current]: val };
          }

          // Recursive case: traverse the path
          return {
            ...obj,
            [current]: setNestedValue(obj[current] || {}, rest.join("."), val),
          };
        };

        return setNestedValue(prev, name, value);
      });
    },
    [setFormDataAction],
  );

  // Enhanced mapFieldType with support for more field types and validation
  const mapFieldType = useCallback((field: any): SupportedFieldType => {
    if (!field || !field.type) return "text";

    const type = field.type.toLowerCase();
    const typeMap: Record<string, SupportedFieldType> = {
      // Basic types
      text: "text",
      string: "text",
      number: "number",
      integer: "number",
      float: "number",
      decimal: "number",

      // Complex types
      textarea: "textarea",
      select: "select",
      toggle: "checkbox",
      checkbox: "checkbox",
      radio: "select",
      color: "color",
      colorpicker: "color",
      boolean: "checkbox",
      multiselect: "multiselect",
      date: "date",
      datetime: "date",
      time: "text",
      email: "text",
      tel: "text",
      url: "text",
      password: "text",
      file: "file",
      image: "file",

      // Special types
      feature: "multiselect",
      "feature-group": "feature-group",

      // Fallback
      default: "text",
    };

    // Handle special cases
    if (field.options) return "select";
    if (field.featureGroups) return "multiselect";
    if (field.multiple) return "multiselect";

    return typeMap[type] || typeMap.default;
  }, []);

  const section = useMemo(
    () =>
      activeTab === "basic"
        ? "essential"
        : activeTab === "advanced"
          ? "advanced"
          : "essential",
    [activeTab],
  );

  const sectionFields = useMemo(() => {
    if (!listingType) return [];
    console.log("Getting fields for:", { listingType, section });
    return getFieldsBySection(listingType, section) || [];
  }, [listingType, section]);

  // Create a memoized handler creator for field changes
  const createFieldChangeHandler = useCallback(
    (fieldName: string, fieldType: string) => {
      return (newValue: any) => {
        const finalValue =
          fieldType === "checkbox" ? Boolean(newValue) : newValue;
        setFieldValue(fieldName, finalValue);
      };
    },
    [setFieldValue],
  );

  // Process field value based on its type
  const processFieldValue = (field: any, value: any) => {
    if (value === undefined || value === null) return value;

    // Handle different field types
    switch (field.type) {
      case "number":
      case "integer":
      case "float":
      case "decimal":
        return Number(value);
      case "boolean":
      case "checkbox":
      case "toggle":
        return Boolean(value);
      case "date":
      case "datetime":
        console.log("Date value:", value);
        return value ? new Date(value).toISOString() : null;
      case "multiselect":
        return Array.isArray(value) ? value : [value].filter(Boolean);
      default:
        return value;
    }
  };

  // Get all fields including nested ones
  const getAllNestedFields = useCallback(
    (fields: any[], parentPath = ""): any[] => {
      const result: any[] = [];

      fields.forEach((field) => {
        const fieldPath = parentPath
          ? `${parentPath}.${field.name}`
          : field.name;

        // Add the field itself
        result.push({
          ...field,
          path: fieldPath,
          fullPath: fieldPath, // For backward compatibility
        });

        // Handle nested fields in feature groups
        if (field.type === "feature-group" && field.featureGroups) {
          Object.entries(field.featureGroups).forEach(
            ([groupName, group]: [string, any]) => {
              if (group.features) {
                group.features.forEach((feature: any) => {
                  const featurePath = `${fieldPath}.${groupName}.${feature.name}`;
                  result.push({
                    ...feature,
                    path: featurePath,
                    fullPath: featurePath,
                    isFeature: true,
                    parentGroup: field.name,
                    groupName,
                    groupLabel: group.label,
                    section: field.section,
                  });
                });
              }
            },
          );
        }
      });

      return result;
    },
    [],
  );

  // Get all fields for the current section
  // const currentFields = useMemo<ExtendedFieldProps[]>(() => {
  const currentFields = useMemo(() => {
    if (!currentListing || !listingType || !sectionFields.length) {
      return [];
    }

    console.log("Calculating currentFields", { listingType, activeTab });

    // Get all fields including nested ones
    const allFields = getAllNestedFields(sectionFields);

    console.log("allFields :", allFields);

    return allFields.map((field) => {
      const fieldName = field.path || field.name;
      const mappedType = mapFieldType(field);
      const value = getFieldValue(formData, fieldName);

      // Process options for select fields
      const options = Array.isArray(field.options)
        ? field.options.map((opt: any) => {
            if (typeof opt === "string") {
              return { value: opt, label: opt };
            }
            return {
              value: String(opt.value),
              label: String(opt.label || opt.value),
              translationKey: opt.translationKey,
            };
          })
        : undefined;

      // Handle feature options
      let featureOptions;
      if (field.isFeature && field.parentGroup) {
        const parentField = sectionFields.find(
          (f) => f.name === field.parentGroup,
        );
        if (parentField?.featureGroups?.[field.groupName]?.features) {
          featureOptions = parentField.featureGroups[
            field.groupName
          ].features.map((f: any) => ({
            value: f.name,
            label: f.label || f.name,
            translationKey: f.translationKey,
          }));
        }
      }

      console.log("Field value for ", fieldName, ": ", value);

      return {
        name: fieldName,
        label: field.label || field.name,
        type: mappedType,
        value: processFieldValue(field, value),
        options: featureOptions || options,
        required: !!field.required,
        placeholder: field.placeholder,
        description: field.description,
        tooltip: field.tooltip,
        disabled: field.disabled,
        readOnly: field.readOnly,
        min: field.min,
        max: field.max,
        step: field.step,
        pattern: field.pattern,
        rows: field.rows,
        cols: field.cols,
        multiple: field.multiple,
        accept: field.accept,
        autoComplete: field.autoComplete,
        autoFocus: field.autoFocus,
        onChange: createFieldChangeHandler(fieldName, mappedType),
        key: fieldName,
        className: field.className,
        style: field.style,
        // Additional metadata
        isFeature: field.isFeature,
        parentGroup: field.parentGroup,
        groupName: field.groupName,
        groupLabel: field.groupLabel,
        section: field.section,
      };
    });
  }, [
    sectionFields,
    formData,
    getFieldValue,
    mapFieldType,
    listingType,
    activeTab,
    createFieldChangeHandler,
    getAllNestedFields,
  ]);

  const dispatch = useDispatch<AppDispatch>();

  // Process form data before submission
  const prepareFormData = (data: any) => {
    const formData = new FormData();

    const appendFormData = (key: string, value: any) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((item) => appendFormData(key, item));
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    };

    // Process all fields, including nested ones
    const processObject = (obj: any, prefix = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof File)
        ) {
          processObject(value, fullKey);
        } else {
          appendFormData(fullKey, value);
        }
      });
    };

    processObject(data);
    return formData;
  };

  // Handle file uploads
  const handleFileUploads = async (files: (File | string | FileMetadata)[]) => {
    const uploadedUrls: string[] = [];
    const newFiles = files.filter((file) => {
      console.log("Image file type: ", file);
      return true;
    }) as File[];

    console.log("[handleFileUploads] newFiles: ", newFiles);

    // Upload new files
    for (const file of newFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        // Let the backend handle authentication via cookies
        const response = await fetch(`${ACTIVE_API_URL}/uploads/upload`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        uploadedUrls.push(data.url);
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error(`Failed to upload file: ${file.name}`);
      }
    }

    // Add existing file URLs
    const existingUrls = files
      .filter((file) => typeof file === "string")
      .map((file) => file as string);

    return [...existingUrls, ...uploadedUrls];
  };

  // Main form submission handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("[handleSubmit] Form submission started");

      if (!currentListing?.id || !formData) {
        console.error("Missing required data");
        toast.error("Missing required data");
        return;
      }

      try {
        dispatch(setLoading(true));

        // Process all form fields
        const processedData = { ...formData };

        // Process each field according to its type
        const allFields = getAllNestedFields(sectionFields);
        allFields.forEach((field) => {
          const fieldName = field.path || field.name;
          const value = formData[fieldName];

          if (value !== undefined) {
            processedData[fieldName] = processFieldValue(field, value);
          }
        });

        // Handle file uploads
        const { images, ...otherData } = processedData;
        console.log("[handleSubmit] Images to upload:", images);
        const uploadedImages = await handleFileUploads(images || []);
        console.log("[handleSubmit] Uploaded images:", uploadedImages);

        // Prepare final data with uploaded files
        const submissionData = {
          ...otherData,
          images: uploadedImages,
        };

        // Convert to FormData
        const formDataToSubmit = prepareFormData(submissionData);

        console.log("[handleSubmit] Dispatching updateListingAction");

        // Submit the data
        const result = await dispatch(
          updateListingAction(currentListing.id, formDataToSubmit),
        );

        console.log(
          "[handleSubmit] Received result from updateListingAction:",
          {
            success: result?.success,
            hasError: !!result?.error,
            error: result?.error,
          },
        );

        if (result?.success) {
          toast.success("Listing updated successfully");
          navigate(`/listings/${currentListing.id}`);
        } else {
          throw new Error(result?.error || "Failed to update listing");
        }
      } catch (error) {
        console.error("Error updating listing:", error);
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(errorMessage);
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [
      currentListing,
      formData,
      dispatch,
      navigate,
      sectionFields,
      getAllNestedFields,
    ],
  );

  // Get the current loading state from Redux
  const { loading: currentLoadingState } = useListingStore();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[handleFormSubmit] Starting form submission");

    try {
      console.log("[handleFormSubmit] Calling handleSubmit");
      await handleSubmit(e);
      console.log("[handleFormSubmit] handleSubmit completed successfully");
    } catch (error) {
      console.error("[handleFormSubmit] Error caught in handleFormSubmit:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });
    } finally {
      console.log("[handleFormSubmit] Entering finally block");
      console.log(
        `[handleFormSubmit] Current loading state: ${currentLoadingState}`,
      );

      if (currentLoadingState) {
        console.log(
          "[handleFormSubmit] Loading state is still true, resetting it",
        );
        try {
          dispatch(setLoading(false));
          console.log("[handleFormSubmit] Successfully reset loading state");
        } catch (dispatchError) {
          console.error(
            "[handleFormSubmit] Error resetting loading state:",
            dispatchError,
          );
        }
      } else {
        console.log("[handleFormSubmit] Loading state is already false");
      }
    }
  };

  type FileMetadata = {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    isNew?: boolean; // Flag to indicate this is a new file that needs upload
  };

  const handleImagesChange = useCallback(
    (newImages: File[]) => {
      console.log("handleImagesChange called with:", newImages);

      if (!formData) return;

      // Convert new File objects to serializable metadata
      const newFileMetadata = newImages.map(
        (file: File): FileMetadata => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          isNew: true, // Mark as new file that needs upload
        }),
      );

      // Get existing images, keeping both string URLs and metadata objects
      const existingImages = (formData.images || []).filter(
        (img: File | string | FileMetadata) => {
          // Keep string URLs as is
          if (typeof img === "string") return true;

          // For File objects or metadata, check if they're being replaced by new files
          const isFile = img instanceof File;
          const name = isFile ? img.name : (img as FileMetadata).name;
          const size = isFile ? img.size : (img as FileMetadata).size;

          return !newImages.some(
            (newImg) => newImg.name === name && newImg.size === size,
          );
        },
      ) as (string | FileMetadata)[];

      // Combine existing images with new metadata
      const updatedFormData = {
        ...formData,
        images: [...existingImages, ...newFileMetadata],
      };

      setFormDataAction(updatedFormData);
    },
    [formData, setFormDataAction],
  );

  const handleDeleteExistingImage = useCallback(
    async (imageUrl: string) => {
      if (!id) return;

      try {
        // Optimistically update the UI
        setFormDataAction((prev: IFormData) => ({
          ...prev,
          images: (prev.images || []).filter((img) => {
            if (typeof img === "string") return img !== imageUrl;
            if (img && typeof img === "object" && "url" in img)
              return (img as any).url !== imageUrl;
            return true;
          }),
        }));

        // Let the backend handle authentication via cookies
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || "/api"}/listings/${id}/images`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ imageUrl }),
          },
        );

        if (!response.ok) {
          // If the API call fails, refetch the listing to restore the correct state
          await fetchListingAction(id);
          throw new Error("Failed to delete image");
        }

        toast.success("Image deleted successfully");
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error("Failed to delete image");

        // Ensure we have the latest state after an error
        if (id) {
          await fetchListingAction(id);
        }
      }
    },
    [id, fetchListingAction],
  );

  const renderField = useCallback((field: ExtendedFieldProps) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: field.value ?? "",
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
        let value: any = e.target.value;

        if (field.type === "number") {
          value = parseFloat(value) || 0;
        } else if (field.type === "checkbox") {
          value = (e.target as HTMLInputElement).checked;
        }

        field.onChange(value, field.name);
      },
      placeholder: field.placeholder,
      className:
        "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
    };

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={3}
            className={`${commonProps.className} min-h-[100px]`}
            value={field.value || ""}
          />
        );

      case "select":
        return (
          <select
            {...commonProps}
            value={field.value || ""}
            className={`${commonProps.className} cursor-pointer`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            id={field.name}
            name={field.name}
            checked={Boolean(field.value)}
            onChange={commonProps.onChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );

      default:
        return (
          <input
            type={field.type || "text"}
            {...commonProps}
            className={`${commonProps.className} ${field.type === "color" ? "h-10 p-1" : ""}`}
          />
        );
    }
  }, []);

  const handleReorderExistingImages = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!currentListing?.images) return;

      const newImages = [...currentListing.images];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);

      // Update the current listing with the new order
      setFormDataAction((prev: IFormData) => ({
        ...prev,
        images: newImages,
      }));
    },
    [currentListing?.images, setFormDataAction],
  );

  const renderImagesTab = useCallback((): JSX.Element => {
    // Handle existing images from the server
    const existingImages = currentListing?.images
      ? (currentListing.images as Array<unknown>)
          .filter((img: unknown): img is { url: string } => {
            if (!img || typeof img !== "object") return false;
            return (
              "url" in img && typeof (img as { url: unknown }).url === "string"
            );
          })
          .map((img) => img.url)
      : [];

    // Get uploaded files
    const uploadedFiles = (formData.images || []).filter(
      (img: unknown): img is File => img instanceof File,
    );

    console.log("Rendering ImageManager with:", {
      uploadedFiles,
      existingImages,
      formDataImages: formData.images,
    });

    return (
      <div className="mt-4">
        <div className="mb-4"></div>

        <ImageManager
          images={uploadedFiles}
          onChange={handleImagesChange}
          existingImages={existingImages}
          onDeleteExisting={handleDeleteExistingImage}
          onReorderExisting={handleReorderExistingImages}
          maxImages={10}
        />

        {/* Hidden file input for direct file selection */}
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            console.log("File input changed, files:", files);
            if (files.length > 0) {
              handleImagesChange([...uploadedFiles, ...files]);
            }
            // Reset the input to allow selecting the same file again
            e.target.value = "";
          }}
        />
      </div>
    );
  }, [
    currentListing?.images,
    formData.images,
    handleImagesChange,
    handleDeleteExistingImage,
    handleReorderExistingImages,
  ]);

  const fetchListing = useCallback(
    async (listingId: string) => {
      // Skip if already loading or if we already have the listing data
      if (loading || currentListing?.id === listingId) {
        return;
      }

      try {
        setLoading(true);
        await fetchListingAction(listingId);
      } catch (error) {
        console.error("Error loading listing:", error);
        toast.error("Failed to load listing");
      } finally {
        setLoading(false);
      }
    },
    [fetchListingAction, setLoading, loading, currentListing?.id],
  );

  // Fetch listing on mount or when ID changes
  useEffect(() => {
    if (!id) {
      navigate("/listings");
      return;
    }

    const loadListing = async () => {
      await fetchListing(id);
    };

    loadListing();
  }, [id, navigate, fetchListing]);

  useEffect(() => {
    if (!socket) return undefined;

    const handlePriceUpdate = (data: { listingId: string; price: number }) => {
      if (data.listingId === currentListing?.id) {
        setFormDataAction((prev: IFormData) => ({
          ...prev,
          price: data.price,
        }));
        toast.success(`Price updated to $${data.price}`);
      }
    };

    socket.on(PRICE_CHANGE, handlePriceUpdate);

    return () => {
      socket.off(PRICE_CHANGE, handlePriceUpdate);
    };
  }, [socket, currentListing?.id, setFormDataAction]);

  if (loading && !currentListing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <span>← Back to Listings</span>
        </button>
        <h1 className="text-2xl font-bold">Edit Listing</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "basic"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Information
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "advanced"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("advanced")}
          >
            Advanced Details
          </button>
          <button
            className={`px-4 py-2 font-medium ml-auto ${
              activeTab === "images"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("images")}
          >
            Images
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentFields.map((field) => (
                  <div key={field.name} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderField(field as any)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentFields.map((field) => {
                  // Skip if this is a basic field
                  if (
                    field.section === "basic" ||
                    field.section === "essential"
                  ) {
                    return null;
                  }

                  return (
                    <div key={field.name} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {renderField(field as any)}
                      {field.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {field.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Render feature groups */}
              {sectionFields
                .filter(
                  (field) =>
                    (field.type as string) === "feature-group" ||
                    field.type === "featureGroup",
                )
                .map((group) => (
                  <div key={group.name} className="col-span-full mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                      {group.featureGroups &&
                        Object.entries(group.featureGroups).map(
                          ([groupName, groupData]: [string, any]) => (
                            <div key={groupName} className="space-y-4">
                              <h4 className="font-medium text-gray-700">
                                {groupData.label}
                              </h4>
                              <div className="space-y-3">
                                {groupData.features?.map((feature: any) => {
                                  const fieldName = `${group.name}.${groupName}.${feature.name}`;
                                  const field = currentFields.find(
                                    (f) => f.name === fieldName,
                                  );

                                  if (!field) return null;

                                  return (
                                    <div
                                      key={field.name}
                                      className="flex items-center"
                                    >
                                      <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                          {field.label}
                                          {field.required && (
                                            <span className="text-red-500 ml-1">
                                              *
                                            </span>
                                          )}
                                        </label>
                                        {field.description && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {field.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className="ml-4">
                                        {renderField(field as any)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ),
                        )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === "images" && (
            <div className="space-y-4">{renderImagesTab()}</div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListingRedux;
