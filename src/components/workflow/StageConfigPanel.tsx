import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Settings, Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';

interface StageConfigPanelProps {
  isOpen: boolean;
  selectedNode: any;
  onSave: (stageData: any) => void;
  onClose: () => void;
}

const StageConfigPanel: React.FC<StageConfigPanelProps> = ({
  isOpen,
  selectedNode,
  onSave,
  onClose,
}) => {
  const [stageConfig, setStageConfig] = useState({
    stageName: '',
    environment: '',
    parameters: {} as Record<string, string>,
  });

  const [newParamKey, setNewParamKey] = useState('');
  const [newParamValue, setNewParamValue] = useState('');

  // Load existing node data when modal opens
  useEffect(() => {
    if (selectedNode) {
      setStageConfig({
        stageName: selectedNode.data.stageName || '',
        environment: selectedNode.data.environment || '',
        parameters: selectedNode.data.parameters || {},
      });
    }
  }, [selectedNode]);

  const handleAddParameter = () => {
    if (!newParamKey.trim() || !newParamValue.trim()) {
      alert('Please enter both parameter name and value');
      return;
    }

    setStageConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [newParamKey.trim()]: newParamValue.trim(),
      },
    }));

    setNewParamKey('');
    setNewParamValue('');
  };

  const handleRemoveParameter = (key: string) => {
    setStageConfig(prev => ({
      ...prev,
      parameters: Object.fromEntries(
        Object.entries(prev.parameters).filter(([k]) => k !== key)
      ),
    }));
  };

  const handleUpdateParameter = (key: string, value: string) => {
    setStageConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    if (!stageConfig.stageName.trim()) {
      alert('Please enter a stage name');
      return;
    }

    // Ensure we're updating the node data properly
    const updatedData = {
      stageName: stageConfig.stageName,
      environment: stageConfig.environment,
      parameters: stageConfig.parameters,
      label: stageConfig.stageName, // Update the label as well
    };
    
    onSave(updatedData);
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Configure Stage Node
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Stage Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Stage Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Stage Name"
                  value={stageConfig.stageName}
                  onChange={(value) => setStageConfig(prev => ({ ...prev, stageName: value }))}
                  placeholder="e.g., Dev, QA, Stage, Prod"
                  required
                />
                
                <InputField
                  label="Environment"
                  value={stageConfig.environment}
                  onChange={(value) => setStageConfig(prev => ({ ...prev, environment: value }))}
                  placeholder="e.g., development, testing, production"
                />
              </div>
            </div>

            {/* Runtime Parameters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Runtime Parameters
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Object.keys(stageConfig.parameters).length} parameters
                </span>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  <strong>Note:</strong> These parameters are passed to the backend's <code>executeStage()</code> method.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  The backend implementation decides what activities to run based on the stage name and these parameters.
                </p>
              </div>

              {/* Add New Parameter */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Add New Parameter
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Parameter Name"
                    value={newParamKey}
                    onChange={setNewParamKey}
                    placeholder="e.g., dbName, serviceUrl"
                  />
                  <InputField
                    label="Parameter Value"
                    value={newParamValue}
                    onChange={setNewParamValue}
                    placeholder="e.g., dev_database, https://api.dev.com"
                  />
                </div>
                <div className="flex justify-end mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddParameter}
                    disabled={!newParamKey.trim() || !newParamValue.trim()}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Parameter
                  </Button>
                </div>
              </div>

              {/* Existing Parameters */}
              <div className="space-y-3">
                {Object.keys(stageConfig.parameters).length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No parameters configured for this stage
                  </div>
                ) : (
                  Object.entries(stageConfig.parameters).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Parameter Name
                          </label>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {key}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Parameter Value
                          </label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleUpdateParameter(key, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveParameter(key)}
                        className="px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Configuration Preview */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-3">
                Stage Configuration Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-primary-700 dark:text-primary-300">Stage:</span>
                  <span className="text-primary-600 dark:text-primary-400 ml-2">
                    {stageConfig.stageName} ({stageConfig.environment})
                  </span>
                </div>
                <div>
                  <span className="font-medium text-primary-700 dark:text-primary-300">Backend Call:</span>
                  <code className="text-primary-600 dark:text-primary-400 ml-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    executeStage("{stageConfig.stageName}", {JSON.stringify(stageConfig.parameters, null, 0)})
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!stageConfig.stageName.trim()}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Save Stage Configuration
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              Cancel
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default StageConfigPanel;