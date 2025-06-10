import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { apiClient } from '../api/apiClient';
import { useAuth } from './useAuth';

interface ListingPermission {
  canCreate: boolean;
  maxListings: number;
  currentListings: number;
  userRole: 'USER' | 'ADMIN';
  isLoading: boolean;
  error: string | null;
}

export const useListingPermission = (): ListingPermission => {
  const [permission, setPermission] = useState<ListingPermission>({
    canCreate: false,
    maxListings: 1,
    currentListings: 0,
    userRole: 'USER',
    isLoading: true,
    error: null,
  });

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await apiClient.get('/user/listing-permission');
        console.log('Listing permission response:', response.data);
        
        // Map backend role to frontend role
        const backendRole = response.data.userRole || 'USER';
        const frontendRole = backendRole === 'ADMIN' || backendRole === 'MODERATOR' 
          ? 'ADMIN' 
          : 'USER';
        
        setPermission({
          canCreate: response.data.canCreate,
          maxListings: response.data.maxListings || 1,
          currentListings: response.data.currentListings || 0,
          userRole: frontendRole,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Error checking listing permission:', error);
        
        if (error.response?.data?.code === 'LISTING_LIMIT_REACHED') {
          setPermission({
            canCreate: false,
            maxListings: error.response.data.maxListings || 1,
            currentListings: error.response.data.currentListings || 0,
            userRole: user?.role || 'USER',
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
            userRole: user?.role || 'USER',
            isLoading: false,
            error: 'Failed to check permissions',
          }));
        }
      }
    };

    if (user) {
      checkPermission();
    } else {
      // If no user is logged in, set loading to false
      setPermission(prev => ({
        ...prev,
        isLoading: false,
        userRole: 'USER',
        canCreate: false
      }));
    }
  }, [enqueueSnackbar, navigate, user]);

  return permission;
};

export default useListingPermission;
