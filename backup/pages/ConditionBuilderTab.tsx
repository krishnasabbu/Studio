import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';
import { ConditionBuilder } from '../components/email-editor/ConditionBuilder';

interface ConditionBuilderTabProps {
  groups: any[]; // ConditionGroup[]
  fields: { label: string; value: string }[];
  isViewing?: boolean;
  onChange: (groups: any[]) => void;
  onAddGroup?: () => void;
}

const ConditionBuilderTab: React.FC<ConditionBuilderTabProps> = ({
  groups,
  fields,
  isViewing = false,
  onChange,
  onAddGroup,
}) => {
  return (
    <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-primary-700 dark:text-white mb-2">
            Conditional Logic Builder
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Define conditional rules to dynamically display content based on your data.
          </p>
        </div>
        {!isViewing && onAddGroup && (
          <Button
            onClick={onAddGroup}
            className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        )}
      </div>

      {(!groups || groups.length === 0) ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-900 rounded-full mb-4">
            <Plus className="h-8 w-8 text-accent-600 dark:text-accent-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Condition Groups Defined
          </h4>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isViewing
              ? 'No conditional rules are configured for this template.'
              : 'Add condition groups to control dynamic content rendering.'
            }
          </p>
          {!isViewing && onAddGroup && (
            <Button
              onClick={onAddGroup}
              className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Group
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <ConditionBuilder
            groups={groups}
            onChange={onChange}
            fields={fields}
          />
        </div>
      )}
    </Card>
  );
};

export default ConditionBuilderTab;
