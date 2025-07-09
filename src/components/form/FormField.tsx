import clsx from "clsx";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import type { SingleValue, ActionMeta, MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import { Tooltip } from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export type FormFieldValue = string | number | boolean | string[];

// Removed unused type definitions

export interface FormFieldProps {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "color"
    | "boolean"
    | "multiselect"
    | "date";
  value: FormFieldValue;
  onChange: (value: FormFieldValue, error?: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string; translationKey?: string }>;
  disabled?: boolean;
  min?: number;
  max?: number;
  prefix?: string;
  customValidation?: (
    value: string | string[],
  ) => string | string[] | undefined | null;
  isSearchable?: boolean;
  tooltip?: string;
}

export const FormField = forwardRef<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  FormFieldProps
>(
  (
    {
      name,
      label,
      type,
      value,
      onChange,
      error,
      required,
      placeholder,
      options,
      disabled,
      min,
      max,
      prefix,
      customValidation,
      isSearchable,
      tooltip,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const handleChange = (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >
        | SingleValue<{ value: string; label: string }>,
      _actionMeta?: ActionMeta<{ value: string; label: string }>,
    ) => {
      let newValue: string | boolean | string[];

      // Handle react-select change
      if (e && typeof e === "object" && "value" in e) {
        newValue = e.value;
      } else if (e && "target" in e) {
        // Handle standard form input change
        const target = e.target as HTMLInputElement;
        if (type === "checkbox") {
          newValue = target.checked;
        } else if (type === "date") {
          // Format date to YYYY-MM-DD
          newValue = target.value
            ? new Date(target.value).toISOString().split("T")[0]
            : "";
        } else {
          newValue = target.value;
        }
      } else {
        // Handle null case from react-select
        newValue = "";
      }

      // Run validation
      let validationError: string | undefined;
      let customValidationError: string | string[] | undefined | null;

      // First check if required field is empty
      if (
        required &&
        (newValue === undefined || newValue === null || newValue === "")
      ) {
        validationError = `${label} is required`;
      }
      // Then run custom validation if exists
      if (customValidation) {
        customValidationError = customValidation(String(newValue));
        if (customValidationError && !validationError) {
          validationError = Array.isArray(customValidationError)
            ? customValidationError[0]
            : customValidationError;
        }
      }

      onChange(
        type === "number" ? Number(newValue) : newValue,
        validationError || undefined,
      );
    };

    const handleMultiSelectChange = (
      newValue: MultiValue<unknown>,
      _actionMeta?: ActionMeta<unknown>,
    ) => {
      let newValueArr: string[] | null = null;

      if (Array.isArray(newValue) && newValue.length > 0) {
        newValueArr = newValue.map((item: any) => item.value);
      }

      // Run validation
      let validationError: string | undefined;
      let customValidationError: string | string[] | undefined | null;

      if (required && (!newValueArr || newValueArr.length === 0)) {
        validationError = `${label} is required`;
      }

      if (customValidation && newValue) {
        customValidationError = customValidation(newValueArr || []);
        if (customValidationError && !validationError) {
          validationError = Array.isArray(customValidationError)
            ? customValidationError[0]
            : customValidationError;
        }
      }

      onChange(newValueArr || [], validationError || undefined);

      // Using _actionMeta to avoid unused variable warning
    };

    const inputClasses = clsx(
      "block w-full rounded-lg border py-2 px-3 text-gray-900 bg-white",
      "transition-all duration-150 ease-in-out focus:outline-none",
      "focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
      {
        "border-gray-300 hover:border-blue-300": !error,
        "border-red-300 bg-red-50 hover:border-red-400 focus:border-red-500 focus:ring-red-500":
          error,
        "opacity-50 cursor-not-allowed": disabled,
        "pl-10": prefix,
      },
      "placeholder-gray-400",
    );

    const animatedComponents = makeAnimated();

    const renderInput = () => {
      switch (type) {
        case "textarea":
          return (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={name}
              name={name}
              value={value as string}
              onChange={handleChange}
              className={inputClasses}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              rows={4}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : undefined}
            />
          );

        case "select":
          if (isSearchable) {
            const selectedOption = options?.find((opt) => opt.value === value);
            return (
              <Select
                id={name}
                name={name}
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isDisabled={disabled}
                placeholder={placeholder || "Select an option"}
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable={true}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: "40px",
                    borderColor: error
                      ? "var(--red-300)"
                      : state.isFocused
                        ? "var(--blue-500)"
                        : "var(--gray-300)",
                    backgroundColor: error ? "var(--red-50)" : "white",
                    boxShadow: "none",
                    transition: "all 0.15s ease-in-out",
                    "&:hover": {
                      borderColor: error ? "var(--red-400)" : "var(--blue-300)",
                    },
                    "&:focus-within": {
                      borderColor: error ? "var(--red-500)" : "var(--blue-500)",
                      boxShadow: `0 0 0 1px ${error ? "var(--red-500)" : "var(--blue-500)"}`,
                    },
                  }),
                }}
              />
            );
          }
          return (
            <select
              ref={ref as React.Ref<HTMLSelectElement>}
              id={name}
              name={name}
              value={value as string}
              onChange={handleChange}
              className={inputClasses}
              required={required}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : undefined}
            >
              <option value="">{placeholder || "Select an option"}</option>
              {options?.map((option) => {
                // Use translationKey if available, otherwise use the label
                const displayLabel = option.translationKey
                  ? t(option.translationKey, option.label)
                  : option.label;

                return (
                  <option key={option.value} value={option.value}>
                    {typeof displayLabel === "string"
                      ? displayLabel === option.value
                        ? `${displayLabel.charAt(0).toUpperCase()}${displayLabel.slice(1).toLowerCase()}`
                        : displayLabel
                      : String(displayLabel)}
                  </option>
                );
              })}
            </select>
          );

        case "multiselect":
          return (
            <Select
              closeMenuOnSelect={false}
              id={name}
              name={name}
              onChange={handleMultiSelectChange}
              components={animatedComponents}
              placeholder={placeholder || "Select an option"}
              className="react-select-container"
              classNamePrefix="react-select"
              isSearchable={true}
              isMulti
              isDisabled={disabled || false}
              options={options}
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderColor: error
                    ? "var(--red-300)"
                    : state.isFocused
                      ? "var(--blue-500)"
                      : "var(--gray-300)",
                  backgroundColor: error ? "var(--red-50)" : "white",
                  boxShadow: state.isFocused
                    ? `0 0 0 1px ${error ? "var(--red-500)" : "var(--blue-500)"}`
                    : "none",
                  "&:hover": {
                    borderColor: error ? "var(--red-400)" : "var(--blue-400)",
                  },
                }),
              }}
            />
          );

        case "checkbox":
        case "boolean":
          return (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type="checkbox"
              id={name}
              name={name}
              checked={value as boolean}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : undefined}
            />
          );

        case "date":
          return (
            <div className="relative rounded-md shadow-sm">
              <input
                ref={ref as React.Ref<HTMLInputElement>}
                type="date"
                id={name}
                name={name}
                value={value as string}
                onChange={(e) => {
                  // Format the date to YYYY-MM-DD for proper display
                  const dateValue = e.target.value;
                  handleChange({
                    ...e,
                    target: {
                      ...e.target,
                      value: dateValue,
                    },
                  });
                }}
                className={inputClasses}
                required={required}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
              />
            </div>
          );

        default:
          return (
            <div className="relative rounded-md shadow-sm">
              {prefix && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">{prefix}</span>
                </div>
              )}
              <input
                ref={ref as React.Ref<HTMLInputElement>}
                type={type}
                id={name}
                name={name}
                value={type === "number" ? Number(value) : value.toString()}
                onChange={handleChange}
                className={inputClasses}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                min={min}
                max={max}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
              />
            </div>
          );
      }
    };

    return (
      <div className="mb-4">
        <div className="flex items-center gap-1">
          <label
            htmlFor={name}
            className={clsx("mb-1 block text-sm font-medium", {
              "text-gray-700": !error,
              "text-red-600": error,
            })}
          >
            {typeof label === "string" ? label : JSON.stringify(label)}
            {required && <span className="text-red-500">*</span>}
          </label>
          {tooltip && (
            <Tooltip content={tooltip} position="right">
              <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-500" />
            </Tooltip>
          )}
        </div>
        {renderInput()}
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
