import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, UserCheck, Shield } from 'lucide-react';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';

interface EdgeConfigPanelProps {
  isOpen: boolean;
  selectedEdge: any;
  onSave: (edgeData: any) => void;
  onClose: () => void;
}

const EdgeConfigPanel: React.FC<EdgeConfigPanelProps> = ({
  isOpen,
  selectedEdge,
  onSave,
  onClose,
}) => {
  const [edgeConfig, setEdgeConfig] = useState({
    requiresApproval: false,
    approverRole: '',
    approvalTimeout: '24',
    autoApprove: false,
  });

  // Load existing edge data when modal opens
  useEffect(() => {
    if (selectedEdge) {
      setEdgeConfig({
        requiresApproval: selectedEdge.data?.requiresApproval || false,
        approverRole: selectedEdge.data?.approverRole || '',
        approvalTimeout: selectedEdge.data?.approvalTimeout || '24',
        autoApprove: selectedEdge.data?.autoApprove || false,
      });
    }
  }, [selectedEdge]);

  const approverRoleOptions = [
    { value: '', label: 'No approval required' },
    { value: 'admin', label: 'Admin' },
    { value: 'dev-lead', label: 'Development Lead' },
    { value: 'qa-manager', label: 'QA Manager' },
    { value: 'devops-engineer', label: 'DevOps Engineer' },
    { value: 'prod-manager', label: 'Production Manager' },
    { value: 'security-team', label: 'Security Team' },
    { value: 'database-admin', label: 'Database Admin' },
  ];

  const timeoutOptions = [
    { value: '1', label: '1 hour' },
    { value: '4', label: '4 hours' },
    { value: '8', label: '8 hours' },
    { value: '24', label: '24 hours' },
    { value: '48', label: '48 hours' },
    { value: '72', label: '72 hours' },
  ];

  const handleSave = () => {
    const edgeData = {
      requiresApproval: edgeConfig.requiresApproval,
      approverRole: edgeConfig.requiresApproval ? edgeConfig.approverRole : '',
      approvalTimeout: edgeConfig.requiresApproval ? edgeConfig.approvalTimeout : '',
      autoApprove: edgeConfig.autoApprove,
      status: 'pending',
    };

    onSave(edgeData);
  };

  if (!isOpen || !selectedEdge) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <UserCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Configure Stage Transition
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
            {/* Connection Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Stage Transition
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>From: <strong>{selectedEdge.source}</strong></div>
                <div>To: <strong>{selectedEdge.target}</strong></div>
              </div>
            </div>

            {/* Approval Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Approval Settings
              </h3>

              {/* Requires Approval Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    Requires Approval
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Should this transition require manual approval?
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={edgeConfig.requiresApproval}
                    onChange={(e) => setEdgeConfig(prev => ({ 
                      ...prev, 
                      requiresApproval: e.target.checked,
                      approverRole: e.target.checked ? prev.approverRole : '',
                    }))}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    edgeConfig.requiresApproval ? 'bg-primary-600' : 'bg-gray-300'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      edgeConfig.requiresApproval ? 'translate-x-5' : 'translate-x-0'
                    } mt-0.5 ml-0.5`} />
                  </div>
                </label>
              </div>

              {/* Approval Configuration (only if approval is required) */}
              {edgeConfig.requiresApproval && (
                <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <Dropdown
                    label="Approver Role"
                    value={edgeConfig.approverRole}
                    onChange={(value) => setEdgeConfig(prev => ({ ...prev, approverRole: value }))}
                    options={approverRoleOptions.filter(opt => opt.value !== '')}
                    placeholder="Select approver role"
                    required
                  />

                  <Dropdown
                    label="Approval Timeout"
                    value={edgeConfig.approvalTimeout}
                    onChange={(value) => setEdgeConfig(prev => ({ ...prev, approvalTimeout: value }))}
                    options={timeoutOptions}
                    placeholder="Select timeout"
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Auto-approve after timeout
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically approve if no response within timeout period
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edgeConfig.autoApprove}
                        onChange={(e) => setEdgeConfig(prev => ({ ...prev, autoApprove: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${
                        edgeConfig.autoApprove ? 'bg-green-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          edgeConfig.autoApprove ? 'translate-x-5' : 'translate-x-0'
                        } mt-0.5 ml-0.5`} />
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Configuration Preview */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-3">
                Transition Configuration Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-primary-700 dark:text-primary-300">Approval Required:</span>
                  <span className="text-primary-600 dark:text-primary-400 ml-2">
                    {edgeConfig.requiresApproval ? 'Yes' : 'No'}
                  </span>
                </div>
                {edgeConfig.requiresApproval && (
                  <>
                    <div>
                      <span className="font-medium text-primary-700 dark:text-primary-300">Approver:</span>
                      <span className="text-primary-600 dark:text-primary-400 ml-2">
                        {edgeConfig.approverRole || 'Not selected'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-primary-700 dark:text-primary-300">Timeout:</span>
                      <span className="text-primary-600 dark:text-primary-400 ml-2">
                        {edgeConfig.approvalTimeout} hours
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-primary-700 dark:text-primary-300">Auto-approve:</span>
                      <span className="text-primary-600 dark:text-primary-400 ml-2">
                        {edgeConfig.autoApprove ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={edgeConfig.requiresApproval && !edgeConfig.approverRole}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Save Transition Config
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

export default EdgeConfigPanel;