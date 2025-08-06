import clsx from "clsx";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/components/ui/tooltip";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

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
      tooltip,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const handleChange = (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>
        | React.ChangeEvent<HTMLTextAreaElement>
        | null,
    ) => {
      let newValue: string | boolean | string[];

      if (e && "target" in e) {
        // Handle standard form input change
        const target = e.target;
        if (type === "checkbox" || type === "boolean") {
          newValue = (target as HTMLInputElement).checked;
        } else if (type === "date") {
          // Format date to YYYY-MM-DD
          newValue = target.value;
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

    const handleMultiSelectChange = (newValue: string[]) => {
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

        case "select": {
          return (
            <SelectPrimitive.Root
              value={value as string}
              onValueChange={(newValue: string) =>
                handleChange({
                  target: { value: newValue },
                } as React.ChangeEvent<HTMLSelectElement>)
              }
              disabled={disabled}
            >
              <SelectPrimitive.Trigger
                className={clsx(
                  "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  error && "border-red-500",
                )}
              >
                <SelectPrimitive.Value
                  placeholder={placeholder || t("form.select_option")}
                />
                <SelectPrimitive.Icon>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </SelectPrimitive.Icon>
              </SelectPrimitive.Trigger>
              <SelectPrimitive.Portal>
                <SelectPrimitive.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                  <SelectPrimitive.Viewport className="p-1">
                    {options?.map((option) => (
                      <SelectPrimitive.Item
                        key={option.value}
                        value={option.value}
                        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      >
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <SelectPrimitive.ItemIndicator>
                            <Check className="h-4 w-4" />
                          </SelectPrimitive.ItemIndicator>
                        </span>
                        <SelectPrimitive.ItemText>
                          {option.translationKey
                            ? t(option.translationKey)
                            : option.label}
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                    ))}
                  </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
              </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
          );
        }

        case "multiselect": {
          const selectedValues = Array.isArray(value) ? value : [];
          return (
            <div className="relative">
              <div
                className={clsx(
                  "flex flex-wrap gap-1 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  error && "border-red-500",
                )}
              >
                {selectedValues.map((val) => {
                  const option = options?.find((opt) => opt.value === val);
                  return (
                    <div
                      key={val}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs"
                    >
                      {option
                        ? option.translationKey
                          ? t(option.translationKey)
                          : option.label
                        : val}
                      <button
                        type="button"
                        onClick={() => {
                          const newValues = selectedValues.filter(
                            (v) => v !== val,
                          );
                          handleMultiSelectChange(newValues);
                        }}
                        className="ml-1 rounded-full hover:bg-blue-200"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
                <SelectPrimitive.Root
                  onValueChange={(newValue: string) => {
                    if (!selectedValues.includes(newValue)) {
                      handleMultiSelectChange([...selectedValues, newValue]);
                    }
                  }}
                  disabled={disabled}
                >
                  <SelectPrimitive.Trigger className="flex items-center text-muted-foreground hover:text-foreground">
                    <span>{placeholder || t("form.select_option")}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </SelectPrimitive.Trigger>
                  <SelectPrimitive.Portal>
                    <SelectPrimitive.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
                      <SelectPrimitive.Viewport className="p-1">
                        {options?.map(
                          (option) =>
                            !selectedValues.includes(option.value) && (
                              <SelectPrimitive.Item
                                key={option.value}
                                value={option.value}
                                className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              >
                                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                  <SelectPrimitive.ItemIndicator>
                                    <Check className="h-4 w-4" />
                                  </SelectPrimitive.ItemIndicator>
                                </span>
                                <SelectPrimitive.ItemText>
                                  {option.translationKey
                                    ? t(option.translationKey)
                                    : option.label}
                                </SelectPrimitive.ItemText>
                              </SelectPrimitive.Item>
                            ),
                        )}
                      </SelectPrimitive.Viewport>
                    </SelectPrimitive.Content>
                  </SelectPrimitive.Portal>
                </SelectPrimitive.Root>
              </div>
            </div>
          );
        }

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
                  handleChange(e);
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
              <div className="relative">
                <input
                  ref={ref as React.Ref<HTMLInputElement>}
                  type={type}
                  id={name}
                  name={name}
                  value={
                    type === "number"
                      ? value === 0
                        ? ""
                        : String(value)
                      : String(value)
                  }
                  onChange={handleChange}
                  className={clsx(
                    inputClasses,
                    "relative z-10 bg-transparent",
                    {
                      "text-transparent": type === "number" && value === 0,
                    },
                  )}
                  placeholder="0"
                  required={required}
                  disabled={disabled}
                  min={min}
                  max={max}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${name}-error` : undefined}
                />
                {type === "number" && value === 0 && (
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                    {placeholder}
                  </span>
                )}
              </div>
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
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-500" />
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
