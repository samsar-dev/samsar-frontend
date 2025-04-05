import React from "react";
// Replace the missing heroicons import with a simple SVG component
const ExclamationCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-2.78-1.5-3.646 0L2.697 16.126z"
    />
  </svg>
);
import { twMerge } from "tailwind-merge";

export interface FormFieldProps {
  id: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "select"
    | "textarea"
    | "checkbox"
    | "radio"
    | "date";
  value: string | number | boolean | undefined;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onBlur?: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  children?: React.ReactNode;
  showErrorIcon?: boolean;
  helpText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  options = [],
  min,
  max,
  step,
  disabled = false,
  className = "",
  inputClassName = "",
  labelClassName = "",
  children,
  showErrorIcon = true,
  helpText,
}) => {
  // Handle checkbox value specifically
  const isChecked = type === "checkbox" ? !!value : false;

  // Base input class - customizable through inputClassName prop
  const baseInputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`;

  // Calculate final input class based on error state and custom className
  const inputClass = twMerge(
    baseInputClass,
    error
      ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500 text-gray-900",
    disabled ? "bg-gray-100 cursor-not-allowed" : "",
    inputClassName,
  );

  // Special class for checkbox/radio
  const checkboxClass = twMerge(
    "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
    error ? "border-red-300" : "",
    disabled ? "bg-gray-100 cursor-not-allowed" : "",
    inputClassName,
  );

  // Render appropriate input based on type
  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <select
            id={id}
            value={value as string}
            onChange={onChange}
            onBlur={onBlur}
            className={inputClass}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            {!required && (
              <option value="">{placeholder || "Select an option"}</option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            id={id}
            value={value as string}
            onChange={onChange as any}
            onBlur={onBlur as any}
            placeholder={placeholder}
            className={twMerge(inputClass, "resize-vertical min-h-[100px]")}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              id={id}
              type="checkbox"
              checked={isChecked}
              onChange={onChange}
              onBlur={onBlur}
              className={checkboxClass}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            <label
              htmlFor={id}
              className={twMerge(
                "ml-2 text-sm text-gray-700",
                error ? "text-red-600" : "",
                labelClassName,
              )}
            >
              {label}
            </label>
          </div>
        );

      case "radio":
        return (
          <>
            <div className="flex items-center space-x-4">
              {options.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    id={`${id}-${option.value}`}
                    type="radio"
                    name={id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={twMerge(
                      "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300",
                      error ? "border-red-300" : "",
                      disabled ? "bg-gray-100 cursor-not-allowed" : "",
                      inputClassName,
                    )}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                  />
                  <label
                    htmlFor={`${id}-${option.value}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </>
        );

      default:
        return (
          <div className="relative">
            <input
              id={id}
              type={type}
              value={value as string}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              className={inputClass}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              required={required}
            />
            {error && showErrorIcon && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ExclamationCircleIcon />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={twMerge(
        "mb-4",
        type === "checkbox" ? "" : "flex flex-col",
        className,
      )}
    >
      {/* Render label except for checkbox which is rendered alongside the input */}
      {type !== "checkbox" && (
        <label
          htmlFor={id}
          className={twMerge(
            "block text-sm font-medium mb-1",
            error ? "text-red-700" : "text-gray-700",
            labelClassName,
          )}
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {/* Render the input or custom children if provided */}
      {children || renderInput()}

      {/* Help text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500" id={`${id}-description`}>
          {helpText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p
          className="mt-1 text-sm text-red-600"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
