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
import {
  setCurrentListing,
  setFormData,
  setStep,
  addImage,
  removeImage,
  setLoading,
  setError,
  createListing,
  updateListing,
  fetchListing,
  resetListingState,
} from '@/store/listing/listing.actions';

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
  const setCurrentListingAction = (listing: any) => dispatch(setCurrentListing(listing));
  const setFormDataAction = (data: any) => dispatch(setFormData(data));
  const setStepAction = (step: number) => dispatch(setStep(step));
  const addImageAction = (image: string | File) => dispatch(addImage(image));
  const removeImageAction = (index: number, isUrl: boolean = false) => 
    dispatch(removeImage(index, isUrl));
  const setLoadingAction = (isLoading: boolean) => dispatch(setLoading(isLoading));
  const setErrorAction = (error: string | null) => dispatch(setError(error));
  const createListingAction = (formData: FormData) => dispatch(createListing(formData));
  const updateListingAction = (id: string, formData: FormData) => 
    dispatch(updateListing(id, formData));
  const fetchListingAction = (id: string) => dispatch(fetchListing(id));
  const resetListingStateAction = () => dispatch(resetListingState());

  return {
    // State
    currentListing,
    formData,
    step,
    images,
    deletedImages,
    loading,
    error,
    
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
