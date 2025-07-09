import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  fetchListingDetails,
  sendMessage,
  setMessageFormVisibility,
  setMessage,
  setMessageType,
  resetListingDetailsState,
} from "@/store/listing/listingDetails.actions";

export const useListingDetails = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.listingDetails);

  return {
    // State
    listing: state.listing,
    loading: state.loading,
    error: state.error,
    showMessageForm: state.showMessageForm,
    message: state.message,
    messageType: state.messageType,
    messageSuccess: state.messageSuccess,

    // Actions
    fetchListingDetails: (id: string) =>
      dispatch(fetchListingDetails(id) as any),
    sendMessage: (
      listingId: string,
      message: string,
      messageType: "question" | "offer" | "meeting",
    ) => dispatch(sendMessage(listingId, message, messageType) as any),
    setMessageFormVisibility: (isVisible: boolean) =>
      dispatch(setMessageFormVisibility(isVisible)),
    setMessage: (message: string) => dispatch(setMessage(message)),
    setMessageType: (messageType: "question" | "offer" | "meeting") =>
      dispatch(setMessageType(messageType)),
    resetListingDetailsState: () => dispatch(resetListingDetailsState()),
  };
};

export default useListingDetails;
