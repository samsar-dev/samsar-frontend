import React from "react";
import type { Listing } from "@/types";
import { FaMapMarkerAlt } from "react-icons/fa";

interface Props {
  onSave: (location: Listing) => void;
}

const LocationSettings: React.FC<Props> = ({ onSave }) => {
  const [currentLocation, setCurrentLocation] = useState<Listing>({
    city: "",
    country: "",
    postalCode: "",
    address: "",
  });

  const cities = [
    "New York",
    "London",
    "Berlin",
    "Paris",
    "Tokyo",
    "Dubai",
    "Singapore",
    "Sydney",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentLocation);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FaMapMarkerAlt className="mr-2" />
        Location Settings
      </h2>

      <div className="space-y-6">
        {/* Location Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Location
          </label>
          <select
            value={currentLocation.city}
            onChange={(e) =>
              setCurrentLocation({ ...currentLocation, city: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            This helps us show you relevant listings and content
          </p>
        </div>

        {/* Location Privacy */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Show My Location
              </h3>
              <p className="text-sm text-gray-500">
                Allow others to see your location on your profile
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={true}
                onChange={(e) =>
                  setCurrentLocation({
                    ...currentLocation,
                    showLocation: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default LocationSettings;
