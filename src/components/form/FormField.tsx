import clsx from "clsx";
import { forwardRef } from "react";
import Select from "react-select";
import type { SingleValue, ActionMeta, MultiValue } from "react-select";
import makeAnimated from "react-select/animated";
import { Tooltip } from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export type FormFieldValue = string | number | boolean | string[];

type OptionType = {
  value: string;
  label: string;
};

type HandleMultiSelectChangeProps = {
  required?: boolean;
  label: string;
  customValidation?: (value: string[]) => string | undefined;
  onChange: (value: string[] | null, error?: string) => void;
};

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
    | "multiselect";
  value: FormFieldValue;
  onChange: (value: FormFieldValue, error?: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
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
  ({
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
  }, ref) => {
  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | SingleValue<{ value: string; label: string }>,
    actionMeta?: ActionMeta<{ value: string; label: string }>,
  ) => {
    let newValue;

    // Handle react-select change
    if (e && typeof e === "object" && "value" in e) {
      newValue = e.value;
    } else if (e && "target" in e) {
      // Handle standard form input change
      newValue =
        type === "checkbox"
          ? (e as React.ChangeEvent<HTMLInputElement>).target.checked
          : (
              e as React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
              >
            ).target.value;
    } else {
      // Handle null case from react-select
      newValue = "";
    }

    // Run validation
    let validationError: string | string[] | undefined | null;

    // First check if required field is empty
    if (
      required &&
      (newValue === undefined || newValue === null || newValue === "")
    ) {
      validationError = `${label} is required`;
    }
    // Then run custom validation if exists and no required error
    else if (customValidation && !validationError) {
      validationError = customValidation(String(newValue));
    }

    onChange(newValue, validationError);
  };

  const handleMultiSelectChange = (
    newValue: MultiValue<unknown>,
    actionMeta?: ActionMeta<unknown>,
  ) => {
    let newValueArr: string[] | null = null;

    if (Array.isArray(newValue) && newValue.length > 0) {
      newValueArr = newValue.map((item) => item.value);
    }

    // Run validation
    let validationError: string | string[] | undefined | null;

    if (required && (!newValueArr || newValueArr.length === 0)) {
      validationError = `${label} is required`;
    } else if (customValidation && newValue) {
      validationError = customValidation(newValueArr || []);
    }

    onChange(newValueArr || [], validationError);
  };

  const inputClasses = clsx(
    "block w-full rounded-lg border py-2 px-3 text-gray-900 shadow-sm transition-colors duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    {
      "border-gray-300 focus:border-blue-500 focus:ring-blue-500": !error,
      "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500": error,
      "opacity-50 cursor-not-allowed": disabled,
      "pl-10": prefix,
    },
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
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {typeof option.label === "string"
                  ? option.label === option.value
                    ? `${option.label.charAt(0).toUpperCase()}${option.label.slice(1).toLowerCase()}`
                    : option.label
                  : String(option.label)}
              </option>
            ))}
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
              value={value as string}
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
          {label}
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
});

FormField.displayName = "FormField";

export default FormField;
