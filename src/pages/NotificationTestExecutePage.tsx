import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetAlertsQuery, useRunTestMutation, useImportAlertMutation, useGetTestHistoryQuery, useRetryTestMutation } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import { ArrowLeft, Play, Upload, CheckCircle, XCircle, ExternalLink, RotateCcw, Clock, AlertCircle } from 'lucide-react';

const NotificationTestExecutePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productName = searchParams.get('product') || '';
  const productId = searchParams.get('productId') || '';

  const { data: alerts = [], isLoading: isLoadingAlerts } = useGetAlertsQuery();
  const [runTest, { isLoading: isRunningTest }] = useRunTestMutation();
  const [importAlert, { isLoading: isImporting }] = useImportAlertMutation();
  const { data: testHistory = [], isLoading: isLoadingHistory } = useGetTestHistoryQuery();
  const [retryTest, { isLoading: isRetrying }] = useRetryTestMutation();

  const [environment, setEnvironment] = useState('');
  const [mode, setMode] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<any>(null);

  const environmentOptions = [
    { value: 'DEV', label: 'Development (DEV)' },
    { value: 'SIT', label: 'System Integration Test (SIT)' },
    { value: 'RQA', label: 'Regression Quality Assurance (RQA)' },
  ];

  const modeOptions = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Regression', label: 'Regression' },
  ];

  const handleAlertSelection = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAllAlerts = () => {
    setSelectedAlerts(
      selectedAlerts.length === alerts.length 
        ? [] 
        : alerts.map(alert => alert.id)
    );
  };

  const handleExecuteTest = async () => {
    if (!environment || !mode || selectedAlerts.length === 0) {
      alert('Please fill all required fields and select at least one alert');
      return;
    }

    try {
      const testData = {
        product: productName,
        productId,
        environment,
        mode,
        selectedAlerts,
      };

      const result = await runTest(testData).unwrap();
      setTestResult(result);
      
      // Show success toast
      alert('Test executed successfully!');
    } catch (error) {
      console.error('Test execution failed:', error);
      alert('Test execution failed. Please try again.');
    }
  };

  const handleImportAlert = async () => {
    try {
      const importData = {
        product: productName,
        productId,
        environment,
      };

      await importAlert(importData).unwrap();
      alert('Alert configuration imported successfully!');
    } catch (error) {
      console.error('Alert import failed:', error);
      alert('Alert import failed. Please try again.');
    }
  };

  const handleRetryTest = async (historyItem: any) => {
    try {
      const testData = {
        product: historyItem.product,
        environment: historyItem.environment,
        mode: historyItem.mode,
        selectedAlerts: historyItem.selectedAlerts,
        messageType: historyItem.messageType,
        messageName: historyItem.messageName,
      };

      await retryTest({ id: historyItem.id, testData }).unwrap();
      alert('Test re-executed successfully!');
    } catch (error) {
      console.error('Test retry failed:', error);
      alert('Test retry failed. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'InProgress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'InProgress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoadingAlerts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/tests')}
            className="flex items-center space-x-2 border-primary-300 text-primary-600 hover:bg-primary-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary-700 dark:text-white">
              Test Execution - {productName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure and run notification tests for {productName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
              Test Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dropdown
                label="Environment"
                value={environment}
                onChange={setEnvironment}
                options={environmentOptions}
                placeholder="Select environment"
                required
              />
              <Dropdown
                label="Mode"
                value={mode}
                onChange={setMode}
                options={modeOptions}
                placeholder="Select test mode"
                required
              />
            </div>
          </Card>

          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-white">
                Select Alerts for Testing
              </h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.length === alerts.length && alerts.length > 0}
                    onChange={handleSelectAllAlerts}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Select All
                  </span>
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedAlerts.length} of {alerts.length} selected
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedAlerts.includes(alert.id)}
                    onChange={() => handleAlertSelection(alert.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {alert.name || 'Unnamed Alert'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      JIRA: {alert.jiraId || 'N/A'} | Status: {alert.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {alerts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No alerts available for testing
                </p>
              </div>
            )}
          </Card>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleImportAlert}
              disabled={isImporting || !environment}
              className="flex items-center space-x-2 border-primary-300 text-primary-600 hover:bg-primary-50"
            >
              <Upload className="h-4 w-4" />
              <span>{isImporting ? 'Importing...' : 'Import Alert'}</span>
            </Button>
            
            <Button
              variant="primary"
              onClick={handleExecuteTest}
              disabled={isRunningTest || !environment || !mode || selectedAlerts.length === 0}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="h-4 w-4" />
              <span>{isRunningTest ? 'Executing...' : 'Execute Test'}</span>
            </Button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent-500">
            <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
              Test Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Product:</span>
                <span className="text-gray-900 dark:text-white font-medium">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {environment || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {mode || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Selected Alerts:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {selectedAlerts.length}
                </span>
              </div>
            </div>
          </Card>

          {testResult && (
            <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-4">
                Test Result
              </h3>
              <div className="flex items-center space-x-3">
                {testResult.result === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <div className={`font-medium ${
                    testResult.result === 'success' 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {testResult.result === 'success' ? 'Test Passed' : 'Test Failed'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Executed at: {new Date(testResult.executedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Test Execution History */}
      <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
        <h3 className="text-lg font-semibold text-primary-700 dark:text-white mb-6">
          Test Execution History
        </h3>
        
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : testHistory.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No test history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Message Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Message Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Run
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Run Type
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Report
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Initiated By
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Last Run Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {testHistory.map((test) => (
                  <tr
                    key={test.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-primary-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {test.messageType}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {test.messageName}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-mono">
                      {test.run}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {test.runType}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(test.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={test.reportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Report</span>
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {test.initiatedBy}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {new Date(test.lastRunDate).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetryTest(test)}
                        disabled={isRetrying}
                        className="flex items-center space-x-1 border-primary-300 text-primary-600 hover:bg-primary-50"
                      >
                        {isRetrying ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationTestExecutePage;