import React from "react";
import { FaCheck } from "react-icons/fa";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`w-5 h-5 flex items-center justify-center rounded border ${
          checked
            ? "bg-primary border-primary text-white"
            : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}`}
      >
        {checked && <FaCheck className="w-3 h-3" />}
      </div>
      <span className={`text-sm ${disabled ? "opacity-50" : ""}`}>{label}</span>
    </label>
  );
};

export default Checkbox;
