import React from "react";
import clsx from "clsx";
import Select from "react-select";

export type FormFieldValue = string | number | boolean | string[];

export interface FormFieldProps {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "checkbox" | "color";
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
  customValidation?: (value: string) => string | undefined;
  isSearchable?: boolean;
}

export const FormField = React.forwardRef<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  FormFieldProps
>((props, ref) => {
  const {
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
  } = props;

  const handleChange = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | { value: string; label: string },
  ) => {
    let newValue;

    // Handle react-select change
    if ("value" in e && "label" in e) {
      newValue = e.value;
    } else {
      // Handle standard form input change
      newValue =
        type === "checkbox"
          ? (e as React.ChangeEvent<HTMLInputElement>).target.checked
          : (
              e as React.ChangeEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
              >
            ).target.value;
    }

    // Run validation
    let validationError: string | undefined;

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
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
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
    <div className="space-y-2">
      <label
        htmlFor={name}
        className={clsx("block text-sm font-medium", {
          "text-gray-900": !error,
          "text-red-600": error,
        })}
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
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
