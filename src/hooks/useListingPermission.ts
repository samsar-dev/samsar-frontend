import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { apiClient } from '../api/apiClient';

interface ListingPermission {
  canCreate: boolean;
  maxListings: number;
  currentListings: number;
  isLoading: boolean;
  error: string | null;
}

export const useListingPermission = (): ListingPermission => {
  const [permission, setPermission] = useState<ListingPermission>({
    canCreate: false,
    maxListings: 1,
    currentListings: 0,
    isLoading: true,
    error: null,
  });

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await apiClient.get('/api/user/listing-permission');
        setPermission({
          canCreate: response.data.canCreate,
          maxListings: response.data.maxListings,
          currentListings: response.data.currentListings,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error checking listing permission:', error);
        
        if (error.response?.data?.code === 'LISTING_LIMIT_REACHED') {
          setPermission({
            canCreate: false,
            maxListings: error.response.data.maxListings,
            currentListings: error.response.data.currentListings,
            isLoading: false,
            error: 'You have reached your listing limit',
          });
        } else if (error.response?.status === 401) {
          // Not authenticated
          navigate('/login', { state: { from: window.location.pathname } });
        } else {
          enqueueSnackbar('Failed to check listing permissions', { variant: 'error' });
          setPermission(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to check permissions',
          }));
        }
      }
    };

    checkPermission();
  }, [enqueueSnackbar, navigate]);

  return permission;
};

export default useListingPermission;
