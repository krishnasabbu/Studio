import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Send, 
  Eye, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FolderOpen,
  Server,
  FileText,
  X,
  Info,
  Settings,
  Zap
} from 'lucide-react';
import { BroadcastAlert, BroadcastAlertFilters, PaginationState } from '../types/broadcastAlert';
import { BroadcastConfig } from '../types/broadcastConfig';
import { mockBroadcastAlerts, simulateTransferProgress } from '../data/mockBroadcastAlerts';
import { mockConfigService } from '../data/mockBroadcastConfig';
import ConfigurationModal from '../components/broadcast/ConfigurationModal';
import Pagination from '../components/ui/Pagination';

const BroadcastAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<BroadcastAlert[]>(mockBroadcastAlerts);
  const [showSendForm, setShowSendForm] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<BroadcastConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Simplified form state - only file selection needed
  const [formData, setFormData] = useState({
    selectedFile: null as File | null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [currentTransferId, setCurrentTransferId] = useState<string | null>(null);

  // Filters and pagination
  const [filters, setFilters] = useState<BroadcastAlertFilters>({
    search: '',
    status: '',
    dateRange: { start: null, end: null },
    destinationIP: ''
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setConfigLoading(true);
    try {
      const config = await mockConfigService.getActiveConfig();
      setCurrentConfig(config);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setConfigLoading(false);
    }
  };

  // Filter and search logic
  const filteredAlerts = useMemo(() => {
    let filtered = alerts.filter(alert => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          alert.fileName.toLowerCase().includes(searchLower) ||
          alert.destinationIP.includes(searchLower) ||
          alert.createdBy.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && alert.transferStatus !== filters.status) return false;

      // Destination IP filter
      if (filters.destinationIP && !alert.destinationIP.includes(filters.destinationIP)) return false;

      // Date range filter
      if (filters.dateRange.start && alert.timestamp < filters.dateRange.start) return false;
      if (filters.dateRange.end && alert.timestamp > filters.dateRange.end) return false;

      return true;
    });

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return filtered;
  }, [alerts, filters]);

  // Pagination logic
  const paginatedAlerts = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredAlerts.slice(startIndex, endIndex);
  }, [filteredAlerts, pagination.page, pagination.pageSize]);

  // Update total when filtered alerts change
  React.useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredAlerts.length,
      page: 1
    }));
  }, [filteredAlerts.length]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in-progress': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!currentConfig) {
      errors.config = 'No broadcast configuration found. Please configure the system first.';
      return false;
    }

    if (!currentConfig.isActive) {
      errors.config = 'Broadcast configuration is inactive. Please activate it first.';
      return false;
    }

    if (!formData.selectedFile) {
      errors.file = 'Please select a file to upload';
    } else {
      // Check file size
      if (formData.selectedFile.size > currentConfig.maxFileSize) {
        errors.file = `File size exceeds maximum allowed size of ${formatFileSize(currentConfig.maxFileSize)}`;
      }

      // Check file type
      const fileExtension = '.' + formData.selectedFile.name.split('.').pop()?.toLowerCase();
      if (!currentConfig.allowedFileTypes.includes(fileExtension)) {
        errors.file = `File type ${fileExtension} is not allowed. Allowed types: ${currentConfig.allowedFileTypes.join(', ')}`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, selectedFile: file }));
      if (formErrors.file) {
        setFormErrors(prev => ({ ...prev, file: '' }));
      }
    }
  };

  const handleSendBroadcast = async () => {
    if (!validateForm() || !currentConfig) return;

    const confirmed = window.confirm(
      `Send "${formData.selectedFile?.name}" to ${currentConfig.hostIP}:${currentConfig.destinationPath}?`
    );
    
    if (!confirmed) return;

    setIsTransferring(true);
    setTransferProgress(0);

    try {
      // Create new alert record
      const newAlert: BroadcastAlert = {
        id: `alert-${Date.now()}`,
        timestamp: new Date(),
        fileName: formData.selectedFile!.name,
        filePath: currentConfig.destinationPath + formData.selectedFile!.name,
        fileSize: formData.selectedFile!.size,
        destinationIP: currentConfig.hostIP,
        transferStatus: 'in-progress',
        transferProgress: 0,
        transferStartTime: new Date(),
        createdBy: 'Current User',
        metadata: {
          fileType: formData.selectedFile!.type,
          retryCount: 0
        }
      };

      setAlerts(prev => [newAlert, ...prev]);
      setCurrentTransferId(newAlert.id);

      // Simulate transfer progress
      await simulateTransferProgress(
        newAlert.id,
        (progress) => {
          setTransferProgress(progress.progress);
          // Update alert in list
          setAlerts(prev => prev.map(alert => 
            alert.id === newAlert.id 
              ? { 
                  ...alert, 
                  transferProgress: progress.progress,
                  transferStatus: progress.status as any,
                  transferSpeed: progress.speed
                }
              : alert
          ));
        },
        (result) => {
          // Transfer completed
          setAlerts(prev => prev.map(alert => 
            alert.id === newAlert.id 
              ? { 
                  ...alert, 
                  transferProgress: 100,
                  transferStatus: 'success',
                  transferEndTime: new Date(),
                  transferSpeed: result.speed
                }
              : alert
          ));
          
          setIsTransferring(false);
          setCurrentTransferId(null);
          setShowSendForm(false);
          setFormData({ selectedFile: null });
          
          // Show success notification
          alert(`Broadcast sent successfully to ${currentConfig.hostIP}!`);
        }
      );
    } catch (error) {
      console.error('Transfer failed:', error);
      setIsTransferring(false);
      alert('Transfer failed. Please try again.');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleConfigUpdate = (config: BroadcastConfig) => {
    setCurrentConfig(config);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-700 dark:text-white font-wells-fargo">
            📡 Broadcast Alerts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Automated file transfer system with centralized configuration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Settings className="w-4 h-4" />
            <span>Configure</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowSendForm(true)}
            disabled={!currentConfig || !currentConfig.isActive}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Zap className="w-4 h-4" />
            <span>Quick Broadcast</span>
          </button>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${currentConfig?.isActive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <Server className={`w-6 h-6 ${currentConfig?.isActive ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-wells-fargo">
                System Configuration
              </h3>
              {configLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading configuration...</p>
              ) : currentConfig ? (
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    Target: <span className="font-mono text-primary-600">{currentConfig.hostIP}:{currentConfig.hostPort}</span>
                    <span className="ml-2 text-sm">({currentConfig.protocol})</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Path: <span className="font-mono">{currentConfig.destinationPath}</span>
                    <span className="ml-2 text-sm">Max: {formatFileSize(currentConfig.maxFileSize)}</span>
                  </p>
                </div>
              ) : (
                <p className="text-red-600 dark:text-red-400">No configuration found - Please configure the system</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              currentConfig?.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              {currentConfig?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.transferStatus === 'success').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.transferStatus === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.transferStatus === 'failed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Server className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files, IPs, users..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="text"
            placeholder="Filter by IP address..."
            value={filters.destinationIP}
            onChange={(e) => setFilters(prev => ({ ...prev, destinationIP: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          <button
            onClick={() => setFilters({ search: '', status: '', dateRange: { start: null, end: null }, destinationIP: '' })}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white font-wells-fargo">
            📋 Broadcast History ({filteredAlerts.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  File Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transfer Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {alert.fileName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(alert.fileSize)} • {formatDate(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Server className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {alert.destinationIP}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(alert.transferStatus)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.transferStatus)}`}>
                        {alert.transferStatus.toUpperCase()}
                      </span>
                    </div>
                    {alert.errorMessage && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {alert.errorMessage}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          alert.transferStatus === 'success' ? 'bg-green-600' :
                          alert.transferStatus === 'failed' ? 'bg-red-600' :
                          alert.transferStatus === 'in-progress' ? 'bg-blue-600' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${alert.transferProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {alert.transferProgress}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      {alert.transferSpeed && (
                        <div>Speed: {alert.transferSpeed}</div>
                      )}
                      {alert.transferStartTime && (
                        <div>Started: {formatDate(alert.transferStartTime)}</div>
                      )}
                      {alert.transferEndTime && (
                        <div>Ended: {formatDate(alert.transferEndTime)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedAlerts.length === 0 && (
          <div className="text-center py-12">
            <Server className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No broadcast alerts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start by sending your first broadcast alert.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredAlerts.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(filteredAlerts.length / pagination.pageSize)}
          pageSize={pagination.pageSize}
          totalItems={filteredAlerts.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Quick Broadcast Modal */}
      {showSendForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-primary-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-wells-fargo">
                    Quick Broadcast
                  </h3>
                </div>
                <button
                  onClick={() => setShowSendForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Configuration Display */}
              {currentConfig && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                        Automatic Configuration Applied
                      </h4>
                      <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        <div>📍 <strong>Destination:</strong> {currentConfig.hostIP}:{currentConfig.hostPort}</div>
                        <div>📁 <strong>Path:</strong> {currentConfig.destinationPath}</div>
                        <div>🔒 <strong>Protocol:</strong> {currentConfig.protocol}</div>
                        <div>📏 <strong>Max Size:</strong> {formatFileSize(currentConfig.maxFileSize)}</div>
                        <div>📋 <strong>Allowed Types:</strong> {currentConfig.allowedFileTypes.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* File Selection - Only Input Required */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Select File to Broadcast
                  <span className="text-red-500 ml-1">*</span>
                </label>
                
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FolderOpen className="w-5 h-5" />
                    <span>Choose File</span>
                  </button>
                  
                  {formData.selectedFile && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      <FileText className="w-4 h-4" />
                      <span>{formData.selectedFile.name}</span>
                      <span>({formatFileSize(formData.selectedFile.size)})</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={currentConfig?.allowedFileTypes.join(',') || '*'}
                />
                
                {formErrors.file && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.file}</p>
                )}
                {formErrors.config && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.config}</p>
                )}
              </div>

              {/* Transfer Progress */}
              {isTransferring && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="font-medium text-blue-800 dark:text-blue-300">
                      Broadcasting to {currentConfig?.hostIP}...
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${transferProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                    {transferProgress}% complete
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                      Automated Broadcast System
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                      <li>• Files are automatically sent to the configured destination</li>
                      <li>• All transfers use secure protocols and are logged</li>
                      <li>• File validation is performed before transfer</li>
                      <li>• Transfer progress is monitored in real-time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowSendForm(false)}
                  disabled={isTransferring}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBroadcast}
                  disabled={isTransferring || !formData.selectedFile}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <Send className="w-4 h-4" />
                  <span>{isTransferring ? 'Broadcasting...' : 'Send Broadcast'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigUpdate={handleConfigUpdate}
      />
    </div>
  );
};

export default BroadcastAlertsPage;