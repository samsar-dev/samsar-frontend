import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocation, calculateDistance } from '@/utils/geolocation';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  error?: string;
}

interface UseLocationProps {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const useLocation = (props?: UseLocationProps) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState<boolean>(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const updateLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    getCurrentLocation()
      .then((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const startWatching = useCallback(() => {
    if (watching) return;

    setWatching(true);
    setLoading(true);

    const watchOptions = {
      enableHighAccuracy: props?.enableHighAccuracy ?? true,
      timeout: props?.timeout ?? 10000,
      maximumAge: props?.maximumAge ?? 0,
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(`Error watching position: ${err.message}`);
        setLoading(false);
      },
      watchOptions
    );

    setWatchId(id);
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watching, props]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setWatching(false);
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const getDistanceFrom = (lat: number, lng: number): number => {
    if (!location) return -1;
    return calculateDistance(location.latitude, location.longitude, lat, lng);
  };

  return {
    location,
    loading,
    error,
    watching,
    updateLocation,
    startWatching,
    stopWatching,
    getDistanceFrom,
  };
};
