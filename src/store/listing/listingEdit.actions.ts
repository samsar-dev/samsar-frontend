import { LISTING_TYPES } from "./listingEdit.types";
import { Listing } from "@/types/listings";
import type { AppDispatch } from "../store";
import { validateField as validateFieldUtil } from "@/utils/listingSchemaRedux";
import {
  VehicleType,
  PropertyType,
  ListingAction,
  ListingStatus,
  ListingCategory,
} from "@/types/enums";
import { listingsAPI } from "@/api/listings.api";

export const setCurrentListing = (listing: Listing | null) => ({
  type: LISTING_TYPES.SET_CURRENT_LISTING,
  payload: listing,
});

export const setFormData = (formData: any) => ({
  type: LISTING_TYPES.SET_FORM_DATA,
  payload: formData,
});

export const setStep = (step: number) => ({
  type: LISTING_TYPES.SET_STEP,
  payload: step,
});

export const addImage = (image: string | File) => ({
  type: LISTING_TYPES.ADD_IMAGE,
  payload: image,
});

export const removeImage = (index: number, isUrl: boolean = false) => ({
  type: LISTING_TYPES.REMOVE_IMAGE,
  payload: { index, isUrl },
});

export const setLoading = (loading: boolean) => ({
  type: LISTING_TYPES.SET_LOADING,
  payload: loading,
});

export const setError = (error: string | null) => ({
  type: LISTING_TYPES.SET_ERROR,
  payload: error,
});

export const resetListingState = () => ({
  type: LISTING_TYPES.RESET_STATE,
});

interface SetFieldValueAction {
  type: typeof LISTING_TYPES.SET_FIELD_VALUE;
  payload: {
    field: string;
    value: any;
  };
}

export const setFieldValue = (
  field: string,
  value: any,
): SetFieldValueAction => ({
  type: LISTING_TYPES.SET_FIELD_VALUE,
  payload: { field, value },
});

interface ValidateFieldAction {
  type: typeof LISTING_TYPES.VALIDATE_FIELD;
  payload: {
    field: string;
    error: string | null;
  };
}

export const validateField = (
  field: string,
  value: any,
  listingType: VehicleType | PropertyType | string,
): ValidateFieldAction => {
  // Ensure listingType is a valid VehicleType or PropertyType
  const validListingType =
    typeof listingType === "string"
      ? (listingType as VehicleType | PropertyType)
      : listingType;

  const error = validateFieldUtil(validListingType, field, value);
  return {
    type: LISTING_TYPES.VALIDATE_FIELD,
    payload: { field, error },
  };
};

