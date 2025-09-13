import React, { useState, useEffect } from 'react';
import { X, Save, TestTube, AlertTriangle, CheckCircle, Settings, Server, Shield, FolderOpen, Clock, RefreshCw } from 'lucide-react';
import { BroadcastConfig } from '../../types/broadcastConfig';
import { mockConfigService } from '../../data/mockBroadcastConfig';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdate: (config: BroadcastConfig) => void;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdate
}) => {
  const [config, setConfig] = useState<Partial<BroadcastConfig>>({
    hostIP: '',
    hostPort: 21,
    username: '',
    password: '',
    protocol: 'SFTP',
    destinationPath: '/uploads/',
    maxFileSize: 104857600, // 100MB
    allowedFileTypes: ['.zip', '.exe', '.tar', '.gz', '.sql', '.msi', '.txt', '.json', '.xml'],
    retryAttempts: 3,
    timeoutSeconds: 300,
    isActive: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[]; warnings: string[] } | null>(null);

  // Load current configuration when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
    }
  }, [isOpen]);

  const loadCurrentConfig = async () => {
    setIsLoading(true);
    try {
      const currentConfig = await mockConfigService.getActiveConfig();
      if (currentConfig) {
        setConfig(currentConfig);
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BroadcastConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(null); // Clear test results when config changes
    
    // Real-time validation
    const newConfig = { ...config, [field]: value };
    const validation = mockConfigService.validateConfig(newConfig);
    setValidationResult(validation);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await mockConfigService.testConnection(config);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    const validation = mockConfigService.validateConfig(config);
    setValidationResult(validation);
    
    if (!validation.isValid) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await mockConfigService.updateConfig(config);
      if (result.success) {
        onConfigUpdate(config as BroadcastConfig);
        onClose();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-wells-fargo">
                Broadcast Configuration
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 text-primary-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Loading configuration...</p>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Connection Settings */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Server className="w-5 h-5 text-primary-600" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white font-wells-fargo">
                  Connection Settings
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Host IP Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.hostIP || ''}
                    onChange={(e) => handleInputChange('hostIP', e.target.value)}
                    placeholder="192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={config.hostPort || 21}
                    onChange={(e) => handleInputChange('hostPort', parseInt(e.target.value))}
                    min="1"
                    max="65535"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Protocol
                  </label>
                  <select
                    value={config.protocol || 'SFTP'}
                    onChange={(e) => handleInputChange('protocol', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="FTP">FTP</option>
                    <option value="SFTP">SFTP (Recommended)</option>
                    <option value="SCP">SCP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination Path <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={config.destinationPath || ''}
                      onChange={(e) => handleInputChange('destinationPath', e.target.value)}
                      placeholder="/uploads/broadcast/"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-primary-600" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white font-wells-fargo">
                  Authentication
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.username || ''}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="broadcast_user"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={config.password || ''}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Transfer Settings */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-primary-600" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white font-wells-fargo">
                  Transfer Settings
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max File Size
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={Math.floor((config.maxFileSize || 0) / 1048576)}
                      onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value) * 1048576)}
                      min="1"
                      max="1024"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500">
                      Current: {formatFileSize(config.maxFileSize || 0)} (MB)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    value={config.retryAttempts || 3}
                    onChange={(e) => handleInputChange('retryAttempts', parseInt(e.target.value))}
                    min="0"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.timeoutSeconds || 300}
                    onChange={(e) => handleInputChange('timeoutSeconds', parseInt(e.target.value))}
                    min="30"
                    max="3600"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Allowed File Types
                </label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {['.zip', '.exe', '.tar', '.gz', '.sql', '.msi', '.txt', '.json', '.xml', '.pdf', '.doc', '.docx'].map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.allowedFileTypes?.includes(type) || false}
                        onChange={(e) => {
                          const current = config.allowedFileTypes || [];
                          if (e.target.checked) {
                            handleInputChange('allowedFileTypes', [...current, type]);
                          } else {
                            handleInputChange('allowedFileTypes', current.filter(t => t !== type));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <div className="space-y-3">
                {validationResult.errors.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-red-800 dark:text-red-300 mb-1">Configuration Errors</h5>
                        <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                          {validationResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {validationResult.warnings.length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Configuration Warnings</h5>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Connection Test Results */}
            {testResult && (
              <div className={`p-4 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-start space-x-3">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h5 className={`font-medium mb-1 ${
                      testResult.success 
                        ? 'text-green-800 dark:text-green-300' 
                        : 'text-red-800 dark:text-red-300'
                    }`}>
                      Connection Test {testResult.success ? 'Successful' : 'Failed'}
                    </h5>
                    <p className={`text-sm ${
                      testResult.success 
                        ? 'text-green-700 dark:text-green-400' 
                        : 'text-red-700 dark:text-red-400'
                    }`}>
                      {testResult.message}
                      {testResult.latency && ` (${testResult.latency}ms)`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleTestConnection}
                disabled={isTesting || isLoading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <TestTube className={`w-4 h-4 ${isTesting ? 'animate-pulse' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isLoading || (validationResult && !validationResult.isValid)}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationModal;