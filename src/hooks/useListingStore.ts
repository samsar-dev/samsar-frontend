import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';
import {
  selectCurrentListing,
  selectFormData,
  selectStep,
  selectImages,
  selectDeletedImages,
  selectLoading,
  selectError,
} from '@/store/listing/listing.selectors';
import * as listingActions from '@/store/listing/listing.actions';
import { 
  getNestedValue,
  setNestedValue
} from '@/utils/listingSchemaRedux';
import { Listing } from '@/types/listings';

// Define action types for better type safety
type ListingAction = ReturnType<typeof listingActions.setCurrentListing>
  | ReturnType<typeof listingActions.setFormData>
  | ReturnType<typeof listingActions.setStep>
  | ReturnType<typeof listingActions.addImage>
  | ReturnType<typeof listingActions.removeImage>
  | ReturnType<typeof listingActions.setLoading>
  | ReturnType<typeof listingActions.setError>
  | ReturnType<typeof listingActions.createListing>
  | ReturnType<typeof listingActions.updateListing>
  | ReturnType<typeof listingActions.fetchListing>
  | ReturnType<typeof listingActions.resetListingState>
  | ReturnType<typeof listingActions.setFieldValue>
  | ReturnType<typeof listingActions.validateField>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for listing-related state and actions
export const useListingStore = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const currentListing = useAppSelector(selectCurrentListing);
  const formData = useAppSelector(selectFormData);
  const step = useAppSelector(selectStep);
  const images = useAppSelector(selectImages);
  const deletedImages = useAppSelector(selectDeletedImages);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  
  // Actions
  const setCurrentListingAction = (listing: Listing) => dispatch(listingActions.setCurrentListing(listing));
  const setFormDataAction = (data: any) => dispatch(listingActions.setFormData(data));
  const setStepAction = (step: number) => dispatch(listingActions.setStep(step));
  const addImageAction = (image: string | File) => dispatch(listingActions.addImage(image));
  const removeImageAction = (index: number, isUrl: boolean = false) => 
    dispatch(listingActions.removeImage(index, isUrl));
  const setLoadingAction = (isLoading: boolean) => dispatch(listingActions.setLoading(isLoading));
  const setErrorAction = (error: string | null) => dispatch(listingActions.setError(error));
  const createListingAction = (formData: FormData) => dispatch(listingActions.createListing(formData));
  const updateListingAction = (id: string, formData: FormData) => 
    dispatch(listingActions.updateListing(id, formData));
  const fetchListingAction = (id: string) => dispatch(listingActions.fetchListing(id));
  const resetListingStateAction = () => dispatch(listingActions.resetListingState());
  
  // Field value and validation handlers
  const handleFieldValue = (field: string, value: any) => {
    dispatch(listingActions.setFieldValue(field, value));
  };

  const handleFieldValidation = (field: string, value: any, listingType: string) => {
    return dispatch(listingActions.validateField(field, value, listingType));
  };

  // Schema-related functions
  const getFieldValue = (fieldPath: string) => 
    getNestedValue(formData, fieldPath);

  const setFieldValue = (fieldPath: string, value: any) => {
    const newFormData = { ...formData };
    setNestedValue(newFormData, fieldPath, value);
    handleFieldValue(fieldPath, value);
  };

  const validateField = (field: string, value: any, listingType: string) => {
    return handleFieldValidation(field, value, listingType);
  };

  return {
    // State
    currentListing,
    formData,
    step,
    images,
    deletedImages,
    loading,
    error,
    
    // Form field methods
    getFieldValue,
    setFieldValue,
    validateField,
    
    // Actions
    setCurrentListing: setCurrentListingAction,
    setFormData: setFormDataAction,
    setStep: setStepAction,
    addImage: addImageAction,
    removeImage: removeImageAction,
    setLoading: setLoadingAction,
    setError: setErrorAction,
    createListing: createListingAction,
    updateListing: updateListingAction,
    fetchListing: fetchListingAction,
    resetListingState: resetListingStateAction,
  };
};