// Thunk actions
export const createListing =
  (formData: FormData) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      // Replace with your actual API call
      // const response = await listingsAPI.create(formData);
      // dispatch(setCurrentListing(response.data));
      console.log("Creating listing with data:", formData);
      return { success: true };
    } catch (error: any) {
      dispatch(setError(error.message));
      return { success: false, error: error.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

export const updateListing =
  (id: string, formData: FormData) => async (dispatch: AppDispatch) => {
    // Set loading to true at the start
    dispatch(setLoading(true));

    try {
      // Make the actual API call
      const response = await listingsAPI.update(id, formData);

      if (!response || !response.data) {
        throw new Error("No data received from server");
      }

      // Get the raw response data
      const responseData = response.data;

      // Transform images if they exist
      const transformedImages = Array.isArray(responseData.images)
        ? responseData.images.map((img) => {
            if (typeof img === "string") return img;
            if (img && typeof img === "object" && "url" in img) return img.url;
            return String(img);
          })
        : [];

      // Create a base transformed listing with required fields
      const baseListing: Omit<Listing, "details" | "id"> & { details?: any } = {
        // Required fields with defaults
        title: responseData.title || "",
        description: responseData.description || "",
        price: Number(responseData.price) || 0,
        category: responseData.category || {
          mainCategory: ListingCategory.VEHICLES,
          subCategory: VehicleType.CAR,
        },
        location: responseData.location || "",
        latitude: responseData.latitude || 0,
        longitude: responseData.longitude || 0,
        images: transformedImages,
        details: {},
        // Optional fields with defaults
        ...(responseData.id && { id: responseData.id }),
        ...(responseData.userId && { userId: responseData.userId }),
        ...(responseData.listingAction && {
          listingAction:
            responseData.listingAction === "RENT"
              ? ListingAction.RENT
              : ListingAction.SALE,
        }),
        ...(responseData.status && {
          status: responseData.status as ListingStatus,
        }),
        // Ensure dates are properly formatted
        createdAt: responseData.createdAt
          ? new Date(responseData.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: responseData.updatedAt
          ? new Date(responseData.updatedAt).toISOString()
          : new Date().toISOString(),
        // Include any other fields from the response
        ...Object.fromEntries(
          Object.entries(responseData).filter(
            ([key]) =>
              ![
                "id",
                "title",
                "description",
                "price",
                "category",
                "location",
                "images",
                "details",
                "createdAt",
                "updatedAt",
                "listingAction",
                "status",
              ].includes(key),
          ),
        ),
      };

      // Handle details if they exist
      if (responseData.details && typeof responseData.details === "object") {
        const details = { ...responseData.details };

        // Transform vehicle details if they exist
        if (details.vehicles && typeof details.vehicles === "object") {
          const vehicleDetails = details.vehicles as Record<string, any>;

          // Create a new vehicle details object with the correct type
          details.vehicles = {
            // Required fields with defaults
            vehicleType: VehicleType.CAR,
            transmissionType: "",
            serviceHistory: false,
            engineType: "",
            engineSize: "",
            enginePower: 0,
            torque: 0,
            horsepower: 0,
            driveSystem: "",
            emissions: "",
            operatingWeight: 0,
            payloadCapacity: 0,
            cargoVolume: 0,
            roofHeight: "",
            interiorLength: "",
            // Include all fields from the response
            ...vehicleDetails,
            // Ensure numeric fields are numbers
            ...(vehicleDetails.enginePower && {
              enginePower: Number(vehicleDetails.enginePower),
            }),
            ...(vehicleDetails.torque && {
              torque: Number(vehicleDetails.torque),
            }),
            ...(vehicleDetails.horsepower && {
              horsepower: Number(vehicleDetails.horsepower),
            }),
            ...(vehicleDetails.operatingWeight && {
              operatingWeight: Number(vehicleDetails.operatingWeight),
            }),
            ...(vehicleDetails.payloadCapacity && {
              payloadCapacity: Number(vehicleDetails.payloadCapacity),
            }),
            ...(vehicleDetails.cargoVolume && {
              cargoVolume: Number(vehicleDetails.cargoVolume),
            }),
          };
        }

        baseListing.details = details;
      }

      // Cast to Listing now that we've ensured all required fields are present
      const transformedListing = baseListing as Listing;

      // Update the current listing with the transformed data
      dispatch(setCurrentListing(transformedListing));

      // Log success
      console.log("Listing updated successfully:", transformedListing);

      return {
        success: true,
        data: transformedListing,
      };
    } catch (error: any) {
      console.error("Error updating listing:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update listing";

      // Set error
      dispatch(setError(errorMessage));

      // Return error but don't throw to prevent unhandled promise rejection
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Always reset loading state in finally block to ensure it's always reset
      dispatch(setLoading(false));
    }
  };

export const fetchListing = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));

    // Use the listingsAPI service to fetch the listing
    const response = await listingsAPI.getById(id);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch listing");
    }

    const listing = response.data;

    // Set the current listing
    dispatch(setCurrentListing(listing));

    // Prepare form data, flattening any nested structures
    const formData = {
      ...listing,
      // Flatten category if it exists
      ...(listing.category && {
        mainCategory: listing.category.mainCategory,
        subCategory: listing.category.subCategory,
      }),
      // Flatten vehicle details if they exist
      ...(listing.details?.vehicles && {
        ...listing.details.vehicles,
      }),
      // Flatten real estate details if they exist
      ...(listing.details?.realEstate && {
        ...listing.details.realEstate,
      }),
    };

    // Set the form data
    dispatch(setFormData(formData));

    // Handle images if available
    if (listing.images && Array.isArray(listing.images)) {
      // Process images - this is a no-op for now since we're not using the images
      // The actual implementation would depend on your image handling logic
      // Example implementation if you need to process images:
      // const processedImages = listing.images.map(img => ({
      //   url: typeof img === 'string' ? img : img.url,
      //   // Add any other image properties you need
      // }));
      // dispatch(setImages(processedImages));
    }

    return { success: true, data: listing };
  } catch (error: any) {
    console.error("Error fetching listing:", error);
    dispatch(setError(error.message || "Failed to fetch listing"));
    return { success: false, error: error.message };
  } finally {
    dispatch(setLoading(false));
  }
};
