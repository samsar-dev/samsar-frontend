import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiX } from "react-icons/fi";
import { useDebounce } from "react-use";
import { syrianCities } from "@/utils/syrianCitiesEnglish";

interface LocationArea {
  name: string;
  city: string;
  enName: string;
  enCity: string;
  arName: string;
  arCity: string;
  latitude: number;
  longitude: number;
  isNeighbor: boolean;
  governorate?: string;
  areaType: "city" | "neighbor";
  distance?: number; // Distance from search location in km
}

interface LocationResult {
  place_id: string;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  namedetails?: {
    name?: string;
    "name:ar"?: string;
    "name:en"?: string;
    [key: string]: string | undefined;
  };
  boundingbox?: [string, string, string, string];
  class?: string;
  type?: string;
  importance?: number;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  address: string;
  coordinates: [number, number];
  rawResult: any;
}

export interface SelectedLocation {
  address: string;
  coordinates: [number, number];
  rawResult?: any;
  latitude: number;
  longitude: number;
  radius?: number;
}

interface LocationSearchProps {
  onSelectLocation: (location: SelectedLocation) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  initialValue?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectLocation,
  onInputChange,
  placeholder = "Search for a location...",
  className = "",
  inputClassName = "",
  initialValue = "",
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialValue);
  const [apiResults, setApiResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { i18n } = useTranslation();

  // Function to get governorate name based on city name
  const getGovernorate = (cityName: string): string => {
    // Add mapping of cities to their governorates
    const governorateMap: { [key: string]: string } = {
      Damascus: "Damascus",
      Aleppo: "Aleppo",
      Homs: "Homs",
      Hama: "Hama",
      Latakia: "Latakia",
      Tartus: "Tartus",
      Idlib: "Idlib",
      "Deir ez-Zor": "Deir ez-Zor",
      Raqqa: "Raqqa",
      Hasakah: "Hasakah",
      Quneitra: "Quneitra",
      Sweida: "Sweida",
      Daraa: "Daraa",
      "Al-Hasakah": "Hasakah",
      "Al-Raqqah": "Raqqa",
      "Al-Quneitra": "Quneitra",
      "As-Suwayda": "Sweida",
      "Ad-Dar": "Daraa",
    };

    return governorateMap[cityName] || "Unknown";
  };

  // Get all predefined areas from the locations data
  const allPredefinedAreas = useMemo<LocationArea[]>(() => {
    const currentLang = i18n.language;
    const isArabic = currentLang.startsWith("ar");

    const areas: LocationArea[] = [];

    // Add cities with their coordinates
    syrianCities.forEach((city) => {
      areas.push({
        name: city.name,
        city: city.name,
        enName: city.name,
        enCity: city.name,
        arName: city.name,
        arCity: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        isNeighbor: false,
        areaType: "city",
        governorate: getGovernorate(city.name),
      });
    });

    // Add neighbors with their coordinates
    syrianCities.forEach((city) => {
      city.neighbors.forEach((neighbor) => {
        areas.push({
          name: neighbor.name,
          city: isArabic ? city.name : city.name,
          enName: neighbor.name,
          enCity: city.name,
          arName: neighbor.name,
          arCity: city.name,
          latitude: neighbor.latitude,
          longitude: neighbor.longitude,
          isNeighbor: true,
          areaType: "neighbor",
          governorate: getGovernorate(city.name),
        });
      });
    });

    return areas;
  }, [i18n.language]);

  // Combine API results with predefined areas
  const results = useMemo(() => {
    if (!query || query.length < 2) return [];

    const isArabic =
      /[\u0600-\u06FF]/.test(query) || i18n.language.startsWith("ar");

    // Filter predefined areas that match the query
    const matchedAreas = allPredefinedAreas
      .filter((area) => {
        const searchInName = isArabic ? area.arName : area.enName;
        const searchInCity = isArabic ? area.arCity : area.enCity;
        return (
          searchInName?.toLowerCase().includes(query.toLowerCase()) ||
          searchInCity?.toLowerCase().includes(query.toLowerCase())
        );
      })
      .map((area) => {
        // For neighborhoods, always include the city in the display name
        const displayName = isArabic
          ? `${area.arName}, ${area.arCity}`
          : `${area.enName}, ${area.enCity}`;

        return {
          place_id: `predefined-${area.enName}-${area.enCity}`,
          display_name: displayName,
          name: isArabic ? area.arName : area.enName,
          lat: area.latitude?.toString() || "0",
          lon: area.longitude?.toString() || "0",
          address: {
            city: isArabic ? area.arCity : area.enCity,
            town: isArabic ? area.arName : area.enName,
            state: isArabic ? "سوريا" : "Syria",
            country: isArabic ? "سوريا" : "Syria",
            country_code: "sy",
          },
          namedetails: {
            name: area.enName,
            "name:ar": area.arName,
            "name:en": area.enName,
          },
          importance: 1,
          isPredefined: true,
        };
      });

    // Combine with API results and remove duplicates
    const allResults = [...matchedAreas, ...apiResults];
    const uniqueResults = Array.from(
      new Map(allResults.map((item) => [item.display_name, item])).values(),
    );

    return uniqueResults;
  }, [query, apiResults, allPredefinedAreas]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce search
  useDebounce(
    () => {
      if (query && query.length > 2) {
        searchLocations(query);
      } else {
        setApiResults([]);
      }
    },
    300,
    [query],
  );

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setApiResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // Check if the input contains Arabic characters
      const hasArabic = /[\u0600-\u06FF]/.test(searchQuery);
      const lang = hasArabic ? "ar" : "en";

      // Create URL with proper encoding
      const baseUrl = "https://nominatim.openstreetmap.org/search";
      const params = new URLSearchParams();

      // Add parameters one by one to ensure proper encoding
      params.append("format", "json");
      params.append("q", searchQuery);
      params.append("countrycodes", "sy");
      params.append("limit", "10");
      params.append("addressdetails", "1");
      params.append("namedetails", "1");
      params.append("polygon_geojson", "0");
      params.append("dedupe", "1");
      params.append("bounded", "1");
      params.append("viewbox", "35.5,37.3,42.4,32.3");
      params.append(
        "accept-language",
        `${lang},${lang === "ar" ? "en" : "ar"}`,
      );
      params.append(
        "featureType",
        "city,town,village,suburb,quarter,neighborhood",
      );
      params.append("extratags", "1");

      // Construct URL with proper encoding
      const url = `${baseUrl}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Samsar/1.0 (contact@samsar.sy)",
          "Accept-Language": `${lang},${lang === "ar" ? "en" : "ar"};q=0.8,en-US;q=0.7`,
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApiResults(data);
    } catch (error) {
      console.error("Error searching locations:", error);
      setApiResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (result: LocationResult) => {
    const displayName = getDisplayName(result);
    setQuery(displayName);
    setShowResults(false);

    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Get the city name from the result
    const city = result.address?.city || result.address?.town || "";

    // Create a combined display name with neighborhood and city if they're different
    const combinedDisplayName =
      city && displayName.toLowerCase() !== city.toLowerCase()
        ? `${displayName}, ${city}`
        : displayName;

    onSelectLocation({
      address: combinedDisplayName,
      coordinates: [lat, lon],
      latitude: lat,
      longitude: lon,
      radius: 5, // Default radius of 5km
      rawResult: result, // Include raw result for debugging
    });
  };

  const getDisplayName = (result: LocationResult): string => {
    if (!result) return "Unknown location";

    // For predefined locations, use the display_name which already includes city
    if ((result as any).isPredefined && result.display_name) {
      return result.display_name;
    }

    // Check if the current query is in Arabic
    const isArabicQuery = /[\u0600-\u06FF]/.test(query);

    // Try to get the name in the preferred language from namedetails
    if (result.namedetails) {
      // If user is typing in Arabic, prefer Arabic name
      if (isArabicQuery && result.namedetails["name:ar"]) {
        return result.namedetails["name:ar"];
      }
      // Otherwise try to match the browser language
      const userLang = navigator.language.startsWith("ar") ? "ar" : "en";
      if (userLang === "ar" && result.namedetails["name:ar"]) {
        return result.namedetails["name:ar"];
      } else if (result.namedetails["name:en"]) {
        return result.namedetails["name:en"];
      } else if (result.namedetails.name) {
        return result.namedetails.name;
      }
    }

    // Fall back to display_name if available
    if (result.display_name) {
      return result.display_name;
    }

    // Fall back to address components if available
    if (result.address) {
      const { address } = result;
      const parts = [];

      // For predefined locations, use town, city format if both exist
      if ((result as any).isPredefined) {
        if (address.town && address.city) {
          return `${address.town}, ${address.city}`;
        }
        return address.town || address.city || "";
      }

      // Add the most specific location name first
      if (address.town) parts.push(address.town);
      if (address.city && !parts.includes(address.city))
        parts.push(address.city);
      else if (address.village && !parts.includes(address.village))
        parts.push(address.village);
      else if (address.municipality && !parts.includes(address.municipality))
        parts.push(address.municipality);

      // Add state if available and not already included
      if (address.state && !parts.includes(address.state)) {
        parts.push(address.state);
      }

      if (parts.length > 0) {
        return parts.join(", ");
      }
    }

    // Final fallback
    return result.name || "Unknown location";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (onInputChange) {
      onInputChange(value);
    }
    if (value.length > 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setApiResults([]);
    setShowResults(false);
    if (onInputChange) {
      onInputChange("");
    }
    onSelectLocation({
      address: "",
      coordinates: [0, 0],
      latitude: 0,
      longitude: 0,
      radius: 0,
      rawResult: null,
    });
  };

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiMapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 2 && setShowResults(true)}
          placeholder={placeholder}
          className={`w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${inputClassName}`}
        />
        {query && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={handleClear}
          >
            <FiX className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search results */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none sm:text-sm">
          {results.map((result) => (
            <div
              key={result.place_id}
              className="cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
              onClick={() => handleSelect(result)}
            >
              <div className="flex items-center">
                <span className="font-normal ml-3 block truncate">
                  {getDisplayName(result)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none sm:text-sm">
          <div className="px-4 py-2 text-sm text-gray-500">
            {t ? `${t("searching")}...` : "Searching..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
