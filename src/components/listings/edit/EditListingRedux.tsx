// src/components/listings/edit/EditListingRedux.tsx
import { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useListingStore } from "@/hooks/useListingEdit";
import { useSocket } from "@/contexts/SocketContext";

import { VehicleType, PropertyType } from "@/types/enums";
import { updateListing as updateListingAction } from "@/store/listing/listingEdit.actions";
import type { AppDispatch } from "@/store/store";
import { PRICE_CHANGE } from "@/constants/socketEvents";
import { ImageManager } from "@/components/listings/images/ImageManager";
import { ACTIVE_API_URL } from "@/config";
import { loadSchema } from "@/components/listings/create/advanced/listingsAdvancedFieldSchema";

type SectionId = "basic" | "essential" | "advanced" | "features" | "location" | "media" | "pricing" | "contact" | "images";
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
  images?: (File | string)[];
  details?: {
    [key: string]: any;
    vehicles?: { [key: string]: any };
    realEstate?: { [key: string]: any };
  };
}

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
  featureGroups?: Record<string, { label: string; features: Array<{ name: string; label: string; type: string; options?: Array<{ value: string; label: string }>; required?: boolean; description?: string }> }>;
  onChange: (value: any, name: string) => void;
}

const EditListingRedux = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { socket } = useSocket();
  const { formData = { images: [] } as IFormData, loading, currentListing, fetchListing: fetchListingAction, setFormData: setFormDataAction, setLoading } = useListingStore();
  const [activeTab, setActiveTab] = useState<SectionId>("basic");
  const dispatch = useDispatch<AppDispatch>();
  const [schemaFields, setSchemaFields] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchema = async () => {
      if (!currentListing?.category?.subCategory) return;
      const fields = await loadSchema(currentListing.category.subCategory as VehicleType | PropertyType);
      console.log("Loaded schema fields for editing:", fields);
      setSchemaFields(fields);
    };
    fetchSchema();
  }, [currentListing?.category?.subCategory]);

  const getFieldValue = useCallback((obj: any, path: string): any => {
    if (!obj) return undefined;
    return path.split(".").reduce((o, p) => (o || {})[p], obj);
  }, []);

  const listingType = useMemo<VehicleType | PropertyType | null>(() => {
    if (!currentListing) return null;
    const listingData = currentListing as any;
    const type =
      listingData.category?.subCategory ||
      listingData.details?.vehicles?.vehicleType ||
      listingData.details?.realEstate?.propertyType ||
      listingData.listingType ||
      listingData.details?.type ||
      listingData.type;

    console.log("Derived listing type:", { type, listingData });
    if (!type) return null;
    if (Object.values(VehicleType).includes(type)) return type as VehicleType;
    if (Object.values(PropertyType).includes(type)) return type as PropertyType;
    console.error("Unsupported listing type:", type);
    return null;
  }, [currentListing]);

  const setFieldValue = useCallback(
    (name: string, value: any) => {
      // Create a deep copy of the current form data
      const updateNestedValue = (obj: any, path: string, val: any): any => {
        const [current, ...rest] = path.split(".");
        const arrayMatch = current.match(/(.*?)\[(\d+)\]/);
        
        // Handle array indices (e.g., 'features[0].name')
        if (arrayMatch) {
          const arrayPath = arrayMatch[1];
          const index = parseInt(arrayMatch[2], 10);
          const array = Array.isArray(obj[arrayPath]) ? [...obj[arrayPath]] : [];
          
          if (rest.length === 0) {
            // Direct array index assignment (e.g., 'features[0]')
            const newArray = [...array];
            newArray[index] = val;
            return { ...obj, [arrayPath]: newArray };
          } else {
            // Nested property within array item (e.g., 'features[0].name')
            const item = array[index] || {};
            const updatedItem = updateNestedValue({...item}, rest.join("."), val);
            const newArray = [...array];
            newArray[index] = updatedItem;
            return { ...obj, [arrayPath]: newArray };
          }
        }
        
        // Handle regular object properties
        if (rest.length === 0) {
          return { ...obj, [current]: val };
        }
        
        // Handle nested properties
        return {
          ...obj,
          [current]: updateNestedValue({ ...(obj[current] || {}) }, rest.join("."), val),
        };
      };
      
      // Update the form data with the new value
      const updatedFormData = updateNestedValue({ ...formData }, name, value);
      setFormDataAction(updatedFormData);
    },
    [formData, setFormDataAction],
  );

  const mapFieldType = useCallback((field: any): SupportedFieldType => {
    if (!field || !field.type) return "text";
    const type = field.type.toLowerCase();
    const typeMap: Record<string, SupportedFieldType> = {
      text: "text",
      string: "text",
      number: "number",
      integer: "number",
      float: "number",
      decimal: "number",
      textarea: "textarea",
      select: "select",
      toggle: "checkbox",
      checkbox: "checkbox",
      radio: "radio",
      color: "colorpicker",
      colorpicker: "colorpicker",
      boolean: "checkbox",
      multiselect: "multiselect",
      date: "date",
      datetime: "datetime",
      time: "time",
      email: "email",
      tel: "tel",
      url: "url",
      password: "password",
      file: "file",
      image: "file",
      feature: "multiselect",
      "feature-group": "feature-group",
      default: "text",
    };
    if (field.options) return "select";
    if (field.featureGroups) return "feature-group";
    if (field.multiple) return "multiselect";
    return typeMap[type] || typeMap.default;
  }, []);

  const section = useMemo(() => (activeTab === "basic" ? "essential" : activeTab === "advanced" ? "advanced" : "essential"), [activeTab]);

  const sectionFields = useMemo(() => {
    if (!listingType || !schemaFields.length) return [];
    console.log("Getting fields for:", { listingType, section });
    return schemaFields.filter((f) => f.section === section || (section === "advanced" && f.section !== "essential"));
  }, [listingType, section, schemaFields]);

  const createFieldChangeHandler = useCallback(
    (fieldName: string, fieldType: string) => {
      return (newValue: any) => {
        const finalValue =
          fieldType === "checkbox" || fieldType === "boolean"
            ? Boolean(newValue)
            : fieldType === "number"
              ? parseFloat(newValue) || 0
              : fieldType === "multiselect"
                ? Array.isArray(newValue)
                  ? newValue
                  : [newValue].filter(Boolean)
                : fieldType === "date" || fieldType === "datetime"
                  ? newValue ? new Date(newValue).toISOString() : null
                  : newValue;
        setFieldValue(fieldName, finalValue);
      };
    },
    [setFieldValue],
  );

  const processFieldValue = (field: any, value: any) => {
    if (value === undefined || value === null || value === '') return value;

    if (field.type === 'number' || field.type === 'price' || field.name === 'price' || field.type === 'integer' || field.type === 'float' || field.type === 'decimal') {
      const num = Number(value);
      return isNaN(num) ? value : num;
    }

    if (field.type === 'boolean' || field.type === 'checkbox' || field.type === 'toggle') {
      return Boolean(value);
    }

    return value;
  };

  const getAllNestedFields = useCallback(
    (fields: any[], parentPath = ""): any[] => {
      const result: any[] = [];
      fields.forEach((field) => {
        const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name;
        result.push({
          ...field,
          path: fieldPath,
          fullPath: fieldPath,
        });
        if (field.type === "feature-group" && field.featureGroups) {
          Object.entries(field.featureGroups).forEach(([groupName, group]: [string, any]) => {
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
          });
        }
      });
      return result;
    },
    [],
  );

  const currentFields = useMemo(() => {
    if (!currentListing || !listingType || !sectionFields.length) {
      return [];
    }

    console.log("Calculating currentFields", { listingType, activeTab, sectionFields: sectionFields.map((f) => f.name) });

    const allFields = getAllNestedFields(sectionFields);

    return allFields.map((field) => {
      const fieldName = field.path || field.name;
      const mappedType = mapFieldType(field);
      const value = getFieldValue(formData, fieldName) ?? getFieldValue(currentListing, fieldName);

      const options = Array.isArray(field.options)
        ? field.options.map((opt: any) => ({
            value: String(typeof opt === "string" ? opt : opt.value),
            label: String(typeof opt === "string" ? opt : opt.label || opt.value),
            translationKey: opt.translationKey,
          }))
        : undefined;

      let featureOptions;
      if (field.isFeature && field.parentGroup) {
        const parentField = sectionFields.find((f) => f.name === field.parentGroup);
        if (parentField?.featureGroups?.[field.groupName]?.features) {
          featureOptions = parentField.featureGroups[field.groupName].features.map((f: any) => ({
            value: f.name,
            label: f.label || f.name,
            translationKey: f.translationKey,
          }));
        }
      }

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
        isFeature: field.isFeature,
        parentGroup: field.parentGroup,
        groupName: field.groupName,
        groupLabel: field.groupLabel,
        section: field.section,
      };
    });
  }, [sectionFields, formData, currentListing, getFieldValue, mapFieldType, listingType, activeTab, createFieldChangeHandler, getAllNestedFields]);

  const prepareFormData = (data: IFormData): FormData => {
    const formData = new FormData();

    const processObject = (obj: any, parentKey = "") => {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const propName = parentKey ? `${parentKey}[${key}]` : key;
          const value = obj[key];

          if (key === 'images' && Array.isArray(value)) {
            value.forEach((item) => {
              if (item instanceof File) {
                formData.append('images', item);
              } else if (typeof item === 'string') {
                formData.append('existingImages[]', item);
              }
            });
          } else if (value instanceof File) {
            formData.append(propName, value);
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // For nested objects like 'details', we stringify them
            if (key === 'details') {
              formData.append('details', JSON.stringify(value));
            } else {
              processObject(value, propName);
            }
          } else if (Array.isArray(value)) {
            formData.append(propName, JSON.stringify(value));
          } else if (value !== null && value !== undefined) {
            formData.append(propName, String(value));
          }
        }
      }
    };

    processObject(data);
    return formData;
  };

  const handleFileUploads = async (files: (File | string | FileMetadata)[]) => {
    const uploadedUrls: string[] = [];
    const newFiles = files.filter((file) => file instanceof File) as File[];

    for (const file of newFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
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

    const existingUrls = files.filter((file) => typeof file === "string") as string[];
    return [...existingUrls, ...uploadedUrls];
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentListing?.id || !formData) {
        toast.error("Missing required data");
        return;
      }

      try {
        dispatch(setLoading(true));

        const submissionData: IFormData = { id: currentListing.id };
        const detailsPath = listingType && Object.values(VehicleType).includes(listingType as VehicleType) ? 'vehicles' : 'realEstate';

        // Initialize details object
        submissionData.details = { [detailsPath]: {} };

        // Basic fields that are not in the schema
        const basicFields = ['title', 'description', 'price', 'location', 'listingAction'];
        const detailsFields = getAllNestedFields(schemaFields);
        const schemaFieldNames = new Set(detailsFields.map(f => f.name));
        const allFields = [...detailsFields, ...basicFields.map(name => ({ name, type: name === 'price' ? 'price' : 'text' }))];

        allFields.forEach(fieldObj => {
            const fieldName = fieldObj.name;
            const isDetailsField = schemaFieldNames.has(fieldName);

            const originalValue = isDetailsField 
                ? getFieldValue(currentListing.details?.[detailsPath], fieldName) 
                : (currentListing as any)[fieldName];

            const value = getFieldValue(formData, fieldName) ?? originalValue;

            if (value !== undefined) {
                const processedValue = processFieldValue(fieldObj, value);
                if (isDetailsField) {
                    submissionData.details[detailsPath][fieldName] = processedValue;
                } else {
                    submissionData[fieldName] = processedValue;
                }
            }
        });



        // Handle images
        const images = getFieldValue(formData, 'images') ?? currentListing.images;
        submissionData.images = await handleFileUploads(images || []);

        console.log('Final Submission Data:', JSON.stringify(submissionData, null, 2));

        const formDataToSubmit = prepareFormData(submissionData);

        const result = await dispatch(updateListingAction(currentListing.id, formDataToSubmit));

        if (result?.success) {
          toast.custom((t) => (
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-4 w-full max-w-md">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Listing updated successfully</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    navigate(`/listings/${currentListing.id}`);
                    toast.dismiss(t);
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium"
                >
                  View Listing
                </button>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 text-sm font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          ));
        } else {
          throw new Error(result?.error || "Failed to update listing");
        }
      } catch (error) {
        console.error("Error updating listing:", error);
        toast.error(error instanceof Error ? error.message : "An error occurred");
      } finally {
        dispatch(setLoading(false));
      }
    },
    [currentListing, formData, dispatch, navigate, schemaFields, getAllNestedFields, getFieldValue],
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
    } catch (error) {
      console.error("[handleFormSubmit] Error:", error);
    }
  };

  type FileMetadata = { name: string; size: number; type: string; lastModified: number; isNew?: boolean };

  const handleImagesChange = useCallback(
    (newImages: File[]) => {
      if (!formData) return;
      const newFileMetadata = newImages.map((file: File): FileMetadata => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        isNew: true,
      }));
      const existingImages = (formData.images || []).filter((img: File | string | FileMetadata) => {
        if (typeof img === "string") return true;
        const name = img instanceof File ? img.name : (img as FileMetadata).name;
        const size = img instanceof File ? img.size : (img as FileMetadata).size;
        return !newImages.some((newImg) => newImg.name === name && newImg.size === size);
      }) as (string | FileMetadata)[];
      setFormDataAction({ ...formData, images: [...existingImages, ...newFileMetadata] });
    },
    [formData, setFormDataAction],
  );

  const handleDeleteExistingImage = useCallback(
    async (imageUrl: string) => {
      if (!id) return;
      try {
        setFormDataAction((prev: IFormData) => ({
          ...prev,
          images: (prev.images || []).filter((img) => (typeof img === "string" ? img !== imageUrl : (img as any).url !== imageUrl)),
        }));
        const response = await fetch(`${process.env.REACT_APP_API_URL || "/api"}/listings/${id}/images`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ imageUrl }),
        });
        if (!response.ok) {
          await fetchListingAction(id);
          throw new Error("Failed to delete image");
        }
        toast.success("Image deleted successfully");
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error("Failed to delete image");
        if (id) await fetchListingAction(id);
      }
    },
    [id, fetchListingAction],
  );

  const renderField = useCallback(
    (field: ExtendedFieldProps) => {
      const commonProps = {
        id: field.name,
        name: field.name,
        value: field.value != null ? field.value : "", // Ensure value is always a scalar
        onChange: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        ) => {
          let value: any = e.target.value;
          if (field.type === "number") value = parseFloat(value) || 0;
          else if (field.type === "checkbox" || field.type === "boolean") value = (e.target as HTMLInputElement).checked;
          else if (field.type === "multiselect") value = Array.isArray(value) ? value : [value].filter(Boolean);
          else if (field.type === "date" || field.type === "datetime") value = value ? new Date(value).toISOString() : null;
          field.onChange(value, field.name);
        },
        placeholder: field.placeholder,
        className:
          "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
      };

      switch (field.type) {
        case "textarea":
          return <textarea {...commonProps} rows={3} className={`${commonProps.className} min-h-[100px]`} value={field.value || ""} />;

        case "select":
          return (
            <select 
              {...commonProps} 
              value={field.value != null ? String(field.value) : ""} // Ensure value is always a string
              className={`${commonProps.className} cursor-pointer`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case "multiselect":
          return (
            <select
              {...commonProps}
              multiple
              value={Array.isArray(field.value) ? field.value : [field.value].filter(Boolean)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                field.onChange(selected, field.name);
              }}
              className={`${commonProps.className} h-32`}
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case "checkbox":
        case "boolean":
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

        case "colorpicker":
        case "color":
          return (
            <input
              type="color"
              {...commonProps}
              value={field.value || "#000000"}
              className={`${commonProps.className} h-10 p-1`}
            />
          );

        case "date":
        case "datetime":
          return (
            <input
              type={field.type === "datetime" ? "datetime-local" : "date"}
              {...commonProps}
              value={field.value ? new Date(field.value).toISOString().slice(0, field.type === "datetime" ? 16 : 10) : ""}
              className={commonProps.className}
            />
          );

        default:
          return <input type={field.type || "text"} {...commonProps} className={commonProps.className} />;
      }
    },
    [],
  );

  const handleReorderExistingImages = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!currentListing?.images) return;
      const newImages = [...currentListing.images];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      setFormDataAction((prev: IFormData) => ({ ...prev, images: newImages }));
    },
    [currentListing?.images, setFormDataAction],
  );

  const renderImagesTab = useCallback((): JSX.Element => {
    const existingImages = currentListing?.images
      ? (currentListing.images as Array<unknown>)
          .filter((img: unknown): img is { url: string } => typeof img === "object" && !!img && "url" in img && typeof (img as any).url === "string")
          .map((img) => img.url)
      : [];
    const uploadedFiles = (formData.images || []).filter((img: unknown): img is File => img instanceof File);

    return (
      <div className="mt-4">
        <ImageManager
          images={uploadedFiles}
          onChange={handleImagesChange}
          existingImages={existingImages}
          onDeleteExisting={handleDeleteExistingImage}
          onReorderExisting={handleReorderExistingImages}
          maxImages={10}
        />
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              handleImagesChange([...uploadedFiles, ...files]);
            }
            e.target.value = "";
          }}
        />
      </div>
    );
  }, [currentListing?.images, formData.images, handleImagesChange, handleDeleteExistingImage, handleReorderExistingImages]);

  const fetchListing = useCallback(
    async (listingId: string) => {
      if (loading || currentListing?.id === listingId) return;
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

  useEffect(() => {
    if (!id) {
      navigate("/listings");
      return;
    }
    fetchListing(id);
  }, [id, navigate, fetchListing]);

  useEffect(() => {
    if (!socket) return undefined;
    const handlePriceUpdate = (data: { listingId: string; price: number }) => {
      if (data.listingId === currentListing?.id) {
        setFormDataAction((prev: IFormData) => ({ ...prev, price: data.price }));
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
            className={`px-4 py-2 font-medium ${activeTab === "basic" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Information
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "advanced" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("advanced")}
          >
            Advanced Details
          </button>
          <button
            className={`px-4 py-2 font-medium ml-auto ${activeTab === "images" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("images")}
          >
            Images
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentFields
                  .filter((field) => field.section === "essential")
                  .map((field) => (
                    <div key={field.name} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderField(field)}
                      {field.description && (
                        <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentFields
                  .filter((field) => field.section !== "essential" && !field.isFeature)
                  .map((field) => (
                    <div key={field.name} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderField(field)}
                      {field.description && (
                        <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                      )}
                    </div>
                  ))}
              </div>
              {sectionFields
                .filter((field) => field.type === "feature-group")
                .map((group) => (
                  <div key={group.name} className="col-span-full mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{group.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                      {group.featureGroups &&
                        Object.entries(group.featureGroups).map(([groupName, groupData]: [string, any]) => (
                          <div key={groupName} className="space-y-4">
                            <h4 className="font-medium text-gray-700">{groupData.label}</h4>
                            <div className="space-y-3">
                              {groupData.features?.map((feature: any) => {
                                const fieldName = `${group.name}.${groupName}.${feature.name}`;
                                const field = currentFields.find((f) => f.name === fieldName);
                                if (!field) return null;
                                return (
                                  <div key={field.name} className="flex items-center">
                                    <div className="flex-1">
                                      <label className="block text-sm font-medium text-gray-700">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                      </label>
                                      {field.description && (
                                        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                                      )}
                                    </div>
                                    <div className="ml-4">{renderField(field)}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
          {activeTab === "images" && <div className="space-y-4">{renderImagesTab()}</div>}
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