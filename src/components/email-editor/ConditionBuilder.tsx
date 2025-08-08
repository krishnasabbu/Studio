import React from 'react';

type ConditionRule = {
  field: string;
  operator: string;
  value: string;
};

type ConditionGroup = {
  logic: 'AND' | 'OR';
  conditions: ConditionRule[];
  displayValue: string;
};

type ConditionBuilderProps = {
  groups: ConditionGroup[];
  onChange: (groups: ConditionGroup[]) => void;
  fields: { label: string; value: string }[];
};

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({ groups = [], onChange, fields }) => {

  const operators = ['is', 'is not', '>', '<', '>=', '<='];

  const updateGroup = (groupIndex: number, updatedGroup: ConditionGroup) => {
    const newGroups = [...groups];
    newGroups[groupIndex] = updatedGroup;
    onChange(newGroups);
  };

  const addGroup = () => {
    onChange([
      ...groups,
      {
        logic: 'AND',
        conditions: [{ field: '', operator: 'is', value: '' }],
        displayValue: '',
      },
    ]);
  };

  const removeGroup = (groupIndex: number) => {
    const newGroups = groups.filter((_, i) => i !== groupIndex);
    onChange(newGroups);
  };

  const updateCondition = (groupIndex: number, conditionIndex: number, key: keyof ConditionRule, value: string) => {
    const group = groups[groupIndex];
    const newConditions = [...group.conditions];
    newConditions[conditionIndex] = { ...newConditions[conditionIndex], [key]: value };
    updateGroup(groupIndex, { ...group, conditions: newConditions });
  };

  const addCondition = (groupIndex: number) => {
    const group = groups[groupIndex];
    const newConditions = [...group.conditions, { field: '', operator: 'is', value: '' }];
    updateGroup(groupIndex, { ...group, conditions: newConditions });
  };

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    const group = groups[groupIndex];
    const newConditions = group.conditions.filter((_, i) => i !== conditionIndex);
    updateGroup(groupIndex, { ...group, conditions: newConditions });
  };

  const updateDisplayValue = (groupIndex: number, value: string) => {
    const group = groups[groupIndex];
    updateGroup(groupIndex, { ...group, displayValue: value });
  };

  const updateLogic = (groupIndex: number, logic: 'AND' | 'OR') => {
    const group = groups[groupIndex];
    updateGroup(groupIndex, { ...group, logic });
  };

  return (
    <div className="space-y-6">
      {(groups || []).map((group, groupIndex) => (
        <div key={groupIndex} className="border p-4 rounded space-y-3 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Condition Group {groupIndex + 1}</div>
            <button
              onClick={() => removeGroup(groupIndex)}
              className="text-red-500 text-sm hover:underline"
            >
              Remove Group
            </button>
          </div>

          <div className="flex space-x-2 items-center">
            <label className="text-sm">Logic:</label>
            <select
              className="p-2 border rounded"
              value={group.logic}
              onChange={(e) => updateLogic(groupIndex, e.target.value as 'AND' | 'OR')}
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>

          {(group.conditions || []).map((condition, conditionIndex) => (
            <div key={conditionIndex} className="flex items-center space-x-2">
              <select
                className="p-2 border rounded"
                value={condition.field}
                onChange={(e) => updateCondition(groupIndex, conditionIndex, 'field', e.target.value)}
              >
                <option value="">Select Field</option>
                {fields.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>

              <select
                className="p-2 border rounded"
                value={condition.operator}
                onChange={(e) => updateCondition(groupIndex, conditionIndex, 'operator', e.target.value)}
              >
                {operators.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>

              <input
                className="p-2 border rounded"
                placeholder="Value"
                value={condition.value}
                onChange={(e) => updateCondition(groupIndex, conditionIndex, 'value', e.target.value)}
              />

              <button
                onClick={() => removeCondition(groupIndex, conditionIndex)}
                className="text-red-400"
              >
                ❌
              </button>
            </div>
          ))}

          <button
            onClick={() => addCondition(groupIndex)}
            className="text-blue-500 text-sm hover:underline"
          >
            + Add Condition
          </button>

          <div>
            <label className="block text-sm mt-3">Display Value if matched</label>
            <input
              className="w-full p-2 border rounded"
              placeholder="e.g. Show this content if matched"
              value={group.displayValue}
              onChange={(e) => updateDisplayValue(groupIndex, e.target.value)}
            />
          </div>
        </div>
      ))}

      <button
        onClick={addGroup}
        className="text-green-600 hover:underline text-sm"
      >
        + Add Condition Group
      </button>
    </div>
  );
};
