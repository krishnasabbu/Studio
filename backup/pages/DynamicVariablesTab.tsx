import React from 'react';
import Card from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface Variable {
  id: string;
  variableName: string;
  formatter: string;
}

interface DynamicVariablesTabProps {
  dynamicVariables: Variable[];
  isViewing?: boolean;
  onAddVariable: () => void;
  onRemoveVariable: (id: string) => void;
  onChangeVariable: (id: string, field: 'variableName' | 'formatter', value: string) => void;
}

const formatterOptions = [
  { value: 'date', label: 'Date Formatter' },
  { value: 'currency', label: 'Currency Formatter' },
  { value: 'number', label: 'Number Formatter' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
  { value: 'percentage', label: 'Percentage Formatter' },
  { value: 'phone', label: 'Phone Number Formatter' },
];

const DynamicVariablesTab: React.FC<DynamicVariablesTabProps> = ({
  dynamicVariables,
  isViewing = false,
  onAddVariable,
  onRemoveVariable,
  onChangeVariable,
}) => {
  return (
    <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-primary-700 dark:text-white mb-2">
            Dynamic Variables Configuration
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Define variables that can be dynamically replaced in your templates with formatted values
          </p>
        </div>
        {!isViewing && (
          <Button
            onClick={onAddVariable}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variable
          </Button>
        )}
      </div>

      {dynamicVariables.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-900 rounded-full mb-4">
            <Plus className="h-8 w-8 text-accent-600 dark:text-accent-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Variables Defined
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isViewing 
              ? 'No dynamic variables are configured for this template'
              : 'Add dynamic variables to make your templates more flexible and reusable'
            }
          </p>
          {!isViewing && (
            <Button
              onClick={onAddVariable}
              className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Variable
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {dynamicVariables.map((variable, index) => (
            <div
              key={variable.id}
              className="flex items-end space-x-4 p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-primary-200 dark:border-gray-600"
            >
              <div className="flex-1">
                <InputField
                  label={`Variable Name ${index + 1}`}
                  value={variable.variableName}
                  onChange={(value) => onChangeVariable(variable.id, 'variableName', value)}
                  placeholder="e.g., customerName, orderDate, totalAmount"
                  disabled={isViewing}
                />
              </div>
              <div className="flex-1">
                <Dropdown
                  label="Formatter"
                  value={variable.formatter}
                  onChange={(value) => onChangeVariable(variable.id, 'formatter', value)}
                  options={formatterOptions}
                  placeholder="Select formatter"
                  disabled={isViewing}
                />
              </div>
              {!isViewing && (
                <div className="pb-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onRemoveVariable(variable.id)}
                    className="px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
            <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
              Usage Examples
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-primary-700 dark:text-primary-300">Template:</span>
                <code className="block text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 p-2 rounded mt-1">
                  Hello {'{'}customerName{'}'}, your order total is {'{'}totalAmount{'}'}
                </code>
              </div>
              <div>
                <span className="font-medium text-primary-700 dark:text-primary-300">Output:</span>
                <code className="block text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 p-2 rounded mt-1">
                  Hello JOHN DOE, your order total is $1,234.56
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DynamicVariablesTab;
