import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "@/components/ui/tooltip";

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  tooltip?: string;
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  tooltip,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(value || "#ffffff");
  const pickerRef = useRef<HTMLDivElement>(null);

  // Toggle color picker visibility
  const toggleColorPicker = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (isOpen && pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Using 'click' event which works for both mouse and touch
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen]);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    onChange(color);
  };

  const presetColors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#808080",
    "#800000",
    "#808000",
    "#008000",
    "#800080",
    "#008080",
    "#000080",
  ];

  return (
    <div className="relative w-full inline-block text-left" ref={pickerRef}>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {tooltip && (
          <div className="flex items-center">
            <Tooltip content={tooltip} position="top">
              <div className="cursor-help">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 w-full relative">
        <button
          type="button"
          onClick={toggleColorPicker}
          onTouchStart={(e) => e.stopPropagation()}
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
          style={{ backgroundColor: currentColor }}
          aria-label={`Selected ${label.toLowerCase()}`}
        />

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={currentColor.toUpperCase()}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="#FFFFFF"
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          />
        </div>

        <input
          type="color"
          value={currentColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
          title={`Choose ${label.toLowerCase()}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full">
          <div className="bg-white rounded-md shadow-lg border border-gray-200 p-3">
            <div className="grid grid-cols-8 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange(color);
                    setIsOpen(false);
                  }}
                  className={`w-6 h-6 rounded-sm border ${
                    currentColor === color 
                      ? "border-blue-500 ring-1 ring-blue-200 ring-offset-1" 
                      : "border-gray-200 hover:border-gray-400"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all`}
                  style={{ backgroundColor: color }}
                  aria-label={`Choose color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ColorPickerField;
