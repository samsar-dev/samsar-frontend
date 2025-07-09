import { listingsAPI } from "@/api/listings.api";
import { PRICE_CHANGE } from "@/constants/socketEvents";
import { FormField } from "@/components/form/FormField";
import type { SectionId } from "@/components/listings/create/advanced/listingsAdvancedFieldSchema";
import { ImageManager } from "@/components/listings/images/ImageManager";
import { Button } from "@/components/ui/Button2";
import { useAuth } from "@/hooks/useAuth";
import type { PropertyType, VehicleType } from "@/types/enums";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "@/contexts/SocketContext";
import { getFieldsBySection, getFieldValue } from "@/utils/listingSchemaUtils";
import type { ListingFieldSchema } from "@/types/listings";

interface EditFormData {
  id?: string;
  title: string;
  description: string;
  price: number;
  // location: {
  //   address: string;
  //   city: string;
  //   state: string;
  //   country: string;
  //   coordinates?: number[];
  // };
  location: string;
  details: {
    vehicles?: Record<string, any>;
    realEstate?: Record<string, any>;
  };
  images: (string | File)[];
  existingImages: string[];
  deletedImages?: string[];
}

const EditListing: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { socket } = useSocket();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionId>("essential");

  const [formData, setFormData] = useState<EditFormData>({
    title: "",
    description: "",
    price: 0,
    location: "",
    details: {},
    images: [],
    existingImages: [],
    deletedImages: [],
  });

  const isVehicle = useMemo(() => {
    return formData.details.vehicles !== undefined;
  }, [formData.details]);

  // Get the current section fields based on the active tab and schema
  const currentFields = useMemo<ExtendedFieldProps[]>(() => {
    if (!activeTab) return [];

    const listingType = isVehicle
      ? (formData.details.vehicles?.vehicleType as VehicleType)
      : (formData.details.realEstate?.propertyType as PropertyType);

    if (!listingType) return [];

    // Get fields from schema utils
    const fields =
      activeTab === "images" ? [] : getFieldsBySection(listingType, activeTab);

    console.log("fields", fields);

    return fields.map((field) => ({
      ...field,
      value: getFieldValue(formData, field.name),
      options: Array.isArray(field.options)
        ? field.options.map((opt) =>
            typeof opt === "string" ? { value: opt, label: opt } : opt
          )
        : undefined,
      onChange: (value: any) => {
        const fieldType = isVehicle ? "vehicles" : "realEstate";
        handleInputChange(field.name, value, fieldType);
      },
    }));
  }, [activeTab, isVehicle, formData]);

  const handleInputChange = useCallback(
    (
      name: string,
      value: any,
      fieldType?: "vehicles" | "realEstate" | "location"
    ) => {
      // Handle location updates
      if (fieldType === "location") {
        setFormData((prev) => ({
          ...prev,
          location: value as string,
        }));
        return;
      }

      // Handle nested fields (e.g., 'engine.size')
      if (fieldType && name.includes(".")) {
        const [parent, child] = name.split(".");
        setFormData((prev) => {
          const currentFieldData = prev.details[fieldType] || {};
          const currentParentData = currentFieldData[parent] || {};

          return {
            ...prev,
            details: {
              ...prev.details,
              [fieldType]: {
                ...currentFieldData,
                [parent]: {
                  ...currentParentData,
                  [child]: value,
                },
              },
            },
          };
        });
        return;
      }

      // Handle top-level fields in details
      if (fieldType) {
        setFormData((prev) => ({
          ...prev,
          details: {
            ...prev.details,
            [fieldType]: {
              ...(prev.details[fieldType] || {}),
              [name]: value,
            },
          },
        }));
      } else {
        // Handle basic fields (title, description, price, etc.)
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    },
    []
  );

  const handleImageChange = useCallback((newImages: (string | File)[]) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  }, []);

  const handleDeleteExisting = useCallback((imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      deletedImages: [...(prev.deletedImages || []), imageUrl],
      existingImages: prev.existingImages.filter((img) => img !== imageUrl),
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.title.trim()) {
      toast.error(t("listings.errors.titleRequired"));
      return false;
    }

    if (!formData.description.trim()) {
      toast.error(t("listings.errors.descriptionRequired"));
      return false;
    }

    if (formData.price <= 0) {
      toast.error(t("listings.errors.validPrice"));
      return false;
    }

    if (!formData.location) {
      toast.error(t("listings.errors.locationRequired"));
      return false;
    }

    // Check if we have the required details based on the listing type
    const listingType = isVehicle
      ? (formData.details.vehicles?.vehicleType as VehicleType)
      : (formData.details.realEstate?.propertyType as PropertyType);

    if (!listingType) {
      toast.error(t("listings.errors.listingTypeRequired"));
      return false;
    }

    const fields = getFieldsBySection(listingType, "essential").concat(
      getFieldsBySection(listingType, "advanced")
    );

    for (const field of fields) {
      if (field.required) {
        const details = isVehicle
          ? formData.details.vehicles
          : formData.details.realEstate;

        // Handle nested fields
        let value;
        if (field.name.includes(".")) {
          const parts = field.name.split(".");
          value = details?.[parts[0]]?.[parts[1]];
        } else {
          value = details?.[field.name as keyof typeof details];
        }

        // Special handling for number fields that might be 0
        if (field.type === "number") {
          if (value === undefined || value === null || value === "") {
            toast.error(
              t("listings.errors.fieldRequired", {
                field: field.label || field.name,
              })
            );
            return false;
          }
          // Ensure number is not negative
          const numValue = Number(value);
          if (isNaN(numValue) || numValue < 0) {
            toast.error(
              t("listings.errors.validNumber", {
                field: field.label || field.name,
              })
            );
            return false;
          }
        } else if (value === undefined || value === null || value === "") {
          toast.error(
            t("listings.errors.fieldRequired", {
              field: field.label || field.name,
            })
          );
          return false;
        }
      }
    }

    return true;
  }, [formData, isVehicle, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAuthenticated) {
        toast.error(t("auth.pleaseLogin"));
        return;
      }

      if (isSubmitting) return;

      // Validate form before submission
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        const formDataToSend = new FormData();

        // Append basic fields
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("price", formData.price.toString());
        formDataToSend.append(
          "location",
          // JSON.stringify({
          //   address: formData.location.address,
          //   city: formData.location.city,
          //   state: formData.location.state,
          //   country: formData.location.country,
          //   coordinates: formData.location.coordinates,
          // })
          formData.location.toString()
        );

        // Process and append details based on listing type
        const details = { ...formData.details };
        const listingType = isVehicle
          ? (details.vehicles?.vehicleType as VehicleType)
          : (details.realEstate?.propertyType as PropertyType);

        // Get all fields for the listing type to ensure we include all schema fields
        if (listingType) {
          const allFields = getFieldsBySection(listingType, "essential").concat(
            getFieldsBySection(listingType, "advanced")
          );

          // Ensure all schema fields are included in the details
          allFields.forEach((field) => {
            const fieldPath = field.name.split(".");
            const fieldType = isVehicle ? "vehicles" : "realEstate";

            if (!details[fieldType]) {
              details[fieldType] = {};
            }

            // Initialize nested objects if they don't exist
            let current = details[fieldType] as Record<string, any>;
            for (let i = 0; i < fieldPath.length - 1; i++) {
              const part = fieldPath[i];
              if (!current[part]) {
                current[part] = {};
              }
              current = current[part] as Record<string, any>;
            }

            // Get the field name and current value
            const fieldName = fieldPath[fieldPath.length - 1];
            const currentValue = current[fieldName];

            // Handle field based on its type
            if (
              field.required &&
              (currentValue === undefined || currentValue === null)
            ) {
              // Set default values based on field type
              switch (field.type) {
                case "number":
                  current[fieldName] = 0;
                  break;
                case "select":
                  // For select fields, use the first option if available
                  if (
                    Array.isArray(field.options) &&
                    field.options.length > 0
                  ) {
                    const firstOption = field.options[0];
                    current[fieldName] =
                      typeof firstOption === "string"
                        ? firstOption
                        : firstOption.value;
                  } else {
                    current[fieldName] = "";
                  }
                  break;
                case "text":
                default:
                  current[fieldName] = "";
                  break;
              }
            } else if (field.type === "number" && currentValue !== undefined) {
              // Ensure number fields are converted to actual numbers
              current[fieldName] = Number(currentValue);
            }
          });
        }

        // Stringify details with proper handling of undefined values
        const cleanDetails = JSON.parse(
          JSON.stringify(details, (_, value) =>
            value === undefined ? "" : value
          )
        );

        formDataToSend.append("details", JSON.stringify(cleanDetails));

        // Append new images (Files) and any existing images included in the `images` array
        formData.images.forEach((image) => {
          if (image instanceof File) {
            formDataToSend.append("images", image);
          } else if (typeof image === "string") {
            formDataToSend.append("existingImages", image);
          }
        });

        // Always include remaining existing images so that they are preserved
        if (formData.existingImages?.length) {
          formData.existingImages
            .filter((url) => !formData.deletedImages?.includes(url))
            .forEach((url) => {
              formDataToSend.append("existingImages", url);
            });
        }

        // Append deleted images if any
        if (formData.deletedImages?.length) {
          formData.deletedImages.forEach((url: string) => {
            formDataToSend.append("deletedImages", url);
          });
        }

        // Call the API to update the listing
        const response = id
          ? await listingsAPI.update(id, formDataToSend)
          : await listingsAPI.create(formDataToSend);

        if (response.success) {
          toast.success(
            id ? t("listing.updateSuccess") : t("listing.createSuccess")
          );
          navigate(`/listings/${response.data?.id || id}`);
        } else {
          throw new Error(
            response.error ||
              (id ? "Failed to update listing" : "Failed to create listing")
          );
        }
      } catch (error) {
        console.error("Error updating listing:", error);
        toast.error(t("listing.updateError"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, id, isVehicle, navigate, t]
  );

  useEffect(() => {
    console.log("formdata >>>>>> ", formData);
  }, [formData]);

  // Load listing data if editing
  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;

      try {
        console.log(">>>>>>>>>>");
        const response = await listingsAPI.getById(id);
        if (response.success && response.data) {
          console.log("Editing listing:", response.data);
          const listing = response.data;
          // Parse the location if it's a string
          // const locationData =
          //   typeof listing.location === "string"
          //     ? JSON.parse(listing.location)
          //     : listing.location;
          const locationData = listing.location;

          // Parse details if it's a string
          let details = listing.details;
          if (typeof details === "string") {
            try {
              details = JSON.parse(details);
            } catch (e) {
              console.error("Failed to parse details:", e);
              details = {};
            }
          }

          // Ensure all required fields are initialized
          const initialData: EditFormData = {
            id: listing.id,
            title: listing.title || "",
            description: listing.description || "",
            price: listing.price || 0,
            // location: {
            //   address: locationData.address || "",
            //   city: locationData.city || "",
            //   state: locationData.state || "",
            //   country: locationData.country || "",
            //   coordinates: locationData.coordinates || [],
            // },
            location: locationData || "",
            details: details || {},
            images: [],
            existingImages:
              listing.images?.map((img: any) =>
                typeof img === "string" ? img : img.url
              ) || [],
            deletedImages: [],
          };

          // Initialize missing schema fields
          const listingType =
            initialData.details.vehicles?.vehicleType ||
            initialData.details.realEstate?.propertyType;

          if (listingType) {
            const allFields = getFieldsBySection(
              listingType,
              "essential"
            ).concat(getFieldsBySection(listingType, "advanced"));

            allFields.forEach((field) => {
              const fieldPath = field.name.split(".");
              const fieldType = initialData.details.vehicles
                ? "vehicles"
                : "realEstate";

              if (!initialData.details[fieldType]) {
                initialData.details[fieldType] = {};
              }

              // Initialize nested objects if they don't exist
              let current = initialData.details[fieldType] as Record<
                string,
                any
              >;
              const fieldName = fieldPath[fieldPath.length - 1];

              // Navigate to the parent object
              for (let i = 0; i < fieldPath.length - 1; i++) {
                const part = fieldPath[i];
                if (!current[part]) {
                  current[part] = {};
                }
                current = current[part] as Record<string, any>;
              }

              // Initialize the field with its current value or a default value
              if (
                current[fieldName] === undefined ||
                current[fieldName] === null
              ) {
                // Set default values for required fields
                if (field.required) {
                  switch (field.type) {
                    case "number":
                      // Special handling for seatingCapacity to ensure it's not negative
                      if (fieldName === "seatingCapacity") {
                        current[fieldName] = Math.max(
                          0,
                          Number(current[fieldName] || 0)
                        );
                      } else {
                        current[fieldName] = 0;
                      }
                      break;
                    case "select":
                      // For select fields, use the first option if available
                      if (
                        Array.isArray(field.options) &&
                        field.options.length > 0
                      ) {
                        const firstOption = field.options[0];
                        current[fieldName] =
                          typeof firstOption === "string"
                            ? firstOption
                            : firstOption.value;
                      } else {
                        current[fieldName] = "";
                      }
                      break;
                    case "text":
                    default:
                      current[fieldName] = "";
                      break;
                  }
                }
              }
            });
          }

          setFormData(initialData);
        } else {
          throw new Error(response.error || "Failed to load listing");
        }
      } catch (error) {
        console.error("Error loading listing:", error);
        toast.error(t("common.errorLoading"));
        navigate("/listings");
      } finally {
        setIsLoading(false);
      }
    };

    loadListing();
  }, [id, navigate, t]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate("/login", { state: { from: `/listings/${id || "new"}/edit` } });
    }
  }, [isAuthenticated, isAuthLoading, navigate, id]);

  // Set up socket listener for price updates
  useEffect(() => {
    if (!socket || !formData.id) return;

    const handlePriceUpdate = (data: {
      listingId: string;
      newPrice: number;
    }) => {
      if (data.listingId === formData.id) {
        setFormData((prev) => ({
          ...prev,
          price: data.newPrice,
        }));
      }
    };

    socket.on(PRICE_CHANGE, handlePriceUpdate);
    return () => {
      socket.off(PRICE_CHANGE, handlePriceUpdate);
    };
  }, [socket, formData.id]);

  // Extend the base field schema with additional properties needed for the form
  interface SelectOption {
    value: string;
    label: string;
  }

  type ExtendedFieldProps = Omit<ListingFieldSchema, "type" | "options"> & {
    min?: number;
    max?: number;
    placeholder?: string;
    type:
      | "text"
      | "number"
      | "select"
      | "checkbox"
      | "textarea"
      | "date"
      | "colorpicker"
      | "multiselect"
      | "radio"
      | "toggle"
      | "featureGroup";
    options?: SelectOption[];
    // featureGroups?: FeatureGroups;
    description?: string;
  };

  // const section = useMemo(
  //   () =>
  //     activeTab === "essential"
  //       ? "essential"
  //       : activeTab === "advanced"
  //         ? "advanced"
  //         : "essential",
  //   [activeTab]
  // );

  // const sectionFields = useMemo(
  //   (listingType: VehicleType | PropertyType) => {
  //     if (!listingType) return [];
  //     console.log("Getting fields for:", { listingType, section });
  //     return getFieldsBySection(listingType, section) || [];
  //   },
  //   [listingType, section]
  // );

  const handleReorderExistingImages = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!formData?.images) return;

      const newImages = [...formData.images];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);

      // Update the current listing with the new order
      setFormData((prev: EditFormData) => ({
        ...prev,
        images: newImages,
      }));
    },
    [formData?.images, setFormData]
  );

  const renderImagesTab = useCallback((): JSX.Element => {
    // Handle existing images from the server
    const existingImages = formData?.images
      ? (formData.images as Array<unknown>)
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
      (img: unknown): img is File => img instanceof File
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
          onChange={handleImageChange}
          existingImages={existingImages}
          onDeleteExisting={handleDeleteExisting}
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
              handleImageChange([...uploadedFiles, ...files]);
            }
            // Reset the input to allow selecting the same file again
            e.target.value = "";
          }}
        />
      </div>
    );
  }, [
    formData.images,
    handleImageChange,
    handleDeleteExisting,
    handleReorderExistingImages,
  ]);

  const renderField = (field: ExtendedFieldProps, idx: number) => {
    // Skip rendering if field type is not supported or name is missing
    if (
      !field.name ||
      field.type === "toggle" ||
      field.type === "featureGroup"
    ) {
      return null;
    }

    // Handle radio fields specially
    if (field.type === "radio" && field.options) {
      const options = field.options;
      return (
        <div key={field.name || idx} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {options.map((option) => {
              // Get the value from the appropriate details object
              const details = isVehicle
                ? formData.details.vehicles
                : formData.details.realEstate;
              const fieldValue = details?.[field.name as keyof typeof details];
              const isChecked = fieldValue === option.value;

              return (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    id={`${field.name}-${option.value}`}
                    name={field.name}
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) =>
                      handleInputChange(
                        field.name,
                        e.target.value,
                        isVehicle ? "vehicles" : "realEstate"
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor={`${field.name}-${option.value}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    const fieldType = field.type || "text";
    // Get the value from the appropriate details object based on listing type
    const details = isVehicle
      ? formData.details.vehicles
      : formData.details.realEstate;
    const fieldValue = details?.[field.name as keyof typeof details];

    const fieldOptions = (field.options || []) as Array<{
      value: string;
      label: string;
    }>;

    const validationError =
      field.required && !fieldValue ? t("common.requiredField") : undefined;

    const commonProps = {
      key: field.name || idx,
      label: field.label,
      name: field.name,
      value: fieldValue ?? "",
      onChange: (value: any) =>
        handleInputChange(
          field.name,
          value,
          isVehicle ? "vehicles" : "realEstate"
        ),
      error: validationError,
      required: field.required,
      placeholder: field.placeholder,
      options: fieldOptions,
    };

    switch (fieldType) {
      case "select":
        return <FormField {...commonProps} type="select" />;
      case "multiselect":
        return <FormField {...commonProps} type="multiselect" />;
      case "radio":
        return (
          <div className="space-y-2">
            {fieldOptions.map((option, i) => (
              <div key={i} className="flex items-center">
                <input
                  type="radio"
                  id={`${field.name}-${i}`}
                  name={field.name}
                  value={option.value}
                  checked={fieldValue === option.value}
                  onChange={() =>
                    handleInputChange(
                      field.name,
                      option.value,
                      isVehicle ? "vehicles" : "realEstate"
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor={`${field.name}-${i}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return <FormField {...commonProps} type="checkbox" />;
      case "number":
        return (
          <FormField
            {...commonProps}
            type="number"
            min={field.min}
            max={field.max}
          />
        );
      case "textarea":
        return <FormField {...commonProps} type="textarea" />;
      default:
        return <FormField {...commonProps} type="text" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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
              activeTab === "essential"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("essential")}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "essential" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentFields.map((field, idx) => (
                  <div key={field.name} className="space-y-1">
                    {/* <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label> */}
                    {renderField(field, idx)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentFields.map((field, idx) => {
                  // Skip if this is a basic field
                  if (
                    field.section === "basic" ||
                    field.section === "essential"
                  ) {
                    return null;
                  }

                  return (
                    <div key={field.name} className="space-y-1">
                      {/* <label className="block text-sm font-medium text-gray-700">
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label> */}
                      {renderField(field, idx)}
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
              {currentFields
                .filter(
                  (field) =>
                    (field.type as string) === "feature-group" ||
                    field.type === "featureGroup"
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
                                    (f) => f.name === fieldName
                                  );
                                  const idx = currentFields.indexOf(
                                    field as ExtendedFieldProps
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
                                        {renderField(field, idx)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )
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
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // return (
  //   <div className="container mx-auto px-4 py-8">
  //     <div className="max-w-4xl mx-auto">
  //       <div className="flex items-center mb-6">
  //         <button
  //           onClick={() => navigate(-1)}
  //           className="mr-4 text-gray-600 hover:text-gray-900"
  //         >
  //           <FaArrowLeft className="w-5 h-5" />
  //         </button>
  //         <h1 className="text-2xl font-bold">
  //           {formData.id
  //             ? t("listings.editListing")
  //             : t("listings.createListing")}
  //         </h1>
  //       </div>

  //       <form onSubmit={handleSubmit} className="space-y-8">
  //         {/* Basic Information */}
  //         <div className="bg-white rounded-lg shadow p-6">
  //           <h2 className="text-xl font-semibold mb-4">
  //             {t("listings.basicInfo")}
  //           </h2>
  //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //             <FormField
  //               label={t("listings.title")}
  //               name="title"
  //               type="text"
  //               value={formData.title}
  //               onChange={(value) => handleInputChange("title", value)}
  //               required
  //             />
  //             <FormField
  //               label={t("listings.price")}
  //               name="price"
  //               type="number"
  //               value={formData.price}
  //               onChange={(value) => handleInputChange("price", Number(value))}
  //               min={0}
  //               required
  //             />
  //             <div className="md:col-span-2">
  //               <div className="space-y-2">
  //                 <label className="block text-sm font-medium text-gray-700">
  //                   {t("listings.description")}
  //                   <span className="text-red-500">*</span>
  //                 </label>
  //                 <textarea
  //                   name="description"
  //                   value={formData.description}
  //                   onChange={(e) =>
  //                     handleInputChange("description", e.target.value)
  //                   }
  //                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
  //                   rows={4}
  //                   required
  //                 />
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         {/* Location */}
  //         <div className="bg-white rounded-lg shadow p-6">
  //           <h2 className="text-xl font-semibold mb-4">
  //             {t("listings.location")}
  //           </h2>
  //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //             <FormField
  //               label={t("listings.location")}
  //               name="city"
  //               type="text"
  //               value={formData.location}
  //               onChange={(value) => {
  //                 handleInputChange("location", value as string);
  //               }}
  //               required
  //             />
  //             {/* <FormField
  //               label={t("listings.state")}
  //               name="state"
  //               type="text"
  //               value={formData.location.state}
  //               onChange={(value) => {
  //                 handleInputChange("location", {
  //                   ...formData.location,
  //                   state: value as string,
  //                 });
  //               }}
  //               required
  //             />
  //             <FormField
  //               label={t("listings.country")}
  //               name="country"
  //               type="text"
  //               value={formData.location.country}
  //               onChange={(value) => {
  //                 handleInputChange("location", {
  //                   ...formData.location,
  //                   country: value as string,
  //                 });
  //               }}
  //               required
  //             />
  //             <FormField
  //               label={t("listings.address")}
  //               name="address"
  //               type="text"
  //               value={formData.location.address}
  //               onChange={(value) => {
  //                 handleInputChange("location", {
  //                   ...formData.location,
  //                   address: value as string,
  //                 });
  //               }}
  //               required
  //             /> */}
  //           </div>
  //         </div>

  //         {/* Dynamic Fields */}
  //         <div className="bg-white rounded-lg shadow p-6">
  //           <div className="flex space-x-4 mb-6 border-b">
  //             <button
  //               type="button"
  //               className={`pb-2 px-1 border-b-2 ${
  //                 activeTab === "essential"
  //                   ? "border-blue-500 text-blue-600"
  //                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
  //               }`}
  //               onClick={() => setActiveTab("essential")}
  //             >
  //               {t("listings.essentials")}
  //             </button>
  //             <button
  //               type="button"
  //               className={`pb-2 px-1 border-b-2 ${
  //                 activeTab === "advanced"
  //                   ? "border-blue-500 text-blue-600"
  //                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
  //               }`}
  //               onClick={() => setActiveTab("advanced")}
  //             >
  //               {t("listings.advanced")}
  //             </button>
  //           </div>

  //           <div className="space-y-4">
  //             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
  //               {currentFields.map((field, idx) => renderField(field, idx))}
  //             </div>
  //           </div>
  //         </div>

  //         {/* Images */}
  //         <div className="bg-white rounded-lg shadow p-6">
  //           <h2 className="text-xl font-semibold mb-4">
  //             {t("listings.images")}
  //           </h2>
  //           <ImageManager
  //             images={formData.images.filter(
  //               (img): img is File => img instanceof File
  //             )}
  //             existingImages={formData.existingImages}
  //             onChange={handleImageChange}
  //             onDeleteExisting={handleDeleteExisting}
  //           />
  //         </div>

  //         {/* Submit Button */}
  //         <div className="flex justify-end">
  //           <Button
  //             type="submit"
  //             variant="primary"
  //             size="lg"
  //             disabled={isSubmitting}
  //             className="flex items-center"
  //           >
  //             <FaSave className="mr-2" />
  //             {isSubmitting ? t("common.saving") : t("common.save")}
  //           </Button>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );
};

export default EditListing;
