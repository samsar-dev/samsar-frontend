import { clsx } from "clsx";
import { forwardRef, useCallback, useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { ListingFieldSchema } from "@/types/listings";

export type FormFieldValue = string | number | boolean | string[];

export interface FormFieldProps {
  label?: string;
  name: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "tel"
    | "textarea"
    | "select"
    | "checkbox"
    | "date"
    | "multiselect"
    | "colorpicker";
  value?: FormFieldValue;
  onChange: (value: FormFieldValue, error?: string) => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  validateOnBlur?: boolean;
  customValidation?: (value: string) => string | undefined;
  fieldSchema?: ListingFieldSchema;
}

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(
  (
    {
      label,
      name,
      type = "text",
      value: propValue,
      onChange,
      error,
      helpText,
      required,
      placeholder,
      options,
      disabled,
      className,
      min,
      max,
      step,
      prefix,
      suffix,
      validateOnBlur = true,
      customValidation,
      fieldSchema,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<FormFieldValue>(
      propValue !== undefined ? propValue : ''
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let newValue: FormFieldValue = event.target.value;

        // Handle number type conversion
        if (type === "number") {
          newValue = event.target.value === "" ? null : Number(event.target.value);
        }

        // Set internal value
        setInternalValue(newValue);

        // Validate if needed
        let validationError: string | undefined;
        if (fieldSchema?.validate) {
          validationError = fieldSchema.validate(newValue);
        } else if (customValidation) {
          validationError = customValidation(newValue as string);
        }

        // Call onChange with value and potential error
        onChange(newValue, validationError);
      },
      [onChange, fieldSchema, customValidation]
    );

    useEffect(() => {
      if (propValue !== undefined) {
        setInternalValue(propValue);
      }
    }, [propValue]);

    const handleBlur = useCallback(() => {
      if (validateOnBlur && (fieldSchema?.validate || customValidation)) {
        const valueToValidate = internalValue as string;
        let validationError: string | undefined;

        if (fieldSchema?.validate) {
          validationError = fieldSchema.validate(internalValue);
        } else if (customValidation) {
          validationError = customValidation(valueToValidate);
        }

        if (validationError) {
          onChange(internalValue, validationError);
        }
      }
    }, [validateOnBlur, fieldSchema, customValidation, internalValue, onChange]);

    const inputClasses = clsx(
      "block w-full rounded-md border-gray-300 shadow-sm",
      "focus:border-blue-500 focus:ring-blue-500",
      "disabled:bg-gray-100 disabled:cursor-not-allowed",
      error && "border-red-300 text-red-900 placeholder-red-300",
      "sm:text-sm",
      className,
    );

    const renderInput = () => {
      if (type === "colorpicker") {
        return (
          <div className="relative">
            <div
              className="w-12 h-8 border rounded cursor-pointer"
              style={{ backgroundColor: (internalValue as string) || "#ffffff" }}
              onClick={() => setInternalValue("#ffffff")}
            />
            <HexColorPicker
              color={(internalValue as string) || "#ffffff"}
              onChange={(color) => setInternalValue(color)}
            />
          </div>
        );
      }

      if (type === "textarea") {
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={name}
            name={name}
            value={internalValue as string}
            onChange={handleChange}
            onBlur={handleBlur}
            className={clsx(
              "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              error && "ring-red-300 focus:ring-red-500",
              disabled && "bg-gray-50 text-gray-500",
              className,
            )}
            disabled={disabled}
            placeholder={placeholder}
            rows={4}
          />
        );
      }

      if (type === "select") {
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={name}
            name={name}
            value={internalValue as string}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClasses}
            disabled={disabled}
            required={required}
            multiple={Array.isArray(internalValue)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      if (type === "checkbox") {
        if (options && options.length > 0) {
          return (
            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="inline-flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    name={name}
                    value={option.value}
                    checked={(internalValue as string[])?.includes(option.value)}
                    onChange={(event) => {
                      const newValue = (internalValue as string[]) || [];
                      if (event.target.checked) {
                        newValue.push(option.value);
                      } else {
                        newValue = newValue.filter((v) => v !== option.value);
                      }
                      setInternalValue(newValue);
                      onChange(newValue);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          );
        }

        return (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="checkbox"
            id={name}
            name={name}
            checked={internalValue as boolean}
            onChange={(event) => {
              setInternalValue(event.target.checked);
              onChange(event.target.checked);
            }}
            onBlur={handleBlur}
            className={clsx(
              "rounded border-gray-300 text-blue-600 focus:ring-blue-500",
              error && "border-red-300",
              disabled && "bg-gray-100 cursor-not-allowed",
            )}
            disabled={disabled}
          />
        );
      }

      if (type === "text" || type === "number" || type === "email" || type === "password" || type === "tel") {
        return (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            id={name}
            name={name}
            value={internalValue as string}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClasses}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
          />
        );
      }

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
            value={internalValue as string}
            onChange={handleChange}
            onBlur={handleBlur}
            className={clsx(inputClasses, prefix && "pl-7", suffix && "pr-7")}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            min={min}
            max={max}
            step={step}
          />
          {suffix && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">{suffix}</span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={name}
            className={clsx(
              "block text-sm font-medium",
              error ? "text-red-600" : "text-gray-700",
              disabled && "text-gray-400",
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        {renderInput()}
        {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
