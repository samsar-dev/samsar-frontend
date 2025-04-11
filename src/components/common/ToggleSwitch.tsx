import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange, disabled }) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-11 h-6 transition-colors duration-200 ease-in-out rounded-full ${
          checked
            ? 'bg-primary'
            : 'bg-gray-200 dark:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div
          className={`absolute left-0.5 top-0.5 w-5 h-5 transition-transform duration-200 ease-in-out transform bg-white rounded-full shadow-sm ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      <span className={`text-sm ${disabled ? 'opacity-50' : ''}`}>{label}</span>
    </label>
  );
};

export default ToggleSwitch; 