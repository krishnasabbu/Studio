import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeItem = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div
          className={`w-full px-3 py-2 border rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } ${
            disabled
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
              : 'bg-white dark:bg-gray-700'
          } dark:text-white`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {value.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {value.map((item) => {
                const option = options.find(opt => opt.value === item);
                return (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                  >
                    {option?.label}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item);
                      }}
                    />
                  </span>
                );
              })}
            </div>
          )}
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center justify-between"
                onClick={() => handleToggle(option.value)}
              >
                <span className="dark:text-white">{option.label}</span>
                {value.includes(option.value) && (
                  <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default MultiSelect;