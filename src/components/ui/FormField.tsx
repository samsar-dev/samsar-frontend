import { clsx } from "clsx";
import { forwardRef, useCallback } from "react";

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
    | "select";
  value?: string | number;
  onChange: (value: string | number) => void;
  error?: string;
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
  tooltip?: string;
  validateOnBlur?: boolean;
  customValidation?: (value: string) => string | undefined;
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
      value,
      onChange,
      error,
      required = false,
      placeholder,
      disabled = false,
      className = "",
      min,
      max,
      step,
      options = [],
      prefix,
      suffix,
      tooltip,
      validateOnBlur = true,
      customValidation,
      ...props
    },
    ref,
  ) => {
    const handleChange = useCallback(
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
        let newValue: string | number = e.target.value;

        if (type === "number") {
          newValue = newValue === "" ? "" : Number(newValue);
          if (isNaN(newValue as number)) newValue = "";
        }

        if (type === "select") {
          newValue =
            options.find((opt) => opt.value === e.target.value)?.value || "";
        }

        onChange(newValue);
      },
      [onChange, type, options],
    );

    const handleBlur = useCallback(() => {
      if (validateOnBlur && customValidation && typeof value === "string") {
        const validationError = customValidation(value);
        if (validationError) {
          console.error(validationError);
        }
      }
    }, [validateOnBlur, customValidation, value]);

    const inputClasses = clsx(
      "block w-full rounded-md border-gray-300 shadow-sm",
      "focus:border-blue-500 focus:ring-blue-500",
      "disabled:bg-gray-100 disabled:cursor-not-allowed",
      error && "border-red-300 text-red-900 placeholder-red-300",
      "sm:text-sm",
      className,
    );

    const renderInput = () => {
      const commonProps = {
        id: name,
        name,
        value: value ?? "",
        onChange: handleChange,
        onBlur: handleBlur,
        disabled,
        placeholder,
        required,
        className: inputClasses,
        "aria-describedby": error ? `${name}-error` : undefined,
        ...props,
      };

      if (type === "textarea") {
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={4}
            {...commonProps}
          />
        );
      }

      if (type === "select") {
        return (
          <select ref={ref as React.Ref<HTMLSelectElement>} {...commonProps}>
            <option value="">Select an option</option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          min={min}
          max={max}
          step={step}
          {...commonProps}
        />
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
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            {tooltip && (
              <span
                className="ml-1 text-gray-400 hover:text-gray-500 cursor-help"
                title={tooltip}
              >
                ⓘ
              </span>
            )}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{prefix}</span>
            </div>
          )}
          {renderInput()}
          {suffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{suffix}</span>
            </div>
          )}
        </div>
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