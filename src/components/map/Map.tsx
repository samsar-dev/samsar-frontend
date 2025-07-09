import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import type { Listing } from "@/types/listings";
import { locationAPI } from "@/api/location.api";
import { useTranslation } from "react-i18next";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  center: [number, number];
  zoom?: number;
  listings?: Listing[];
  onMarkerClick?: (listing: Listing) => void;
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
  scrollWheelZoom?: boolean;
  dragging?: boolean;
  zoomControl?: boolean;
  doubleClickZoom?: boolean;
  touchZoom?: boolean;
  boxZoom?: boolean;
  keyboard?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

const ChangeView = ({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) => {
  const map = useMap();
  useEffect(() => {
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// Custom marker icon for listings
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: '<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
};

const Map: React.FC<MapProps> = ({
  center: propCenter,
  zoom = 13,
  listings = [],
  onMarkerClick,
  className = "",
  style = { height: "200px", width: "100%" },
  // interactive is handled by the MapContainer props
  scrollWheelZoom = false,
  dragging = false,
  zoomControl = false,
  doubleClickZoom = false,
  touchZoom = false,
  boxZoom = false,
  keyboard = false,
  minZoom = 2,
  maxZoom = 19,
}) => {
  // Initial check for valid coordinates in the first listing
  const hasInitialCoords =
    listings[0]?.latitude !== undefined && listings[0]?.longitude !== undefined;
  const initialCenter = hasInitialCoords
    ? ([listings[0].latitude, listings[0].longitude] as [number, number])
    : ([0, 0] as [number, number]);

  // Check if we have valid coordinates
  const hasValidCoords = (coords: unknown): coords is [number, number] => {
    return (
      Array.isArray(coords) &&
      coords.length === 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number" &&
      !isNaN(coords[0]) &&
      !isNaN(coords[1])
    );
  };
  const mapRef = useRef<LeafletMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [geocodedCenter, setGeocodedCenter] = useState<[number, number] | null>(
    null,
  );
  const { t } = useTranslation();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (listing: Listing) => {
      onMarkerClick?.(listing);
    },
    [onMarkerClick],
  );

  // Geocode location if coordinates are not available
  useEffect(() => {
    const geocodeLocation = async () => {
      if (hasValidCoords(propCenter || initialCenter) || !listings.length)
        return;

      const listing = listings[0];
      if (!listing.location) return;

      setIsGeocoding(true);
      setGeocodingError(null);

      try {
        // First try reverse geocoding with the location name
        const response = await locationAPI.searchLocations(listing.location, {
          limit: 1,
        });

        if (response && response.length > 0) {
          setGeocodedCenter([response[0].lat, response[0].lon]);
          return;
        }

        // If no results, try with a more general search
        const generalSearch = await locationAPI.searchLocations(
          listing.location.split(",")[0],
          { limit: 1 },
        );
        if (generalSearch && generalSearch.length > 0) {
          setGeocodedCenter([generalSearch[0].lat, generalSearch[0].lon]);
          return;
        }

        throw new Error("Location not found");
      } catch (error) {
        console.error("Geocoding error:", error);
        setGeocodingError(t("map.locationNotFound"));
      } finally {
        setIsGeocoding(false);
      }
    };

    geocodeLocation();
  }, [listings, t, initialCenter]);

  // Use geocoded center if available and no explicit center provided
  const effectiveCenter =
    propCenter ||
    (hasValidCoords(initialCenter)
      ? initialCenter
      : geocodedCenter || ([0, 0] as [number, number]));

  // Don't render on server-side
  if (typeof window === "undefined") {
    return <div style={{ ...style }} className={className} />;
  }

  // Handle loading and error states
  if (isGeocoding) {
    return (
      <div
        style={{
          ...style,
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: "0.875rem",
        }}
        className={className}
      >
        {t("map.loadingLocation")}
      </div>
    );
  }

  if (geocodingError) {
    return (
      <div
        style={{
          ...style,
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef4444",
          fontSize: "0.875rem",
          textAlign: "center",
          padding: "1rem",
        }}
        className={className}
      >
        {t("map.locationNotFound")}
      </div>
    );
  }

  // Handle invalid coordinates
  if (!hasValidCoords(effectiveCenter)) {
    return (
      <div
        style={{
          ...style,
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: "0.875rem",
          textAlign: "center",
          padding: "1rem",
        }}
        className={className}
      >
        {listings.length > 0
          ? t("map.locationNotAvailable")
          : t("map.noLocationData")}
      </div>
    );
  }

  // Calculate bounds to fit all markers if we have multiple listings
  const bounds =
    listings.length > 1
      ? L.latLngBounds(
          listings
            .filter((l) => l.latitude && l.longitude)
            .map((l) => [l.latitude!, l.longitude!] as [number, number]),
        )
      : undefined;

  return (
    <div className={`map-container ${className}`} style={style}>
      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
        style={{ height: "100%", width: "100%" }}
        whenReady={() => {
          setMapReady(true);
        }}
        ref={(map) => {
          if (map) {
            mapRef.current = map;
            // If we have bounds, fit to them after a short delay to ensure the map is initialized
            if (bounds) {
              setTimeout(() => {
                map.fitBounds(bounds, { padding: [50, 50] });
              }, 100);
            }
          }
        }}
        zoomControl={zoomControl}
        scrollWheelZoom={scrollWheelZoom}
        dragging={dragging}
        doubleClickZoom={doubleClickZoom}
        touchZoom={touchZoom}
        boxZoom={boxZoom}
        keyboard={keyboard}
        minZoom={minZoom}
        maxZoom={maxZoom}
        className="map-container bg-gray-100 dark:bg-gray-800"
      >
        <ChangeView center={effectiveCenter} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={maxZoom}
          minZoom={minZoom}
          className="map-tiles"
        />

        {mapReady &&
          listings.map((listing, index) => {
            if (!listing.latitude || !listing.longitude) return null;

            return (
              <Marker
                key={listing.id || `marker-${index}`}
                position={[listing.latitude, listing.longitude]}
                icon={createCustomIcon()}
                eventHandlers={{
                  click: () => handleMarkerClick(listing),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[150px]">
                    <h4 className="font-medium text-sm mb-1">
                      {listing.title || "Location"}
                    </h4>
                    {listing.price && (
                      <p className="text-primary-600 font-semibold text-sm">
                        ${listing.price.toLocaleString()}
                      </p>
                    )}
                    {listing.location && (
                      <p className="text-xs text-gray-600 mt-1">
                        {listing.location}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default Map;
